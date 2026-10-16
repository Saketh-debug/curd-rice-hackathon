import json
import os
import random
import numpy as np
import pandas as pd

def create_simulation_dataset(output_path="large_simulation_log.csv", num_rows=1000):
    """
    Generates a realistic simulation dataset for network traffic flows
    matching the 52 CIC-IDS2017 features in feature_columns.json,
    incorporating all 7 classes.
    """
    feature_file = os.path.join(os.path.dirname(__file__), 'feature_columns.json')
    with open(feature_file, 'r') as f:
        feature_columns = json.load(f)

    classes = ['Normal Traffic', 'DDoS', 'DoS', 'Port Scanning', 'Bots', 'Brute Force', 'Web Attacks']
    weights = [0.45, 0.10, 0.10, 0.10, 0.08, 0.09, 0.08]

    rows = []
    for _ in range(num_rows):
        attack_type = random.choices(classes, weights=weights)[0]
        row = {col: 0.0 for col in feature_columns}
        row['Attack Type'] = attack_type

        if attack_type == 'Normal Traffic':
            row['Destination Port'] = random.choice([443, 80, 53, 8080])
            row['Flow Duration'] = random.uniform(5000, 300000)
            row['Total Fwd Packets'] = random.randint(5, 40)
            row['Total Length of Fwd Packets'] = random.uniform(200, 8000)
            row['Fwd Packet Length Max'] = random.uniform(50, 1500)
            row['Bwd Packet Length Mean'] = random.uniform(100, 1200)
            row['Flow Bytes/s'] = random.uniform(1000, 50000)
            row['Flow Packets/s'] = random.uniform(10, 500)
            row['Init_Win_bytes_forward'] = 65535
            row['Init_Win_bytes_backward'] = 65535

        elif attack_type == 'DDoS':
            row['Destination Port'] = random.choice([80, 443])
            row['Flow Duration'] = random.uniform(100, 50000)
            row['Total Fwd Packets'] = random.randint(20, 200)
            row['Total Length of Fwd Packets'] = random.uniform(5000, 50000)
            row['Flow Bytes/s'] = random.uniform(500000, 10000000)
            row['Flow Packets/s'] = random.uniform(5000, 50000)
            row['Init_Win_bytes_forward'] = 29200
            row['Init_Win_bytes_backward'] = 0

        elif attack_type == 'DoS':
            row['Destination Port'] = 80
            row['Flow Duration'] = random.uniform(100000, 5000000)
            row['Total Fwd Packets'] = random.randint(3, 15)
            row['Total Length of Fwd Packets'] = random.uniform(100, 1000)
            row['Flow Bytes/s'] = random.uniform(100, 5000)
            row['Idle Max'] = random.uniform(100000, 2000000)
            row['Init_Win_bytes_forward'] = 8192

        elif attack_type == 'Port Scanning':
            row['Destination Port'] = random.randint(1, 65535)
            row['Flow Duration'] = random.uniform(1, 500)
            row['Total Fwd Packets'] = random.choice([1, 2])
            row['Total Length of Fwd Packets'] = random.choice([0, 6, 44])
            row['Flow Packets/s'] = random.uniform(2000, 50000)
            row['Init_Win_bytes_forward'] = 1024

        elif attack_type == 'Brute Force':
            row['Destination Port'] = random.choice([21, 22, 3389])
            row['Flow Duration'] = random.uniform(10000, 500000)
            row['Total Fwd Packets'] = random.randint(10, 60)
            row['Total Length of Fwd Packets'] = random.uniform(500, 4000)
            row['Init_Win_bytes_forward'] = 29200
            row['Init_Win_bytes_backward'] = 29200

        elif attack_type == 'Bots':
            row['Destination Port'] = random.choice([8080, 6667, 443])
            row['Flow Duration'] = random.uniform(50000, 1000000)
            row['Total Fwd Packets'] = random.randint(4, 25)
            row['Flow IAT Mean'] = random.uniform(1000, 10000)
            row['Fwd IAT Std'] = random.uniform(10, 500)
            row['Init_Win_bytes_forward'] = 8192

        elif attack_type == 'Web Attacks':
            row['Destination Port'] = random.choice([80, 8080, 443])
            row['Flow Duration'] = random.uniform(10000, 800000)
            row['Total Fwd Packets'] = random.randint(5, 30)
            row['Total Length of Fwd Packets'] = random.uniform(1000, 10000)
            row['Fwd Packet Length Max'] = random.uniform(800, 3000)
            row['Subflow Fwd Bytes'] = row['Total Length of Fwd Packets']
            row['Init_Win_bytes_forward'] = 29200
            row['Init_Win_bytes_backward'] = 29200

        rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} simulation packets at '{output_path}'.")
    return df

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_csv = os.path.join(script_dir, 'large_simulation_log.csv')
    create_simulation_dataset(target_csv, 2000)
