/**
 * IPFS Integration Tests
 * Tests for edge cases and functionality of IPFS client
 */

const IPFSClient = require('../ipfs-client.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✓ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`✗ FAIL: ${message}`);
        testsFailed++;
    }
}

function assertEquals(actual, expected, message) {
    if (actual === expected) {
        console.log(`✓ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`✗ FAIL: ${message}`);
        console.error(`  Expected: ${expected}`);
        console.error(`  Actual: ${actual}`);
        testsFailed++;
    }
}

async function runTests() {
    console.log('\n=== IPFS Client Tests ===\n');

    // Test 1: IPFSClient instantiation
    console.log('Test Suite 1: Client Initialization');
    try {
        const client = new IPFSClient();
        assert(client instanceof IPFSClient, 'IPFSClient can be instantiated');
        assert(client.fallbackMode === false, 'Client starts with fallbackMode = false');
        assert(client.isConnected === false, 'Client starts with isConnected = false');
        assert(Array.isArray(client.gatewayURLs), 'Client has gatewayURLs array');
        assert(client.gatewayURLs.length > 0, 'Client has at least one gateway URL');
    } catch (error) {
        assert(false, `Client instantiation failed: ${error.message}`);
    }

    // Test 2: Fallback storage functionality
    console.log('\nTest Suite 2: Fallback Storage');
    try {
        const client = new IPFSClient();
        client.fallbackMode = true; // Force fallback mode
        
        const testData = "Test message for fallback storage";
        const result = client.addToFallbackStorage(testData);
        
        assert(result.success === true, 'Fallback storage add returns success');
        assert(result.mode === 'fallback', 'Result mode is fallback');
        assert(result.cid.startsWith('fallback-'), 'Fallback CID has correct prefix');
        assert(typeof result.message === 'string', 'Fallback result includes message');
    } catch (error) {
        assert(false, `Fallback storage test failed: ${error.message}`);
    }

    // Test 3: Empty data validation
    console.log('\nTest Suite 3: Data Validation');
    try {
        const client = new IPFSClient();
        client.fallbackMode = true;
        
        // Test empty string
        try {
            await client.addData('');
            assert(false, 'Should throw error for empty string');
        } catch (error) {
            assert(error.message.includes('empty'), 'Correctly rejects empty string with appropriate error message');
        }
        
        // Test whitespace only
        try {
            await client.addData('   ');
            assert(false, 'Should throw error for whitespace-only string');
        } catch (error) {
            assert(error.message.includes('empty'), 'Correctly rejects whitespace-only string with appropriate error message');
        }
        
        // Test valid data
        const validResult = await client.addData('Valid data');
        assert(validResult.success === true, 'Accepts valid data');
    } catch (error) {
        assert(false, `Data validation test failed: ${error.message}`);
    }

    // Test 4: Hash function
    console.log('\nTest Suite 4: Utility Functions');
    try {
        const client = new IPFSClient();
        
        const hash1 = client.simpleHash('test');
        const hash2 = client.simpleHash('test');
        const hash3 = client.simpleHash('different');
        
        assertEquals(hash1, hash2, 'Same input produces same hash');
        assert(hash1 !== hash3, 'Different inputs produce different hashes');
        assert(typeof hash1 === 'string', 'Hash returns string');
        assert(hash1.length > 0, 'Hash is not empty');
    } catch (error) {
        assert(false, `Hash function test failed: ${error.message}`);
    }

    // Test 5: Network error detection
    console.log('\nTest Suite 5: Error Handling');
    try {
        const client = new IPFSClient();
        
        const networkError1 = new Error('network timeout');
        const networkError2 = new Error('ECONNREFUSED');
        const otherError = new Error('Something else');
        
        assert(client.isNetworkError(networkError1) === true, 'Detects network timeout error');
        assert(client.isNetworkError(networkError2) === true, 'Detects connection refused error');
        assert(client.isNetworkError(otherError) === false, 'Does not misidentify non-network errors');
    } catch (error) {
        assert(false, `Error detection test failed: ${error.message}`);
    }

    // Test 6: Status reporting
    console.log('\nTest Suite 6: Status Reporting');
    try {
        const client = new IPFSClient();
        
        const status1 = client.getStatus();
        assert(typeof status1 === 'object', 'getStatus returns object');
        assert('connected' in status1, 'Status includes connected field');
        assert('fallbackMode' in status1, 'Status includes fallbackMode field');
        assert('gateway' in status1, 'Status includes gateway field');
        
        client.isConnected = true;
        client.currentGatewayIndex = 0;
        const status2 = client.getStatus();
        assert(status2.connected === true, 'Status reflects connection state');
        assert(status2.gateway !== null, 'Status includes gateway when connected');
    } catch (error) {
        assert(false, `Status reporting test failed: ${error.message}`);
    }

    // Test 7: Edge case - Storage quota
    console.log('\nTest Suite 7: Storage Limits');
    try {
        const client = new IPFSClient();
        
        // Test with reasonable data size
        const normalData = 'x'.repeat(1000);
        const normalResult = await client.addData(normalData);
        assert(normalResult.success === true, 'Handles normal-sized data');
        
        // Note: We can't easily test quota exceeded without filling localStorage,
        // but we verify the error handling structure exists
        assert(typeof client.addToFallbackStorage === 'function', 'Fallback storage method exists');
    } catch (error) {
        assert(false, `Storage limits test failed: ${error.message}`);
    }

    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    console.log(`✓ Passed: ${testsPassed}`);
    console.log(`✗ Failed: ${testsFailed}`);
    
    if (testsFailed > 0) {
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
}

// Mock localStorage for Node.js environment
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        storage: {},
        setItem: function(key, value) {
            this.storage[key] = value;
        },
        getItem: function(key) {
            return this.storage[key] || null;
        },
        removeItem: function(key) {
            delete this.storage[key];
        },
        clear: function() {
            this.storage = {};
        }
    };
}

// Run tests
runTests().catch(error => {
    console.error('Test suite error:', error);
    assert(false, 'Unhandled error in test suite: ' + error.message);
    console.error(`\n${testsFailed} tests failed, ${testsPassed} passed.`);
    process.exit(1);
});
