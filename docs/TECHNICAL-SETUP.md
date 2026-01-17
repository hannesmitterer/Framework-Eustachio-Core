# IPFS Technical Setup Guide

## Architecture Overview

The Eustachio Framework IPFS integration consists of three main components:

1. **IPFS Service** (`src/ipfs-service.js`) - Handles IPFS connectivity and operations
2. **Cache Service** (`src/cache-service.js`) - Manages local IndexedDB storage
3. **Main Application** (`script.js`) - Coordinates between services and UI

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Main Script    │─────▶│ IPFS Service │
│   (script.js)   │      └──────┬───────┘
└────────┬────────┘             │
         │                      ▼
         │              ┌───────────────┐
         │              │  IPFS Network │
         │              └───────────────┘
         ▼
┌─────────────────┐
│ Cache Service   │
│  (IndexedDB)    │
└─────────────────┘
```

## Local vs Remote Configuration

### Local IPFS Node Setup

**Advantages:**
- Faster operations
- Full control over content
- Can pin content indefinitely
- Works offline once content is cached

**Configuration:**
```javascript
const ipfsService = new IPFSService({
    host: 'localhost',
    port: 5001,
    protocol: 'http',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 2000,
    debugMode: false
});
```

**Setup Steps:**
1. Install IPFS (see FAQ)
2. Start IPFS daemon: `ipfs daemon`
3. Verify: `ipfs id`
4. Configure CORS (if needed):
   ```bash
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
   ```

### Remote IPFS Gateway

**Advantages:**
- No local setup required
- Works immediately
- Good for development/testing

**Disadvantages:**
- Slower than local node
- Limited control over pinning
- Requires internet connection

**Configuration:**
```javascript
const ipfsService = new IPFSService({
    host: 'ipfs.io',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    retryAttempts: 3,
    retryDelay: 2000,
    debugMode: false
});
```

**Popular Gateways:**
- ipfs.io:443
- dweb.link:443
- cloudflare-ipfs.com:443

## Service Initialization Flow

```javascript
// 1. Create service instance
const ipfsService = new IPFSService(config);

// 2. Initialize connection
const initialized = await ipfsService.initialize();

// 3. Check status
const status = ipfsService.getStatus();
console.log('Connected:', status.connected);

// 4. Use service
if (status.connected) {
    const result = await ipfsService.addData('Hello IPFS');
    console.log('CID:', result.cid);
}
```

## Error Handling Strategy

The IPFS service implements a multi-layered error handling approach:

### 1. Connection Errors
- Caught during initialization
- Fallback to cache-only mode
- User notification displayed

### 2. Operation Errors
- Retry mechanism with exponential backoff
- Configurable retry attempts (default: 3)
- Detailed error logging in debug mode

### 3. Timeout Handling
- Configurable timeout per operation
- Graceful degradation to cache

### Example Error Handling:
```javascript
try {
    const result = await ipfsService.addData(content);
    console.log('Success:', result.cid);
} catch (error) {
    // Error is already logged by service
    // Fall back to local cache
    await cacheService.saveMessage(content, 'user');
    showNotification('Saved locally - IPFS unavailable', 'warning');
}
```

## IndexedDB Cache Structure

### Object Stores

#### 1. ipfs-data
Stores IPFS content for offline access:
```javascript
{
    cid: "QmXxx...",           // Primary key
    data: "content string",     // Actual data
    timestamp: 1234567890       // When cached
}
```

#### 2. messages
Stores chat messages:
```javascript
{
    id: 1,                      // Auto-increment primary key
    message: "user message",    // Message text
    type: "user|iani",         // Message type
    timestamp: 1234567890       // When sent
}
```

### Cache Operations

```javascript
// Initialize cache
const cache = new CacheService();
await cache.initialize();

// Save data
await cache.saveData(cid, content);

// Retrieve data
const content = await cache.getData(cid);

// Save message
await cache.saveMessage('Hello', 'user');

// Get recent messages
const messages = await cache.getRecentMessages(10);

