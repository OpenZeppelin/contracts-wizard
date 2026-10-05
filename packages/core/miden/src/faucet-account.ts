import type { ContractBuilder } from './contract';
import type { Access, TransferPolicy } from './common-options';
import type { Lines } from './utils/format-lines';
import { bullet, paragraph } from './utils/doc';

export type FaucetKind = 'Fungible' | 'NonFungible';

/** The standard burn policies of `miden-standards`. `'minimumAmount'` only applies to fungible tokens. */
export type BurnPolicy = 'anyHolder' | 'minimumAmount' | 'ownerOnly';

export interface FaucetFeatures {
  kind: FaucetKind;
  /** The active burn policy. `'minimumAmount'` requires the `MIN_BURN_AMOUNT` constant to have been added. */
  burnPolicy: BurnPolicy;
  pausable: boolean;
  /** Whether pausing also stops transfers. Without a transfer policy, an allow-all policy is made active for this. */
  pausableTransfers: boolean;
  transferPolicy: TransferPolicy;
  /** Whether the standard transfer policies are registered as alternatives that can be activated after deployment. */
  switchableTransferPolicy: boolean;
  /** Whether the faucet exposes authority-gated metadata setters that are usable after deployment. */
  updatableMetadata: boolean;
}

interface RoleAssignment {
  /** Name of the associated constant holding the role symbol, e.g. `PAUSER_ROLE`. */
  constant: string;
  /** The role symbol. */
  symbol: string;
  /** Local variable of `procedure_roles` holding the parsed `RoleSymbol`. */
  variable: string;
  /** Argument of `create` holding the initial member of the role. */
  member: string;
  /** Expressions evaluating to the procedure roots gated by the role. */
  procedureRoots: string[];
}

/** The standard transfer policies, as `TransferPolicy` constructors. */
const TRANSFER_POLICIES = ['allow_all', 'empty_basic_allowlist', 'empty_basic_blocklist'] as const;

type TransferPolicyConstructor = (typeof TRANSFER_POLICIES)[number];

/**
 * Adds the documentation, token policy manager, access control and account creation function of a faucet
 * account to the contract. The kind-specific `faucet()` function and constants must be added beforehand.
 */
