"""
Unit tests for the SOAR IDS Evaluation Engine.
Verifies mathematical correctness of:
- Precision, Recall, F1-Score
- False Positive Rate (FPR) and Specificity
- Confusion Matrix row sums and dimensions
- Binary Cyber Defense Mode
"""
import sys
import os
import unittest
import numpy as np

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from evaluation.evaluator import IDSEvaluator

class TestIDSEvaluation(unittest.TestCase):

    def setUp(self):
        self.classes = [
            "Normal Traffic", "DDoS", "DoS", "Port Scanning",
            "Bots", "Brute Force", "Web Attacks"
        ]
        self.evaluator = IDSEvaluator(classes=self.classes, normal_class_name="Normal Traffic")

    def test_perfect_classification(self):
        """When predictions equal ground truth, metrics should be 1.0 and FPR should be 0.0."""
        y_true = ["Normal Traffic", "DDoS", "DoS", "Port Scanning", "Bots", "Brute Force", "Web Attacks"] * 10
        y_pred = list(y_true)

        res = self.evaluator.evaluate(y_true, y_pred, class_order=self.classes)

        # Check Binary
        self.assertEqual(res.binary_metrics.tp, 60) # 6 attack classes * 10
        self.assertEqual(res.binary_metrics.fp, 0)
        self.assertEqual(res.binary_metrics.fn, 0)
        self.assertEqual(res.binary_metrics.tn, 10)
        self.assertEqual(res.binary_metrics.precision, 1.0)
        self.assertEqual(res.binary_metrics.recall, 1.0)
        self.assertEqual(res.binary_metrics.f1, 1.0)
        self.assertEqual(res.binary_metrics.fpr, 0.0)
        self.assertEqual(res.binary_metrics.specificity, 1.0)
        self.assertEqual(res.binary_metrics.accuracy, 1.0)

        # Check Per Class
        for m in res.per_class_metrics:
            self.assertEqual(m.precision, 1.0)
            self.assertEqual(m.recall, 1.0)
            self.assertEqual(m.f1, 1.0)
            self.assertEqual(m.fpr, 0.0)

    def test_mathematical_properties(self):
        """Verify FPR + Specificity == 1.0 and F1 harmonic formula."""
        # Simulated scenario with known confusion
        y_true = ["Normal Traffic"] * 100 + ["DDoS"] * 50 + ["DoS"] * 50
        y_pred = (
            ["Normal Traffic"] * 95 + ["DDoS"] * 5 +    # 5 false alarms on normal
            ["DDoS"] * 45 + ["Normal Traffic"] * 5 +     # 5 missed DDoS
            ["DoS"] * 40 + ["DDoS"] * 10                 # 10 DoS misclassified as DDoS
        )

        res = self.evaluator.evaluate(y_true, y_pred, class_order=self.classes)

        # FPR + Specificity = 1.0
        self.assertAlmostEqual(res.binary_metrics.fpr + res.binary_metrics.specificity, 1.0, places=4)

        # Binary TP = 45 + 50 = 95 attacks detected
        # Binary FP = 5 normal wrongly flagged as attack
        # Binary FN = 5 attacks predicted as normal
        # Binary TN = 95 normal correctly predicted as normal
        self.assertEqual(res.binary_metrics.tp, 85 + 10) # 95 attacks flagged
        self.assertEqual(res.binary_metrics.fp, 5)
        self.assertEqual(res.binary_metrics.fn, 5)
        self.assertEqual(res.binary_metrics.tn, 95)

        # Precision = 95 / 100 = 0.95
        self.assertEqual(res.binary_metrics.precision, 0.95)
        # Recall = 95 / 100 = 0.95
        self.assertEqual(res.binary_metrics.recall, 0.95)
        # F1 = 0.95
        self.assertEqual(res.binary_metrics.f1, 0.95)
        # FPR = 5 / (5 + 95) = 0.05
        self.assertEqual(res.binary_metrics.fpr, 0.05)

    def test_confusion_matrix_dimensions_and_sums(self):
        """Confusion matrix must be 7x7 and row sums must equal support."""
        y_true = ["DDoS"] * 20 + ["DoS"] * 30 + ["Normal Traffic"] * 50
        y_pred = ["DDoS"] * 18 + ["DoS"] * 2 + ["DoS"] * 28 + ["DDoS"] * 2 + ["Normal Traffic"] * 48 + ["DDoS"] * 2

        res = self.evaluator.evaluate(y_true, y_pred, class_order=self.classes)

        cm = np.array(res.confusion_matrix_raw)
        self.assertEqual(cm.shape, (7, 7))
        self.assertEqual(cm.sum(), 100)

        # Support check
        ddos_idx = self.classes.index("DDoS")
        dos_idx = self.classes.index("DoS")
        normal_idx = self.classes.index("Normal Traffic")

        self.assertEqual(cm[ddos_idx, :].sum(), 20)
        self.assertEqual(cm[dos_idx, :].sum(), 30)
        self.assertEqual(cm[normal_idx, :].sum(), 50)

if __name__ == "__main__":
    unittest.main()
