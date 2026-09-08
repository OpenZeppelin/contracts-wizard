import type { ContractBuilder } from './contract';
import type { Access, Restrictions } from './common-options';
import type { Lines } from './utils/format-lines';
import { bullet, paragraph } from './utils/doc';

export type FaucetKind = 'Fungible' | 'NonFungible';

export interface FaucetFeatures {
  kind: FaucetKind;
  /** Whether any holder can burn the asset by sending it back to the faucet. Otherwise only the owner can. */
  burnable: boolean;
  /**
   * Minimum amount that can be burned at once, in token units as displayed in the documentation. Only
   * applies to fungible tokens; the `MIN_BURN_AMOUNT` constant must have been added when set.
   */
  minBurnAmount?: string;
  pausable: boolean;
  restrictions: Restrictions;
  /** Whether the other standard policies are registered as alternatives that can be activated after deployment. */
  switchablePolicies: boolean;
  /** Whether the faucet exposes authority-gated metadata setters that are usable after deployment. */
  updatableMetadata: boolean;
}

interface RoleAssignment {
  /** Name of the associated constant holding the role symbol, e.g. `PAUSER_ROLE`. */
  constant: string;
  /** The role symbol. */
  symbol: string;
  /** Local variable holding the parsed `RoleSymbol`. */
  variable: string;
  comment: string;
  /** Expressions evaluating to the procedure roots gated by the role. */
  procedureRoots: string[];
}

/**
 * Adds the documentation, token policy manager, access control and account creation function of a faucet
 * account to the contract. The kind-specific `faucet()` function and constants must be added beforehand.
 */
export function addFaucetAccount(c: ContractBuilder, access: Access, features: FaucetFeatures): void {
  addDocumentation(c, access, features);
  addTokenPolicyManager(c, access, features);

  if (access === false) {
    addUserAccountCreation(c, features);
  } else {
    if (access === 'roles') {
      addProcedureRoles(c, features);
    }
    addAllowedNotes(c, access, features);
    addFeePolicyManager(c);
    addNetworkAccountCreation(c, access, features);
  }
}

function assetNoun(kind: FaucetKind, plural = true): string {
  if (kind === 'Fungible') {
    return plural ? 'tokens' : 'token';
  } else {
    return plural ? 'NFTs' : 'NFT';
  }
}

/** Returns the asset noun agreeing in number with `amount`, a validated decimal string. */
function assetNounFor(kind: FaucetKind, amount: string): string {
  return assetNoun(kind, Number(amount) !== 1);
}

function addDocumentation(c: ContractBuilder, access: Access, features: FaucetFeatures): void {
  const name = c.name.stringLiteral;
  const intro =
    features.kind === 'Fungible'
      ? `Fungible faucet account issuing the \`${name}\` token.`
      : `Non-fungible faucet account issuing the \`${name}\` NFT collection.`;

  let model: string;
  switch (access) {
    case false:
      model =
        'The faucet is a user account authenticated by a single signature: every transaction, including ' +
        'minting, must be signed by the key holder, who is the sole authority over the configuration of the faucet.';
      break;
    case 'ownable':
      model =
        'The faucet is a network account: the network consumes the MINT, BURN and config notes sent to it, ' +
        'and the privileged procedures are gated by the owner account, with two-step ownership transfer.';
      break;
    case 'roles':
      model =
        'The faucet is a network account: the network consumes the MINT, BURN and config notes sent to it, ' +
        'and the privileged procedures are gated by role-based access control. Minting and burning are ' +
        'gated by owner-only policies, which check the `Ownable2Step` owner.';
      break;
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }

  const lines = [...paragraph(intro, 0), '', ...paragraph(model, 0)];

  if (features.pausable) {
    const nouns = assetNoun(features.kind);
    let pausing: string;
    if (features.restrictions !== false) {
      pausing =
        'The faucet can be paused. While paused, minting, burning, metadata updates and transfers of the ' +
        `${nouns} are rejected.`;
    } else if (features.switchablePolicies) {
      pausing =
        'The faucet can be paused. While paused, minting, burning and metadata updates are rejected, and so are ' +
        `transfers of the ${nouns} once a transfer policy has been activated.`;
    } else {
      pausing =
        'The faucet can be paused. While paused, minting, burning and metadata updates are rejected. Transfers ' +
        `of the ${nouns} are not affected, since the faucet is not consulted on transfers of an unrestricted asset.`;
    }
    lines.push('', ...paragraph(pausing, 0));
  }

  for (const line of lines) {
    c.addDocumentation(line);
  }
}

