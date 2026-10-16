"""
Synthetic Simulation Log Generator for SOAR Platform
Generates realistic CIC-IDS2017 feature rows covering all classes:
- Normal Traffic
- DDoS
- DoS
- Port Scanning
- Brute Force
- Web Attacks
- Bots
"""

import json
import os
import random
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FEATURE_FILE = os.path.join(BASE_DIR, "feature_columns.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "large_simulation_log.csv")

def generate_row(attack_type: str, feature_columns: list) -> dict:
    row = {col: 0.0 for col in feature_columns}
    
    if attack_type == "Normal Traffic":
        dest_port = random.choice([80, 443, 53, 8080, 8443, 22])
        flow_duration = random.randint(5000, 500000)
        fwd_pkts = random.randint(2, 30)
        bwd_pkts = random.randint(2, 40)
        mean_len = random.uniform(80, 600)
        
        row.update({
            "Destination Port": dest_port,
            "Flow Duration": flow_duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Length of Fwd Packets": fwd_pkts * mean_len,
            "Fwd Packet Length Max": mean_len * 1.5,
            "Fwd Packet Length Min": 40.0,
            "Fwd Packet Length Mean": mean_len,
            "Fwd Packet Length Std": mean_len * 0.3,
            "Bwd Packet Length Max": mean_len * 2.0,
            "Bwd Packet Length Min": 40.0,
            "Bwd Packet Length Mean": mean_len * 1.2,
            "Bwd Packet Length Std": mean_len * 0.4,
            "Flow Bytes/s": random.uniform(500, 50000),
            "Flow Packets/s": random.uniform(10, 500),
            "Flow IAT Mean": random.uniform(100, 5000),
            "Flow IAT Std": random.uniform(50, 2000),
            "Flow IAT Max": random.uniform(500, 20000),
            "Flow IAT Min": random.uniform(5, 50),
            "Fwd IAT Total": flow_duration * 0.8,
            "Fwd IAT Mean": random.uniform(100, 4000),
            "Fwd IAT Std": random.uniform(50, 1500),
            "Fwd IAT Max": random.uniform(500, 15000),
            "Fwd IAT Min": random.uniform(5, 40),
            "Bwd IAT Total": flow_duration * 0.7,
            "Bwd IAT Mean": random.uniform(100, 4000),
            "Bwd IAT Std": random.uniform(50, 1500),
            "Bwd IAT Max": random.uniform(500, 15000),
            "Bwd IAT Min": random.uniform(5, 40),
            "Fwd Header Length": fwd_pkts * 32,
            "Bwd Header Length": bwd_pkts * 32,
            "Fwd Packets/s": random.uniform(5, 250),
            "Bwd Packets/s": random.uniform(5, 250),
            "Min Packet Length": 40.0,
            "Max Packet Length": 1500.0,
            "Packet Length Mean": mean_len,
            "Packet Length Std": mean_len * 0.4,
            "Packet Length Variance": (mean_len * 0.4) ** 2,
            "FIN Flag Count": random.choice([0, 1]),
            "PSH Flag Count": random.choice([0, 1]),
            "ACK Flag Count": 1.0,
            "Average Packet Size": mean_len * 1.1,
            "Subflow Fwd Bytes": fwd_pkts * mean_len,
            "Init_Win_bytes_forward": random.choice([29200, 65535, 14600]),
            "Init_Win_bytes_backward": random.choice([29200, 65535, 14600]),
            "act_data_pkt_fwd": fwd_pkts - 1,
            "min_seg_size_forward": 32.0,
            "Active Mean": 0.0,
            "Active Max": 0.0,
            "Active Min": 0.0,
            "Idle Mean": 0.0,
            "Idle Max": 0.0,
            "Idle Min": 0.0
        })

    elif attack_type == "DDoS":
        dest_port = random.choice([80, 443, 8080, 53])
        flow_duration = random.randint(1000, 30000)
        fwd_pkts = random.randint(20, 200)
        bwd_pkts = random.randint(0, 5)
        
        row.update({
            "Destination Port": dest_port,
            "Flow Duration": flow_duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Length of Fwd Packets": fwd_pkts * 128,
            "Fwd Packet Length Max": 512.0,
            "Fwd Packet Length Min": 64.0,
            "Fwd Packet Length Mean": 128.0,
            "Fwd Packet Length Std": 20.0,
            "Bwd Packet Length Max": 64.0,
            "Bwd Packet Length Min": 0.0,
            "Bwd Packet Length Mean": 20.0,
            "Bwd Packet Length Std": 10.0,
            "Flow Bytes/s": random.uniform(500000, 10000000),
            "Flow Packets/s": random.uniform(5000, 50000),
            "Flow IAT Mean": random.uniform(5, 50),
            "Flow IAT Std": random.uniform(2, 20),
            "Flow IAT Max": random.uniform(20, 100),
            "Flow IAT Min": 1.0,
            "Fwd IAT Total": flow_duration,
            "Fwd IAT Mean": random.uniform(5, 50),
            "Fwd IAT Std": random.uniform(2, 20),
            "Fwd IAT Max": random.uniform(20, 100),
            "Fwd IAT Min": 1.0,
            "Bwd IAT Total": 0.0,
            "Bwd IAT Mean": 0.0,
            "Bwd IAT Std": 0.0,
            "Bwd IAT Max": 0.0,
            "Bwd IAT Min": 0.0,
            "Fwd Header Length": fwd_pkts * 20,
            "Bwd Header Length": bwd_pkts * 20,
            "Fwd Packets/s": random.uniform(5000, 50000),
            "Bwd Packets/s": random.uniform(0, 100),
            "Min Packet Length": 40.0,
            "Max Packet Length": 512.0,
            "Packet Length Mean": 120.0,
            "Packet Length Std": 30.0,
            "Packet Length Variance": 900.0,
            "FIN Flag Count": 0.0,
            "PSH Flag Count": 0.0,
            "ACK Flag Count": 0.0,
            "Average Packet Size": 128.0,
            "Subflow Fwd Bytes": fwd_pkts * 128,
            "Init_Win_bytes_forward": 1024,
            "Init_Win_bytes_backward": -1,
            "act_data_pkt_fwd": fwd_pkts,
            "min_seg_size_forward": 20.0,
            "Active Mean": 0.0,
            "Active Max": 0.0,
            "Active Min": 0.0,
            "Idle Mean": 0.0,
            "Idle Max": 0.0,
            "Idle Min": 0.0
        })

    elif attack_type == "DoS":
        dest_port = random.choice([80, 443])
        flow_duration = random.randint(1000000, 15000000)
        fwd_pkts = random.randint(5, 20)
        bwd_pkts = random.randint(1, 5)
        
        row.update({
            "Destination Port": dest_port,
            "Flow Duration": flow_duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Length of Fwd Packets": fwd_pkts * 250,
            "Fwd Packet Length Max": 500.0,
            "Fwd Packet Length Min": 54.0,
            "Fwd Packet Length Mean": 250.0,
            "Fwd Packet Length Std": 50.0,
            "Bwd Packet Length Max": 100.0,
            "Bwd Packet Length Min": 0.0,
            "Bwd Packet Length Mean": 50.0,
            "Bwd Packet Length Std": 25.0,
            "Flow Bytes/s": random.uniform(100, 2000),
            "Flow Packets/s": random.uniform(0.5, 10),
            "Flow IAT Mean": random.uniform(50000, 500000),
            "Flow IAT Std": random.uniform(10000, 200000),
            "Flow IAT Max": random.uniform(100000, 1000000),
            "Flow IAT Min": 500.0,
            "Fwd IAT Total": flow_duration * 0.9,
            "Fwd IAT Mean": random.uniform(50000, 500000),
            "Fwd IAT Std": random.uniform(10000, 200000),
            "Fwd IAT Max": random.uniform(100000, 1000000),
            "Fwd IAT Min": 500.0,
            "Bwd IAT Total": flow_duration * 0.5,
            "Bwd IAT Mean": 50000.0,
            "Bwd IAT Std": 10000.0,
            "Bwd IAT Max": 100000.0,
            "Bwd IAT Min": 1000.0,
            "Fwd Header Length": fwd_pkts * 32,
            "Bwd Header Length": bwd_pkts * 32,
            "Fwd Packets/s": random.uniform(0.5, 5),
            "Bwd Packets/s": random.uniform(0.1, 2),
            "Min Packet Length": 40.0,
            "Max Packet Length": 500.0,
            "Packet Length Mean": 220.0,
            "Packet Length Std": 60.0,
            "Packet Length Variance": 3600.0,
            "FIN Flag Count": 0.0,
            "PSH Flag Count": 1.0,
            "ACK Flag Count": 1.0,
            "Average Packet Size": 230.0,
            "Subflow Fwd Bytes": fwd_pkts * 250,
            "Init_Win_bytes_forward": 29200,
            "Init_Win_bytes_backward": 29200,
            "act_data_pkt_fwd": fwd_pkts - 1,
            "min_seg_size_forward": 32.0,
            "Active Mean": 10000.0,
            "Active Max": 20000.0,
            "Active Min": 5000.0,
            "Idle Mean": 5000000.0,
            "Idle Max": 7000000.0,
            "Idle Min": 3000000.0
        })

    elif attack_type == "Port Scanning":
        dest_port = random.choice([21, 22, 23, 25, 53, 80, 110, 135, 139, 443, 445, 1433, 3306, 3389, 8080, 8443, 27017])
        flow_duration = random.randint(10, 5000)
        fwd_pkts = random.randint(1, 3)
        bwd_pkts = random.choice([0, 1])
        
        row.update({
            "Destination Port": dest_port,
            "Flow Duration": flow_duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Length of Fwd Packets": fwd_pkts * 40,
            "Fwd Packet Length Max": 44.0,
            "Fwd Packet Length Min": 40.0,
            "Fwd Packet Length Mean": 40.0,
            "Fwd Packet Length Std": 2.0,
            "Bwd Packet Length Max": 40.0 if bwd_pkts > 0 else 0.0,
            "Bwd Packet Length Min": 0.0,
            "Bwd Packet Length Mean": 20.0 if bwd_pkts > 0 else 0.0,
            "Bwd Packet Length Std": 0.0,
            "Flow Bytes/s": random.uniform(500, 20000),
            "Flow Packets/s": random.uniform(100, 5000),
            "Flow IAT Mean": random.uniform(5, 500),
            "Flow IAT Std": random.uniform(2, 100),
            "Flow IAT Max": random.uniform(10, 1000),
            "Flow IAT Min": 2.0,
            "Fwd IAT Total": flow_duration,
            "Fwd IAT Mean": random.uniform(5, 500),
            "Fwd IAT Std": random.uniform(2, 100),
            "Fwd IAT Max": random.uniform(10, 1000),
            "Fwd IAT Min": 2.0,
            "Bwd IAT Total": 0.0,
            "Bwd IAT Mean": 0.0,
            "Bwd IAT Std": 0.0,
            "Bwd IAT Max": 0.0,
            "Bwd IAT Min": 0.0,
            "Fwd Header Length": fwd_pkts * 20,
            "Bwd Header Length": bwd_pkts * 20,
            "Fwd Packets/s": random.uniform(100, 5000),
            "Bwd Packets/s": random.uniform(0, 100),
            "Min Packet Length": 40.0,
            "Max Packet Length": 44.0,
            "Packet Length Mean": 40.0,
            "Packet Length Std": 2.0,
            "Packet Length Variance": 4.0,
            "FIN Flag Count": 0.0,
            "PSH Flag Count": 0.0,
            "ACK Flag Count": 0.0,
            "Average Packet Size": 40.0,
            "Subflow Fwd Bytes": fwd_pkts * 40,
            "Init_Win_bytes_forward": 1024,
            "Init_Win_bytes_backward": -1,
            "act_data_pkt_fwd": 0,
            "min_seg_size_forward": 20.0,
            "Active Mean": 0.0,
            "Active Max": 0.0,
            "Active Min": 0.0,
            "Idle Mean": 0.0,
            "Idle Max": 0.0,
            "Idle Min": 0.0
        })

    elif attack_type == "Brute Force":
        dest_port = random.choice([22, 21, 3389, 445, 80])
        flow_duration = random.randint(100000, 3000000)
        fwd_pkts = random.randint(15, 60)
        bwd_pkts = random.randint(15, 60)
        
        row.update({
            "Destination Port": dest_port,
            "Flow Duration": flow_duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Length of Fwd Packets": fwd_pkts * 120,
            "Fwd Packet Length Max": 300.0,
            "Fwd Packet Length Min": 40.0,
            "Fwd Packet Length Mean": 120.0,
            "Fwd Packet Length Std": 30.0,
            "Bwd Packet Length Max": 350.0,
            "Bwd Packet Length Min": 40.0,
            "Bwd Packet Length Mean": 130.0,
            "Bwd Packet Length Std": 35.0,
            "Flow Bytes/s": random.uniform(1000, 10000),
            "Flow Packets/s": random.uniform(10, 80),
            "Flow IAT Mean": random.uniform(1000, 30000),
            "Flow IAT Std": random.uniform(500, 10000),
            "Flow IAT Max": random.uniform(5000, 80000),
            "Flow IAT Min": 10.0,
            "Fwd IAT Total": flow_duration * 0.8,
            "Fwd IAT Mean": random.uniform(1000, 25000),
            "Fwd IAT Std": random.uniform(500, 8000),
            "Fwd IAT Max": random.uniform(5000, 70000),
            "Fwd IAT Min": 10.0,
            "Bwd IAT Total": flow_duration * 0.7,
            "Bwd IAT Mean": random.uniform(1000, 25000),
            "Bwd IAT Std": random.uniform(500, 8000),
            "Bwd IAT Max": random.uniform(5000, 70000),
            "Bwd IAT Min": 10.0,
            "Fwd Header Length": fwd_pkts * 32,
            "Bwd Header Length": bwd_pkts * 32,
            "Fwd Packets/s": random.uniform(5, 40),
            "Bwd Packets/s": random.uniform(5, 40),
            "Min Packet Length": 40.0,
            "Max Packet Length": 350.0,
            "Packet Length Mean": 125.0,
            "Packet Length Std": 32.0,
            "Packet Length Variance": 1024.0,
            "FIN Flag Count": 0.0,
            "PSH Flag Count": 1.0,
            "ACK Flag Count": 1.0,
            "Average Packet Size": 130.0,
            "Subflow Fwd Bytes": fwd_pkts * 120,
            "Init_Win_bytes_forward": 29200,
            "Init_Win_bytes_backward": 29200,
            "act_data_pkt_fwd": fwd_pkts - 2,
            "min_seg_size_forward": 32.0,
            "Active Mean": 5000.0,
            "Active Max": 10000.0,
            "Active Min": 2000.0,
            "Idle Mean": 50000.0,
            "Idle Max": 100000.0,
            "Idle Min": 20000.0
        })

    elif attack_type == "Web Attacks":
        dest_port = random.choice([80, 443, 8080])
        flow_duration = random.randint(50000, 1000000)
        fwd_pkts = random.randint(5, 25)
        bwd_pkts = random.randint(5, 30)
        
        row.update({
            "Destination Port": dest_port,
            "Flow Duration": flow_duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Length of Fwd Packets": fwd_pkts * 450,
            "Fwd Packet Length Max": 1200.0,
            "Fwd Packet Length Min": 54.0,
            "Fwd Packet Length Mean": 450.0,
            "Fwd Packet Length Std": 150.0,
            "Bwd Packet Length Max": 1460.0,
            "Bwd Packet Length Min": 54.0,
            "Bwd Packet Length Mean": 600.0,
            "Bwd Packet Length Std": 200.0,
            "Flow Bytes/s": random.uniform(5000, 80000),
            "Flow Packets/s": random.uniform(10, 100),
            "Flow IAT Mean": random.uniform(1000, 20000),
            "Flow IAT Std": random.uniform(500, 8000),
            "Flow IAT Max": random.uniform(5000, 50000),
            "Flow IAT Min": 10.0,
            "Fwd IAT Total": flow_duration * 0.8,
            "Fwd IAT Mean": random.uniform(1000, 20000),
            "Fwd IAT Std": random.uniform(500, 8000),
            "Fwd IAT Max": random.uniform(5000, 50000),
            "Fwd IAT Min": 10.0,
            "Bwd IAT Total": flow_duration * 0.7,
            "Bwd IAT Mean": random.uniform(1000, 20000),
            "Bwd IAT Std": random.uniform(500, 8000),
            "Bwd IAT Max": random.uniform(5000, 50000),
            "Bwd IAT Min": 10.0,
            "Fwd Header Length": fwd_pkts * 32,
            "Bwd Header Length": bwd_pkts * 32,
            "Fwd Packets/s": random.uniform(5, 50),
            "Bwd Packets/s": random.uniform(5, 50),
            "Min Packet Length": 40.0,
            "Max Packet Length": 1460.0,
            "Packet Length Mean": 520.0,
            "Packet Length Std": 180.0,
            "Packet Length Variance": 32400.0,
            "FIN Flag Count": 0.0,
            "PSH Flag Count": 1.0,
            "ACK Flag Count": 1.0,
            "Average Packet Size": 530.0,
            "Subflow Fwd Bytes": fwd_pkts * 450,
            "Init_Win_bytes_forward": 29200,
            "Init_Win_bytes_backward": 29200,
            "act_data_pkt_fwd": fwd_pkts - 1,
            "min_seg_size_forward": 32.0,
            "Active Mean": 0.0,
            "Active Max": 0.0,
            "Active Min": 0.0,
            "Idle Mean": 0.0,
            "Idle Max": 0.0,
            "Idle Min": 0.0
        })

    elif attack_type == "Bots":
        dest_port = random.choice([8080, 4444, 6667, 80, 443])
        flow_duration = random.randint(200000, 5000000)
        fwd_pkts = random.randint(8, 30)
        bwd_pkts = random.randint(6, 25)
        
        row.update({
            "Destination Port": dest_port,
            "Flow Duration": flow_duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Length of Fwd Packets": fwd_pkts * 180,
            "Fwd Packet Length Max": 400.0,
            "Fwd Packet Length Min": 40.0,
            "Fwd Packet Length Mean": 180.0,
            "Fwd Packet Length Std": 40.0,
            "Bwd Packet Length Max": 500.0,
            "Bwd Packet Length Min": 40.0,
            "Bwd Packet Length Mean": 200.0,
            "Bwd Packet Length Std": 45.0,
            "Flow Bytes/s": random.uniform(1000, 25000),
            "Flow Packets/s": random.uniform(5, 50),
            "Flow IAT Mean": random.uniform(5000, 50000),
            "Flow IAT Std": random.uniform(1000, 10000),
            "Flow IAT Max": random.uniform(10000, 100000),
            "Flow IAT Min": 20.0,
            "Fwd IAT Total": flow_duration * 0.8,
            "Fwd IAT Mean": random.uniform(5000, 50000),
            "Fwd IAT Std": random.uniform(1000, 10000),
            "Fwd IAT Max": random.uniform(10000, 100000),
            "Fwd IAT Min": 20.0,
            "Bwd IAT Total": flow_duration * 0.7,
            "Bwd IAT Mean": random.uniform(5000, 50000),
            "Bwd IAT Std": random.uniform(1000, 10000),
            "Bwd IAT Max": random.uniform(10000, 100000),
            "Bwd IAT Min": 20.0,
            "Fwd Header Length": fwd_pkts * 32,
            "Bwd Header Length": bwd_pkts * 32,
            "Fwd Packets/s": random.uniform(3, 25),
            "Bwd Packets/s": random.uniform(3, 25),
            "Min Packet Length": 40.0,
            "Max Packet Length": 500.0,
            "Packet Length Mean": 190.0,
            "Packet Length Std": 42.0,
            "Packet Length Variance": 1764.0,
            "FIN Flag Count": 0.0,
            "PSH Flag Count": 1.0,
            "ACK Flag Count": 1.0,
            "Average Packet Size": 195.0,
            "Subflow Fwd Bytes": fwd_pkts * 180,
            "Init_Win_bytes_forward": 29200,
            "Init_Win_bytes_backward": 29200,
            "act_data_pkt_fwd": fwd_pkts - 1,
            "min_seg_size_forward": 32.0,
            "Active Mean": 2000.0,
            "Active Max": 5000.0,
            "Active Min": 1000.0,
            "Idle Mean": 200000.0,
            "Idle Max": 500000.0,
            "Idle Min": 100000.0
        })

    return row

def generate_simulation_dataset(num_rows: int = 1000, output_path: str = OUTPUT_FILE):
    with open(FEATURE_FILE, "r") as f:
        feature_columns = json.load(f)

    distribution = [
        ("Normal Traffic", 0.45),
        ("DDoS", 0.15),
        ("DoS", 0.10),
        ("Port Scanning", 0.10),
        ("Brute Force", 0.10),
        ("Web Attacks", 0.05),
        ("Bots", 0.05),
    ]

    types, weights = zip(*distribution)
    rows = []
    for _ in range(num_rows):
        selected_type = random.choices(types, weights=weights)[0]
        rows.append(generate_row(selected_type, feature_columns))

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} simulated packets at: {output_path}")
    return df

if __name__ == "__main__":
    generate_simulation_dataset()
