import test from 'ava';

import { extractGitCommitHash } from './community-contracts-git-commit';

// Valid cases

test('extractGitCommitHash - lowercase 40-char hash', t => {
  const hash = extractGitCommitHash(
    '@openzeppelin/community-contracts',
    'git+https://github.com/OpenZeppelin/openzeppelin-community-contracts.git#0123456789abcdef0123456789abcdef01234567',
  );
  t.is(hash, '0123456789abcdef0123456789abcdef01234567');
});

test('extractGitCommitHash - uppercase 7-char hash returns lowercase', t => {
  const hash = extractGitCommitHash(
    '@openzeppelin/community-contracts',
    'git+ssh://git@github.com/OpenZeppelin/openzeppelin-community-contracts.git#ABCDEF1',
  );
  t.is(hash, 'abcdef1');
});

// Invalid format cases

test('extractGitCommitHash - missing git+ prefix', t => {
  const err = t.throws(() =>
    extractGitCommitHash(
      '@openzeppelin/community-contracts',
      'https://github.com/OpenZeppelin/openzeppelin-community-contracts.git#abcdef1',
    ),
  );
  t.true(
    err instanceof Error &&
      err.message.includes(
        'Expected package dependency for @openzeppelin/community-contracts in format git+<url>#<commit-hash>,',
      ),
  );
});

test('extractGitCommitHash - missing #', t => {
  const err = t.throws(() =>
    extractGitCommitHash(
      '@openzeppelin/community-contracts',
      'git+https://github.com/OpenZeppelin/openzeppelin-community-contracts.git',
    ),
  );
  t.true(
    err instanceof Error &&
      err.message.includes(
        'Expected package dependency for @openzeppelin/community-contracts in format git+<url>#<commit-hash>,',
      ),
  );
});

test('extractGitCommitHash - multiple # parts', t => {
  const err = t.throws(() =>
    extractGitCommitHash(
      '@openzeppelin/community-contracts',
      'git+https://github.com/OpenZeppelin/openzeppelin-community-contracts.git#abcdef1#extra',
    ),
  );
  t.true(
    err instanceof Error &&
      err.message.includes(
        'Expected package dependency for @openzeppelin/community-contracts in format git+<url>#<commit-hash>,',
      ),
  );
});

// Invalid hash content cases

test('extractGitCommitHash - too short hash', t => {
  const err = t.throws(() =>
    extractGitCommitHash(
      '@openzeppelin/community-contracts',
      'git+https://github.com/OpenZeppelin/openzeppelin-community-contracts.git#abcde',
    ),
  );
  t.true(
    err instanceof Error &&
      err.message.includes(
        'Expected git commit hash for package dependency @openzeppelin/community-contracts to have between 7 and 40 hex chars',
      ),
  );
});

test('extractGitCommitHash - too long hash', t => {
  const err = t.throws(() =>
    extractGitCommitHash(
      '@openzeppelin/community-contracts',
      'git+https://github.com/OpenZeppelin/openzeppelin-community-contracts.git#0123456789abcdef0123456789abcdef012345678',
    ),
  );
  t.true(
    err instanceof Error &&
      err.message.includes(
        'Expected git commit hash for package dependency @openzeppelin/community-contracts to have between 7 and 40 hex chars',
      ),
  );
});

test('extractGitCommitHash - non-hex characters', t => {
  const err = t.throws(() =>
    extractGitCommitHash(
      '@openzeppelin/community-contracts',
      'git+https://github.com/OpenZeppelin/openzeppelin-community-contracts.git#abcdefg',
    ),
  );
  t.true(
    err instanceof Error &&
      err.message.includes(
        'Expected git commit hash for package dependency @openzeppelin/community-contracts to have between 7 and 40 hex chars',
      ),
  );
});
