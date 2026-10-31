// backend/test_phase2_security.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function runTests() {
  console.log('=== Starting Phase 2 Security & Authorization Tests ===\n');
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extraInfo = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // Test 1: Health check endpoint
    const health = await axios.get(`${BASE_URL}/`);
    assert('1. Health check returns 200 with status healthy', health.status === 200 && health.data.status === 'healthy');

    // Test 2: Input validation - bad email registration
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Invalid User',
        email: 'invalid-email-format',
        password: 'password123',
      });
      assert('2. Invalid email rejected with 400', false, 'Expected 400 error but request succeeded');
    } catch (err) {
      assert('2. Invalid email rejected with 400', err.response?.status === 400);
    }

    // Test 3: Input validation - short password
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Short Pass',
        email: `valid${Date.now()}@example.com`,
        password: '123',
      });
      assert('3. Short password (<6 chars) rejected with 400', false, 'Expected 400 error but request succeeded');
    } catch (err) {
      assert('3. Short password (<6 chars) rejected with 400', err.response?.status === 400);
    }

    // Test 4: Successful registration with valid data
    const testWomanEmail = `testwoman_${Date.now()}@test.org`;
    const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test Woman Security',
      email: testWomanEmail,
      phone: '9876543210',
      password: 'password123',
    });
    assert('4. Valid registration succeeds with 201', regRes.status === 201 && regRes.data.token && regRes.data.role === 'woman');
    const womanToken = regRes.data.token;

    // Test 5: Successful login with valid credentials
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testWomanEmail,
      password: 'password123',
    });
    assert('5. Valid login succeeds with 200 and JWT token', loginRes.status === 200 && loginRes.data.token);

    // Test 6: Role Authorization - Pregnant Woman accessing Admin endpoint
    try {
      await axios.get(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${womanToken}` },
      });
      assert('6. Pregnant Woman cannot access /api/admin/stats (403)', false, 'Expected 403');
    } catch (err) {
      assert('6. Pregnant Woman cannot access /api/admin/stats (403)', err.response?.status === 403);
    }

    // Test 7: Unauthenticated request to protected endpoint
    try {
      await axios.get(`${BASE_URL}/api/admin/stats`);
      assert('7. Unauthenticated request to protected endpoint returns 401', false, 'Expected 401');
    } catch (err) {
      assert('7. Unauthenticated request to protected endpoint returns 401', err.response?.status === 401);
    }

    // Test 8: Admin login & access
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@maacare.org',
      password: 'adminpassword123',
    });
    assert('8. Admin login succeeds', adminLogin.status === 200 && adminLogin.data.role === 'admin');
    const adminToken = adminLogin.data.token;

    // Test 9: Admin can access /api/admin/stats
    const statsRes = await axios.get(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert('9. Admin can access /api/admin/stats (200)', statsRes.status === 200 && statsRes.data.totalWomen !== undefined);

    console.log(`\n=== Tests Complete: ${passed} Passed, ${failed} Failed ===`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Unexpected test runner error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

runTests();
