from transformers import pipeline

# Global variable to hold the model (so we don't load it 100 times)
sentiment_pipeline = None

def load_model():
    """
    Loads the AI model into memory when the app starts.
    This runs once.
    """
    global sentiment_pipeline
    print("🧠 Loading AI Brain... (This might take a moment)")
    
    # We use 'distilbert' because it is fast and lightweight
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    
    print("✅ AI Brain Loaded Successfully!")

def analyze_text(text: str):
    """
    Takes a string, runs it through the AI, and returns the result.
    """
    if not sentiment_pipeline:
        load_model()
    
    # The pipeline returns a list like [{'label': 'POSITIVE', 'score': 0.99}]
    result = sentiment_pipeline(text)[0]
    return result