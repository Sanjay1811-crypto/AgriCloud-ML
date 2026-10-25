#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  AgriCloud-ML: Automated AWS EC2 Deployment Script"
echo "=========================================================="

# 1. Update and install system dependencies
echo "--> Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y curl git nginx build-essential python3 python3-pip python3-venv

# 2. Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo "--> Installing Node.js 20.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "--> Node version: $(node -v)"
echo "--> NPM version: $(npm -v)"

# 3. Install PM2 process manager
if ! command -v pm2 &> /dev/null; then
    echo "--> Installing PM2 process manager..."
    sudo npm install -g pm2
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "--> Application directory: $APP_DIR"

# 4. Setup Python ML Microservice (FastAPI + PyTorch EfficientNet-B0)
echo "--> Setting up Python ML Microservice (EfficientNet-B0)..."
cd "$APP_DIR/ml-service"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
echo "--> Installing PyTorch CPU inference engine..."
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
deactivate

# Ensure trained weights are present in model/
if [ ! -f "$APP_DIR/model/model.pth" ] && [ ! -f "$APP_DIR/model/plant_disease_efficientnet_b0.pth" ]; then
    echo "--> Downloading fine-tuned PlantVillage EfficientNet-B0 model weights (99.56% accuracy)..."
    curl -L "https://huggingface.co/tahmidalbi/agroscan-efficientnet-b0/resolve/main/agroscan_efficientnet_b0.pth" -o "$APP_DIR/model/model.pth"
    curl -L "https://huggingface.co/tahmidalbi/agroscan-efficientnet-b0/resolve/main/labels.json" -o "$APP_DIR/model/labels.json"
fi

# 5. Setup Backend
echo "--> Setting up Backend..."
cd "$APP_DIR/backend"
if [ ! -f .env ]; then
    echo "--> Creating .env from defaults..."
    cp .env.example .env 2>/dev/null || cp "$APP_DIR/backend/.env" .env
fi
# Switch to real ML service mode
sed -i 's/ML_MODE=mock/ML_MODE=real/g' .env 2>/dev/null || true
npm install --omit=dev

# 6. Setup and Build Frontend
echo "--> Building Frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# 7. Configure Nginx
echo "--> Configuring Nginx..."
sudo mkdir -p /var/www/agricloud/frontend
sudo cp -r "$APP_DIR/frontend/dist" /var/www/agricloud/frontend/

# Copy Nginx config
sudo cp "$APP_DIR/aws/nginx.conf" /etc/nginx/sites-available/agricloud
sudo ln -sf /etc/nginx/sites-available/agricloud /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 8. Start Services with PM2
echo "--> Starting Python ML Inference Engine with PM2..."
cd "$APP_DIR/ml-service"
pm2 delete agricloud-ml 2>/dev/null || true
pm2 start "venv/bin/python run.py" --name "agricloud-ml"

echo "--> Starting Backend Server with PM2..."
cd "$APP_DIR/backend"
pm2 delete agricloud-backend 2>/dev/null || true
pm2 start server.js --name "agricloud-backend"
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

# 9. Print Completion & Public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://api.ipify.org || echo "YOUR-EC2-PUBLIC-IP")

echo ""
echo "=========================================================="
echo "  AgriCloud-ML Deployment Complete! "
echo "=========================================================="
echo "  Public URL:   http://$PUBLIC_IP"
echo "  Backend API:  http://$PUBLIC_IP/api/health"
echo "  ML Engine:    http://$PUBLIC_IP:8000/health"
echo ""
echo "  Manage Services:"
echo "    pm2 status"
echo "    pm2 logs agricloud-ml"
echo "    pm2 logs agricloud-backend"
echo "=========================================================="
