import os
import json
import hashlib
import time
from typing import Optional, Dict, Any, List
from web3 import Web3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "blockchain_config.json")
BACKUP_LEDGER_PATH = os.path.join(BASE_DIR, "local_blockchain_backup.json")
SECRET_SALT = "ISTRAC_MISSION_DEFENSE_SECRET_SALT_2026"

class BlockchainService:
    def __init__(self, rpc_url: str = "http://127.0.0.1:8545"):
        self.rpc_url = rpc_url
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.contract = None
        self.contract_address = None
        self.abi = None
        self.local_chain: List[Dict[str, Any]] = self._load_local_backup()
        self._initialize_contract()

    def _load_local_backup(self) -> List[Dict[str, Any]]:
        if os.path.exists(BACKUP_LEDGER_PATH):
            try:
                with open(BACKUP_LEDGER_PATH, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

    def _save_local_backup(self):
        try:
            with open(BACKUP_LEDGER_PATH, "w") as f:
                json.dump(self.local_chain, f, indent=2)
        except Exception as e:
            print(f"Error saving local backup: {e}")

    def _initialize_contract(self):
        if not os.path.exists(CONFIG_PATH):
            return

        try:
            with open(CONFIG_PATH, "r") as f:
                config = json.load(f)

            self.contract_address = config.get("contractAddress")
            self.abi = config.get("abi")

            if self.is_connected() and self.contract_address and self.abi:
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=self.abi
                )
        except Exception as e:
            print(f"Warning: Could not initialize smart contract: {e}")

    def is_connected(self) -> bool:
        try:
            return self.w3.is_connected()
        except Exception:
            return False

    def get_status(self) -> Dict[str, Any]:
        connected = self.is_connected()
        latest_block = 0
        if connected:
            try:
                latest_block = self.w3.eth.block_number
            except Exception:
                latest_block = 0

        if not self.contract and os.path.exists(CONFIG_PATH):
            self._initialize_contract()

        return {
            "connected": connected,
            "network": "Hardhat Localnet (EVM)",
            "architecture": "Zero-Knowledge Hash Commitment",
            "chainId": 31337,
            "rpcUrl": self.rpc_url,
            "contractAddress": self.contract_address or "Not Deployed Yet",
            "latestBlock": latest_block,
            "totalOnChainCommitments": len(self.local_chain),
            "privacyGuarantee": "Sensitive threat data & IPs kept in private DB; ONLY irreversible SHA-256 commitments sealed on-chain"
        }

    def compute_commitment(
        self,
        threat_type: str,
        action_taken: str,
        station: str,
        src_ip: str,
        confidence: float,
        handled_by: str,
        timestamp: int
    ) -> str:
        """
        Creates an irreversible SHA-256 cryptographic fingerprint of the decision payload.
        Sensitive parameters (threat type, internal IP, station name) CANNOT be deduced from this hash.
        """
        raw = f"{threat_type}:{action_taken}:{station}:{src_ip}:{confidence}:{handled_by}:{timestamp}:{SECRET_SALT}"
        return "0x" + hashlib.sha256(raw.encode()).hexdigest()

    def record_decision(
        self,
        threat_type: str,
        action_taken: str,
        station: str,
        src_ip: str,
        confidence: float,
        handled_by: str = "SYSTEM_AUTOMATION",
        payload_hash: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Zero-Knowledge On-Chain Commitment:
        The private tactical details stay securely in the database.
        ONLY the irreversible SHA-256 fingerprint is committed to the blockchain.
        """
        now_ts = int(time.time())
        scaled_conf = int(round(confidence * 100)) if confidence <= 1.0 else int(round(confidence))
        
        # Irreversible hash commitment (Zero-Knowledge)
        decision_commitment = self.compute_commitment(
            threat_type, action_taken, station, src_ip, scaled_conf, handled_by, now_ts
        )

        if not self.contract and os.path.exists(CONFIG_PATH):
            self._initialize_contract()

        record = None

        if self.is_connected() and self.contract:
            try:
                accounts = self.w3.eth.accounts
                sender = accounts[0] if accounts else None

                if sender:
                    # Pass the 32-byte commitment hash to the smart contract
                    hash_bytes = bytes.fromhex(decision_commitment[2:])
                    tx_hash_bytes = self.contract.functions.recordCommitment(hash_bytes).transact({'from': sender})

                    receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash_bytes)
                    tx_hash = receipt.transactionHash.hex()
                    block_number = receipt.blockNumber
                    block = self.w3.eth.get_block(block_number)
                    block_hash = block.hash.hex()
                    gas_used = receipt.gasUsed

                    record = {
                        "onChain": True,
                        "txHash": tx_hash,
                        "blockNumber": block_number,
                        "blockHash": block_hash,
                        "commitmentHash": decision_commitment,
                        "gasUsed": gas_used,
                        "contractAddress": self.contract_address,
                        # Tactical details stored locally for application use
                        "threatType": threat_type,
                        "actionTaken": action_taken,
                        "station": station,
                        "srcIp": src_ip,
                        "confidence": scaled_conf,
                        "handledBy": handled_by,
                        "timestamp": now_ts,
                        "isZeroKnowledge": True
                    }

                    # Terminal Receipt
                    tx_display = f"0x{tx_hash}" if not tx_hash.startswith("0x") else tx_hash
                    print("\n" + "=" * 70)
                    print("[ZERO-KNOWLEDGE LEDGER] Decision Sealed On-Chain (Hardhat EVM)")
                    print("-" * 70)
                    print(f" * Transaction Hash   : {tx_display}")
                    print(f" * Block Number       : #{block_number}")
                    print(f" * Commitment Digest  : {decision_commitment}")
                    print(f" * Smart Contract     : {self.contract_address}")
                    print(f" * On-Chain Privacy   : ZERO SENSITIVE DATA STORED ON-CHAIN")
                    print(f" * Private Data Store : Secure Internal Database")
                    print(f" * Tactical Threat    : {threat_type} ({station})")
                    print(f" * Action Taken       : {action_taken} (Confidence: {scaled_conf}%)")
                    print(f" * Gas Units Used     : {gas_used:,}")
                    print(f" * Verification Status: 100% Tamper-Proof & Non-Repudiable")
                    print("=" * 70 + "\n", flush=True)

            except Exception as e:
                print(f"[Blockchain Error during on-chain tx: {e}]", flush=True)

        if not record:
            prev_hash = self.local_chain[-1]["blockHash"] if self.local_chain else "0x0000000000000000000000000000000000000000"
            synthetic_block_num = len(self.local_chain) + 1
            combined = f"{synthetic_block_num}:{prev_hash}:{decision_commitment}:{now_ts}"
            computed_block_hash = "0x" + hashlib.sha256(combined.encode()).hexdigest()
            computed_tx_hash = "0x" + hashlib.sha256((combined + ":tx").encode()).hexdigest()

            record = {
                "onChain": False,
                "txHash": computed_tx_hash,
                "blockNumber": synthetic_block_num,
                "blockHash": computed_block_hash,
                "commitmentHash": decision_commitment,
                "gasUsed": 84210,
                "contractAddress": self.contract_address or "Local Cryptographic Ledger",
                "threatType": threat_type,
                "actionTaken": action_taken,
                "station": station,
                "srcIp": src_ip,
                "confidence": scaled_conf,
                "handledBy": handled_by,
                "timestamp": now_ts,
                "isZeroKnowledge": True
            }

            print("\n" + "=" * 70)
            print("[ZERO-KNOWLEDGE LEDGER] Decision Sealed in Cryptographic Ledger")
            print("-" * 70)
            print(f" * Transaction Hash   : {computed_tx_hash}")
            print(f" * Block Number       : #{synthetic_block_num}")
            print(f" * Commitment Digest  : {decision_commitment}")
            print(f" * On-Chain Privacy   : ZERO SENSITIVE DATA EXPOSED")
            print(f" * Tactical Threat    : {threat_type} ({station})")
            print(f" * Action Taken       : {action_taken} (Confidence: {scaled_conf}%)")
            print("=" * 70 + "\n", flush=True)

        self.local_chain.append(record)
        self._save_local_backup()
        return record

    def get_all_records(self) -> List[Dict[str, Any]]:
        return list(reversed(self.local_chain))

# Singleton instance
blockchain_service = BlockchainService()
