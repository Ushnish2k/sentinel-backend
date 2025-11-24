import random
from faker import Faker
from sqlalchemy.orm import Session
from app.models import sentiment
from app.services.ai_engine import analyze_text

fake = Faker()

# Topics to make it look real
BRANDS = ["Sentinel", "Tesla", "Apple", "Google", "Netflix"]
ADJECTIVES_POS = ["amazing", "incredible", "fast", "reliable", "beautiful"]
ADJECTIVES_NEG = ["terrible", "slow", "broken", "expensive", "ugly"]

def generate_fake_tweet():
    """Generates a realistic-looking social media post."""
    brand = random.choice(BRANDS)
    
    # 50/50 chance of being Positive or Negative
    if random.random() > 0.5:
        adj = random.choice(ADJECTIVES_POS)
        text = f"I just tried {brand} and it is {adj}! Best experience ever."
    else:
        adj = random.choice(ADJECTIVES_NEG)
        text = f"My experience with {brand} was {adj}. I want a refund immediately."
        
    return text

def generate_data(db: Session, count: int = 10):
    """
    Generates 'count' number of fake posts, analyzes them with AI, 
    and saves them to the DB.
    """
    created_posts = []
    
    print(f"🔄 Generating {count} posts...")
    
    for _ in range(count):
        # 1. Make up a fake post
        text = generate_fake_tweet()
        
        # 2. Run it through your AI Brain (Real inference!)
        ai_result = analyze_text(text)
        
        # 3. Save to Database
        db_entry = sentiment.SentimentResult(
            text=text,
            sentiment=ai_result['label'],
            score=ai_result['score'],
            source="Simulated Twitter"
        )
        db.add(db_entry)
        created_posts.append(db_entry)
    
    # Commit all at once (Faster)
    db.commit()
    print(f"✅ Successfully created {count} posts.")
    return len(created_posts)