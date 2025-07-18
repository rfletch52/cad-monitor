# 🚀 GitHub Setup Guide - Build iOS/Android in the Cloud

Follow these steps to push your code to GitHub and trigger automatic iOS/Android builds.

## 📋 **Step 1: Create GitHub Repository**

1. **Go to GitHub.com** and sign in
2. **Click "New Repository"** (green button)
3. **Repository name**: `winnipeg-cad-monitor`
4. **Description**: `Live emergency incident monitoring for Winnipeg with native mobile apps`
5. **Set to Public** (required for free GitHub Actions)
6. **Don't initialize** with README, .gitignore, or license (we have them)
7. **Click "Create Repository"**

## 💻 **Step 2: Push Code from Your PC**

Open terminal/command prompt in your project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Winnipeg CAD Monitor with native mobile apps"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/winnipeg-cad-monitor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔧 **Step 3: GitHub Actions Will Start Automatically**

Once you push, GitHub Actions will automatically:

1. **Build iOS App** (runs on macOS runner)
2. **Build Android APK** (runs on Ubuntu runner)  
3. **Deploy Web Version** (to Netlify)

## 📱 **Step 4: Download Built Apps**

After 10-15 minutes:

1. **Go to your GitHub repository**
2. **Click "Actions" tab**
3. **Click on the latest workflow run**
4. **Download artifacts**:
   - `ios-app` - Contains .ipa file for iPhone
   - `android-debug-apk` - APK for Android testing
   - `android-release-apk` - Production Android APK

## 🚨 **Step 5: Install on Phones**

### **Android (Easy)**
1. **Send .apk file** to friends via email/messaging
2. **Enable "Install from Unknown Sources"** in Android settings
3. **Tap .apk file to install**
4. **Test emergency audio** - should work even in silent mode!

### **iOS (Requires Apple Developer Account)**
1. **Sign up for Apple Developer** ($99/year)
2. **Upload .ipa to App Store Connect**
3. **Add friends as beta testers**
4. **They install via TestFlight app**

## ⚡ **Quick Commands Reference**

```bash
# If you make changes later:
git add .
git commit -m "Update emergency audio features"
git push

# Check build status:
# Go to GitHub.com → Your Repo → Actions tab
```

## 🎯 **What You'll Get**

- ✅ **Real iOS app** with emergency audio bypass
- ✅ **Android APK** ready for immediate testing
- ✅ **Automatic builds** on every code change
- ✅ **No Mac required** - everything builds in the cloud
- ✅ **Easy distribution** to friends for testing

## 🆘 **Troubleshooting**

### **If Git Commands Fail:**
```bash
# Install Git if not installed
# Download from: https://git-scm.com/download/win

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### **If GitHub Actions Fail:**
- Check the Actions tab for error logs
- Most common issue: missing dependencies (automatically resolved)
- iOS builds may take 15-20 minutes (normal)

## 🚀 **Ready to Go!**

Once you push to GitHub, you'll have:
- **Automatic iOS builds** without owning a Mac
- **Android APKs** ready for testing
- **Emergency audio** that bypasses silent mode
- **Easy distribution** to friends

Your emergency monitoring app will be building in the cloud! 🚨☁️📱✅