# AgriCloud-ML: Serverless Plant Pathology & Relabeling Pipeline on AWS

**Capstone Project BCSE497J — Final-Year Engineering Project**  
*School of Computer Science & Engineering, Vellore Institute of Technology (VIT)*

---

## 1. Executive Summary & Problem Statement

Plant foliar diseases cause 20% to 40% reduction in global crop yields each year, costing hundreds of billions of dollars and posing severe risks to global food security (UN SDG 2: Zero Hunger). While deep convolutional neural networks achieve laboratory benchmark accuracies exceeding 95%, deployed agricultural AI systems suffer from three fundamental limitations:

1. **Monolithic Design Coupling**: Treatment recommendations are frequently hard-coded into model classifiers. When biological treatments change or new fungicides are approved, the entire neural network must be retrained.
2. **Dataset Drift & Absence of Relabeling Loops**: Models trained on laboratory datasets (such as PlantVillage) degrade in real-world field conditions due to complex background foliage, irregular lighting, and novel pathogen strains.
3. **Hardware Constraints**: Edge and mobile devices struggle to execute heavy neural networks with rapid inference without draining battery and processing power.

**AgriCloud-ML** solves these challenges through a cloud-native, serverless architecture that decouples deep learning diagnostic inference from structured botanical curation (`cures.json`), while embedding an expert human-in-the-loop relabeling workflow that continuously collects and exports re-annotated samples (in COCO JSON and CSV formats) for iterative cloud retraining.

---

## 2. Machine Learning Architecture & Specifications

### Pretrained Deep Learning Backbone
- **Model Architecture**: `EfficientNet-B0` (Pretrained on ImageNet, fine-tuned on PlantVillage)
- **Input Dimensions**: $224 \times 224 \times 3$ RGB (Center-cropped from 256)
- **Tensor Normalization**:
  - Channel Means: `[0.485, 0.456, 0.406]`
  - Channel Std Dev: `[0.229, 0.224, 0.225]`
- **Dataset**: PlantVillage (~54,306 laboratory condition images)
- **Total Diagnostic Classes**: 38 distinct crop-pathology categories across 14 crop species
- **Best Observed Validation Accuracy**: **98.72%**

> [!IMPORTANT]
> **Scientific Caveat on Real-World Generalization**:
> The 98.72% validation accuracy was achieved under controlled laboratory lighting conditions with uniform backgrounds. In real-world field photography, soil backgrounds, insect damage, and variable sun angles can lower model confidence. For this reason, AgriCloud-ML incorporates configurable confidence thresholding (High $\ge 80\%$, Moderate $50\text{--}79\%$, Low $< 50\%$) and explicitly warns agronomists when confidence falls below threshold.

---

## 3. The 38 PlantVillage Pathology Classes

