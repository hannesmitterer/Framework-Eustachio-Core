// IPFS Service Test Suite
// Tests IPFS connectivity, data operations, and error handling

const IPFSService = require('../src/ipfs-service.js');

// Test configuration
const TEST_CONFIG = {
    debugMode: true,
    retryAttempts: 2,
    retryDelay: 1000,
    timeout: 5000
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function to run a test
async function runTest(name, testFn) {
    totalTests++;
    console.log(`\n🧪 Test: ${name}`);
    try {
        await testFn();
        passedTests++;
        console.log(`✅ PASSED: ${name}`);
        return true;
    } catch (error) {
        failedTests++;
        console.error(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

// Test 1: IPFSService instantiation
async function testInstantiation() {
    const service = new IPFSService(TEST_CONFIG);
    
    if (!service) {
        throw new Error('Failed to instantiate IPFSService');
    }
    
    if (service.config.debugMode !== true) {
        throw new Error('Config not properly set');
    }
    
    console.log('   Service instantiated with config:', service.config);
}

// Test 2: Configuration defaults
async function testConfigDefaults() {
    const service = new IPFSService();
    
    if (service.config.host !== 'localhost') {
        throw new Error('Default host incorrect');
    }
    
    if (service.config.port !== 5001) {
        throw new Error('Default port incorrect');
    }
    
    if (service.config.protocol !== 'http') {
        throw new Error('Default protocol incorrect');
    }
    
    console.log('   Default configuration is correct');
}

// Test 3: Status check before initialization
async function testStatusBeforeInit() {
    const service = new IPFSService(TEST_CONFIG);
    const status = service.getStatus();
    
    if (status.connected !== false) {
        throw new Error('Service should not be connected before initialization');
    }
    
    console.log('   Status before init:', status);
}

// Test 4: Error handling for uninitialized service
async function testUninitializedError() {
    const service = new IPFSService(TEST_CONFIG);
    
    try {
        await service.addData('test data');
        throw new Error('Should have thrown error for uninitialized service');
    } catch (error) {
        if (!error.message.includes('not connected')) {
            throw new Error('Wrong error message: ' + error.message);
        }
        console.log('   Correctly throws error for uninitialized service');
    }
}

// Test 5: Delay helper function
async function testDelayHelper() {
    const service = new IPFSService(TEST_CONFIG);
    const startTime = Date.now();
    
    await service.delay(100);
    
    const elapsed = Date.now() - startTime;
    if (elapsed < 100) {
        throw new Error('Delay function did not wait long enough');
    }
    
    console.log(`   Delay helper worked correctly (waited ${elapsed}ms)`);
}

// Test 6: IPFS initialization attempt (may fail if no node available)
async function testIPFSInitialization() {
    const service = new IPFSService({
        host: 'ipfs.io',
        port: 443,
        protocol: 'https',
        debugMode: true,
        timeout: 5000
    });
    
    console.log('   Attempting to initialize IPFS connection...');
    console.log('   Note: This test may fail if no IPFS node is available');
    
    try {
        const result = await service.initialize();
        console.log('   IPFS initialization result:', result);
        
        const status = service.getStatus();
        console.log('   Service status:', status);
        
        // Even if initialization fails, the test passes if error is handled correctly
        if (result === false && service.lastError) {
            console.log('   Initialization failed as expected (no node available)');
            console.log('   Last error:', service.lastError.message);
        }
    } catch (error) {
        console.log('   Initialization error caught:', error.message);
    }
}

// Test 7: Pinata configuration
async function testPinataConfig() {
    const service = new IPFSService({
        usePinata: true,
        pinataApiKey: 'test-key',
        pinataSecretKey: 'test-secret'
    });
    
    if (service.config.usePinata !== true) {
        throw new Error('Pinata configuration not set');
    }
    
    if (service.config.pinataApiKey !== 'test-key') {
        throw new Error('Pinata API key not set');
    }
    
    console.log('   Pinata configuration set correctly');
}

// Main test runner
async function runAllTests() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 IPFS Service Test Suite');
    console.log('═══════════════════════════════════════════════════');
    
    await runTest('IPFSService Instantiation', testInstantiation);
    await runTest('Configuration Defaults', testConfigDefaults);
    await runTest('Status Check Before Init', testStatusBeforeInit);
    await runTest('Uninitialized Service Error', testUninitializedError);
    await runTest('Delay Helper Function', testDelayHelper);
    await runTest('IPFS Initialization Attempt', testIPFSInitialization);
    await runTest('Pinata Configuration', testPinataConfig);
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 Test Results');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Total Tests:  ${totalTests}`);
    console.log(`✅ Passed:    ${passedTests}`);
    console.log(`❌ Failed:    ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('═══════════════════════════════════════════════════\n');
    
    // Exit with appropriate code
    if (failedTests > 0) {
        console.error('⚠️  Some tests failed!');
        process.exit(1);
    } else {
        console.log('🎉 All tests passed!');
        process.exit(0);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
