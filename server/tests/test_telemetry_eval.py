"""
Unit tests verifying the Spacecraft Telemetry Anomaly Dataset evaluation.
"""
import os
import sys
import unittest
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class TestTelemetryDatasetEvaluation(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.csv_path = os.path.join(self.base_dir, "telemetry_anomaly_dataset.csv")
        self.json_path = os.path.join(self.base_dir, "telemetry_benchmark_results.json")

    def test_dataset_exists_and_format(self):
        self.assertTrue(os.path.exists(self.csv_path), "telemetry_anomaly_dataset.csv should exist")
        df = pd.read_csv(self.csv_path)
        self.assertEqual(len(df), 2123, "Dataset should have 2123 segments")
        self.assertIn("anomaly", df.columns)
        self.assertIn("train", df.columns)
        self.assertIn("channel", df.columns)

    def test_benchmark_results_consistency(self):
        self.assertTrue(os.path.exists(self.json_path), "telemetry_benchmark_results.json should exist")
        import json
        with open(self.json_path, "r") as f:
            data = json.load(f)
        
        holdout = data["metrics_holdout"]
        # Verify Precision formula: TP / (TP + FP)
        tp = holdout["tp"]
        fp = holdout["fp"]
        fn = holdout["fn"]
        tn = holdout["tn"]
        self.assertAlmostEqual(holdout["precision"], tp / (tp + fp), places=4)
        self.assertAlmostEqual(holdout["recall"], tp / (tp + fn), places=4)
        self.assertAlmostEqual(holdout["fpr"], fp / (fp + tn), places=4)
        self.assertAlmostEqual(holdout["fpr"] + holdout["specificity"], 1.0, places=4)

if __name__ == "__main__":
    unittest.main()
