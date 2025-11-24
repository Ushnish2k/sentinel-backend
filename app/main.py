from fastapi import FastAPI

# Initialize the app
app = FastAPI(
    title="Sentinel API",
    description="AI-Powered Brand Reputation Monitor",
    version="1.0.0"
)

# Health Check Route
@app.get("/")
def read_root():
    return {"status": "active", "system": "Sentinel v1"}

@app.get("/api/v1/test")
def test_route():
    return {"message": "The API is connected and listening."}