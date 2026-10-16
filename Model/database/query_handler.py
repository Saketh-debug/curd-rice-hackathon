import re
from .db import execute_query

def extract_ip(query):
    pattern = r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b"
    match = re.search(pattern, query)
    return match.group() if match else None


def handle_ip_query(ip):
    incidents = execute_query(
        "SELECT type, confidence, action FROM traffic_logs WHERE src_ip=%s ORDER BY timestamp DESC LIMIT 10",
        (ip,)
    )

    blocked = execute_query(
        "SELECT action FROM auto_blocked WHERE src_ip=%s LIMIT 1",
        (ip,)
    )

    return incidents, blocked


def handle_sql_query():
    result = execute_query(
        "SELECT COUNT(*) FROM traffic_logs WHERE type='DDoS'"
    )
    count = result[0][0] if result and len(result) > 0 else 0
    return f"Total DDoS incidents: {count}"
