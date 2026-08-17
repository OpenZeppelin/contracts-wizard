import { ContractBuilder } from './contract';
import { addSelfAuthUpgradeable } from './add-upgradeable';
import { defineFunctions } from './utils/define-functions';
import type { CommonOptions } from './common-options';
import { withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setInfo } from './set-info';
import { printContract } from './print';
import { OptionsError } from './error';

export const policyOptions = [false, 'simple-threshold', 'weighted-threshold'] as const;

export type Policy = (typeof policyOptions)[number];

// Verifier and policy contracts are deployment arguments, not wizard inputs: one
// wasm then works on both networks. The generated code points at the Stellar
// Registry, a third-party index of deployed contracts, so that whoever deploys
// has somewhere to start looking. Vetting the contract is up to them.
const REGISTRY_HINT = [
  'Take one you trust from the Stellar Registry:',
  'https://testnet.rgstry.xyz (testnet) or https://stellar.rgstry.xyz (mainnet).',
];

// Error code for the single runtime check the generated constructor performs.
// Kept clear of the library's ranges: `stellar_accounts` uses 3000+ for smart
// account errors and 3200+ for policy errors.
const WEIGHTS_LENGTH_MISMATCH_ERROR = 1;

export const defaults: Required<AccountOptions> = {
  name: 'MyAccount',
  delegatedSigners: true,
  ed25519Signers: false,
  webauthnSigners: false,
  policy: 'simple-threshold',
  executionEntryPoint: true,
  upgradeable: false,
  info: commonDefaults.info,
} as const;

export function printAccount(opts: AccountOptions = defaults): string {
  return printContract(buildAccount(opts));
}

export interface AccountOptions extends CommonOptions {
  name: string;
  delegatedSigners?: boolean;
  ed25519Signers?: boolean;
  webauthnSigners?: boolean;
  policy?: Policy;
  executionEntryPoint?: boolean;
  upgradeable?: boolean;
}

export function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    delegatedSigners: opts.delegatedSigners ?? defaults.delegatedSigners,
    ed25519Signers: opts.ed25519Signers ?? defaults.ed25519Signers,
    webauthnSigners: opts.webauthnSigners ?? defaults.webauthnSigners,
    policy: opts.policy ?? defaults.policy,
    executionEntryPoint: opts.executionEntryPoint ?? defaults.executionEntryPoint,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
  };
}

export function buildAccount(opts: AccountOptions): ContractBuilder {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  // A context rule may legally hold only policies, but such an account could
  // never authenticate anything, so a signer type is required here.
  if (!allOpts.delegatedSigners && !allOpts.ed25519Signers && !allOpts.webauthnSigners) {
    throw new OptionsError({
      delegatedSigners: 'At least one signer type is required',
    });
  }

  addBase(c, allOpts);

  if (allOpts.executionEntryPoint) {
    addExecutionEntryPoint(c);
  }

  if (allOpts.upgradeable) {
    addSelfAuthUpgradeable(c);
  }

  setInfo(c, allOpts.info);

  return c;
}

// External signer types differ only in which verifier contract validates their
// signatures, so they share a constructor argument shape.
const externalSigners: { option: 'ed25519Signers' | 'webauthnSigners'; prefix: string; label: string }[] = [
  { option: 'ed25519Signers', prefix: 'ed25519', label: 'Ed25519' },
  { option: 'webauthnSigners', prefix: 'webauthn', label: 'WebAuthn' },
];

function contextRuleName(policy: Policy): string {
  switch (policy) {
    case false:
      return 'default';
    case 'simple-threshold':
      return 'multisig';
    case 'weighted-threshold':
      return 'weighted-multisig';
    default: {
      const _: never = policy;
      throw new Error('Unknown value for `policy`');
    }
  }
}

