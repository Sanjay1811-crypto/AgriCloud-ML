import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.model import PlantPathologyModel
from app.classes import CLASS_NAMES

app = FastAPI(
    title="AgriCloud-ML Pathology Inference Service",
    description="EfficientNet-B0 Plant Disease Inference Service for 38 PlantVillage Classes with OOD Foliage Validation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def resolve_model_path():
    env_path = os.getenv("MODEL_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "model"))
    candidates = [
        os.path.join(model_dir, "plant_disease_efficientnet_b0.pth"),
        os.path.join(model_dir, "model.pth")
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate

    # Search for any .pth file in model directory
    if os.path.exists(model_dir):
        for fname in os.listdir(model_dir):
            if fname.lower().endswith(".pth"):
                return os.path.join(model_dir, fname)

    return os.path.join(model_dir, "plant_disease_efficientnet_b0.pth")

MODEL_PATH = resolve_model_path()
pathology_model = None

@app.on_event("startup")
def load_model_instance():
    global pathology_model
    try:
        pathology_model = PlantPathologyModel(MODEL_PATH)
        print(f"[ML Service] EfficientNet-B0 inference engine initialized with weights from: {MODEL_PATH}")
    except Exception as e:
        print(f"[ML Service] Startup notice: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgriCloud-ML Inference Engine",
        "model": "EfficientNet-B0",
        "modelPath": MODEL_PATH,
        "modelExists": os.path.exists(MODEL_PATH),
        "classesCount": len(CLASS_NAMES),
        "device": str(pathology_model.device) if pathology_model else "uninitialized"
    }

@app.get("/classes")
def list_classes():
    return {
        "total": len(CLASS_NAMES),
        "classes": CLASS_NAMES
    }

@app.post("/predict")
async def predict_plant_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG/PNG)")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")

    try:
        prediction = pathology_model.predict(contents, top_k=3)
        if not prediction.get("isPlant", True):
            raise HTTPException(
                status_code=422,
                detail=prediction.get("rejectionReason", "No plant leaf detected. Please upload a clear photo of a crop leaf.")
            )
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