| Crop | Disease / Pathological Condition | Class ID in Pipeline |
| :--- | :--- | :--- |
| **Apple** | Apple Scab | `Apple___Apple_scab` |
| **Apple** | Black Rot | `Apple___Black_rot` |
| **Apple** | Cedar Apple Rust | `Apple___Cedar_apple_rust` |
| **Apple** | Healthy Apple | `Apple___healthy` |
| **Blueberry** | Healthy Blueberry | `Blueberry___healthy` |
| **Cherry** | Powdery Mildew | `Cherry_(including_sour)___Powdery_mildew` |
| **Cherry** | Healthy Cherry | `Cherry_(including_sour)___healthy` |
| **Corn (Maize)** | Gray Leaf Spot (*Cercospora zeae-maydis*) | `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` |
| **Corn (Maize)** | Common Rust (*Puccinia sorghi*) | `Corn_(maize)___Common_rust_` |
| **Corn (Maize)** | Northern Leaf Blight (*Exserohilum turcicum*) | `Corn_(maize)___Northern_Leaf_Blight` |
| **Corn (Maize)** | Healthy Corn | `Corn_(maize)___healthy` |
| **Grape** | Black Rot (*Guignardia bidwellii*) | `Grape___Black_rot` |
| **Grape** | Esca / Black Measles | `Grape___Esca_(Black_Measles)` |
| **Grape** | Leaf Blight (*Isariopsis Leaf Spot*) | `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)` |
| **Grape** | Healthy Grape | `Grape___healthy` |
| **Orange** | Huanglongbing (Citrus Greening) | `Orange___Haunglongbing_(Citrus_greening)` |
| **Peach** | Bacterial Spot (*Xanthomonas arboricola*) | `Peach___Bacterial_spot` |
| **Peach** | Healthy Peach | `Peach___healthy` |
| **Pepper (Bell)**| Bacterial Spot (*Xanthomonas campestris*) | `Pepper,_bell___Bacterial_spot` |
| **Pepper (Bell)**| Healthy Pepper (Bell) | `Pepper,_bell___healthy` |
| **Potato** | Early Blight (*Alternaria solani*) | `Potato___Early_blight` |
| **Potato** | Late Blight (*Phytophthora infestans*) | `Potato___Late_blight` |
| **Potato** | Healthy Potato | `Potato___healthy` |
| **Raspberry** | Healthy Raspberry | `Raspberry___healthy` |
| **Soybean** | Healthy Soybean | `Soybean___healthy` |
| **Squash** | Powdery Mildew (*Podosphaera xanthii*) | `Squash___Powdery_mildew` |
| **Strawberry**| Leaf Scorch (*Diplocarpon earlianum*) | `Strawberry___Leaf_scorch` |
| **Strawberry**| Healthy Strawberry | `Strawberry___healthy` |
| **Tomato** | Bacterial Spot (*Xanthomonas*) | `Tomato___Bacterial_spot` |
| **Tomato** | Early Blight (*Alternaria solani*) | `Tomato___Early_blight` |
| **Tomato** | Late Blight (*Phytophthora infestans*) | `Tomato___Late_blight` |
| **Tomato** | Leaf Mold (*Passalora fulva*) | `Tomato___Leaf_Mold` |
| **Tomato** | Septoria Leaf Spot | `Tomato___Septoria_leaf_spot` |
| **Tomato** | Spider Mites Infestation | `Tomato___Spider_mites Two-spotted_spider_mite` |
| **Tomato** | Target Spot (*Corynespora cassiicola*) | `Tomato___Target_Spot` |
| **Tomato** | Yellow Leaf Curl Virus (TYLCV) | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` |
| **Tomato** | Mosaic Virus (ToMV) | `Tomato___Tomato_mosaic_virus` |
| **Tomato** | Healthy Tomato | `Tomato___healthy` |

---

## 4. End-to-End System Architecture

```text
                          ┌───────────────────────────┐
                          │   React + Vite Frontend   │
                          │   (Tailwind CSS, Router)  │
                          └─────────────┬─────────────┘
                                        │ HTTP / REST (JWT Auth)
                                        ▼
                          ┌───────────────────────────┐
                          │  Express.js Node Backend  │
                          │  (Multer, Auth, Routing)  │
                          └───┬───────┬───────┬───────┘
                              │       │       │
       ┌──────────────────────┘       │       └──────────────────────┐
       ▼                              ▼                              ▼
┌──────────────┐             ┌──────────────────┐          ┌───────────────────┐
│ MongoDB Store│             │ Storage Provider │          │ Python ML Service │
│ - Users      │             │ - Local Uploads  │          │ (FastAPI Engine)  │
│ - Analyses   │             │ - AWS S3 Bucket  │          └─────────┬─────────┘
│ - Relabeling │             └──────────────────┘                    │
└──────────────┘                                                     ▼
                                                           ┌───────────────────┐
                                                           │  EfficientNet-B0  │
                                                           │  (224x224, Top-3) │
                                                           └─────────┬─────────┘
                                                                     │ Disease Class
                                                                     ▼
                                                           ┌───────────────────┐
                                                           │  data/cures.json  │
                                                           │  (Cause, Symptoms,│
                                                           │   Cure & Prevent) │
                                                           └───────────────────┘
```

### Key Architectural Tenets
1. **Frontend Isolation**: The React client communicates exclusively with the Express backend. It never talks directly to the ML engine or cloud databases, preserving credentials and preventing unauthorized queries.
2. **Decoupled Curation**: Disease management data resides in `data/cures.json`. When agronomists update chemical or organic treatment guidelines, no model re-training is required.
3. **Multi-Modal Preprocessing**: PDFs (such as agronomy scouting reports) pass through a rendering stage to produce clean leaf image buffers prior to tensor normalization.
4. **Relabeling Feedback Loop**: Misclassifications can be corrected by expert users. Updates are saved to MongoDB with `reviewStatus: 'Corrected'` and can be exported as COCO JSON or CSV for active learning pipelines.

---

## 5. Technology Stack Summary

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React.
- **Backend API**: Node.js, Express.js, Mongoose, JWT authentication, bcryptjs, Multer, Helmet, CORS, Rate Limiting.
- **Database**: MongoDB (Local or MongoDB Atlas) with persistent file-backed development fallback.
- **Storage**: AWS S3 with local disk storage fallback (`STORAGE_MODE=local | s3`).
- **ML Inference**: Python 3.12, FastAPI, PyTorch, TorchVision EfficientNet-B0 (`ML_MODE=mock | real`).
- **Cloud Architecture**: AWS S3, AWS Lambda (via serverless-http), API Gateway, CloudFormation / Serverless Framework.

---

## 6. Setup & Execution Guide

### Prerequisites
- Node.js $\ge 18$ (`node -v`)
- npm $\ge 9$ (`npm -v`)
- Python $\ge 3.10$ (`py --version` or `python --version`)

### Quickstart (Dual-Service Local Mode)

#### 1. Backend REST API
```bash
cd backend
npm install
node server.js
```
The backend starts on `http://localhost:5000`. By default, it runs with `STORAGE_MODE=local` and `ML_MODE=mock` (returning calibrated 38-class PlantVillage predictions).

