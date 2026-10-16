"""
Core evaluation engine for the SOAR Intrusion Detection System.
Implements:
- Multi-class Confusion Matrix (raw counts and normalized)
- Per-class and Macro/Weighted Precision, Recall, F1-Score, and False Positive Rate (FPR)
- Binary (Attack vs Normal) Classification Metrics
- Threshold Sensitivity Curves (FPR vs Recall / Precision tradeoff)
"""
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix

AEROSPACE_ALIASES = {
    "DDoS": "TT&C Uplink Saturation",
    "DoS": "TT&C Gateway Flood",
    "Brute Force": "Telecommand (TC) Auth Bypass",
    "Port Scanning": "SLE Service Reconnaissance",
    "Bots": "Ground RTU / Sensor Hijack",
    "Web Attacks": "Mission Data Distribution Exploit",
    "Normal Traffic": "Nominal Housekeeping Telemetry",
}

@dataclass
class PerClassMetric:
    name: str
    alias: str
    tp: int
    fp: int
    fn: int
    tn: int
    precision: float
    recall: float
    f1: float
    fpr: float
    support: int

@dataclass
class BinaryMetric:
    tp: int
    fp: int
    fn: int
    tn: int
    precision: float
    recall: float
    f1: float
    fpr: float
    specificity: float
    accuracy: float
    total: int

@dataclass
class ThresholdPoint:
    threshold: float
    precision: float
    recall: float
    f1: float
    fpr: float
    auto_block_rate: float

@dataclass
class EvaluationResult:
    classes: List[str]
    sample_count: int
    confusion_matrix_raw: List[List[int]]
    confusion_matrix_normalized: List[List[float]]
    per_class_metrics: List[PerClassMetric]
    macro_avg: Dict[str, float]
    weighted_avg: Dict[str, float]
    binary_metrics: BinaryMetric
    threshold_curve: List[ThresholdPoint]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "classes": self.classes,
            "sample_count": self.sample_count,
            "confusion_matrix_raw": self.confusion_matrix_raw,
            "confusion_matrix_normalized": self.confusion_matrix_normalized,
            "per_class_metrics": [asdict(m) for m in self.per_class_metrics],
            "macro_avg": self.macro_avg,
            "weighted_avg": self.weighted_avg,
            "binary_metrics": asdict(self.binary_metrics),
            "threshold_curve": [asdict(p) for p in self.threshold_curve]
        }