/** Whether the allowlist manager component is installed, either for the active policy or as a reserved alternative. */
function hasAllowlist(features: FaucetFeatures): boolean {
  return features.restrictions === 'allowlist' || features.switchablePolicies;
}

/** Whether the blocklist manager component is installed, either for the active policy or as a reserved alternative. */
function hasBlocklist(features: FaucetFeatures): boolean {
  return features.restrictions === 'blocklist' || features.switchablePolicies;
}

/** Whether the minimum burn amount policy is installed, either as the active burn policy or as a reserved alternative. */
function hasMinBurnAmount(features: FaucetFeatures): boolean {
  return features.minBurnAmount !== undefined || (features.switchablePolicies && features.kind === 'Fungible');
}

function addTokenPolicyManager(c: ContractBuilder, access: Access, features: FaucetFeatures): void {
  const { kind, burnable, minBurnAmount, restrictions, switchablePolicies } = features;
  const network = access !== false;
  const nouns = assetNoun(kind);

  c.addUseClause('miden_standards::account::policies', 'TokenPolicyManager');
  c.addUseClause('miden_standards::account::policies', 'MintPolicy');
  c.addUseClause('miden_standards::account::policies', 'BurnPolicy');

  const setup: Lines[] = [];

  // Mint policies. The owner-only policy checks the `Ownable2Step` owner, which user accounts do not have.
  const activeMint = network ? 'MintPolicy::owner_only()' : 'MintPolicy::allow_all()';
  const mintLines: string[] = [`.active_mint_policy(${activeMint})`];
  if (switchablePolicies && network) {
    mintLines.push('.allowed_mint_policy(MintPolicy::allow_all())');
  }
  const mintDoc =
    access === false
      ? `Minting: every mint is accepted once the transaction is authenticated by the signature of the key holder.`
      : `Minting: only the owner can mint, by sending a MINT note to the faucet.`;

  // Burn policies.
  let activeBurn: string;
  let burnDoc: string;
  if (minBurnAmount !== undefined) {
    c.addUseClause('miden_protocol::asset', 'AssetAmount');
    setup.push('let min_burn_amount = AssetAmount::new(Self::MIN_BURN_AMOUNT).expect("valid amount");');
    activeBurn = 'BurnPolicy::min_burn_amount(min_burn_amount)';
    burnDoc =
      `Burning: any holder can burn ${nouns} by sending them back to the faucet in a BURN note, ` +
      `in amounts of at least ${minBurnAmount} ${assetNounFor(kind, minBurnAmount)}.`;
  } else if (burnable) {
    activeBurn = 'BurnPolicy::allow_all()';
    burnDoc = `Burning: any holder can burn ${nouns} by sending them back to the faucet in a BURN note.`;
  } else {
    activeBurn = 'BurnPolicy::owner_only()';
    burnDoc = `Burning: only the owner can burn ${nouns}, by sending them back to the faucet in a BURN note.`;
  }
  const burnLines: string[] = [`.active_burn_policy(${activeBurn})`];
  if (switchablePolicies) {
    if (activeBurn !== 'BurnPolicy::allow_all()') {
      burnLines.push('.allowed_burn_policy(BurnPolicy::allow_all())');
    }
    if (network && activeBurn !== 'BurnPolicy::owner_only()') {
      burnLines.push('.allowed_burn_policy(BurnPolicy::owner_only())');
    }
    if (kind === 'Fungible' && minBurnAmount === undefined) {
      c.addUseClause('miden_protocol::asset', 'AssetAmount');
      burnLines.push('.allowed_burn_policy(BurnPolicy::min_burn_amount(AssetAmount::ZERO))');
    }
  }

  // Transfer policies, registered for both the send and the receive side.
  const transferLines: string[] = [];
  let activeTransfer: string | undefined;
  let transferDoc: string;
  switch (restrictions) {
    case false:
      transferDoc = switchablePolicies
        ? 'Transfers: unrestricted; asset callbacks are enabled so that an allowlist or a blocklist can be ' +
          'activated later.'
        : 'Transfers: unrestricted, so asset callbacks are disabled for the faucet.';
      break;
    case 'allowlist':
      activeTransfer = 'empty_basic_allowlist';
      transferDoc = `Transfers: only accounts on the allowlist can send or receive the ${nouns}.`;
      break;
    case 'blocklist':
      activeTransfer = 'empty_basic_blocklist';
      transferDoc = `Transfers: accounts on the blocklist can neither send nor receive the ${nouns}.`;
      break;
    default: {
      const _: never = restrictions;
      throw new Error('Unknown value for `restrictions`');
    }
  }
  if (activeTransfer !== undefined) {
    transferLines.push(
      `.active_send_policy(TransferPolicy::${activeTransfer}())`,
      `.active_receive_policy(TransferPolicy::${activeTransfer}())`,
    );
  }
  if (switchablePolicies) {
    for (const alternative of ['allow_all', 'empty_basic_allowlist', 'empty_basic_blocklist']) {
      if (alternative !== activeTransfer) {
        transferLines.push(
          `.allowed_send_policy(TransferPolicy::${alternative}())`,
          `.allowed_receive_policy(TransferPolicy::${alternative}())`,
        );
      }
    }
  }
  if (transferLines.length > 0) {
    c.addUseClause('miden_standards::account::policies', 'TransferPolicy');
  }

  const comments = [
    ...paragraph('Returns the token policy manager gating minting, burning and transfers.', 1),
    '',
    ...bullet(mintDoc, 1),
    ...bullet(burnDoc, 1),
    ...bullet(transferDoc, 1),
  ];
  if (switchablePolicies) {
    const switchable: string[] = [];
    if (mintLines.length > 1) {
      switchable.push('mint');
    }
    if (burnLines.length > 1) {
      switchable.push('burn');
    }
    switchable.push('send', 'receive');
    const kinds = `${switchable.slice(0, -1).join(', ')} and ${switchable[switchable.length - 1]}`;
    comments.push(
      '',
      ...paragraph(
        `The other standard policies are registered as allowed alternatives, so the active ${kinds} policies ` +
          'can be switched after deployment' +
          (network ? ' by sending a policy config note.' : ' by the key holder.'),
        1,
      ),
    );
  }

  if (setup.length > 0) {
    setup.push('');
  }

  c.addFunction({
    name: 'token_policy_manager',
    comments,
    args: [],
    returns: 'TokenPolicyManager',
    code: [...setup, 'TokenPolicyManager::builder()', [...mintLines, ...burnLines, ...transferLines, '.build()']],
    pub: true,
  });
}

