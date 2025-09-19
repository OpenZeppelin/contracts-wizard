import test from 'node:test';
import assert from 'node:assert/strict';
import { remixURL } from './remix';

// Decoder provided in the prompt
const decodeBase64 = (b64Payload: string) => {
  const raw = atob(decodeURIComponent(b64Payload));
  const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

test('remixURL encodes code param decodable by decodeBase64', () => {
  const contractSource = 'contract A{}';

  const url = remixURL(contractSource);
  const codeParam = url.searchParams.get('code');
  assert.ok(codeParam, 'Expected code search param to be set');

  const decoded = decodeBase64(codeParam!);
  assert.equal(decoded, contractSource, 'Decoded code should equal original source');
});

test('remixURL sets deployProxy flag when upgradeable', () => {
  const contractSource = 'contract A{}';

  const urlTrue = remixURL(contractSource, true);
  assert.equal(urlTrue.searchParams.get('deployProxy'), 'true');

  const urlFalse = remixURL(contractSource, false);
  assert.equal(urlFalse.searchParams.get('deployProxy'), null);
});

test('remixURL encodes code param with special characters decodable by decodeBase64', () => {
  const contractSource = `// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {AbstractSigner} from "@openzeppelin/contracts/utils/cryptography/signers/AbstractSigner.sol";
import {Account} from "@openzeppelin/contracts/account/Account.sol";
import {AccountERC7579} from "@openzeppelin/contracts/account/extensions/draft-AccountERC7579.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC7739} from "@openzeppelin/contracts/utils/cryptography/signers/draft-ERC7739.sol";
import {PackedUserOperation} from "@openzeppelin/contracts/interfaces/draft-IERC4337.sol";
import {SignerECDSA} from "@openzeppelin/contracts/utils/cryptography/signers/SignerECDSA.sol";

contract MyAccount is Account, EIP712, ERC7739, AccountERC7579, SignerECDSA, ERC721Holder, ERC1155Holder {
    constructor(address signer)
        EIP712(unicode"MyAccount🌾", "1")
        SignerECDSA(signer)
    {}

    function isValidSignature(bytes32 hash, bytes calldata signature)
        public
        view
        override(AccountERC7579, ERC7739)
        returns (bytes4)
    {
        // ERC-7739 can return the ERC-1271 magic value, 0xffffffff (invalid) or 0x77390001 (detection).
        // If the returned value is 0xffffffff, fallback to ERC-7579 validation.
        bytes4 erc7739magic = ERC7739.isValidSignature(hash, signature);
        return erc7739magic == bytes4(0xffffffff) ? AccountERC7579.isValidSignature(hash, signature) : erc7739magic;
    }

    // The following functions are overrides required by Solidity.

    function _validateUserOp(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        override(Account, AccountERC7579)
        returns (uint256)
    {
        return super._validateUserOp(userOp, userOpHash);
    }

    // IMPORTANT: Make sure SignerECDSA is most derived than AccountERC7579
    // in the inheritance chain (i.e. contract ... is AccountERC7579, ..., SignerECDSA)
    // to ensure the correct order of function resolution.
    // AccountERC7579 returns false for _rawSignatureValidation
    function _rawSignatureValidation(bytes32 hash, bytes calldata signature)
        internal
        view
        override(SignerECDSA, AbstractSigner, AccountERC7579)
        returns (bool)
    {
        return super._rawSignatureValidation(hash, signature);
    }
}`;

  const url = remixURL(contractSource);
  const codeParam = url.searchParams.get('code');
  assert.ok(codeParam, 'Expected code search param to be set');

  const decoded = decodeBase64(codeParam!);
  assert.equal(decoded, contractSource, 'Decoded code should equal original source');
});
