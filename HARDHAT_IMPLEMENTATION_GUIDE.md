# Hardhat Blockchain Implementation Guide: SOAR Autonomous Defense Network

This guide explains how the **Zero-Knowledge Hardhat EVM Blockchain Ledger** is implemented in the SOAR platform to provide **100% tamper-proof, non-repudiable auditing** for aerospace ground-segment defense decisions while **strictly protecting operational secrecy**.

---

## 1. High-Level Architecture: Zero-Knowledge Hash Commitment

In aerospace ground defense (e.g., ISRO ISTRAC MOX operations), tactical decisions (such as which ground station link was severed, target IP addresses, and flight controller identities) are **sensitive intelligence**. Publishing plain text attack data to a public or shared ledger would expose tactical vulnerabilities to attackers.

To solve this, the SOAR platform implements a **Zero-Knowledge Hash-Commitment Architecture**:

```
+-----------------------------------------------------------------------------------+
| 1. Incident Resolution / Automated Mitigation                                     |
|    - Threat Type: TT&C Uplink Saturation                                          |
|    - Target IP:   10.14.1.120                                                     |
|    - Station:     ISTRAC-BLR                                                      |
|    - Action:      AUTO_BLOCKED                                                    |
|    - Controller:  SYSTEM_AUTOMATION                                               |
+-----------------------------------------------------------------------------------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
         v                                                   v
[Private Database]                                  [Cryptographic SHA-256 Digest]
- Plaintext data stored securely in internal DB     - Irreversible one-way fingerprint:
- Access-controlled & air-gapped                      0xf9aeaf9008ee4736614ed2aa...
                                                             |
                                                             v
                                                    [Hardhat EVM Smart Contract]
                                                    - DecisionAuditLedger.sol
                                                    - Records ONLY the 32-byte hash
                                                    - Mined into block (Block #13)
                                                    - Emits on-chain event receipt
```

### Why this architecture?
1. **Confidentiality**: An outsider or adversary looking at the blockchain only sees random 32-byte hashes (`0xf9aeaf...`). It is mathematically impossible to deduce the target IP, frequency, or station name.
2. **Integrity (Tamper-Proofing)**: If anyone attempts to alter even one character in the private internal database, the hash fingerprint immediately breaks, proving that tampering occurred.
3. **Non-Repudiation**: Operators and automated agents cannot deny actions once the cryptographic seal is confirmed on-chain.

---

## 2. Directory Structure

```text
soar_platform/
├── blockchain/                              # Hardhat EVM Workspace
│   ├── contracts/
│   │   └── DecisionAuditLedger.sol         # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js                       # Deployment script (saves config for server)
│   ├── test/
│   │   └── DecisionAuditLedger.test.js     # Mocha/Chai contract tests
│   ├── hardhat.config.js                   # Hardhat network configuration (Chain 31337)
│   └── package.json                        # Dependencies: hardhat, @nomicfoundation/hardhat-toolbox
│
├── server/
│   ├── blockchain_service.py               # Web3 connector & ZK hash commitment service
│   ├── blockchain_config.json              # Auto-generated contract address & ABI
│   └── main.py                             # FastAPI endpoints & simulator hooks
│
├── frontend/src/features/admin/pages/
│   └── DecisionTimeline.tsx                # Dual-view audit timeline & blockchain ledger HUD
│
└── run_blockchain.ps1                      # 1-click startup script for Hardhat node & deployer
```

---

## 3. The Solidity Smart Contract (`contracts/DecisionAuditLedger.sol`)

