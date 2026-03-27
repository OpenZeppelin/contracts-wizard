import test from 'ava';
import { remixURL } from './remix';

// Decoder used in Remix
const decodeBase64 = (b64Payload: string) => {
  const raw = atob(decodeURIComponent(b64Payload));
  const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const getHashParams = (url: URL) => new URLSearchParams(url.hash.replace(/^#/, ''));

test('remixURL encodes code param decodable by decodeBase64', t => {
  const contractSource = 'contract A{}';

  const url = remixURL(contractSource);
  const hashParams = getHashParams(url);
  const codeParam = hashParams.get('code');
  t.truthy(codeParam, 'Expected code hash param to be set');

  const decoded = decodeBase64(codeParam!);
  t.is(decoded, contractSource, 'Decoded code should equal original source');
});

test('remixURL sets deployProxy flag when upgradeable', t => {
  const contractSource = 'contract A{}';

  const urlTrue = remixURL(contractSource, [], true);
  t.is(getHashParams(urlTrue).get('deployProxy'), 'true');

  const urlFalse = remixURL(contractSource, [], false);
  t.is(getHashParams(urlFalse).get('deployProxy'), null);
});

test('remixURL does not set remaps when remappings is empty', t => {
  const url = remixURL('contract A{}');
  t.is(getHashParams(url).get('remaps'), null);
});

test('remixURL encodes remappings into remaps hash param', t => {
  const remappings = [
    '@openzeppelin/contracts/=@openzeppelin/contracts@5.4.0/',
    '@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@5.4.0/',
  ];

  const url = remixURL('contract A{}', remappings, true);
  const hashParams = getHashParams(url);
  const remapsParam = hashParams.get('remaps');
  t.truthy(remapsParam, 'Expected remaps hash param to be set');

  const decoded = decodeBase64(remapsParam!);
  t.is(decoded, remappings.join('\n'), 'Decoded remaps should equal newline-joined remappings');
});

test('remixURL encodes code param with special characters decodable by decodeBase64', t => {
  // not a valid contract
  const contractSource = `// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {AccountERC7579} from "@openzeppelin/contracts/account/extensions/draft-AccountERC7579.sol";
import {ERC7739} from "@openzeppelin/contracts/utils/cryptography/signers/draft-ERC7739.sol";

contract MyAccount is ERC7739, AccountERC7579 {
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
}`;

  const url = remixURL(contractSource);
  const hashParams = getHashParams(url);
  const codeParam = hashParams.get('code');
  t.truthy(codeParam, 'Expected code hash param to be set');

  const decoded = decodeBase64(codeParam!);
  t.is(decoded, contractSource, 'Decoded code should equal original source');
});
