from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Skin disease information database
SKIN_DISEASES_INFO = {
    "acne": {
        "name": "Acne Vulgaris",
        "description": "A common skin condition that occurs when hair follicles become plugged with oil and dead skin cells. It causes whiteheads, blackheads, or pimples.",
        "severity_levels": ["Mild", "Moderate", "Severe"],
        "treatments": [
            "Topical retinoids (tretinoin, adapalene)",
            "Benzoyl peroxide cleansers",
            "Salicylic acid treatments",
            "Keep skin clean and moisturized"
        ],
        "precautions": [
            "Avoid touching or picking at affected areas",
            "Use non-comedogenic skincare products",
            "Maintain a consistent skincare routine",
            "Consult a dermatologist for persistent cases"
        ]
    },
    "eczema": {
        "name": "Eczema (Atopic Dermatitis)",
        "description": "A chronic condition that makes skin red, inflamed, and itchy. It's common in children but can occur at any age and often flares periodically.",
        "severity_levels": ["Mild", "Moderate", "Severe"],
        "treatments": [
            "Moisturizing creams and ointments",
            "Topical corticosteroids",
            "Antihistamines for itching",
            "Avoiding known triggers"
        ],
        "precautions": [
            "Keep skin well moisturized",
            "Avoid harsh soaps and detergents",
            "Wear soft, breathable fabrics",
            "Identify and avoid personal triggers"
        ]
    },
    "psoriasis": {
        "name": "Psoriasis",
        "description": "An autoimmune condition that causes rapid skin cell buildup, resulting in scaling on the skin's surface. Patches are typically red and covered with silver scales.",
        "severity_levels": ["Mild", "Moderate", "Severe"],
        "treatments": [
            "Topical corticosteroids",
            "Vitamin D analogues",
            "Light therapy (phototherapy)",
            "Moisturizers to reduce dryness"
        ],
        "precautions": [
            "Avoid skin injuries and sunburn",
            "Manage stress levels",
            "Limit alcohol consumption",
            "Regular follow-up with dermatologist"
        ]
    },
    "melanoma": {
        "name": "Melanoma",
        "description": "The most serious type of skin cancer, developing in cells that produce melanin. It can develop anywhere on the body and requires immediate medical attention.",
        "severity_levels": ["Stage 0", "Stage I-IV"],
        "treatments": [
            "URGENT: Seek immediate medical consultation",
            "Surgical removal is primary treatment",
            "Immunotherapy may be recommended",
            "Regular skin checks are essential"
        ],
        "precautions": [
            "URGENT: See a dermatologist immediately",
            "Protect skin from UV radiation",
            "Perform regular self-examinations",
            "Follow ABCDE rule for mole checks"
        ]
    },
    "ringworm": {
        "name": "Ringworm (Tinea)",
        "description": "A common fungal infection that causes a red, circular, itchy rash. Despite its name, it's not caused by a worm but by fungi called dermatophytes.",
        "severity_levels": ["Mild", "Moderate", "Severe"],
        "treatments": [
            "Antifungal creams (clotrimazole, miconazole)",
            "Keep affected area clean and dry",
            "Antifungal powders for prevention",
            "Oral antifungals for severe cases"
        ],
        "precautions": [
            "Avoid sharing personal items",
            "Keep skin clean and dry",
            "Wash hands after touching affected areas",
            "Complete full course of treatment"
        ]
    },
    "rosacea": {
        "name": "Rosacea",
        "description": "A chronic skin condition causing redness and visible blood vessels on the face. It may also produce small, red, pus-filled bumps.",
        "severity_levels": ["Mild", "Moderate", "Severe"],
        "treatments": [
            "Topical antibiotics (metronidazole)",
            "Azelaic acid preparations",
            "Avoiding trigger factors",
            "Gentle skincare routine"
        ],
        "precautions": [
            "Avoid sun exposure and use sunscreen",
            "Identify and avoid personal triggers",
            "Use gentle, fragrance-free products",
            "Avoid hot beverages and spicy foods"
        ]
    },
    "vitiligo": {
        "name": "Vitiligo",
        "description": "A condition causing loss of skin pigmentation in patches. It occurs when melanocytes die or stop producing melanin.",
        "severity_levels": ["Localized", "Generalized", "Universal"],
        "treatments": [
            "Topical corticosteroids",
            "Phototherapy (narrowband UVB)",
            "Depigmentation therapy",
            "Camouflage makeup"
        ],
        "precautions": [
            "Protect skin from sun exposure",
            "Use broad-spectrum sunscreen",
            "Avoid skin trauma",
            "Consider psychological support"
        ]
    },
    "dermatitis": {
        "name": "Contact Dermatitis",
        "description": "An itchy rash caused by direct contact with a substance or an allergic reaction. The rash isn't contagious but can be very uncomfortable.",
        "severity_levels": ["Mild", "Moderate", "Severe"],
        "treatments": [
            "Identify and avoid the irritant",
            "Topical corticosteroids",
            "Cool, wet compresses",
            "Oral antihistamines for itching"
        ],
        "precautions": [
            "Wear protective gloves when handling irritants",
            "Use hypoallergenic products",
            "Patch test new products",
            "Keep skin moisturized"
        ]
    },
    "hives": {
        "name": "Urticaria (Hives)",
        "description": "Raised, itchy welts on the skin triggered by various factors including allergic reactions, stress, or infections.",
        "severity_levels": ["Acute", "Chronic"],
        "treatments": [
            "Antihistamines (cetirizine, loratadine)",
            "Cool compresses",
            "Avoid scratching",
            "Corticosteroids for severe cases"
        ],
        "precautions": [
            "Identify and avoid triggers",
            "Keep a symptom diary",
            "Seek emergency care if breathing affected",
            "Wear loose, comfortable clothing"
        ]
    },
    "healthy_skin": {
        "name": "Healthy Skin",
        "description": "Your skin appears healthy with no visible signs of common skin conditions. Continue maintaining your current skincare routine.",
        "severity_levels": ["N/A"],
        "treatments": [
            "Continue regular cleansing and moisturizing",
            "Use sunscreen daily",
            "Stay hydrated",
            "Maintain a balanced diet"
        ],
        "precautions": [
            "Regular skin self-examinations",
            "Annual dermatologist check-ups",
            "Protect from excessive sun exposure",
            "Maintain healthy lifestyle habits"
        ]
    }
}