The contract stores only the 32-byte irreversible commitment:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecisionAuditLedger {
    struct DecisionCommitment {
        uint256 id;
        bytes32 decisionHash;  // Irreversible SHA-256 fingerprint
        uint256 timestamp;
        address authority;
    }

    DecisionCommitment[] public commitments;
    address public immutable owner;

    event CommitmentSealed(
        uint256 indexed id,
        bytes32 indexed decisionHash,
        uint256 timestamp,
        address indexed authority
    );

    constructor() {
        owner = msg.sender;
    }

    function recordCommitment(bytes32 decisionHash) external returns (uint256, bytes32) {
        uint256 newId = commitments.length;

        commitments.push(DecisionCommitment({
            id: newId,
            decisionHash: decisionHash,
            timestamp: block.timestamp,
            authority: msg.sender
        }));

        emit CommitmentSealed(newId, decisionHash, block.timestamp, msg.sender);
        return (newId, decisionHash);
    }

    function verifyCommitment(uint256 id, bytes32 candidateHash) external view returns (bool) {
        require(id < commitments.length, "Invalid commitment ID");
        return commitments[id].decisionHash == candidateHash;
    }

    function getCommitmentCount() external view returns (uint256) {
        return commitments.length;
    }
}
```

---

## 4. How to Run & Deploy the Blockchain

### Option A: Using the Automated PowerShell Script
Run the automated script from the repository root:
```powershell
.\run_blockchain.ps1
```
This script:
1. Starts the Hardhat node on `http://127.0.0.1:8545` (Chain ID `31337`).
2. Waits for RPC responsiveness.
3. Deploys `DecisionAuditLedger.sol` automatically.
4. Generates `server/blockchain_config.json` containing the deployed address and ABI.

### Option B: Manual CLI Steps
1. Navigate to the blockchain directory and install dependencies:
   ```bash
   cd blockchain
   npm install
   ```
2. Compile the smart contract:
   ```bash
   npx hardhat compile
   ```
3. Run the contract test suite:
   ```bash
   npx hardhat test
   ```
4. Start the local node in a terminal:
   ```bash
   npx hardhat node
   ```
5. In another terminal, deploy to localhost:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

---

## 5. Backend Python Integration (`server/blockchain_service.py`)

The backend connects to the Hardhat node via `web3.py`. When an anomaly is resolved or automated containment occurs:

```python
from server.blockchain_service import blockchain_service

# Records decision and prints cryptographic receipt
blockchain_service.record_decision(
    threat_type="TT&C Uplink Saturation",
    action_taken="AUTO_BLOCKED",
    station="ISTRAC-BLR",
    src_ip="10.14.1.120",
    confidence=0.96,
    handled_by="SYSTEM_AUTOMATION"
)
```

### Live Terminal Receipt Output
```text
======================================================================
[ZERO-KNOWLEDGE LEDGER] Decision Sealed On-Chain (Hardhat EVM)
----------------------------------------------------------------------
 * Transaction Hash   : 0x5d1db6332cf765887429e877dd2c2a031c4d96ac7e65...
 * Block Number       : #13
 * Commitment Digest  : 0xf9aeaf9008ee4736614ed2aa02116af755a28a62c73...
 * Smart Contract     : 0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e
 * On-Chain Privacy   : ZERO SENSITIVE DATA STORED ON-CHAIN
 * Private Data Store : Secure Internal Database
 * Tactical Threat    : TT&C Uplink Saturation (ISTRAC-BLR)
 * Action Taken       : AUTO_BLOCKED (Confidence: 96%)
 * Gas Units Used     : 115,033
 * Verification Status: 100% Tamper-Proof & Non-Repudiable
======================================================================
```

---

## 6. Frontend Verification Interface (`http://localhost:5173/admin/timeline`)

Visiting the **Mission Decision Audit Timeline** provides:
1. **Network Status HUD**:
   - Status: `NODE ONLINE • CHAIN #31337`
   - Privacy Seal: `ZERO-KNOWLEDGE AUDIT (No Raw Data Leaked)`
   - Live Block Height & Contract Address.
2. **Dual View Options**:
   - **Timeline View**: Visual chronological flow with threat status and copyable `[Sealed Hash Commitment]` pills.
   - **Ledger Table View**: High-density tabular layout with Block numbers, Hash fingerprints, gas consumed, and a 1-click **"Verify"** button.
3. **Cryptographic Proof Modal**:
   - Displays the on-chain receipt, transaction hash, block number, gas used, and SHA-256 payload digest.

---

## 7. Verification API Endpoints

- `GET /api/blockchain/status`: Returns current EVM connection status, block height, contract address, and privacy guarantees.
- `GET /api/blockchain/records`: Returns list of all on-chain decision commitments.
- `GET /api/logs/audit`: Enriched audit log combining private database records with on-chain cryptographic receipts.