function addBase(c: ContractBuilder, opts: Required<AccountOptions>) {
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'Map');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Val');
  c.addUseClause('soroban_sdk', 'Vec');
  c.addUseClause('soroban_sdk::auth', 'Context');
  c.addUseClause('soroban_sdk::auth', 'CustomAccountInterface');
  c.addUseClause('soroban_sdk::crypto', 'Hash');
  c.addUseClause('stellar_accounts::smart_account', 'self', { alias: 'smart_account' });
  c.addUseClause('stellar_accounts::smart_account', 'AuthPayload');
  // `ContextRule` is the return type of several `SmartAccount` methods, which the
  // contracttrait macro needs in scope even though the generated code never
  // names it.
  c.addUseClause('stellar_accounts::smart_account', 'ContextRule');
  c.addUseClause('stellar_accounts::smart_account', 'ContextRuleType');
  c.addUseClause('stellar_accounts::smart_account', 'Signer');
  c.addUseClause('stellar_accounts::smart_account', 'SmartAccount');
  c.addUseClause('stellar_accounts::smart_account', 'SmartAccountError');

  // The arguments the signers are read from, in assembly order: what `weights`
  // is positionally aligned with.
  const signerArgs: string[] = [];
  const signerLines: string[] = ['let mut signers = Vec::new(e);'];

  if (opts.delegatedSigners) {
    signerArgs.push('delegated_signers');
    c.addConstructorArgument({ name: 'delegated_signers', type: 'Vec<Address>' });
    signerLines.push(
      'for account in delegated_signers.iter() {',
      '    signers.push_back(Signer::Delegated(account));',
      '}',
    );
  }

  for (const { option, prefix, label } of externalSigners) {
    if (!opts[option]) continue;

    signerArgs.push(`${prefix}_keys`);
    c.addUseClause('soroban_sdk', 'Bytes');
    // Verifier contracts are stateless, immutable and shareable, so one address
    // per signature type serves every key of that type.
    c.addConstructorArgument({
      name: `${prefix}_verifier`,
      type: 'Address',
      comment: [`${label} verifier contract, shared by every ${label} key.`, ...REGISTRY_HINT],
    });
    c.addConstructorArgument({ name: `${prefix}_keys`, type: 'Vec<Bytes>' });
    signerLines.push(
      `for key in ${prefix}_keys.iter() {`,
      `    signers.push_back(Signer::External(${prefix}_verifier.clone(), key));`,
      '}',
    );
  }

  // Adding the policy after the signers keeps the signer arguments first, which
  // is the order `weights` is aligned with.
  const policyCode = addPolicy(c, opts, signerArgs);

  c.addConstructorCodeBlock([...signerLines, '']);
  c.addConstructorCodeBlock([...policyCode, '']);
  // The trait's `add_context_rule` requires auth from the account itself, which
  // cannot be satisfied before any rule exists, so the constructor goes through
  // the module-level function instead.
  c.addConstructorCodeBlock([
    'smart_account::add_context_rule(',
    '    e,',
    '    &ContextRuleType::Default,',
    `    &String::from_str(e, "${contextRuleName(opts.policy)}"),`,
    '    None,',
    '    &signers,',
    '    &policies,',
    ');',
  ]);

  c.addTraitFunction(
    {
      traitName: 'CustomAccountInterface',
      structName: c.name,
      tags: ['contractimpl'],
      assocType: ['type Error = SmartAccountError;', 'type Signature = AuthPayload;'],
      priority: 0,
    },
    functions.__check_auth,
  );

  // Every `SmartAccount` method authorizes with
  // `e.current_contract_address().require_auth()`, which routes back into
  // `__check_auth` and the context rules, so the library defaults are kept as is.
  c.addTraitImplBlock({
    traitName: 'SmartAccount',
    structName: c.name,
    tags: ['contractimpl(contracttrait)'],
    priority: 1,
  });
}

/**
 * Adds the policy constructor arguments and returns the code that builds the
 * policy map passed to `add_context_rule`.
 */
