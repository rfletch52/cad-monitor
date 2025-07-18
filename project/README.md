# Winnipeg CAD Monitor - Live Emergency System

A comprehensive emergency incident monitoring system that displays real-time Winnipeg CAD data with an intuitive interface.

## 🚨 Features

### Core Monitoring
- **Real-time CAD Data** - Live updates from Winnipeg's official dispatch system
- **Mobile Responsive** - Works on desktop, tablet, and mobile
- **Dark Mode** - Perfect for night monitoring
- **Incident Filtering** - Filter by priority, status, or type
- **Live Statistics** - Real-time incident counts and metrics
- **Unit Tracking** - Monitor unit assignments and status changes

## 🏗️ Architecture

### Frontend
- **React + TypeScript** - Modern web application
- **Tailwind CSS** - Beautiful, responsive design
- **Vite** - Fast development and building

### Data Sources
- **Winnipeg CAD API** - Official city dispatch data
- **Local Storage** - Settings and preferences

## 🚀 Quick Start

### Web Version (Immediate)
```bash
npm install
npm run dev
```

### Native Mobile Apps (Emergency Audio)

#### Automatic Cloud Builds
- **Push to GitHub** - iOS and Android apps build automatically
- **Download from Actions tab** - Get .ipa and .apk files
- **Install on devices** - Real emergency audio that bypasses silent mode

#### Manual Setup
### Prerequisites
```bash
# Install Node.js 16+
```

### Development
```bash
# Start the web application
npm install
npm run dev
```

### Network Access (for mobile)
```bash
npm run dev:network
```

### Mobile App Distribution

#### iOS (TestFlight)
1. **Apple Developer Account** ($99/year)
2. **Upload .ipa to App Store Connect**
3. **Add beta testers**
4. **Install via TestFlight app**

#### Android (Direct Install)
1. **Download .apk from GitHub Actions**
2. **Enable "Unknown Sources"**
3. **Install directly on device**

## ⚙️ Configuration

### Required Setup
No additional setup required - the application connects directly to Winnipeg's public CAD data.

### Environment Variables
No environment variables required - all configuration via UI.

## 📊 Data Flow

1. **CAD Polling** → Official incident data from data.winnipeg.ca
2. **Real-time Processing** → Unit tracking and status updates
3. **Live UI Updates** → Real-time dashboard updates

## 🔒 Security & Privacy

### Data Privacy
- **Public Data Only** - Uses only publicly available CAD data
- **No Personal Information** - No sensitive data collected or stored
- **Local Storage** - Settings stored in browser only

## 🚀 Deployment

### Local Network
```bash
npm run build
npm run preview
```

### Production Build
```bash
npm run build
# Serve dist/ folder with any web server
```

## 📱 Mobile Features

- **Touch Optimized** - Mobile-friendly interface
- **Network Access** - Connect from any device on network
- **Responsive Design** - Adapts to all screen sizes
- **Dark Mode** - Great for night monitoring

## 🔧 Troubleshooting

### Data Issues
- Winnipeg CAD API may have rate limits
- Check network connectivity to data.winnipeg.ca
- System will retry failed requests automatically

## 🤝 Contributing

This is a comprehensive emergency monitoring system. Contributions welcome for:
- Enhanced filtering and search features
- Additional data visualization
- Mobile app development
- Performance optimizations

## 📄 License

MIT License - Feel free to use, modify, and share.

## ⚠️ Disclaimer

This system is for informational purposes only and should not be used as a substitute for official emergency services. For emergencies, always call 911 directly.

## 🆘 Emergency

**For emergencies, always call 911 directly.**

This monitoring system is for situational awareness only.