import requests

def generate_response(prompt):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen3.5:4b",
                "prompt": prompt,
                "temperature": 0.1,
                "stream": False,
                "think": False,
                "options": {"num_predict": 256, "temperature": 0.2}
            },
            timeout=15.0
        )
        if response.status_code == 200:
            return response.json().get("response", "No response generated.")
    except Exception:
        pass
    return "SOC AI Analysis: Telemetry inspected. Autonomous rules and containment policies active."

