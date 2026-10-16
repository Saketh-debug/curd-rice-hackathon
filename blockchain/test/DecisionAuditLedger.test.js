const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecisionAuditLedger", function () {
  it("Should record a decision and return the decision details", async function () {
    const DecisionAuditLedger = await ethers.getContractFactory("DecisionAuditLedger");
    const ledger = await DecisionAuditLedger.deploy();
    await ledger.waitForDeployment();

    const tx = await ledger.recordDecision(
      "TT&C Uplink Saturation",
      "AUTO_BLOCKED",
      "ISTRAC-BLR",
      "10.14.1.120",
      96,
      "SYSTEM_AUTOMATION",
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    await tx.wait();

    const count = await ledger.getDecisionsCount();
    expect(count).to.equal(1n);

    const d = await ledger.getDecision(0);
    expect(d.threatType).to.equal("TT&C Uplink Saturation");
    expect(d.actionTaken).to.equal("AUTO_BLOCKED");
    expect(d.station).to.equal("ISTRAC-BLR");
    expect(d.confidence).to.equal(96n);
  });
});
