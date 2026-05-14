// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract XpAttestation is EIP712 {
    using ECDSA for bytes32;

    address public signerAuthority;

    mapping(address => uint256) public userXp;
    mapping(bytes32 => bool) public processedNonces;

    event XpAttested(address indexed user, uint256 totalXp, bytes32 indexed nonce);

    constructor(address _signerAuthority) EIP712("XpAttestation", "1") {
        signerAuthority = _signerAuthority;
    }

    function updateSignerAuthority(address _newSigner) external {
        require(msg.sender == signerAuthority, "Only current authority can change signer");
        signerAuthority = _newSigner;
    }

    struct AttestPayload {
        address user;
        uint256 totalXp;
        bytes32 nonce;
    }

    function hashPayload(AttestPayload memory payload) public view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("AttestPayload(address user,uint256 totalXp,bytes32 nonce)"),
                    payload.user,
                    payload.totalXp,
                    payload.nonce
                )
            )
        );
    }

    function attestXp(
        address user,
        uint256 totalXp,
        bytes32 nonce,
        bytes calldata signature
    ) external {
        require(!processedNonces[nonce], "Nonce already processed");

        AttestPayload memory payload = AttestPayload({
            user: user,
            totalXp: totalXp,
            nonce: nonce
        });

        bytes32 digest = hashPayload(payload);
        address recoveredSigner = ECDSA.recover(digest, signature);

        require(recoveredSigner == signerAuthority, "Invalid signature or unauthorized signer");

        require(totalXp > userXp[user], "New XP must be strictly greater than current XP");

        processedNonces[nonce] = true;
        userXp[user] = totalXp;

        emit XpAttested(user, totalXp, nonce);
    }
}
