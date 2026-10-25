# AgriCloud-ML: End-to-End System Architecture

This document outlines the production architecture of **AgriCloud-ML: Serverless Plant Pathology & Relabeling Pipeline** deployed on **AWS EC2**, integrated with **PyTorch EfficientNet-B0**, **FastAPI**, **Express.js**, and **MongoDB Atlas Cloud**.

---

## 1. High-Level Architecture Flowchart

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (End Users & Agronomists)"]
        Browser["Web / Mobile Browser (React 18 + Vite + Tailwind CSS)"]
    end

    subgraph AWSCloud["AWS Cloud Infrastructure (EC2 Ubuntu Instance)"]
        subgraph Ingress["Ingress & Web Server"]
            Nginx["Nginx Reverse Proxy (Port 80)"]
        end

        subgraph PM2["PM2 Process Supervision Layer"]
            subgraph NodeService["Application Backend: agricloud-backend (Port 5000)"]
                API["Express.js REST API Engine"]
                Auth["JWT Auth & Security (Helmet, bcrypt, Rate Limit)"]
                Ingest["Multi-Modal Ingestion (Multer / pdf-lib)"]
                OOD_Filter["OOD Filename & Pattern Guardrail"]
                CureEngine["Botanical Curation Engine (cures.json loader)"]
            end

            subgraph MLService["Inference Microservice: agricloud-ml (Port 8000)"]
                FastAPI["FastAPI REST Server (Uvicorn)"]
                
                subgraph Guardrail["Multi-Stage Plant & Foliage Guardrail"]
                    HSV["Botanical HSV Spectrum Filter (Chlorophyll & Lesion Density)"]
                    Entropy["Softmax Shannon Entropy & Confidence Gate"]
                end

                subgraph NeuralEngine["Deep Learning Pipeline"]
                    Transforms["Input Transforms (224x224, ImageNet Normalization)"]
                    EffNet["PyTorch EfficientNet-B0 Backbone"]
                    Head["Linear Classifier (39 Classes: 38 PlantVillage + Non-Leaf)"]
                end
            end
        end

        subgraph LocalAssets["Local EC2 Storage & Artifacts"]
            StaticDist["Frontend Static Build (/var/www/agricloud/frontend/dist)"]
            ModelWeights["Model Artifacts (model/model.pth & labels.json)"]
            KnowledgeBase["Decoupled Botanical Knowledge (data/cures.json)"]
            LocalUploads["Local Uploaded Specimens (backend/uploads/)"]
        end
    end

    subgraph CloudDataTier["External Cloud Data Tier"]
        subgraph Atlas["MongoDB Atlas Cloud Cluster"]
            MongoUsers[("users Collection: Credentials & Roles")]
            MongoAnalyses[("analyses Collection: Diagnoses & Relabeling")]
        end

        subgraph S3["AWS Cloud Object Storage (Optional)"]
            S3Bucket[("AWS S3 Bucket: agricloud-ml-leaf-storage")]
        end
    end

    %% Network Connections
    Browser -->|"HTTP / HTTPS (Port 80)"| Nginx
    Nginx -->|"Path / (Static Files)"| StaticDist
    Nginx -->|"Path /api/* (Reverse Proxy)"| API
    Nginx -->|"Path /uploads/*"| LocalUploads

    API --> Auth
    API --> Ingest
    API --> OOD_Filter
    API -->|"Dynamic Agronomy Lookup"| CureEngine
    CureEngine -->|"Reads"| KnowledgeBase

    Ingest -->|"Save Specimen"| LocalUploads
    Ingest -.->|"Upload (If STORAGE_MODE=s3)"| S3Bucket

    API -->|"POST /predict (Multipart Image)"| FastAPI
    FastAPI --> Transforms
    Transforms --> HSV
    HSV -->|"Foliage Coverage >= 12%"| EffNet
    HSV -->|"Coverage < 12%: REJECT"| FastAPI
    EffNet --> Head
    Head --> Entropy
    Entropy -->|"High Confidence Plant Class"| FastAPI
    Entropy -->|"Non_leaf_or_unknown: REJECT"| FastAPI

    FastAPI -->|"Return JSON Diagnosis / 422 Rejection"| API

    API -->|"Mongoose TLS Connection"| Atlas
    Atlas --> MongoUsers
    Atlas --> MongoAnalyses
    Head -.->|"Loads Weights on Boot"| ModelWeights
```

---

## 2. Component Breakdown

### 2.1 Ingress Tier (Nginx Reverse Proxy)
* **Port**: `80` (HTTP) / `443` (HTTPS)
* **Function**: Single entry point for all web traffic.
  * Routes root requests (`/`) directly to the pre-compiled React 18 production bundle at `/var/www/agricloud/frontend/dist`.
  * Proxies `/api/` calls to the Node.js Express backend on `http://127.0.0.1:5000/api/`.
  * Serves cached specimen images from `/uploads/` directly from disk with client max body size configured to `25M`.

