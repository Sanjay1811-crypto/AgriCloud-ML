#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  AgriCloud-ML: Automated AWS EC2 Deployment Script"
echo "=========================================================="

# 1. Update and install system dependencies
echo "--> Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y curl git nginx build-essential

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

# 4. Setup Backend
echo "--> Setting up Backend..."
cd "$APP_DIR/backend"
if [ ! -f .env ]; then
    echo "--> Copying .env.example to .env..."
    cp .env.example .env
fi
npm install --omit=dev

# 5. Setup and Build Frontend
echo "--> Building Frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# 6. Configure Nginx
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

# 7. Start Backend with PM2
echo "--> Starting Backend with PM2..."
cd "$APP_DIR/backend"
pm2 delete agricloud-backend 2>/dev/null || true
pm2 start server.js --name "agricloud-backend"
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

# 8. Print Completion & Public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://api.ipify.org || echo "YOUR-EC2-PUBLIC-IP")

echo ""
echo "=========================================================="
echo "  AgriCloud-ML Deployment Complete! "
echo "=========================================================="
echo "  Public URL: http://$PUBLIC_IP"
echo "  Backend API: http://$PUBLIC_IP/api/health"
echo ""
echo "  Manage Backend:"
echo "    pm2 status"
echo "    pm2 logs agricloud-backend"
echo "    pm2 restart agricloud-backend"
echo "=========================================================="
