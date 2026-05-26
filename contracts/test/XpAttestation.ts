import { expect } from "chai";
import { ethers } from "hardhat";

describe("XpAttestation", function () {
  it("Should verify EIP-712 signatures and attest XP", async function () {
    const [owner, authority, user] = await ethers.getSigners();
    const XpAttestation = await ethers.getContractFactory("XpAttestation");
    const attestation = await XpAttestation.deploy(authority.address);

    const domain = {
      name: "XpAttestation",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await attestation.getAddress(),
    };

    const types = {
      AttestPayload: [
        { name: "user", type: "address" },
        { name: "totalXp", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const payload = {
      user: user.address,
      totalXp: 100,
      nonce: nonce,
    };

    const signature = await authority.signTypedData(domain, types, payload);

    await expect(
      attestation.attestXp(
        payload.user,
        payload.totalXp,
        payload.nonce,
        signature,
      ),
    )
      .to.emit(attestation, "XpAttested")
      .withArgs(payload.user, payload.totalXp, payload.nonce);

    expect(await attestation.userXp(user.address)).to.equal(100);
    expect(await attestation.processedNonces(nonce)).to.equal(true);

    // Replay attack should fail
    await expect(
      attestation.attestXp(
        payload.user,
        payload.totalXp,
        payload.nonce,
        signature,
      ),
    ).to.be.revertedWith("Nonce already processed");

    // Invalid signature should fail
    const invalidSignature = await user.signTypedData(domain, types, payload);
    const newNonce = ethers.hexlify(ethers.randomBytes(32));
    await expect(
      attestation.attestXp(
        payload.user,
        payload.totalXp,
        newNonce,
        invalidSignature,
      ),
    ).to.be.revertedWith("Invalid signature or unauthorized signer");
  });
});