export function addFaucetAccount(c: ContractBuilder, access: Access, features: FaucetFeatures): void {
  addDocumentation(c, access, features);
  addTokenPolicyManager(c, access, features);

  if (access === 'singleKey') {
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

/**
 * The transfer policy active at creation, applied to both the send and the receive side. Pausing transfers without
 * a transfer policy makes the allow-all policy active, since the pause flag is only checked by an active policy.
 */
function activeTransferPolicy(features: FaucetFeatures): TransferPolicyConstructor | undefined {
  switch (features.transferPolicy) {
    case 'allowlist':
      return 'empty_basic_allowlist';
    case 'blocklist':
      return 'empty_basic_blocklist';
    case false:
      return features.pausableTransfers ? 'allow_all' : undefined;
    default: {
      const _: never = features.transferPolicy;
      throw new Error('Unknown value for `transferPolicy`');
    }
  }
}

/** Whether a transfer policy is registered, which enables asset callbacks: every transfer consults the faucet. */
function hasAssetCallbacks(features: FaucetFeatures): boolean {
  return activeTransferPolicy(features) !== undefined || features.switchableTransferPolicy;
}

function addDocumentation(c: ContractBuilder, access: Access, features: FaucetFeatures): void {
  let model: string;
  switch (access) {
    case 'singleKey':
      model =
        'The faucet is a user account: the key holder signs every transaction of the faucet itself, including minting.';
      break;
    case 'ownable':
      model =
        'The faucet is a network account: the network consumes the notes sent to it, and the owner manages the ' +
        'faucet by sending config notes.';
      break;
    case 'roles':
      model =
        'The faucet is a network account: the network consumes the notes sent to it, and role holders manage the ' +
        'faucet by sending config notes. Minting is done by the faucet owner, initially the admin.';
      break;
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }

  const lines = [...paragraph(model, 0)];

  if (features.pausable) {
    let pausing: string;
    if (activeTransferPolicy(features) !== undefined) {
      pausing =
        'The faucet can be paused. While paused, minting, burning, metadata updates and transfers of the tokens ' +
        'are rejected.';
    } else if (features.switchableTransferPolicy) {
      pausing =
        'The faucet can be paused. While paused, minting, burning and metadata updates are rejected, and so are ' +
        'transfers of the tokens once a transfer policy has been activated.';
    } else {
      pausing =
        'The faucet can be paused. While paused, minting, burning and metadata updates are rejected. Transfers ' +
        'of the tokens are not affected, since they do not consult the faucet.';
    }
    lines.push('', ...paragraph(pausing, 0));
  }

  for (const line of lines) {
    c.addDocumentation(line);
  }
}

/** Whether the allowlist manager component is installed, either for the active policy or as a reserved alternative. */
function hasAllowlist(features: FaucetFeatures): boolean {
  return features.transferPolicy === 'allowlist' || features.switchableTransferPolicy;
}

/** Whether the blocklist manager component is installed, either for the active policy or as a reserved alternative. */
function hasBlocklist(features: FaucetFeatures): boolean {
  return features.transferPolicy === 'blocklist' || features.switchableTransferPolicy;
}

function addTokenPolicyManager(c: ContractBuilder, access: Access, features: FaucetFeatures): void {
  const network = access !== 'singleKey';

  c.addUseClause('miden_standards::account::policies', 'TokenPolicyManager');
  c.addUseClause('miden_standards::account::policies', 'MintPolicy');
  c.addUseClause('miden_standards::account::policies', 'BurnPolicy');

  const setup: Lines[] = [];

  // The owner-only mint policy checks the faucet owner, which a Single Key faucet does not have: there, the
  // signature of the key holder gates minting.
  const lines: string[] = [`.active_mint_policy(${network ? 'MintPolicy::owner_only()' : 'MintPolicy::allow_all()'})`];

  switch (features.burnPolicy) {
    case 'anyHolder':
      lines.push('.active_burn_policy(BurnPolicy::allow_all())');
      break;
    case 'minimumAmount':
      c.addUseClause('miden_protocol::asset', 'AssetAmount');
      setup.push(
        'let min_burn_amount =',
        ['AssetAmount::new(Self::MIN_BURN_AMOUNT).expect("minimum burn amount should be valid");'],
        '',
      );
      lines.push('.active_burn_policy(BurnPolicy::min_burn_amount(min_burn_amount))');
      break;
    case 'ownerOnly':
      lines.push('.active_burn_policy(BurnPolicy::owner_only())');
      break;
    default: {
      const _: never = features.burnPolicy;
      throw new Error('Unknown value for `burnPolicy`');
    }
  }

  // Transfer policies are registered for both the send and the receive side. Only transfer policies are
  // registered as alternatives: no mint or burn policy can be switched after deployment.
  const active = activeTransferPolicy(features);
  if (active !== undefined) {
    lines.push(
      `.active_send_policy(TransferPolicy::${active}())`,
      `.active_receive_policy(TransferPolicy::${active}())`,
    );
  }
  if (features.switchableTransferPolicy) {
    for (const alternative of TRANSFER_POLICIES) {
      if (alternative !== active) {
        lines.push(
          `.allowed_send_policy(TransferPolicy::${alternative}())`,
          `.allowed_receive_policy(TransferPolicy::${alternative}())`,
        );
      }
    }
  }
  if (hasAssetCallbacks(features)) {
    c.addUseClause('miden_standards::account::policies', 'TransferPolicy');
  }

  const burning: string[] = [];
  if (!network) {
    burning.push(
      'Any holder can request a burn by sending tokens back to the faucet in a BURN note; the key holder must process ' +
        'each request.',
    );
  } else if (features.burnPolicy === 'ownerOnly') {
    burning.push(
      'Only the faucet owner can burn tokens. A BURN note from any other holder is rejected, and the tokens in it ' +
        'stay locked, since BURN notes cannot be reclaimed.',
    );
  }
  if (features.burnPolicy === 'minimumAmount') {
    burning.push(
      'A BURN note below the minimum is rejected. BURN notes cannot be reclaimed, so its tokens stay locked until the ' +
        'faucet accepts the note, which requires lowering the minimum first.',
    );
  }
  const comments: string[] = burning.length > 0 ? [...paragraph(burning.join(' '), 1)] : [];
  if (features.switchableTransferPolicy) {
    if (comments.length > 0) {
      comments.push('');
    }
    comments.push(
      ...paragraph(
        'The standard transfer policies are registered as allowed alternatives, so a transfer policy can be ' +
          'activated or switched after deployment' +
          (network ? ' by sending a policy config note.' : ' by the key holder.'),
        1,
      ),
    );
  }

  c.addFunction({
    name: 'token_policy_manager',
    comments,
    args: [],
    returns: 'TokenPolicyManager',
    code: [...setup, 'TokenPolicyManager::builder()', [...lines, '.build()']],
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
  c.addUseClause('miden_standards::account::wallets', 'BasicWallet');

  // The wallet lets the faucet receive the fee token, from which it pays its transaction fees.
  const chain: string[] = [
    '.account_type(account_type)',
    '.with_component(AuthSingleSig::from_public_key(public_key))',
    '.with_component(Self::faucet())',
    '.with_component(BasicWallet)',
    '.with_component(Authority::AuthControlled)',
    '.with_components(Self::token_policy_manager())',
    ...featureComponents(c, features),
    '.build()',
  ];

  const accountTypeDoc = hasAssetCallbacks(features)
    ? "`account_type`: whether the faucet is public or private. With a private faucet, holders must get the faucet's " +
      'current state from the key holder for every transfer, because every transfer consults the faucet.'
    : '`account_type`: whether the faucet is public or private.';

  c.addFunction({
    name: 'create',
    comments: [
      ...paragraph('Creates the faucet as a user account controlled by the holder of `public_key`.', 1),
      '',
      '# Arguments',
      '',
      ...bullet(INIT_SEED_DOC, 1),
      ...bullet(
        '`public_key`: public key of the key holder, who signs every transaction of the faucet. The key can never be ' +
          'changed, so control can never be handed over or renounced.',
        1,
      ),
      ...bullet(accountTypeDoc, 1),
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
      member: 'pauser',
      procedureRoots: ['PausableManager::pause_root()', 'PausableManager::unpause_root()'],
    });
  }

  if (hasAllowlist(features)) {
    roles.push({
      constant: 'ALLOWLISTER_ROLE',
      symbol: 'ALLOWLISTER',
      variable: 'allowlister',
      member: 'allowlister',
      procedureRoots: ['AllowlistManager::allow_account_root()', 'AllowlistManager::disallow_account_root()'],
    });
  }

  if (hasBlocklist(features)) {
    roles.push({
      constant: 'BLOCKLISTER_ROLE',
      symbol: 'BLOCKLISTER',
      variable: 'blocklister',
      member: 'blocklister',
      procedureRoots: ['BlocklistManager::block_account_root()', 'BlocklistManager::unblock_account_root()'],
    });
  }

  // The fee setter has no role of its own and falls back to `ADMIN`: whoever sets fees can make every note, including
  // the config notes that would undo it, too expensive to send, so it must not be a power `ADMIN` cannot take back.
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
      comments: [],
    });
  }

  // Local variables keep the map entries short enough for `rustfmt` to leave each one on a single line.
  const variables = roles.map(role => `let ${role.variable} = ${roleSymbol(role)};`);
  const entries = roles.flatMap(role =>
    role.procedureRoots.map((root, i) => {
      const value = i < role.procedureRoots.length - 1 ? `${role.variable}.clone()` : role.variable;
      return `(${root}, ${value}),`;
    }),
  );
  const code: Lines[] =
    roles.length === 0 ? ['BTreeMap::new()'] : [...variables, '', 'BTreeMap::from([', entries, '])'];

  c.addFunction({
    name: 'procedure_roles',
    comments: paragraph(
      'Procedures without an entry, such as the metadata and fee setters, fall back to the `ADMIN` role.',
      1,
    ),
    args: [],
    returns: 'BTreeMap<AccountProcedureRoot, RoleSymbol>',
    code,
    pub: true,
  });
}

/** Expression parsing the role symbol constant of `role`, using the `role` helper added by `addRoleHelper`. */
function roleSymbol(role: RoleAssignment): string {
  return `Self::role(Self::${role.constant})`;
}

/** Adds the private helper parsing role symbol constants, used by `procedure_roles` and `create`. */
function addRoleHelper(c: ContractBuilder): void {
  c.addFunction({
    name: 'role',
    comments: [],
    args: [{ name: 'symbol', type: '&str' }],
    returns: 'RoleSymbol',
    code: ['RoleSymbol::new(symbol).expect("role symbol should be valid")'],
    pub: false,
  });
}

function configNotes(access: Exclude<Access, 'singleKey'>, features: FaucetFeatures): string[] {
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
  if (features.burnPolicy === 'minimumAmount') {
    notes.push('MinBurnAmountConfigNote');
  }
  if (features.switchableTransferPolicy) {
    notes.push('FaucetPolicyConfigNote');
  }
  if (features.updatableMetadata) {
    notes.push('FaucetMetadataConfigNote');
  }
  // The fee schedule starts at zero and is adjusted after deployment through this note.
  notes.push('ConstantFeePolicyConfigNote');
  return notes;
}

function addAllowedNotes(c: ContractBuilder, access: Exclude<Access, 'singleKey'>, features: FaucetFeatures): void {
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
    comments: paragraph(
      'Returns the script roots of the notes the network may consume on behalf of the faucet, in addition to the ' +
        'defaults of every network account (see `AuthNetworkAccount::default_allowed_note_scripts`).',
      1,
    ),
    args: [],
    returns: 'BTreeSet<NoteScriptRoot>',
    code: ['BTreeSet::from([', notes.map(note => `${note}::script_root(),`), '])'],
    pub: true,
  });
}

