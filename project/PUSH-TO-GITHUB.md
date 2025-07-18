# 🚀 Complete GitHub Setup Guide - Step by Step

## Step 1: Create GitHub Repository (Do This First!)

1. **Open your web browser** and go to **GitHub.com**
2. **Sign in** to your GitHub account (or create one if you don't have it)
3. **Click the green "New" button** (top left, or the "+" icon → "New repository")
4. **Fill out the form**:
   - Repository name: `winnipeg-cad-monitor`
   - Description: `Live emergency incident monitoring for Winnipeg`
   - Make sure it's **Public** (required for free GitHub Actions)
   - **DO NOT check** "Add a README file"
   - **DO NOT check** "Add .gitignore" 
   - **DO NOT check** "Choose a license"
5. **Click "Create repository"**

## Step 2: Copy Your Repository URL

After creating the repository, GitHub will show you a page with commands. You'll see something like:

```
https://github.com/YOUR_USERNAME/winnipeg-cad-monitor.git
```

**Copy this URL** - you'll need it in the next step.

## Step 3: Run Commands in Terminal

Open your terminal/command prompt in your project folder and run these commands **one by one**:

### Command 1: Initialize Git (if not already done)
```bash
git init
```

### Command 2: Add all your files
```bash
git add .
```

### Command 3: Create your first commit
```bash
git commit -m "Initial commit - Winnipeg CAD Monitor with emergency features"
```

### Command 4: Connect to GitHub (replace YOUR_USERNAME with your actual GitHub username)
```bash
git remote add origin https://github.com/YOUR_USERNAME/winnipeg-cad-monitor.git
```

### Command 5: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## Step 4: Watch the Magic! ✨

Once you push:
1. **Go back to your GitHub repository page**
2. **Refresh the page** - you should see all your files
3. **Click the "Actions" tab** - builds will start automatically
4. **Wait 10-15 minutes** for iOS and Android builds to complete

## Step 5: Download Your Apps

After builds finish:
1. **Go to Actions tab**
2. **Click on the latest workflow run**
3. **Scroll down to "Artifacts"**
4. **Download**:
   - `ios-app` - Contains .ipa file for iPhone
   - `android-debug-apk` - APK file for Android testing

## 🆘 Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/winnipeg-cad-monitor.git
```

### If you get authentication errors:
- Make sure you're signed into GitHub
- You might need to use a Personal Access Token instead of password
- Or use GitHub Desktop app for easier authentication

### If git commands don't work:
- Make sure Git is installed: https://git-scm.com/download
- Restart your terminal after installing Git

## 🎯 What You'll Get

- **Real iOS app** that bypasses silent mode for emergency audio
- **Android APK** ready for immediate testing
- **Automatic builds** on every code change
- **Easy sharing** with friends for testing

The key is to **create the GitHub repository first**, then run the commands to push your code!