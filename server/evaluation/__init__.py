"""
Evaluation module for SOAR Platform Intrusion Detection System.
Provides calculations for Confusion Matrix, Precision, Recall, F1-Score,
False-Positive Rate (FPR), and threshold sensitivity curves.
"""
from .evaluator import IDSEvaluator, EvaluationResult

__all__ = ["IDSEvaluator", "EvaluationResult"]
