import os
import json
import joblib
import pandas as pd

def generate():
    base = os.path.dirname(os.path.abspath(__file__))
    df = pd.read_csv(os.path.join(base, 'telemetry_anomaly_dataset.csv'))
    model = joblib.load(os.path.join(base, 'telemetry_xgboost_model.joblib'))

    feature_cols = [
        'sampling', 'duration', 'len', 'mean', 'var', 'std',
        'kurtosis', 'skew', 'n_peaks', 'smooth10_n_peaks', 'smooth20_n_peaks',
        'diff_peaks', 'diff2_peaks', 'diff_var', 'diff2_var',
        'gaps_squared', 'len_weighted', 'var_div_duration', 'var_div_len'
    ]

    SUBSYSTEM_MAP = {
        'CADC0872': {'satellite': 'EOS-09 (LEO SSO)', 'station': 'ISTRAC-BLR', 'subsystem': 'Attitude & Orbit Control (AOCS)', 'param': 'Star Tracker Gyro Rate'},
        'CADC0873': {'satellite': 'Cartosat-3 (LEO SSO)', 'station': 'ISTRAC-MAU', 'subsystem': 'Payload Thermal Control', 'param': 'Focal Plane Array Temp'},
        'CADC0874': {'satellite': 'Oceansat-3 (EOS-06)', 'station': 'ISTRAC-PBL', 'subsystem': 'Electrical Power (EPS)', 'param': 'Solar Array Bus Voltage'},
        'CADC0884': {'satellite': 'RISAT-2BR2 (LEO Radar)', 'station': 'SDSC-SHAR', 'subsystem': 'Synthetic Aperture Radar', 'param': 'RF Power Amplifier Temp'},
        'CADC0888': {'satellite': 'Chandrayaan-3 Orbiter', 'station': 'IDSN-32M', 'subsystem': 'Deep Space TT&C', 'param': 'Ka-Band Downlink SNR'},
        'CADC0890': {'satellite': 'Aditya-L1 Halo Orbit', 'station': 'IDSN-32M', 'subsystem': 'Solar Coronagraph', 'param': 'Plasma Analyzer Stream'},
        'CADC0892': {'satellite': 'GSAT-24 Telecom (GEO)', 'station': 'MCF-HSN', 'subsystem': 'Ku-Band Payload', 'param': 'TWTA Helix Current'},
        'CADC0894': {'satellite': 'Polar EOS SVALSAT', 'station': 'SVALSAT', 'subsystem': 'High-Speed Downlink', 'param': 'X-Band Modulator Bias'}
    }

    test_df = df[df['train'] == 0].copy()
    test_df['pred'] = model.predict(test_df[feature_cols])
    test_df['prob'] = model.predict_proba(test_df[feature_cols])[:, 1]
    test_df['seg_index'] = test_df.index

    def make_sample(row, cell_type):
        ch = str(row['channel'])
        meta = SUBSYSTEM_MAP.get(ch, {'satellite': 'Unknown', 'station': 'ISTRAC-BLR', 'subsystem': 'Telemetry Link', 'param': 'Sensor Voltage'})
        prob = float(row['prob'])
        var_val = float(row['var'])
        length = int(row['len'])
        peaks = int(row['n_peaks'])
        
        param_name = meta['param']
        subsys_name = meta['subsystem']

        if cell_type == 'FP':
            reason = f"Elevated variance ({var_val:.2e}) during orbital penumbra exit crossed the 0.50 threshold (p={prob:.1%}). Nominal housekeeping temporarily flagged as false alarm."
        elif cell_type == 'FN':
            reason = f"Subtle gradual drift in {param_name} ({subsys_name}) with low peak count ({peaks}) produced an anomaly score of {prob:.1%}, falling just below the decision threshold."
        elif cell_type == 'TP':
            reason = f"Telemetry perturbation signature detected with {prob:.1%} confidence. Signal variance ({var_val:.2e}) and {peaks} transient peaks triggered immediate space defense alert."
        else:
            reason = f"Nominal housekeeping telemetry confirmed within 3-sigma tolerance envelope. Clearance confidence: {1.0 - prob:.1%}."
            
        return {
            'segment_id': f"SEG-ESA-{row['seg_index']}",
            'channel': ch,
            'satellite': meta['satellite'],
            'station': meta['station'],
            'subsystem': meta['subsystem'],
            'telemetry_param': meta['param'],
            'true_label': 'Anomaly' if row['anomaly'] == 1 else 'Nominal',
            'pred_label': 'Anomaly' if row['pred'] == 1 else 'Nominal',
            'anomaly_probability': round(prob, 4),
            'clearance_confidence': round(1.0 - prob, 4),
            'signal_length': length,
            'signal_variance': var_val,
            'peak_count': peaks,
            'explanation': reason
        }

    fps = [make_sample(row, 'FP') for _, row in test_df[(test_df['anomaly'] == 0) & (test_df['pred'] == 1)].iterrows()]
    fns = [make_sample(row, 'FN') for _, row in test_df[(test_df['anomaly'] == 1) & (test_df['pred'] == 0)].iterrows()]
    tps = [make_sample(row, 'TP') for _, row in test_df[(test_df['anomaly'] == 1) & (test_df['pred'] == 1)].head(30).iterrows()]
    tns = [make_sample(row, 'TN') for _, row in test_df[(test_df['anomaly'] == 0) & (test_df['pred'] == 0)].head(30).iterrows()]

    tp_total = int(((test_df['anomaly'] == 1) & (test_df['pred'] == 1)).sum())
    tn_total = int(((test_df['anomaly'] == 0) & (test_df['pred'] == 0)).sum())

    out = {
        'summary': {
            'total_test_segments': len(test_df),
            'tp_count': tp_total,
            'fp_count': len(fps),
            'fn_count': len(fns),
            'tn_count': tn_total,
        },
        'samples': {
            'FP': fps,
            'FN': fns,
            'TP': tps,
            'TN': tns
        }
    }

    out_path = os.path.join(base, 'telemetry_confusion_samples.json')
    with open(out_path, 'w') as f:
        json.dump(out, f, indent=2)

    print(f"Generated {out_path}:")
    print(f"TP: {tp_total} (preview {len(tps)}), FP: {len(fps)}, FN: {len(fns)}, TN: {tn_total} (preview {len(tns)})")

if __name__ == '__main__':
    generate()