/**
 * Returns the components installed on the account for the selected features, in installation order, together
 * with the `use` declarations they need.
 */
function featureComponents(c: ContractBuilder, features: FaucetFeatures): string[] {
  const components: string[] = [];

  if (hasAllowlist(features)) {
    c.addUseClause('miden_standards::account::policies', 'AllowlistManager');
    components.push('.with_component(AllowlistManager)');
  }
  if (hasBlocklist(features)) {
    c.addUseClause('miden_standards::account::policies', 'BlocklistManager');
    components.push('.with_component(BlocklistManager)');
  }

  if (features.pausable) {
    c.addUseClause('miden_standards::account::access', 'Pausable');
    c.addUseClause('miden_standards::account::access', 'PausableManager');
    components.push('.with_component(Pausable::unpaused())', '.with_component(PausableManager)');
  }

  return components;
}

const INIT_SEED_DOC =
  '`init_seed`: seed the account ID is derived from; use a cryptographically secure random number generator.';

function addUserAccountCreation(c: ContractBuilder, features: FaucetFeatures): void {
  c.addUseClause('miden_protocol::account', 'Account');
  c.addUseClause('miden_protocol::account', 'AccountBuilder');
  c.addUseClause('miden_protocol::account', 'AccountType');
  c.addUseClause('miden_protocol::account::auth', 'PublicKey');
  c.addUseClause('miden_protocol::errors', 'AccountError');
  c.addUseClause('miden_standards::account::access', 'Authority');
  c.addUseClause('miden_standards::account::auth', 'AuthSingleSig');

  const chain: string[] = [
    '.account_type(account_type)',
    '.with_component(AuthSingleSig::from_public_key(public_key))',
    '.with_component(Self::faucet())',
    '.with_component(Authority::AuthControlled)',
    '.with_components(Self::token_policy_manager())',
    ...featureComponents(c, features),
    '.build()',
  ];

  c.addFunction({
    name: 'create',
    comments: [
      ...paragraph('Creates the faucet as a user account controlled by the holder of `public_key`.', 1),
      '',
      '# Arguments',
      '',
      ...bullet(INIT_SEED_DOC, 1),
      ...bullet(
        '`public_key`: public key of the single-signature authentication component. Every transaction of ' +
          'the faucet, including minting, must be signed with the matching secret key.',
        1,
      ),
      ...bullet('`account_type`: whether the account state is stored on-chain (public) or off-chain (private).', 1),
    ],
    args: [
      { name: 'init_seed', type: '[u8; 32]' },
      { name: 'public_key', type: 'PublicKey' },
      { name: 'account_type', type: 'AccountType' },
    ],
    returns: 'Result<Account, AccountError>',
    code: ['AccountBuilder::new(init_seed)', chain],
    pub: true,
  });
}

