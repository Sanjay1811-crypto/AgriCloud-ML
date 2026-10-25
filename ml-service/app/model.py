import os
import io
import math
import json
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
        # Build base EfficientNet-B0 without downloading ImageNet weights
        # (Weights are populated by _load_weights)
        model = models.efficientnet_b0(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, self.num_classes)
        return model.to(self.device)

    def _load_weights(self, model_path: str):
        if model_path and os.path.exists(model_path):
            try:
                checkpoint = torch.load(model_path, map_location=self.device)
                state_dict = checkpoint.get("model_state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint

                # Check classifier output dimension in state_dict
                if "classifier.1.weight" in state_dict:
                    out_features = state_dict["classifier.1.weight"].shape[0]
                    if out_features != self.num_classes:
                        print(f"[ML Service] Adjusting classifier outputs to {out_features} classes")
                        in_features = self.model.classifier[1].in_features
                        self.model.classifier[1] = nn.Linear(in_features, out_features).to(self.device)
                        self.num_classes = out_features

                # Check for classes list in checkpoint or companion labels.json
                labels_json = os.path.join(os.path.dirname(model_path), "labels.json")
                if isinstance(checkpoint, dict) and "classes" in checkpoint and len(checkpoint["classes"]) == self.num_classes:
                    self.classes = checkpoint["classes"]
                elif os.path.exists(labels_json):
                    try:
                        with open(labels_json, "r") as f:
                            loaded_labels = json.load(f)
                            if len(loaded_labels) == self.num_classes:
                                self.classes = loaded_labels
                    except Exception:
                        pass

                self.model.load_state_dict(state_dict)
                print(f"[ML Service] Successfully loaded weights ({self.num_classes} classes) from: {model_path}")
            except Exception as e:
                print(f"[ML Service] Warning: Failed to load {model_path}: {e}. Running with initialized weights.")
        else:
            print(f"[ML Service] No custom .pth found at {model_path}; using base EfficientNet-B0 architecture.")

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

        # Explicit non-leaf class check (if model has Non_leaf_or_unknown output)
        if "non_leaf" in best["rawClass"].lower() or "unknown" in best["rawClass"].lower():
            is_plant = False
            rejection_reason = (
                f"The neural model identified this image as Non-Leaf or Unknown object with {round(best['confidence'] * 100, 1)}% confidence. "
                "Please upload a clear photograph of a crop leaf."
            )
        elif foliage_ratio < 0.12:
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
