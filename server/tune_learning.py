import numpy as np
from sklearn.linear_model import SGDClassifier

# Initialize
bandit = SGDClassifier(
    loss="log_loss", learning_rate='constant', eta0=0.01, fit_intercept=True, warm_start=True, random_state=42
)

# Warm Start: 2000 loops (Targeting ~5 blocks to shift)
ctx_allow_normal = [0.1] + [0, 0, 0, 0, 1, 0, 0] 
ctx_allow_ddos_high = [0.8] + [0, 0, 1, 0, 0, 0, 0]
ctx_block_ddos = [0.99] + [0, 0, 1, 0, 0, 0, 0] 

print("Training warm start (5000 loops)...")
for _ in range(5000):
    bandit.partial_fit([ctx_allow_normal, ctx_allow_ddos_high, ctx_block_ddos], [0, 0, 1], classes=[0, 1])

def get_ddos_threshold():
    weights = bandit.coef_[0]
    intercept = bandit.intercept_[0]
    w_prob = weights[0]
    w_class = weights[1 + 2] # DDoS index
    p = -(w_class + intercept) / w_prob
    return float(np.clip(p, 0.01, 0.99))

start_thresh = get_ddos_threshold()
print(f"Initial Threshold: {start_thresh:.4f}")

# Simulate Manual Blocks with WEIGHTED Feedback (5x)
incident_conf = 0.85
ctx_incident = [incident_conf] + [0, 0, 1, 0, 0, 0, 0]

print("\nSimulating Manual BLOCKS (Weight=5)...")
for i in range(1, 11):
    # Repeat fit 5 times to simulate weight=5
    for _ in range(5):
        bandit.partial_fit([ctx_incident], [1]) 
        
    thresh = get_ddos_threshold()
    print(f"Block #{i}: Threshold = {thresh:.4f}")
    
    if thresh <= 0.95 and start_thresh > 0.95:
         print(f"-> Crossed 95% at Block #{i}")