function roleAssignments(features: FaucetFeatures): RoleAssignment[] {
  const roles: RoleAssignment[] = [];

  if (features.pausable) {
    roles.push({
      constant: 'PAUSER_ROLE',
      symbol: 'PAUSER',
      variable: 'pauser',
      comment: 'Role allowed to pause and unpause the faucet.',
      procedureRoots: ['PausableManager::pause_root()', 'PausableManager::unpause_root()'],
    });
  }

  if (hasAllowlist(features)) {
    roles.push({
      constant: 'ALLOWLISTER_ROLE',
      symbol: 'ALLOWLISTER',
      variable: 'allowlister',
      comment: 'Role allowed to add accounts to and remove accounts from the allowlist.',
      procedureRoots: ['AllowlistManager::allow_account_root()', 'AllowlistManager::disallow_account_root()'],
    });
  }

  if (hasBlocklist(features)) {
    roles.push({
      constant: 'BLOCKLISTER_ROLE',
      symbol: 'BLOCKLISTER',
      variable: 'blocklister',
      comment: 'Role allowed to add accounts to and remove accounts from the blocklist.',
      procedureRoots: ['BlocklistManager::block_account_root()', 'BlocklistManager::unblock_account_root()'],
    });
  }

  // Every network faucet installs the constant fee manager, so the fee schedule is always role-gated.
  roles.push({
    constant: 'FEE_MANAGER_ROLE',
    symbol: 'FEE_MANAGER',
    variable: 'fee_manager',
    comment: 'Role allowed to change the fee charged for each note script the faucet consumes.',
    procedureRoots: ['ConstantFeeManager::set_note_fee_root()'],
  });

  return roles;
}

function addProcedureRoles(c: ContractBuilder, features: FaucetFeatures): void {
  const roles = roleAssignments(features);

  c.addUseClause('std::collections', 'BTreeMap');
  c.addUseClause('miden_protocol::account', 'AccountProcedureRoot');
  c.addUseClause('miden_protocol::account', 'RoleSymbol');

  for (const role of roles) {
    c.addConstant({
      name: role.constant,
      type: "&'static str",
      value: `"${role.symbol}"`,
      comments: [role.comment],
    });
  }

  const variables = roles.map(
    role => `let ${role.variable} = RoleSymbol::new(Self::${role.constant}).expect("role symbol is valid");`,
  );

  const entries = roles.flatMap(role =>
    role.procedureRoots.map((root, i) => {
      const value = i < role.procedureRoots.length - 1 ? `${role.variable}.clone()` : role.variable;
      return `(${root}, ${value}),`;
    }),
  );

  c.addFunction({
    name: 'procedure_roles',
    comments: [
      ...paragraph('Returns the role required to invoke each authority-gated procedure.', 1),
      '',
      ...paragraph(
        'Procedures without an entry, such as the metadata and policy setters, fall back to the `ADMIN` role.',
        1,
      ),
    ],
    args: [],
    returns: 'BTreeMap<AccountProcedureRoot, RoleSymbol>',
    code: [...variables, '', 'BTreeMap::from([', entries, '])'],
    pub: true,
  });
}

