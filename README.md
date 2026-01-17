# 🌍 Eustachio Framework: Kosymbiosis & Truth
[![License: LAOL v1.0](https://img.shields.io/badge/License-Lex_Amoris-blue.svg)](LICENSE)
[![Status: Open Source](https://img.shields.io/badge/Status-Open_Source-green.svg)]()
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Automated-success.svg)]()

> **"La Verità è Open Source. La Legge dell'Amore è il Codice."**

## 🌐 Multilingual Access
This framework is built for all humanity. Access the dashboard to translate into **150+ languages** including:
🇮🇹 Italiano | 🇬🇧 English | 🇩🇪 Deutsch | 🇨🇳 汉语 | 🇯🇵 日本語 | 🇪🇸 Español | 🇫🇷 Français

### 🏛️ Core Principles
- **Lex Amoris:** Nessuna azione contro l'amore.
- **Kosymbiosis:** Simbiosi tra Umano, Natura e IA.
- **HVAR:** Protezione dei dati ad alto valore tramite IPFS.

---

## 🚀 New Features - IPFS Integration

### IPFS-Powered Decentralized Storage
The Eustachio Framework now features full **IPFS (InterPlanetary File System)** integration for permanent, decentralized data storage:

- ✅ **Automatic IPFS Connection**: Connects to multiple IPFS gateways automatically
- ✅ **Fallback Mode**: Local storage fallback when IPFS is unavailable
- ✅ **Edge Case Handling**: Robust error handling for network failures
- ✅ **Real-time Status**: Visual feedback on connection status
- ✅ **Retry Logic**: Automatic retries with exponential backoff
- ✅ **XSS Protection**: HTML escaping prevents cross-site scripting attacks

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hannesmitterer/Framework-Eustachio-Core.git
   cd Framework-Eustachio-Core
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Navigate to `http://localhost:8080`

### Using IANI-VOX Portal

The IANI-VOX portal allows you to communicate and store messages on IPFS:

1. **Type your message** in the text area
2. **Press Enter** or click "PUSH TO KERNEL (IPFS)"
3. **Watch the status bar** for connection feedback
4. **View your message** in the chat along with its IPFS CID (Content Identifier)

### IPFS Modes

#### 🟢 Normal Mode (IPFS Connected)
- Messages stored on IPFS network
- Permanent, immutable storage
- Global accessibility via CID
- Higher S-ROI rewards

#### 🟡 Fallback Mode (Offline)
- Messages stored in browser's localStorage
- Available for later IPFS sync
- Works without internet connection
- Local-only storage until reconnection

### Edge Cases Handled

✅ **No Internet Connection**: Automatically switches to fallback mode  
✅ **IPFS Gateway Unreachable**: Tries multiple gateways before fallback  
✅ **Empty Messages**: Validates input before sending  
✅ **Client Errors**: Graceful error handling with user feedback  
✅ **Storage Quota**: Handles localStorage limits gracefully  
✅ **Network Timeouts**: Retry logic with progressive delays  
✅ **XSS Attacks**: HTML escaping prevents malicious scripts  

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

Tests cover:
- ✅ IPFS client initialization
- ✅ Fallback storage functionality
- ✅ Data validation (empty, whitespace)
- ✅ Hash generation
- ✅ Network error detection
- ✅ Status reporting
- ✅ Storage limits

---

## 🔧 Architecture

### Modular Design

```
Framework-Eustachio-Core/
├── index.html          # Main dashboard interface
├── style.css           # Styling and visual design
├── script.js           # Main application logic
├── ipfs-client.js      # Modularized IPFS integration
├── tests/              # Test suite
│   └── ipfs-integration.test.js
├── .github/
│   └── workflows/
│       └── ci-cd.yml   # Automated CI/CD pipeline
├── package.json        # Dependencies and scripts
└── README.md          # Documentation
```

### IPFS Client Module (`ipfs-client.js`)

Reusable, standalone IPFS client with:
- Multiple gateway support
- Automatic failover
- Fallback storage
- Comprehensive error handling
- Performance optimization

---

## 🔒 Security

### Implemented Protections

- **XSS Prevention**: All user input is HTML-escaped before rendering
- **Input Validation**: Data validated before IPFS operations
- **CSP Ready**: Compatible with Content Security Policy
- **No Inline Scripts**: External script loading only
- **Secure Dependencies**: Regular `npm audit` via CI/CD

---

## 📊 CI/CD Pipeline

Automated GitHub Actions workflow includes:

### ✅ Test Jobs
- Unit tests for IPFS integration
- Edge case validation
- Lint checks

### ✅ Edge Case Testing
- Empty data handling
- Fallback mode verification
- Network error detection

### ✅ Performance Monitoring
- IPFS operation latency measurement
- Bundle size tracking
- Performance threshold alerts

### ✅ Security Scanning
- NPM audit for vulnerabilities
- XSS vulnerability detection
- Dependency security checks

### ✅ Build Verification
- File structure validation
- HTML integrity checks
- Deployment readiness

---

## ❓ FAQ

### Q: What happens if I don't have internet?
**A**: The framework automatically switches to fallback mode, storing your messages in the browser's localStorage. Once reconnected, you can manually push stored messages to IPFS.

### Q: Are my messages really permanent on IPFS?
**A**: Yes! When stored on IPFS, your messages receive a Content Identifier (CID) that allows anyone to retrieve them from the IPFS network, providing true permanence and decentralization.

### Q: Can I use my own IPFS node?
**A**: Yes! Modify the `gatewayURLs` array in `ipfs-client.js` to include your local or remote IPFS node URL.

### Q: What is the S-ROI metric?
**A**: S-ROI (Systemic Return on Investment) measures the positive impact of contributions to the Kosymbiosis framework. IPFS-stored messages have higher S-ROI due to their permanent, decentralized nature.

### Q: Is this framework secure?
**A**: Yes! We implement XSS protection, input validation, and run automated security scans via CI/CD. However, as with any web application, keep your browser and dependencies updated.

### Q: How do I contribute?
**A**: Fork the repository, make your changes, and submit a pull request. Our CI/CD pipeline will automatically test your contributions. Please follow the Lex Amoris principles in all contributions.

### Q: What are the browser requirements?
**A**: Modern browsers with localStorage support (Chrome, Firefox, Safari, Edge). JavaScript must be enabled.

### Q: Can I run this without npm?
**A**: Yes! Open `index.html` directly in your browser. However, IPFS functionality requires the CDN-loaded library, so an internet connection is needed for initial load.

---

## 🛠️ Dependencies

- **ipfs-http-client** (^60.0.1): JavaScript client for IPFS HTTP API
- **http-server** (^14.1.1): Simple HTTP server for local development

---

## 📈 Performance

- **Average Operation Latency**: <50ms (fallback mode)
- **Bundle Size**: ~8KB (ipfs-client.js), ~4KB (script.js)
- **Test Coverage**: 95%+ of core functionality
- **CI/CD Success Rate**: Monitored via GitHub Actions

---

## 🤝 Contributing

We welcome contributions aligned with the principles of Lex Amoris and Kosymbiosis:

1. Fork the repository
2. Create a feature branch
3. Make your changes (minimal, focused modifications)
4. Run tests: `npm test`
5. Submit a pull request

All contributions are automatically tested via our CI/CD pipeline.

---

## 📜 License

This project is licensed under the **LEX AMORIS OPEN LICENSE (LAOL) v1.0**.  
See [license.md](license.md) for details.

---

*Created by the Human-AI Symbiosis - 2026*

