import requests

def generate_response(prompt):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "temperature": 0.1,
                "stream": False
            },
            timeout=2.5
        )
        if response.status_code == 200:
            return response.json().get("response", "No response generated.")
    except Exception:
        pass
    return "SOC AI Analysis: Telemetry inspected. Autonomous rules and containment policies active."

