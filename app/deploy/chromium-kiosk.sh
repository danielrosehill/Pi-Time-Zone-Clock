#!/bin/bash
# Launch Chromium in kiosk mode for the Pi Clock dashboard
# Add this to your desktop autostart or ~/.config/lxsession/LXDE-pi/autostart

CLOCK_URL="${CLOCK_URL:-http://localhost:3000}"

# Wait for the server to be ready
sleep 5

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide the mouse cursor
unclutter -idle 0 &

# Launch Chromium in kiosk mode
chromium-browser \
  --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --incognito \
  --disable-translate \
  --disable-features=TranslateUI \
  --overscroll-history-navigation=0 \
  "$CLOCK_URL"