### 2.2 Application Backend Tier (`agricloud-backend`)
* **Technology**: Node.js 20 LTS + Express.js
* **Process Manager**: Supervised by PM2 as `agricloud-backend`
* **Port**: `5000` (Internal)
* **Key Responsibilities**:
  1. **Authentication & Authorization**: Strict user data isolation via stateless JWT tokens and bcrypt password hashing.
  2. **Multi-Modal Document Processing**: Accepts standard JPEG/PNG imagery and clinical multi-page agronomy PDF reports (extracting specimen images via `pdf-lib`).
  3. **Non-Plant Pattern Filter**: First-pass regular expression filter that catches uploaded files depicting non-botanical objects (cars, portraits, electronics, furniture).
  4. **Dynamic Botanical Curation Service**: Integrates with `data/cures.json` to retrieve Cause, Symptoms, Treatment, and Prevention independently of ML weights.
  5. **Continuous Learning / Relabeling Loop**: Stores human-in-the-loop annotations (`Pending`, `Confirmed`, `Corrected`) and exports standard training datasets in COCO JSON and CSV formats.

### 2.3 Machine Learning Inference Tier (`agricloud-ml`)
* **Technology**: Python 3.12 + FastAPI + PyTorch + TorchVision
* **Process Manager**: Supervised by PM2 as `agricloud-ml`
* **Port**: `8000` (Internal)
* **Neural Backbone**: **EfficientNet-B0** ($224 \times 224$ input, ImageNet normalized).
* **Weights**: Fine-tuned checkpoint loaded from `model/model.pth` (99.56% validation accuracy).
* **Multi-Stage Plant Verification & OOD Guardrail**:
  1. **Botanical Spectrum Pre-Filter**: Evaluates pixel density in HSV color space across chlorophyll greens ($H: 50^\circ\text{--}155^\circ$), chlorotic yellows ($H: 28^\circ\text{--}50^\circ$), and necrotic lesion browns ($H: 14^\circ\text{--}28^\circ$). Rejects images with $< 12\%$ botanical foliage.
  2. **Dedicated Out-Of-Distribution Neural Class**: The classifier head outputs **39 classes** (38 PlantVillage categories across 14 crops + `Non_leaf_or_unknown`). When an artificial object or non-leaf image is processed, the network predicts `Non_leaf_or_unknown` and rejects it.
  3. **Shannon Entropy Gate**: Computes prediction entropy $H = -\sum p_i \ln(p_i)$. Unusually flat probability distributions trigger an Out-Of-Distribution rejection with HTTP 422.

### 2.4 Cloud Database Tier (MongoDB Atlas)
* **Cluster**: `cluster0.kjeyc9a.mongodb.net`
* **Database**: `agricloud_ml`
* **Collections**:
  * `users`: Stores user identity, hashed passwords, roles (`user`, `expert`, `admin`), and timestamps.
  * `analyses`: Stores complete pathology records, confidence metrics, top-3 alternate predictions, agronomic recommendations, review statuses, and file URLs.
* **Failover Engine**: If connection to the cloud cluster is interrupted, the backend automatically proxies requests through `backend/config/localStore.js` to `backend/data/local_db.json` with zero service disruption.

---

## 3. Data Flow Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Farmer
    participant UI as React Frontend
    participant Nginx as Nginx (Port 80)
    participant Backend as Express Backend (Port 5000)
    participant ML as FastAPI Service (Port 8000)
    participant EffNet as EfficientNet-B0 + Guardrails
    participant Cures as cures.json
    participant DB as MongoDB Atlas Cloud

    User->>UI: Uploads Leaf Image (.jpg/.png) or PDF
    UI->>Nginx: POST /api/analysis (Multipart Form)
    Nginx->>Backend: Proxy to 127.0.0.1:5000

    Backend->>Backend: Validate format, size (<= 15MB) & non-plant keywords
    Backend->>Backend: Save image to local disk / S3

    Backend->>ML: POST /predict (Binary Image Stream)
    ML->>EffNet: Check HSV botanical spectrum & run PyTorch inference
    
    alt Image is Non-Plant or Out-of-Distribution
        EffNet-->>ML: isPlant = False (Coverage < 12% OR Non_leaf_or_unknown)
        ML-->>Backend: HTTP 422 (Rejection Reason)
        Backend-->>UI: HTTP 400: "No plant foliage detected. Please upload a crop leaf."
        UI-->>User: Display Red Warning Alert (No database record created)
    else Image is Valid Crop Leaf Specimen
        EffNet-->>ML: isPlant = True, Top-3 Predictions & Confidence Score
        ML-->>Backend: HTTP 200: { rawClass, plantName, disease, confidence, topPredictions }
        Backend->>Cures: Query disease curation by rawClass
        Cures-->>Backend: Return Cause, Symptoms, Treatment, Prevention
        Backend->>DB: Save complete Analysis record (status: 'completed')
        DB-->>Backend: Confirmed saved document with _id
        Backend-->>UI: HTTP 201: Analysis details payload
        UI-->>User: Render Diagnostic Card, Treatment Plan & Relabeling Review UI
    end
```

---

## 4. Port & Security Summary

| Service | Port | Access Scope | Managed By | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx** | `80` (HTTP) | Public (`0.0.0.0/0`) | `systemd` | SSL termination & reverse proxy |
| **Frontend** | Static Files | Internal | Nginx | Serves React Single Page Application |
| **Backend** | `5000` | Loopback (`127.0.0.1`) | PM2 (`agricloud-backend`) | REST API, auth, business logic |
| **ML Engine** | `8000` | Loopback (`127.0.0.1`) | PM2 (`agricloud-ml`) | PyTorch EfficientNet-B0 inference |
| **MongoDB Atlas**| `27017` (TLS) | Outbound to Atlas Cloud | Cloud Provider | User & Analysis data persistence |
| **SSH** | `22` | Admin IP / Restrictive | `sshd` | Remote server administration |
