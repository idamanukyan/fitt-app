# API Configuration Guide

## Current Configuration

The API base URL is set in `/mobile/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## Configuration for Different Environments

### iOS Simulator
```typescript
const API_BASE_URL = 'http://localhost:8000';
```
✅ Current configuration works

### Android Emulator
```typescript
const API_BASE_URL = 'http://10.0.2.2:8000';
```
❌ Need to change for Android testing

### Physical Device (iPhone/Android)
```typescript
const API_BASE_URL = 'http://YOUR_MACHINE_IP:8000';
```
❌ Need to use your computer's local IP address

## How to Find Your Machine's IP Address

### On macOS:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### On Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### On Linux:
```bash
hostname -I
```

## Quick Update Guide

1. Open `/mobile/services/api.ts`
2. Find line: `const API_BASE_URL = 'http://localhost:8000';`
3. Update based on your testing environment
4. Save and restart the Metro bundler

## Example for Physical Device Testing

If your machine's IP is `192.168.1.100`:

```typescript
const API_BASE_URL = 'http://192.168.1.100:8000';
```

**Important:** Ensure your phone and computer are on the same WiFi network!

## Backend CORS Configuration

The backend needs to allow requests from your device IP. Check `/backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Currently allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This is already configured to accept requests from any origin during development.
