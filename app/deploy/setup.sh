#!/bin/bash
set -euo pipefail

echo "=== Pi Time Zone Clock — Setup ==="

APP_DIR="/home/pi/Pi-Time-Zone-Clock/app"

# Check if Node.js is installed
if ! command -v node &>/dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node.js $(node -v)"

# Install unclutter for cursor hiding
if ! command -v unclutter &>/dev/null; then
  sudo apt-get install -y unclutter
fi

# Install dependencies
cd "$APP_DIR"
npm install --production

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo ">>> IMPORTANT: Edit $APP_DIR/.env and add your API keys <<<"
  echo ""
fi

# Create data directory
mkdir -p data

# Install systemd service
sudo cp deploy/pi-clock.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pi-clock
sudo systemctl start pi-clock

# Make kiosk script executable
chmod +x deploy/chromium-kiosk.sh

echo ""
echo "=== Setup complete ==="
echo "Clock server: http://localhost:3000"
echo "Settings:     http://localhost:3000/settings"
echo ""
echo "To start kiosk mode: ./deploy/chromium-kiosk.sh"
echo "To view logs: journalctl -u pi-clock -f"