// Cleanup old entries
await cache.clearOldEntries(30); // Older than 30 days

// Get statistics
const stats = await cache.getStats();
```

## Pinata Integration

Pinata provides persistent pinning for IPFS content.

### Configuration
```javascript
const ipfsService = new IPFSService({
    // ... other config
    usePinata: true,
    pinataApiKey: 'your_api_key_here',
    pinataSecretKey: 'your_secret_key_here'
});
```

### Workflow
1. Content is added to IPFS
2. CID is generated
3. Automatically pinned to Pinata (if configured)
4. Content persists even if local node goes offline

### API Key Setup
1. Visit https://pinata.cloud
2. Sign up for free account
3. Navigate to API Keys
4. Create new key with pinning permissions
5. Copy API Key and Secret Key
6. Add to configuration

## Debug Mode

Enable comprehensive logging:

```javascript
// Via configuration
const ipfsService = new IPFSService({
    debugMode: true
});

// Via URL parameter
// Load page with: index.html?debug=true
```

### Debug Output Examples:
```
[IPFS Service] Initializing with config: {...}
[IPFS Service] Connected to node: QmXxx...
[IPFS Service] Adding data (attempt 1/3)
[IPFS Service] Data added successfully. CID: QmYxx...
[Cache Service] IndexedDB initialized
[Cache Service] Data saved to cache: QmYxx...
[App] IPFS service initialized
```

## Testing Strategy

### Unit Tests
Located in `tests/ipfs-test.js`:
- Service instantiation
- Configuration validation
- Error handling
- Retry mechanism
- Helper functions

### Running Tests
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run with debug output
DEBUG=* npm test
```

### Integration Testing
Test the full flow:
1. Open `index.html` with `?debug=true`
2. Open browser console
3. Send a test message
4. Verify IPFS operations in console
5. Check IndexedDB in DevTools → Application → IndexedDB

## Performance Optimization

### Best Practices

1. **Use Local Node for Production**
   - Much faster than remote gateways
   - Better reliability
   - Full control

2. **Implement Caching**
   - Always cache IPFS content locally
   - Reduces network requests
   - Enables offline functionality

3. **Optimize Retry Strategy**
   ```javascript
   retryAttempts: 3,
   retryDelay: 2000  // 2 seconds
   ```

4. **Set Appropriate Timeouts**
   ```javascript
   timeout: 10000  // Local: 10s
   timeout: 30000  // Remote: 30s
   ```

5. **Monitor Performance**
   ```javascript
   const start = Date.now();
   await ipfsService.addData(content);
   console.log(`Operation took ${Date.now() - start}ms`);
   ```

## Security Considerations

### Content Security
- All IPFS content is public by default
- CIDs are deterministic - same content = same CID
- Don't store sensitive data without encryption

### API Key Security
- Never commit API keys to version control
- Use environment variables in production
- Rotate keys periodically

### CORS Configuration
Local IPFS nodes need CORS configured:
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:8080"]'
```

Replace `http://localhost:8080` with your actual domain.

## Deployment Checklist

- [ ] Install and configure IPFS node (or use gateway)
- [ ] Set up CORS if using local node
- [ ] Configure Pinata (optional but recommended)
- [ ] Test IPFS connectivity
- [ ] Verify IndexedDB works in target browsers
- [ ] Configure appropriate timeouts
- [ ] Set up monitoring/logging
- [ ] Test offline functionality
- [ ] Configure CSP headers if needed
- [ ] Test on target browsers
- [ ] Set up CI/CD pipeline

## Troubleshooting Commands

```bash
# Check IPFS daemon status
ipfs id

# List pinned content
ipfs pin ls

# Check connection to peers
ipfs swarm peers

# Get IPFS config
ipfs config show

# Test adding content
echo "test" | ipfs add

# Get content by CID
ipfs cat <CID>

# Check IPFS version
ipfs version
```

## Further Reading

- [IPFS Concepts](https://docs.ipfs.io/concepts/)
- [IPFS HTTP Client API](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Pinata Documentation](https://docs.pinata.cloud/)
