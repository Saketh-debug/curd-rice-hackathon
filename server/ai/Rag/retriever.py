from .embedding import load_embedding_model
import numpy as np

class RAGSystem:
    def __init__(self, documents=None, vector_store=None):
        self.documents = documents if documents is not None else []
        self.vector_store = vector_store
        self.model = load_embedding_model()

    def retrieve(self, query, k=3):
        if not self.documents or not self.vector_store:
            return []
        query_embedding = self.model.encode([query])
        indices = self.vector_store.search(query_embedding, k)
        return [self.documents[i] for i in indices]
