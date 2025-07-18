# 🚀 Windows Git Setup - Step by Step Fix

## The Problem
You ran `git init` in the wrong directory (`C:\Users\rflet` instead of your project folder).

## The Solution

### Step 1: Navigate to Your Project Folder
```powershell
# Navigate to where your project files are
cd "C:\Users\rflet\Downloads\Cad-monitor"

# OR if it's somewhere else, find it first:
# dir /s package.json
```

### Step 2: Initialize Git in the RIGHT Place
```powershell
# Make sure you're in the project folder (should see package.json, src folder, etc.)
dir

# Initialize git here
git init

# Add all your project files
git add .

# Create your first commit
git commit -m "Initial commit - Winnipeg CAD Monitor"
```

### Step 3: Connect to GitHub
```powershell
# Connect to your GitHub repo
git remote add origin https://github.com/rfletch52/cad-monitor.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## 🔍 Quick Check
Before running git commands, make sure you see these files:
- `package.json`
- `src/` folder
- `index.html`
- `.github/` folder

If you don't see these, you're in the wrong directory!

## 🆘 If You're Still Lost

### Find Your Project:
```powershell
# Search for your project files
dir /s package.json

# This will show you where package.json is located
# Navigate there with: cd "path\to\your\project"
```

### Clean Start:
```powershell
# Remove the wrong git repo
cd C:\Users\rflet
rmdir /s .git

# Go to correct project folder
cd "path\to\your\actual\project"

# Start over
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/rfletch52/cad-monitor.git
git branch -M main
git push -u origin main
```

## ✅ Success Looks Like:
After pushing, you should see:
- All your files appear on GitHub.com
- GitHub Actions start building automatically
- iOS and Android builds begin in the "Actions" tab

The key is being in the **correct project directory** before running git commands!