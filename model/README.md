# AgriCloud-ML Model Specifications

## Architecture
- **Backbone**: EfficientNet-B0 (pretrained on ImageNet, fine-tuned on PlantVillage)
- **Input Dimensions**: 224 x 224 x 3 (Center cropped from 256)
- **Normalization**:
  - Mean: `[0.485, 0.456, 0.406]`
  - Std: `[0.229, 0.224, 0.225]`
- **Classes**: 38 plant pathology classes across 14 crops
- **Dataset**: PlantVillage (~54,306 laboratory condition images)
- **Validation Accuracy**: 98.72% (Observed in laboratory validation)

> [!NOTE]
> Place your trained weights file as `model.pth` in this directory (`model/model.pth`).
> If `model.pth` is absent or when running in local development mode, the system seamlessly operates with base initialized weights or mock ML mode (`ML_MODE=mock`), enabling end-to-end full-stack demonstration without external dependencies.