# Pydantic Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"

class DiagnosisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    detected_condition: str
    condition_name: str
    confidence_score: float
    description: str
    severity: str
    treatments: List[str]
    precautions: List[str]
    analysis_notes: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    disclaimer: str = "This analysis is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider."

# GPT-5.2 Vision Analysis
async def analyze_skin_image(image_base64: str) -> dict:
    """Analyze skin image using GPT-5.2 vision capabilities"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
    import json
    import re
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="AI API key not configured")
    
    session_id = str(uuid.uuid4())
    
    system_message = """You are an expert dermatological AI assistant specialized in skin condition analysis. 
    
Your task is to analyze skin images and provide:
1. The most likely skin condition from this list: acne, eczema, psoriasis, melanoma, ringworm, rosacea, vitiligo, dermatitis, hives, healthy_skin
2. A confidence score between 0.0 and 1.0
3. Severity assessment (Mild, Moderate, or Severe)
4. Brief analysis notes about what you observed

IMPORTANT: 
- Always respond in valid JSON format
- Be conservative with confidence scores
- If you detect potential melanoma or anything that could be skin cancer, flag it as URGENT
- If the image quality is poor or you cannot make a determination, indicate lower confidence

Respond ONLY with this JSON structure:
{
    "detected_condition": "condition_key",
    "confidence_score": 0.85,
    "severity": "Mild|Moderate|Severe",
    "analysis_notes": "Brief description of observations"
}"""

    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    image_content = ImageContent(image_base64=image_base64)
    
    user_message = UserMessage(
        text="Please analyze this skin image and provide your assessment in the specified JSON format. Identify any visible skin conditions, estimate confidence, assess severity, and provide brief analysis notes.",
        file_contents=[image_content]
    )
    
    try:
        response = await chat.send_message(user_message)
        logger.info(f"AI Response: {response}")
        
        # Try to extract JSON from the response
        json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            # Try parsing the whole response as JSON
            result = json.loads(response)
        
        return result
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        # Return a default response if parsing fails
        return {
            "detected_condition": "healthy_skin",
            "confidence_score": 0.5,
            "severity": "Mild",
            "analysis_notes": "Unable to parse AI response. Please try again with a clearer image."
        }
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "DermaScan AI - Skin Disease Detection API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "DermaScan AI"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

@api_router.post("/analyze", response_model=DiagnosisResult)
async def analyze_skin_condition(request: ImageAnalysisRequest):
    """Analyze a skin image and return diagnosis results"""
    logger.info("Received skin analysis request")
    
    # Validate image data
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="No image data provided")
    
    # Remove data URL prefix if present
    image_data = request.image_base64
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # Validate base64
    try:
        base64.b64decode(image_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")
    
    # Analyze with GPT-5.2 Vision
    analysis_result = await analyze_skin_image(image_data)
    
    # Get condition details
    condition_key = analysis_result.get("detected_condition", "healthy_skin")
    if condition_key not in SKIN_DISEASES_INFO:
        condition_key = "healthy_skin"
    
    condition_info = SKIN_DISEASES_INFO[condition_key]
    
    # Build diagnosis result
    diagnosis = DiagnosisResult(
        detected_condition=condition_key,
        condition_name=condition_info["name"],
        confidence_score=min(1.0, max(0.0, analysis_result.get("confidence_score", 0.5))),
        description=condition_info["description"],
        severity=analysis_result.get("severity", "Mild"),
        treatments=condition_info["treatments"],
        precautions=condition_info["precautions"],
        analysis_notes=analysis_result.get("analysis_notes", "Analysis completed successfully.")
    )
    
    logger.info(f"Analysis complete: {condition_info['name']} with {diagnosis.confidence_score:.0%} confidence")
    
    return diagnosis

@api_router.get("/conditions")
async def get_all_conditions():
    """Get information about all detectable skin conditions"""
    return {key: {"name": info["name"], "description": info["description"]} 
            for key, info in SKIN_DISEASES_INFO.items()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
