from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image
import io
import os
import json

app = FastAPI(title="FlameScore AI Backend")

# 1. Enable CORS Middleware (CRITICAL for React to FastAPI communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://neil-023.github.io",   # Must include https://
        "https://alitaptap.mooo.com",  # Your new backend domain
        "http://localhost:5173",       # For local development
        "http://localhost:8003",
        "http://localhost:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize Gemini Client
# It automatically picks up the "GEMINI_API_KEY" environment variable.
# DO NOT hardcode your API key here for security reasons.
client = genai.Client()

SYSTEM_PROMPT = """
You are 'Alitaptap', a specialized fire safety AI agent for Filipino households.
Your goal is to analyze the photo using 4 Pillars.

PILLARS (Each scored 0 to 10, where 10 is the HIGHEST RISK):
1. STUFF (Fuel): Flammable materials.
2. POWER (Heat): Electrical/Gas condition.
3. SPACE (Distance): Proximity of Stuff to Power.
4. EXIT (Path): Clear way to doors/windows.

SCORING LOGIC:
Overall Score = (Sum of all 4 pillars) * 2.5
- 0-39: Low Risk
- 40-69: Moderate Risk
- 70-100: High Risk

Remarks: 10 to 15 words summary

OUTPUT FORMAT (JSON ONLY):
{
  "overall_score": [0-100],
  "classification": "Low Risk | Moderate Risk | High Risk",
  "Rremarks": "comments",
  "pillars": {
    "Fuel": [0-10],
    "Heat": [0-10],
    "space": [0-10],
    "Path": [0-10]
  },
  "assessments": [
    {"hazard": "name", "class": "Low Risk | Moderate Risk | High Risk", "risk": "danger", "fix": "action"}
  ],
  "agent_note": "Short English summary."
}
"""

@app.post("/api/assess")
async def assess_fire_safety(file: UploadFile = File(...)):
    """
    Receives an image from the React frontend, processes it with Gemini,
    and returns a structured flammability assessment JSON.
    """
    try:
        # Read the uploaded image file bytes
        image_bytes = await file.read()
        
        # Convert bytes to a PIL Image
        try:
            img = Image.open(io.BytesIO(image_bytes))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file format.")

        # Request Gemini to analyze with forced JSON output configuration
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[img, SYSTEM_PROMPT],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",  # Forces pure JSON, removing markdown codeblocks
                temperature=0.2  # Keeps results more consistent and deterministic
            )
        )

        # Parse and return the JSON response directly to the frontend
        result_json = json.loads(response.text)
        return result_json

    except json.JSONDecodeError:
        # Fallback if Gemini fails to output correct JSON (rare with response_mime_type)
        raise HTTPException(
            status_code=500, 
            detail="AI model failed to return a valid JSON format. Please try again."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "FlameScore API is online!"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}