function configNotes(access: Access, features: FaucetFeatures): string[] {
  const notes: string[] = [];
  // Both access control modes install `Ownable2Step`: the owner is checked by the owner-only mint and burn
  // policies, and the owner config note transfers ownership.
  notes.push('OwnerConfigNote');
  if (access === 'roles') {
    notes.push('RbacConfigNote');
  }
  if (features.pausable) {
    notes.push('PauseConfigNote');
  }
  if (hasAllowlist(features)) {
    notes.push('AllowlistConfigNote');
  }
  if (hasBlocklist(features)) {
    notes.push('BlocklistConfigNote');
  }
  if (hasMinBurnAmount(features)) {
    notes.push('MinBurnAmountConfigNote');
  }
  if (features.switchablePolicies) {
    notes.push('FaucetPolicyConfigNote');
  }
  if (features.updatableMetadata) {
    notes.push('FaucetMetadataConfigNote');
  }
  // The fee schedule starts at zero and is adjusted after deployment through this note.
  notes.push('ConstantFeePolicyConfigNote');
  return notes;
}

function addAllowedNotes(c: ContractBuilder, access: Access, features: FaucetFeatures): void {
  c.addUseClause('std::collections', 'BTreeSet');
  c.addUseClause('miden_protocol::note', 'NoteScriptRoot');
  c.addUseClause('miden_standards::note', 'MintNote');
  c.addUseClause('miden_standards::note', 'BurnNote');

  const notes = ['MintNote', 'BurnNote'];
  for (const note of configNotes(access, features)) {
    c.addUseClause('miden_standards::note::config', note);
    notes.push(note);
  }

  c.addFunction({
    name: 'allowed_notes',
    comments: [
      ...paragraph('Returns the script roots of the notes the network may consume on behalf of the faucet.', 1),
      '',
      ...paragraph(
        'Besides the MINT and BURN notes, the config notes carrying the management actions of the installed ' +
          'components are allowlisted, so that the faucet can be managed by sending them.',
        1,
      ),
    ],
    args: [],
    returns: 'BTreeSet<NoteScriptRoot>',
    code: ['BTreeSet::from([', notes.map(note => `${note}::script_root(),`), '])'],
    pub: true,
  });
}

function addFeePolicyManager(c: ContractBuilder): void {
  c.addUseClause('miden_protocol::account', 'AccountId');
  c.addUseClause('miden_protocol::asset', 'AssetAmount');
  c.addUseClause('miden_standards::account::fees', 'BasicConstantFeePolicy');
  c.addUseClause('miden_standards::account::fees', 'FeePolicyManager');
  c.addUseClause('miden_standards::note::config', 'NetworkAccountConfigNote');

  c.addFunction({
    name: 'fee_policy_manager',
    comments: [
      ...paragraph(
        'Returns the fee policy manager pricing the notes the faucet consumes, in the asset issued by the ' +
          'faucet `fee_faucet_id`.',
        1,
      ),
      '',
      ...paragraph(
        'Every allowlisted note is scheduled with a zero fee: senders prepay nothing, and the faucet covers the ' +
          'network fee of each note it consumes from its own vault (nothing on fee-free chains). Fees can be ' +
          'scheduled per note script after deployment by sending ConstantFeePolicy config notes.',
        1,
      ),
    ],
    args: [{ name: 'fee_faucet_id', type: 'AccountId' }],
    returns: 'FeePolicyManager',
    code: [
      'let fee_policy = BasicConstantFeePolicy::new().with_fees(',
      [
        'Self::allowed_notes()',
        [
          '.into_iter()',
          '.chain([NetworkAccountConfigNote::script_root()])',
          '.map(|script_root| (script_root, AssetAmount::ZERO)),',
        ],
      ],
      ');',
      '',
      'FeePolicyManager::builder()',
      ['.fee_faucet_id(fee_faucet_id)', '.active_fee_policy(fee_policy.into())', '.build()'],
    ],
    pub: true,
  });
}

