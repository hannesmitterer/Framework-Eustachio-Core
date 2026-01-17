# IPFS Integration FAQ

## General Questions

### What is IPFS?
IPFS (InterPlanetary File System) is a decentralized, peer-to-peer protocol for storing and sharing data. Instead of location-based addressing (like traditional URLs), IPFS uses content-based addressing where each piece of content gets a unique identifier called a CID (Content Identifier).

### Why does Eustachio Framework use IPFS?
The Eustachio Framework integrates IPFS to:
- **Decentralize data storage**: No single point of failure
- **Ensure data immutability**: Content can't be altered once stored
- **Enable censorship resistance**: Data is distributed across the network
- **Support the HVAR principle**: High-Value Asset Registry protection through distributed storage

### What is a CID?
A CID (Content IDentifier) is a unique hash that identifies content on IPFS. It's generated based on the content itself, so:
- The same content always produces the same CID
- Different content always produces different CIDs
- You can verify content integrity by checking its CID

Example CID: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`

## Setup and Configuration

### How do I set up IPFS locally?
1. **Install IPFS Desktop** (easiest option):
   - Download from: https://github.com/ipfs/ipfs-desktop/releases
   - Run the installer
   - Start IPFS Desktop - it will run a local node on port 5001

2. **Or install IPFS CLI**:
   ```bash
   # Linux/Mac
   wget https://dist.ipfs.io/go-ipfs/v0.20.0/go-ipfs_v0.20.0_linux-amd64.tar.gz
   tar -xvzf go-ipfs_v0.20.0_linux-amd64.tar.gz
   cd go-ipfs
   sudo ./install.sh
   
   # Start the daemon
   ipfs daemon
   ```

3. **Configure the application**:
   - For local IPFS node, the default settings work (localhost:5001)
   - For remote/public gateway, configure accordingly in `script.js`

### How do I use a remote IPFS gateway?
Edit the IPFS service initialization in `script.js`:
```javascript
ipfsService = new IPFSService({
    host: 'ipfs.io',
    port: 443,
    protocol: 'https',
    debugMode: false
});
```

### How do I enable debug mode?
Add `?debug=true` to the URL when loading the page:
```
http://localhost/index.html?debug=true
```

This will show detailed IPFS operation logs in the browser console.

## Usage

### How do I send a message to IPFS?
1. Type your message in the text area
2. Click "PUSH TO KERNEL (IPFS)"
3. The message will be:
   - Uploaded to IPFS (if connected)
   - Cached locally in IndexedDB
   - Displayed in the chat interface with its CID

### What happens if IPFS is unavailable?
The application includes fallback mechanisms:
1. **Local caching**: All messages are stored in IndexedDB
2. **Offline mode**: The app continues to work without IPFS
3. **Retry logic**: Automatic retry attempts with exponential backoff
4. **User notifications**: Clear feedback about connection status

### How do I retrieve content by CID?
Currently, the application automatically handles storage and retrieval. To manually retrieve:
```javascript
const data = await ipfsService.getData('YOUR_CID_HERE');
console.log(data);
```

## Troubleshooting

### Error: "IPFS node unreachable"
**Possible causes:**
- IPFS daemon is not running
- Firewall blocking port 5001
- Wrong host/port configuration

**Solutions:**
1. Check if IPFS daemon is running: `ipfs id`
2. Check firewall settings
3. Verify configuration in the code
4. Try using a public gateway (ipfs.io)

### Error: "IPFS HTTP Client library not loaded"
**Cause:** The CDN script for IPFS client failed to load.

**Solution:**
1. Check your internet connection
2. Verify the CDN URL in `index.html`
3. Check browser console for network errors
4. Try a different CDN mirror

### Connection timeout
**Cause:** Network latency or slow IPFS node response.

**Solution:**
1. Increase timeout in configuration:
   ```javascript
   timeout: 30000  // 30 seconds
   ```
2. Use a faster IPFS node
3. Check network connection

### Messages not persisting
**Cause:** IndexedDB may not be supported or blocked.

**Solution:**
1. Check browser compatibility (all modern browsers support IndexedDB)
2. Ensure cookies/storage are not blocked
3. Check browser privacy settings
4. Check console for errors

## Advanced Features

### Using Pinata for Persistence
Pinata is a pinning service that ensures your IPFS content remains available. To enable:

1. Sign up at https://pinata.cloud
2. Get API keys from dashboard
3. Configure in the service:
   ```javascript
   ipfsService = new IPFSService({
       usePinata: true,
       pinataApiKey: 'your_api_key',
       pinataSecretKey: 'your_secret_key'
   });
   ```

### Clearing Old Cache Entries
The cache service can clean up old entries:
```javascript
// Clear entries older than 30 days
await cacheService.clearOldEntries(30);
```

### Getting Cache Statistics
```javascript
const stats = await cacheService.getStats();
console.log('Cached data entries:', stats.dataEntries);
console.log('Cached messages:', stats.messages);
```

## Performance

### How much data can I store?
- **IPFS**: Virtually unlimited (distributed network)
- **IndexedDB**: Browser-dependent, typically 50MB+ (can be much larger)
- **Pinata Free Tier**: 1GB total storage

### How fast is IPFS?
Speed depends on:
- Network conditions
- Number of peers hosting the content
- Geographic distribution of peers
- Local node vs remote gateway

Typical operations:
- Add small file: 100-500ms
- Retrieve from local node: 50-200ms
- Retrieve from network: 500ms-5s

## Security

### Is my data encrypted?
- IPFS stores data unencrypted by default
- All content is public and can be accessed by anyone with the CID
- For private data, implement encryption before uploading
- Consider using IPFS Private Networks for sensitive data

### Can I delete content from IPFS?
- Content can be "unpinned" from your node
- Content may persist on other nodes if they pinned it
- IPFS is designed for persistence, not deletion
- Don't upload sensitive data you might need to delete later

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Opera (v76+)

### Required Features
- IndexedDB support
- ES6+ JavaScript
- Async/Await support
- Fetch API

## Further Resources

- IPFS Documentation: https://docs.ipfs.io
- IPFS Forums: https://discuss.ipfs.io
- Pinata Documentation: https://docs.pinata.cloud
- Eustachio Framework GitHub: https://github.com/hannesmitterer/Framework-Eustachio-Core