function addPolicy(c: ContractBuilder, opts: Required<AccountOptions>, signerArgs: string[]): string[] {
  if (opts.policy === false) {
    return ['let policies: Map<Address, Val> = Map::new(e);'];
  }

  c.addUseClause('soroban_sdk', 'IntoVal');

  const lines: string[] = [];
  let installParam: string;

  if (opts.policy === 'weighted-threshold') {
    c.addUseClause('soroban_sdk', 'panic_with_error');
    c.addUseClause('stellar_accounts::policies::weighted_threshold', 'WeightedThresholdAccountParams');
    c.addError('WeightsLengthMismatch', WEIGHTS_LENGTH_MISMATCH_ERROR);
    // A flat vector rather than a `Map<Signer, u32>` so that callers never have
    // to spell out `Signer` values, which is the point of the typed
    // per-signer-type arguments. The assembly order fixes the signer indices,
    // so whoever deploys the contract needs to know it.
    c.addConstructorArgument({
      name: 'weights',
      type: 'Vec<u32>',
      comment:
        signerArgs.length === 1
          ? [`One weight per signer, positionally aligned with \`${signerArgs[0]}\`.`]
          : [
              'One weight per signer, positionally aligned with the signers assembled',
              `from ${signerArgs.join(', ')}, in that order.`,
            ],
    });

    lines.push(
      'if weights.len() != signers.len() {',
      `    panic_with_error!(e, ${c.name}Error::WeightsLengthMismatch);`,
      '}',
      '',
      'let mut signer_weights: Map<Signer, u32> = Map::new(e);',
      'for (i, signer) in signers.iter().enumerate() {',
      '    signer_weights.set(signer, weights.get_unchecked(i as u32));',
      '}',
      '',
    );
    installParam = 'WeightedThresholdAccountParams { signer_weights, threshold }';
  } else {
    c.addUseClause('stellar_accounts::policies::simple_threshold', 'SimpleThresholdAccountParams');
    installParam = 'SimpleThresholdAccountParams { threshold }';
  }

  // The threshold is a deployment argument because it is only valid relative to
  // the number of signers, which is not known when the contract is generated.
  c.addConstructorArgument({ name: 'threshold', type: 'u32' });
  c.addConstructorArgument({
    name: 'threshold_policy',
    type: 'Address',
    comment: [
      `${opts.policy === 'weighted-threshold' ? 'Weighted threshold' : 'Simple threshold'} policy contract.`,
      ...REGISTRY_HINT,
    ],
  });

  lines.push(
    'let mut policies: Map<Address, Val> = Map::new(e);',
    'policies.set(',
    '    threshold_policy,',
    `    ${installParam}.into_val(e),`,
    ');',
  );

  return lines;
}

// Direct contract-to-contract calls are always authorized in Soroban, so an
// account needs this entry point to reach contracts it owns, such as its own
// policies, without the call re-entering `__check_auth`.
function addExecutionEntryPoint(c: ContractBuilder) {
  c.addUseClause('stellar_accounts::smart_account', 'ExecutionEntryPoint');
  // `execute` takes the target function name as a `Symbol`, which the
  // contracttrait macro needs in scope.
  c.addUseClause('soroban_sdk', 'Symbol');

  c.addTraitImplBlock({
    traitName: 'ExecutionEntryPoint',
    structName: c.name,
    tags: ['contractimpl(contracttrait)'],
    priority: 2,
  });
}

export const functions = defineFunctions({
  // CustomAccountInterface Trait
  __check_auth: {
    args: [
      { name: 'e', type: 'Env' },
      { name: 'signature_payload', type: 'Hash<32>' },
      { name: 'signatures', type: 'AuthPayload' },
      { name: 'auth_contexts', type: 'Vec<Context>' },
    ],
    returns: 'Result<(), Self::Error>',
    code: ['smart_account::do_check_auth(&e, &signature_payload, &signatures, &auth_contexts)'],
  },
});
