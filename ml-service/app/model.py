import os
import io
import math
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
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

    def _evaluate_foliage_density(self, image: Image.Image) -> float:
        """
        Fast botanical spectrum evaluation in HSV space.
        Returns the ratio of pixels matching botanical foliage (chlorophyll green,
        chlorotic yellow/amber, necrotic brown lesions).
        """
        thumb = image.resize((128, 128)).convert("HSV")
        pixels = list(thumb.getdata())
        if not pixels:
            return 0.0

        botanical_count = 0
        for h, s, v in pixels:
            # Chlorophyll green foliage: H in 35..110 (approx 50°-155°), S >= 25, V >= 25
            is_green = (35 <= h <= 110) and (s >= 25) and (v >= 25)
            # Senescent / chlorotic yellow foliage: H in 20..35, S >= 30, V >= 35
            is_yellow = (20 <= h < 35) and (s >= 30) and (v >= 35)
            # Necrotic brown / blight lesion: H in 10..20, S >= 25, 20 <= V <= 180
            is_brown = (10 <= h < 20) and (s >= 25) and (20 <= v <= 180)

            if is_green or is_yellow or is_brown:
                botanical_count += 1

        return botanical_count / len(pixels)

    def predict(self, image_bytes: bytes, top_k: int = 3):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # 1. Botanical spectrum pre-filter
        foliage_ratio = self._evaluate_foliage_density(image)

        # 2. Run EfficientNet-B0 neural inference
        tensor = INFERENCE_TRANSFORMS(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

        top_probs, top_indices = torch.topk(probabilities, min(top_k, self.num_classes))
        best_confidence = round(top_probs[0].item(), 4)

        # Calculate Shannon entropy: H = -sum(p * ln(p))
        entropy = -torch.sum(probabilities * torch.log(probabilities + 1e-9)).item()

        # 3. Out-Of-Distribution (OOD) & Plant Validation Guardrail
        is_plant = True
        rejection_reason = None

        if foliage_ratio < 0.12:
            is_plant = False
            rejection_reason = (
                f"No botanical plant foliage detected (foliage coverage: {round(foliage_ratio * 100, 1)}%). "
                "The image does not appear to be a crop leaf. Please upload a clear photo of a plant leaf."
            )
        elif foliage_ratio < 0.25 and best_confidence < 0.55:
            is_plant = False
            rejection_reason = (
                f"Low botanical foliage coverage ({round(foliage_ratio * 100, 1)}%) with low model confidence. "
                "Specimen does not match supported plant leaf patterns."
            )
        elif best_confidence < 0.35:
            is_plant = False
            rejection_reason = (
                f"Prediction confidence too low ({round(best_confidence * 100, 1)}%). "
                "Unable to identify plant pathology with sufficient confidence."
            )

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
            "isPlant": is_plant,
            "rejectionReason": rejection_reason,
            "foliageRatio": round(foliage_ratio, 3),
            "entropy": round(entropy, 3),
            "rawClass": best["rawClass"],
            "plantName": best["crop"],
            "disease": best["label"],
            "confidence": best_confidence,
            "topPredictions": top_predictions,
            "modelVersion": self.model_version
        }
