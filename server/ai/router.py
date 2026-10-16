from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, ChatSession, ChatMessage, ManualReview, AutoBlocked, TrafficLog
from .Rag.retriever import RAGSystem
from .Rag.prompt_template import build_prompt
from .llm.ollama_client import generate_response
import json

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

# Lazy-load RAG when needed
_rag_instance = None
def get_rag():
    global _rag_instance
    if _rag_instance is None:
        try:
            _rag_instance = RAGSystem([], None)
        except Exception as e:
            print(f"Warning: RAG System failed to initialize: {e}")
            _rag_instance = False
    return _rag_instance if _rag_instance is not False else None

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[int] = None

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime

class SessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[Message]

def get_db_context(db: Session, query: str) -> str:
    """Generates dynamic context from the database based on the query."""
    context = "System Data Overview:\n"
    query_lower = query.lower()

    # 1. Total Counts
    total_logs = db.query(TrafficLog).count()
    pending_reviews = db.query(ManualReview).filter(ManualReview.status == "PENDING").count()
    auto_blocked = db.query(AutoBlocked).count()
    context += f"- Total Traffic Logs: {total_logs}\n"
    context += f"- Pending Incidents: {pending_reviews}\n"
    context += f"- Auto-Blocked IPs: {auto_blocked}\n"

    # 2. Country-Specific Queries (e.g., "logs from China")
    # Fetch all distinct countries appearing in logs to check against query
    active_countries = db.query(TrafficLog.country).distinct().all()
    active_countries = [c[0] for c in active_countries if c[0]]
    
    for country in active_countries:
        if country.lower() in query_lower:
            count = db.query(TrafficLog).filter(TrafficLog.country == country).count()
            context += f"\n[Specific Query Match]\n- Logs from {country}: {count}\n"
            
            # Add recent logs from this country
            recent = db.query(TrafficLog).filter(TrafficLog.country == country).order_by(TrafficLog.timestamp.desc()).limit(3).all()
            if recent:
                context += f"- Recent activity from {country}:\n"
                for r in recent:
                     context += f"  - {r.timestamp}: {r.type} (IP: {r.src_ip})\n"
            break

    # 3. Recent Activity (if no specific country found or general query)
    context += "\nRecent System Activity (Last 5):\n"
    recent_logs = db.query(TrafficLog).order_by(TrafficLog.timestamp.desc()).limit(5).all()
    for log in recent_logs:
        context += f"- {log.timestamp}: {log.type} from {log.country} (IP: {log.src_ip})\n"
        
    return context

@router.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    # 1. Create or Get Session
    session_id = req.session_id
    if not session_id:
        new_session = ChatSession(title=req.query[:30] + "...")
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        session_id = new_session.id
    
    # 2. Save User Message
    user_msg = ChatMessage(session_id=session_id, role="user", content=req.query)
    db.add(user_msg)
    db.commit()

    # Pre-fetch database context while the db session is open
    query_lower = req.query.lower()
    recent_incidents = None
    if "latest incidents" in query_lower or "recent attacks" in query_lower:
        recent_incidents = db.query(ManualReview).order_by(ManualReview.timestamp.desc()).limit(5).all()

    db_context = get_db_context(db, req.query)

    # Generator function for streaming
    def stream_logic():
        full_response = ""
        
        # Simple Logic Keywords
        if recent_incidents is not None:
            if not recent_incidents:
               chunk = "No pending or recent incidents recorded in the ground telemetry queue."
               full_response += chunk
               yield chunk
            else:
                chunk = "### Latest Incident Telemetry:\n\n"
                full_response += chunk
                yield chunk
                for i in recent_incidents:
                    line = f"- **{i.type}** from {i.country} (`{i.src_ip}`) - Confidence: {int(i.confidence*100)}% ({i.status})\n"
                    full_response += line
                    yield line

        elif "block" in query_lower and "ip" in query_lower:
             chunk = "To block an IP, use the **Review Now** action in the SecOps queue or Policy Configuration. Autonomous containment automatically auto-blocks threats above the 95% threshold."
             full_response += chunk
             yield chunk

        else:
            # LLM Streaming with Qwen 3.5:4B
            try:
                full_prompt = f"""You are AEGIS, the Autonomous Cyber Copilot and SOC Master AI Assistant for the SOAR aerospace ground segment operations center.
{db_context}

User Query: {req.query}

Instructions:
- If the user asks about live threat posture, statistics, incidents, or network logs, use the telemetry context above to provide factual metrics and status.
- If the user asks technical questions (e.g. SLE protocol exploit, TT&C link saturation, satellite communication security, DDoS, injection, port scanning, security policies), provide an expert, concise aerospace cybersecurity answer.
- Always structure responses cleanly in valid Markdown with standard headers (e.g. '### Threat Posture Summary'), bold labels, and bullet points ('- **Active Incidents**: ...').
- Never output space-separated hashes like '# # #' (always use '###').
- Keep responses direct, informative, and professional. Limit to 2-4 bullet points or concise paragraphs. Avoid conversational filler.
"""
                for chunk in generate_response(full_prompt):
                    full_response += chunk
                    yield chunk
                    
            except Exception as e:
                err = f"Error generating response: {str(e)}"
                full_response += err
                yield err

        # Save AI Response using fresh session
        try:
            from database import SessionLocal
            with SessionLocal() as db_save:
                ai_msg = ChatMessage(session_id=session_id, role="ai", content=full_response)
                db_save.add(ai_msg)
                db_save.commit()
        except Exception as e:
            print(f"Failed to save chat history: {e}")

    return StreamingResponse(stream_logic(), media_type="text/plain", headers={"X-Session-Id": str(session_id)})

@router.get("/history", response_model=List[SessionResponse])
def get_history(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).limit(10).all()
    result = []
    for s in sessions:
        msgs = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).order_by(ChatMessage.timestamp).all()
        result.append({
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "messages": [{"role": m.role, "content": m.content, "timestamp": m.timestamp} for m in msgs]
        })
    return result
