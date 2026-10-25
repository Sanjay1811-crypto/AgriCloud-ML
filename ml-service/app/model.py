import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from app.classes import CLASS_NAMES, parse_class_label

# ImageNet normalization matching PlantVillage training
INFERENCE_TRANSFORMS = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

class PlantPathologyModel:
    def __init__(self, model_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.classes = CLASS_NAMES
        self.num_classes = len(self.classes)
        self.model = self._build_model()
        self.model_version = "EfficientNet-B0-v1"
        self._load_weights(model_path)
        self.model.eval()

    def _build_model(self):
        # Base EfficientNet-B0 architecture
        try:
            weights = models.EfficientNet_B0_Weights.DEFAULT
            model = models.efficientnet_b0(weights=weights)
        except Exception:
            model = models.efficientnet_b0(weights=None)

        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, self.num_classes)
        return model.to(self.device)

    def _load_weights(self, model_path: str):
        if model_path and os.path.exists(model_path):
            try:
                state_dict = torch.load(model_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                print(f"[ML Service] Loaded weights from {model_path}")
            except Exception as e:
                print(f"[ML Service] Warning: Failed to load {model_path}: {e}. Running with initialized weights.")
        else:
            print("[ML Service] No custom .pth found; using base EfficientNet-B0 architecture.")

    def predict(self, image_bytes: bytes, top_k: int = 3):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = INFERENCE_TRANSFORMS(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

        top_probs, top_indices = torch.topk(probabilities, min(top_k, self.num_classes))
        
        top_predictions = []
        for prob, idx in zip(top_probs, top_indices):
            raw_label = self.classes[idx.item()]
            crop, disease = parse_class_label(raw_label)
            top_predictions.append({
                "rawClass": raw_label,
                "label": disease,
                "crop": crop,
                "confidence": round(prob.item(), 4)
            })

        best = top_predictions[0]
        return {
            "rawClass": best["rawClass"],
            "plantName": best["crop"],
            "disease": best["label"],
            "confidence": best["confidence"],
            "topPredictions": top_predictions,
            "modelVersion": self.model_version
        }