function addFeePolicyManager(c: ContractBuilder): void {
  c.addUseClause('miden_protocol::account', 'AccountId');
  c.addUseClause('miden_protocol::asset', 'AssetAmount');
  c.addUseClause('miden_standards::account::auth', 'AuthNetworkAccount');
  c.addUseClause('miden_standards::account::fees', 'BasicConstantFeePolicy');
  c.addUseClause('miden_standards::account::fees', 'FeePolicyManager');

  // `AuthNetworkAccount` allowlists its default notes (such as P2ID deposits of the fee token) on top of
  // `allowed_notes()`. A note without a fee schedule entry cannot be consumed, so they are scheduled too.
  c.addFunction({
    name: 'fee_policy_manager',
    comments: paragraph(
      'Every note the faucet accepts is free for its sender, so the faucet pays the network fee for each one from ' +
        'its own balance, including notes anyone sends it. Before using a network that charges fees, fund the ' +
        'faucet with the fee token and set a price per note (see `miden_tx::NetworkNotePricer`).',
      1,
    ),
    args: [{ name: 'fee_faucet_id', type: 'AccountId' }],
    returns: 'FeePolicyManager',
    code: [
      'let fee_policy = BasicConstantFeePolicy::new().with_fees(',
      [
        'Self::allowed_notes()',
        [
          '.into_iter()',
          '.chain(AuthNetworkAccount::default_allowed_note_scripts())',
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

function addNetworkAccountCreation(
  c: ContractBuilder,
  access: Exclude<Access, 'singleKey'>,
  features: FaucetFeatures,
): void {
  c.addUseClause('miden_protocol::account', 'Account');
  c.addUseClause('miden_protocol::account', 'AccountId');
  c.addUseClause('miden_protocol::errors', 'AccountError');
  c.addUseClause('miden_standards::account::auth', 'NetworkAccount');
  c.addUseClause('miden_standards::account::fees', 'ConstantFeeManager');

  const authority = access === 'ownable' ? 'owner' : 'admin';

  const setup: Lines[] = [];
  const accessControlComponents: string[] = [];
  const roleMembers: RoleAssignment[] = [];
  let summary: string;
  let authorityDoc: string;
  switch (access) {
    case 'ownable':
      summary = 'Creates the faucet as a public network account owned by `owner`.';
      c.addUseClause('miden_standards::account::access', 'AccessControl');
      accessControlComponents.push('.with_components(AccessControl::Ownable2Step { owner })');
      authorityDoc = '`owner`: account owning the faucet. Ownership can be transferred in two steps.';
      break;
    case 'roles': {
      summary = 'Creates the faucet as a public network account administered by `admin`.';
      c.addUseClause('miden_standards::account::access', 'Authority');
      c.addUseClause('miden_standards::account::access', 'Ownable2Step');
      c.addUseClause('miden_standards::account::access', 'RoleBasedAccessControl');
      c.addUseClause('miden_standards::account::access', 'RoleConfig');
      roleMembers.push(...roleAssignments(features));
      setup.push(
        'let roles = RoleBasedAccessControl::builder()',
        [
          '.role(RoleConfig::new(RoleBasedAccessControl::admin_role()).with_member(admin))',
          ...roleMembers.map(role => `.role(RoleConfig::new(${roleSymbol(role)}).with_member(${role.member}))`),
          '.build()',
          '.expect("role configuration should be valid");',
        ],
        'let authority = Authority::RbacControlled {',
        ['procedure_roles: Self::procedure_roles(),'],
        '};',
      );
      accessControlComponents.push(
        '.with_component(roles)',
        '.with_component(authority)',
        '.with_component(Ownable2Step::new(admin))',
      );
      authorityDoc =
        '`admin`: initial member of the `ADMIN` role, which administers every other role, and initial faucet ' +
        'owner, which mints. Ownership is transferred separately from the `ADMIN` role, by sending owner config notes.';
      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }

  setup.push('let fee_policy_manager = Self::fee_policy_manager(fee_faucet_id);', '');

  const chain: string[] = [
    '.expect("note allowlist should not be empty")',
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
      '# Arguments',
      '',
      ...bullet(INIT_SEED_DOC, 1),
      ...bullet(authorityDoc, 1),
      ...roleMembers.flatMap(role => bullet(`\`${role.member}\`: initial member of the \`${role.symbol}\` role.`, 1)),
      ...bullet(
        '`fee_faucet_id`: ID of the faucet issuing the fee token of the chain ' +
          '(`ProtocolConfig::fee_asset_id().faucet_id()`), in which the faucet prices notes and pays its network ' +
          'transaction fees.',
        1,
      ),
    ],
    args: [
      { name: 'init_seed', type: '[u8; 32]' },
      { name: authority, type: 'AccountId' },
      ...roleMembers.map(role => ({ name: role.member, type: 'AccountId' })),
      { name: 'fee_faucet_id', type: 'AccountId' },
    ],
    returns: 'Result<Account, AccountError>',
    code: [...setup, 'NetworkAccount::builder(init_seed, Self::allowed_notes(), fee_policy_manager)', chain],
    pub: true,
  });

  if (roleMembers.length > 0) {
    addRoleHelper(c);
  }
}