function addNetworkAccountCreation(c: ContractBuilder, access: Exclude<Access, false>, features: FaucetFeatures): void {
  c.addUseClause('miden_protocol::account', 'Account');
  c.addUseClause('miden_protocol::account', 'AccountId');
  c.addUseClause('miden_protocol::errors', 'AccountError');
  c.addUseClause('miden_standards::account::access', 'AccessControl');
  c.addUseClause('miden_standards::account::auth', 'NetworkAccount');
  c.addUseClause('miden_standards::account::fees', 'ConstantFeeManager');

  const authority = access === 'ownable' ? 'owner' : 'admin';

  const setup: Lines[] = [];
  const accessControlComponents: string[] = [];
  const authorityDoc: string[] = [];
  let summary: string;
  switch (access) {
    case 'ownable':
      summary = 'Creates the faucet as a public network account owned by `owner`.';
      accessControlComponents.push('.with_components(AccessControl::Ownable2Step { owner })');
      authorityDoc.push(
        ...bullet(
          '`owner`: account owning the faucet. It mints by sending MINT notes and manages the faucet by sending ' +
            'config notes. Ownership can be transferred in two steps.',
          1,
        ),
      );
      break;
    case 'roles': {
      summary = 'Creates the faucet as a public network account administered by `admin`.';
      c.addUseClause('miden_standards::account::access', 'Ownable2Step');
      setup.push(
        'let access_control = AccessControl::Rbac {',
        ['admin,', 'procedure_roles: Self::procedure_roles(),'],
        '};',
      );
      accessControlComponents.push('.with_components(access_control)', '.with_component(Ownable2Step::new(admin))');
      authorityDoc.push(
        ...bullet(
          '`admin`: account seeded as the initial member of the `ADMIN` role, which administers every other ' +
            'role, and as the owner checked by the owner-only mint and burn policies. Roles are granted and ' +
            'revoked by sending RBAC config notes.',
          1,
        ),
      );
      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }

  setup.push('let fee_policy_manager = Self::fee_policy_manager(fee_faucet_id);', '');

  const chain: string[] = [
    '.expect("note allowlist is not empty")',
    '.with_component(Self::faucet())',
    ...accessControlComponents,
    '.with_components(Self::token_policy_manager())',
    ...featureComponents(c, features),
    '.with_component(ConstantFeeManager::for_basic_constant_fee_policy())',
    '.build()',
  ];

  c.addFunction({
    name: 'create',
    comments: [
      ...paragraph(summary, 1),
      '',
      ...paragraph(
        'The network executes the transactions of the faucet: the MINT and BURN notes, as well as the config ' +
          'notes managing the faucet, are consumed automatically once allowlisted (see [`Self::allowed_notes`]).',
        1,
      ),
      '',
      '# Arguments',
      '',
      ...bullet(INIT_SEED_DOC, 1),
      ...authorityDoc,
      ...bullet(
        '`fee_faucet_id`: ID of the faucet issuing the native fee asset of the chain (see ' +
          '`ProtocolConfig::fee_asset_id`). The faucet prices the notes it consumes and pays its own network ' +
          'transaction fees in this asset.',
        1,
      ),
    ],
    args: [
      { name: 'init_seed', type: '[u8; 32]' },
      { name: authority, type: 'AccountId' },
      { name: 'fee_faucet_id', type: 'AccountId' },
    ],
    returns: 'Result<Account, AccountError>',
    code: [...setup, 'NetworkAccount::builder(init_seed, Self::allowed_notes(), fee_policy_manager)', chain],
    pub: true,
  });
}