#### 2. Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
The React application starts on `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

#### 3. Python ML Inference Service (Optional for Real Mode)
```bash
cd ml-service
py -m pip install -r requirements.txt
py run.py
```
FastAPI will start on `http://localhost:8000`. Set `ML_MODE=real` in `backend/.env` to route inference through the live PyTorch model.

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Backend API port |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/agricloud_ml` | MongoDB connection URI |
| `JWT_SECRET` | `agricloud_super_secret_jwt_key...` | Cryptographic secret for signing auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration |
| `STORAGE_MODE` | `local` | `local` (saves to disk) or `s3` (uploads to AWS S3) |
| `AWS_REGION` | `us-east-1` | AWS region for S3 bucket |
| `AWS_ACCESS_KEY_ID` | `""` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | `""` | AWS IAM secret key |
| `S3_BUCKET_NAME` | `agricloud-ml-leaf-storage` | Target Amazon S3 bucket name |
| `ML_MODE` | `mock` | `mock` (calibrated 38-class mock) or `real` (FastAPI PyTorch engine) |
| `ML_SERVICE_URL` | `http://127.0.0.1:8000` | URL for Python ML inference service |

---

## 8. REST API Documentation

### Authentication
- `POST /api/auth/signup`: Create user account (`name`, `email`, `password`)
- `POST /api/auth/login`: Authenticate and obtain JWT bearer token
- `GET /api/auth/me`: Get current authenticated user profile
- `POST /api/auth/logout`: Invalidate client session

### Pathology Analysis
- `POST /api/analysis`: Upload image/PDF multipart file for diagnosis
- `GET /api/analysis`: Query paginated analysis history with search & filters
- `GET /api/analysis/:id`: Get individual specimen diagnostic result
- `PUT /api/analysis/:id/review`: Submit expert relabeling (`Confirmed` or `Corrected`)
- `DELETE /api/analysis/:id`: Delete analysis record and stored file
- `GET /api/analysis/export/relabel`: Export reviewed dataset in COCO JSON or CSV format

### Dashboard & Analytics
- `GET /api/dashboard/stats`: Get live metrics (Total, Diseased, Healthy, Avg Confidence)
- `GET /api/dashboard/recent`: Get latest 5 analyzed specimens

### Botanical Knowledge Base
- `GET /api/cures/classes`: List all 38 supported PlantVillage disease profiles

---

## 9. Viva / Defense Q&A Cheatsheet

**Q1: Why did you choose EfficientNet-B0 over ResNet-50 or VGG-16?**  
*A: EfficientNet-B0 uses compound scaling (balancing depth, width, and resolution simultaneously). It achieves equal or superior accuracy compared to ResNet-50 while requiring ~5x fewer parameters (5.3M vs 25.6M), drastically reducing latency and cloud inference costs on AWS.*

**Q2: Why separate `cures.json` from the neural network?**  
*A: Neural networks are perceptual pattern classifiers; they should not embed static agronomic domain knowledge. Decoupling the curation database allows agricultural extension officers to update fungicide names, dosage restrictions, or organic remedies without expensive model retraining.*

**Q3: How does the relabeling loop work in production?**  
*A: Misdiagnosed images are flagged by agronomists through the UI (`PUT /api/analysis/:id/review`). The platform saves the corrected ground-truth labels and exports them in standardized COCO JSON format. These curated annotations can then be ingested by an automated AWS SageMaker retraining pipeline.*

---

## 10. Authors & Acknowledgments

- **NUZELLA PRABHAKARA SANJAY** (Reg No: 23BCE0211)
- **GONTLA VENKATA SIVA SAI NIKHIL** (Reg No: 23BCE0318)
- **ALAPATI VENKATA SAI MURARI** (Reg No: 23BCI0156)
- **Faculty Guide**: Prof. K V Lakshmi Narayana
- **Institution**: School of Computer Science and Engineering, Vellore Institute of Technology (VIT), Vellore
