export interface StationStatus {
    code: string;
    name: string;
    status: string;
    ping: string;
}

export interface DecisionVelocityItem {
    hour: number | string;
    automated: number;
    reviewed?: number;
    review?: number;
}

export interface SystemHealth {
    status: "HEALTHY" | "DEGRADED";
    uptime_seconds: number;
    traffic_processed: string;
    raw_traffic_processed?: number;
    threats_detected?: number;
    auto_blocked?: number;
    pending_reviews?: number;
    automation_rate: string;
    events_per_second?: number;
    controller_hours_saved?: string;
    false_alarm_rate?: string;
    link_integrity_score?: number;
    avg_defense_latency?: string;
    sparkline_24h?: number[];
    decision_velocity?: DecisionVelocityItem[];
    stations?: StationStatus[];
}

export interface Packet {
    id: number;
    timestamp: string;
    src_ip: string;
    country: string;
    lat: number;
    lon: number;
    type: string;
    confidence: number;
    destination_port: number;
    station?: string;
    action: "MONITOR" | "AUTO_BLOCKED" | "PENDING_REVIEW" | "MANUAL_BLOCK" | "FALSE_POSITIVE";
    handled_by?: string;
    resolved_at?: string;

    // Context Data
    target_username?: string;
    burst_score?: number;
    failed_attempts?: number;
    traffic_volume?: string;
    login_behavior?: string;
}

export interface ClassMetric {
    name: string;
    alias: string;
    precision: number;
    recall: number;
    f1: number;
    fpr: number;
    support: number;
}

export interface MulticlassMetrics {
    confusion_matrix_7x7: number[][];
    matrix_labels: string[];
    class_metrics: ClassMetric[];
    total_support?: number;
    total_samples?: number;
    generated_at?: string;
}


export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
}

export interface ChatSession {
    id: number;
    title: string;
    created_at: string;
    messages: ChatMessage[];
}

export interface Incident extends Packet {
    // Same structure as packet for now, but semantically distinct
}

export interface LayaFactor {
    feature: string;
    value: number | null;
    contribution: number;
    note: string;
}

export interface ConfusionMatrix {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
}

export interface PerChannelMetric {
    channel: string;
    n_segments: number;
    anomaly_rate: number;
    tp: number;
    fp: number;
    fn: number;
    tn: number;
    recall: number;
    precision: number;
}

export interface EvaluationMetrics {
    computed_at: string;
    dataset: string;
    n_test_segments: number;
    n_train_segments: number;
    optimal_threshold: number;
    confusion_matrix: ConfusionMatrix;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
    specificity: number;
    roc_auc: number;
    distribution_drift: {
        kl_divergence: number;
        drift_detected: boolean;
        note: string;
    };
    per_channel_metrics: PerChannelMetric[];
    feature_importance: { feature: string; weight: number }[];
    benchmark_disclaimer: string;
}

export interface ThreatMapData {
    id: number;
    lat: number;
    lon: number;
    type: string;
    src_ip: string;
    country: string;
}

export interface SatellitePassData {
    satellite: string;
    orbit: string;
    station: string;
    station_code: string;
    aos: string;
    los: string;
    duration: string;
    maxElevation: string;
    frequency: string;
    channel: string;
    total_segments: number;
    anomalous_segments: number;
    anomaly_rate: number;
    mean_signal_length: number;
    signal_variance: number;
    peak_count: number;
    status: 'ACTIVE' | 'UPCOMING' | 'STANDBY';
    threatStatus: 'SECURE' | 'MONITOR' | 'CRITICAL';
    laya_risk_tier: string;
    laya_explanation: string;
}

export interface SatelliteMissionTelemetry {
    dataset_name: string;
    total_records: number;
    active_pass_channel: string;
    active_pass_satellite: string;
    active_pass_seconds_left: number;
    passes: SatellitePassData[];
}

