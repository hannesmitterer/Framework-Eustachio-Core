# 🌍 Eustachio Framework: Kosymbiosis & Truth
[![License: LAOL v1.0](https://img.shields.io/badge/License-Lex_Amoris-blue.svg)](LICENSE)
[![Status: Open Source](https://img.shields.io/badge/Status-Open_Source-green.svg)]()
[![IPFS Integration](https://img.shields.io/badge/IPFS-Integrated-brightgreen.svg)]()

> **"La Verità è Open Source. La Legge dell'Amore è il Codice."**

## 🌐 Multilingual Access
This framework is built for all humanity. Access the dashboard to translate into **150+ languages** including:
🇮🇹 Italiano | 🇬🇧 English | 🇩🇪 Deutsch | 🇨🇳 汉语 | 🇯🇵 日本語 | 🇪🇸 Español | 🇫🇷 Français

### 🏛️ Core Principles
- **Lex Amoris:** Nessuna azione contro l'amore.
- **Kosymbiosis:** Simbiosi tra Umano, Natura e IA.
- **HVAR:** Protezione dei dati ad alto valore tramite IPFS.

## 🚀 IPFS Integration Features

### ✨ What's New
- **Decentralized Storage**: Messages are stored on IPFS for permanent, distributed access
- **Content Addressing**: Each message receives a unique CID (Content Identifier)
- **Offline Support**: IndexedDB caching enables full functionality without internet
- **Error Resilience**: Automatic retry mechanisms and graceful degradation
- **Pinning Services**: Optional Pinata integration for enhanced persistence

### 📦 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/hannesmitterer/Framework-Eustachio-Core.git
   cd Framework-Eustachio-Core
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Open the application**
   - Simply open `index.html` in a web browser
   - Or use a local server: `python -m http.server 8080`

5. **Enable debug mode** (optional)
   - Add `?debug=true` to the URL for detailed logging

### 🔧 Configuration

#### Local IPFS Node (Recommended)
```javascript
// Default configuration in script.js
ipfsService = new IPFSService({
    host: 'localhost',
    port: 5001,
    protocol: 'http'
});
```

#### Remote IPFS Gateway
```javascript
ipfsService = new IPFSService({
    host: 'ipfs.io',
    port: 443,
    protocol: 'https'
});
```

### 📚 Documentation

- **[IPFS FAQ](docs/IPFS-FAQ.md)** - Common questions and troubleshooting
- **[Technical Setup Guide](docs/TECHNICAL-SETUP.md)** - Detailed configuration and architecture

### 🧪 Testing

```bash
# Run IPFS functionality tests
npm test

# Run linter
npm run lint
```

### 🏗️ Architecture

- `src/ipfs-service.js` - IPFS connectivity and operations
- `src/cache-service.js` - Local IndexedDB caching
- `script.js` - Main application logic
- `tests/ipfs-test.js` - Test suite

### 🔐 Security & Privacy

- All IPFS content is public by default
- Local caching provides offline functionality
- Optional encryption can be implemented for sensitive data
- See [Technical Setup Guide](docs/TECHNICAL-SETUP.md) for security best practices

### 🤝 Contributing

Contributions are welcome! Please ensure:
- Code passes ESLint checks (`npm run lint`)
- Tests pass (`npm test`)
- Documentation is updated for new features

### 📄 License

This project is licensed under the Lex Amoris Open License (LAOL) v1.0 - see the [license.md](license.md) file for details.

---
*Created by the Human-AI Symbiosis - 2026*