class IDSEvaluator:
    """
    Evaluates IDS predictions against ground truth labels.
    """

    def __init__(self, classes: Optional[List[str]] = None, normal_class_name: str = "Normal Traffic"):
        self.classes = classes or [
            "Normal Traffic", "DDoS", "DoS", "Port Scanning",
            "Bots", "Brute Force", "Web Attacks"
        ]
        self.normal_class_name = normal_class_name

    def evaluate(
        self,
        y_true: List[str],
        y_pred: List[str],
        y_prob: Optional[np.ndarray] = None,
        class_order: Optional[List[str]] = None
    ) -> EvaluationResult:
        """
        Computes the complete evaluation suite given true and predicted labels.
        """
        labels = class_order or self.classes
        y_true_arr = np.array(y_true)
        y_pred_arr = np.array(y_pred)
        total_samples = len(y_true_arr)

        if total_samples == 0:
            raise ValueError("Evaluation dataset is empty.")

        # 1. Multi-class Confusion Matrix
        # M[i, j] = count of instances with true class i predicted as class j
        cm_raw = confusion_matrix(y_true_arr, y_pred_arr, labels=labels)
        
        # Row-normalized (Recall perspective)
        row_sums = cm_raw.sum(axis=1, keepdims=True)
        # Avoid division by zero
        with np.errstate(divide='ignore', invalid='ignore'):
            cm_norm = np.where(row_sums > 0, cm_raw / np.maximum(row_sums, 1), 0.0)
            cm_norm = np.round(cm_norm, 4)

        # 2. Per-Class Metrics
        per_class: List[PerClassMetric] = []
        total_matrix_sum = cm_raw.sum()

        for idx, cls_name in enumerate(labels):
            tp = int(cm_raw[idx, idx])
            fp = int(cm_raw[:, idx].sum() - tp)
            fn = int(cm_raw[idx, :].sum() - tp)
            tn = int(total_matrix_sum - tp - fp - fn)
            support = int(cm_raw[idx, :].sum())

            # Precision: TP / (TP + FP)
            precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
            # Recall: TP / (TP + FN)
            recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
            # F1: 2 * (P * R) / (P + R)
            f1 = float(2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
            # FPR: FP / (FP + TN)
            fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0

            per_class.append(PerClassMetric(
                name=cls_name,
                alias=AEROSPACE_ALIASES.get(cls_name, cls_name),
                tp=tp,
                fp=fp,
                fn=fn,
                tn=tn,
                precision=round(precision, 4),
                recall=round(recall, 4),
                f1=round(f1, 4),
                fpr=round(fpr, 5),
                support=support
            ))

        # 3. Macro and Weighted Averages
        supports = np.array([m.support for m in per_class], dtype=float)
        precisions = np.array([m.precision for m in per_class])
        recalls = np.array([m.recall for m in per_class])
        f1s = np.array([m.f1 for m in per_class])
        fprs = np.array([m.fpr for m in per_class])

        macro_avg = {
            "precision": round(float(np.mean(precisions)), 4),
            "recall": round(float(np.mean(recalls)), 4),
            "f1": round(float(np.mean(f1s)), 4),
            "fpr": round(float(np.mean(fprs)), 5),
        }

        total_support = supports.sum()
        if total_support > 0:
            weights = supports / total_support
            weighted_avg = {
                "precision": round(float(np.sum(precisions * weights)), 4),
                "recall": round(float(np.sum(recalls * weights)), 4),
                "f1": round(float(np.sum(f1s * weights)), 4),
                "fpr": round(float(np.sum(fprs * weights)), 5),
            }
        else:
            weighted_avg = macro_avg.copy()

        # 4. Binary Cyber Defense Mode (Attack = 1, Normal = 0)
        # An attack is anything that is NOT normal_class_name
        is_true_attack = (y_true_arr != self.normal_class_name)
        is_pred_attack = (y_pred_arr != self.normal_class_name)

        bin_tp = int(np.sum(is_true_attack & is_pred_attack))
        bin_fp = int(np.sum((~is_true_attack) & is_pred_attack)) # Normal wrongly blocked!
        bin_fn = int(np.sum(is_true_attack & (~is_pred_attack))) # Attack missed!
        bin_tn = int(np.sum((~is_true_attack) & (~is_pred_attack))) # Normal allowed

        bin_precision = float(bin_tp / (bin_tp + bin_fp)) if (bin_tp + bin_fp) > 0 else 0.0
        bin_recall = float(bin_tp / (bin_tp + bin_fn)) if (bin_tp + bin_fn) > 0 else 0.0
        bin_f1 = float(2 * bin_precision * bin_recall / (bin_precision + bin_recall)) if (bin_precision + bin_recall) > 0 else 0.0
        bin_fpr = float(bin_fp / (bin_fp + bin_tn)) if (bin_fp + bin_tn) > 0 else 0.0
        bin_spec = float(bin_tn / (bin_fp + bin_tn)) if (bin_fp + bin_tn) > 0 else 0.0
        bin_acc = float((bin_tp + bin_tn) / total_samples) if total_samples > 0 else 0.0

        binary_metrics = BinaryMetric(
            tp=bin_tp,
            fp=bin_fp,
            fn=bin_fn,
            tn=bin_tn,
            precision=round(bin_precision, 4),
            recall=round(bin_recall, 4),
            f1=round(bin_f1, 4),
            fpr=round(bin_fpr, 5),
            specificity=round(bin_spec, 4),
            accuracy=round(bin_acc, 4),
            total=total_samples
        )

        # 5. Threshold Sensitivity Analysis
        threshold_curve = []
        if y_prob is not None and self.normal_class_name in labels:
            normal_idx = labels.index(self.normal_class_name)
            # Attack probability = 1.0 - P(Normal)
            attack_probs = 1.0 - y_prob[:, normal_idx]

            for thresh in np.linspace(0.05, 0.95, 19):
                t_pred_attack = (attack_probs >= thresh)
                t_tp = int(np.sum(is_true_attack & t_pred_attack))
                t_fp = int(np.sum((~is_true_attack) & t_pred_attack))
                t_fn = int(np.sum(is_true_attack & (~t_pred_attack)))
                t_tn = int(np.sum((~is_true_attack) & (~t_pred_attack)))

                t_prec = float(t_tp / (t_tp + t_fp)) if (t_tp + t_fp) > 0 else 0.0
                t_rec = float(t_tp / (t_tp + t_fn)) if (t_tp + t_fn) > 0 else 0.0
                t_f1 = float(2 * t_prec * t_rec / (t_prec + t_rec)) if (t_prec + t_rec) > 0 else 0.0
                t_fpr = float(t_fp / (t_fp + t_tn)) if (t_fp + t_tn) > 0 else 0.0
                t_block_rate = float(np.sum(t_pred_attack) / total_samples)

                threshold_curve.append(ThresholdPoint(
                    threshold=round(float(thresh), 2),
                    precision=round(t_prec, 4),
                    recall=round(t_rec, 4),
                    f1=round(t_f1, 4),
                    fpr=round(t_fpr, 5),
                    auto_block_rate=round(t_block_rate, 4)
                ))

        return EvaluationResult(
            classes=labels,
            sample_count=total_samples,
            confusion_matrix_raw=cm_raw.tolist(),
            confusion_matrix_normalized=cm_norm.tolist(),
            per_class_metrics=per_class,
            macro_avg=macro_avg,
            weighted_avg=weighted_avg,
            binary_metrics=binary_metrics,
            threshold_curve=threshold_curve
        )
