_model = None

def load_embedding_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        except ImportError:
            print("Warning: sentence-transformers not installed. RAG embedding disabled.")
            return None
    return _model


def create_embeddings(documents):
    model = load_embedding_model()
    if model is None:
        return []
    return model.encode(documents)
