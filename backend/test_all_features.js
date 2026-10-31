// backend/test_all_features.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function runAllTests() {
  console.log('=== Running End-to-End MaaCare Feature Verification Suite ===\n');
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
    // 1. Health Check
    const health = await axios.get(`${BASE_URL}/`);
    assert('1. Health check endpoint (200, healthy)', health.status === 200 && health.data.status === 'healthy');

    // 2. Education Module (EN & MR)
    const eduEn = await axios.get(`${BASE_URL}/api/education?lang=en`);
    assert('2. Education API returns English guide & danger signs', eduEn.status === 200 && eduEn.data.emergencyCare.dangerSigns.length > 0);

    const eduMr = await axios.get(`${BASE_URL}/api/education?lang=mr`);
    assert('3. Education API returns Marathi guide & danger signs', eduMr.status === 200 && eduMr.data.emergencyCare.headline.includes('आपत्कालीन'));

    const eduT2 = await axios.get(`${BASE_URL}/api/education?trimester=2`);
    assert('4. Education API filters by trimester (Trimester 2)', eduT2.status === 200 && eduT2.data.trimesterGuidance[0].trimester === 2);

    // 3. Admin Authentication
    const adminRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@maacare.org',
      password: 'adminpassword123',
    });
    const adminToken = adminRes.data.token;
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };
    assert('5. Admin login authenticated', adminRes.status === 200 && adminRes.data.role === 'admin');

    // 4. Admin Analytics Stats with trends
    const statsRes = await axios.get(`${BASE_URL}/api/admin/stats`, adminHeaders);
    assert('6. Admin stats returns trends & trimester distribution',
      statsRes.status === 200 &&
      Array.isArray(statsRes.data.trends) &&
      statsRes.data.trimesterDistribution !== undefined &&
      Array.isArray(statsRes.data.workload)
    );

    // 5. Admin CSV Exports
    const exportWomen = await axios.get(`${BASE_URL}/api/admin/export/women`, adminHeaders);
    assert('7. CSV export of enrolled women succeeds', exportWomen.status === 200 && exportWomen.data.includes('Gestation Week'));

    const exportCheckups = await axios.get(`${BASE_URL}/api/admin/export/checkups`, adminHeaders);
    assert('8. CSV export of checkups succeeds', exportCheckups.status === 200 && exportCheckups.data.includes('Blood Pressure'));

    // 6. Admin Broadcast Announcement
    const broadcastRes = await axios.post(`${BASE_URL}/api/notifications/broadcast`, {
      title: 'National Nutrition Month Announcement',
      message: 'All pregnant mothers are encouraged to collect IFA and Calcium supplements from their local health center.',
      targetRole: 'all',
    }, adminHeaders);
    assert('9. Admin broadcast announcement created', broadcastRes.status === 201 && broadcastRes.data.dispatchedCount >= 0);

    // 7. Create Health Worker
    const workerEmail = `sister.asha_${Date.now()}@maacare.org`;
    const newWorker = await axios.post(`${BASE_URL}/api/admin/workers`, {
      name: 'Sister Asha Worker',
      email: workerEmail,
      phone: '9822012345',
      password: 'workerpassword123',
    }, adminHeaders);
    assert('10. Worker creation succeeds', newWorker.status === 201 && newWorker.data.role === 'worker');

    // Worker Login
    const workerLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: workerEmail,
      password: 'workerpassword123',
    });
    const workerToken = workerLogin.data.token;
    const workerHeaders = { headers: { Authorization: `Bearer ${workerToken}` } };

    // 8. Register Expectant Mother
    const motherEmail = `mother_${Date.now()}@example.com`;
    const newMother = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Pooja Jadhav',
      email: motherEmail,
      phone: '9833012345',
      password: 'motherpassword123',
    });
    assert('11. Mother registration succeeds', newMother.status === 201 && newMother.data.role === 'woman');
    const motherToken = newMother.data.token;
    const motherHeaders = { headers: { Authorization: `Bearer ${motherToken}` } };

    // 9. Admin creates pregnancy clinical profile for mother
    const edd = new Date();
    edd.setDate(edd.getDate() + 120);
    const lmp = new Date();
    lmp.setDate(lmp.getDate() - 160);

    const womanProfile = await axios.post(`${BASE_URL}/api/admin/women`, {
      userId: newMother.data._id,
      age: 26,
      phone: '9833012345',
      address: 'Shivaji Nagar, Pune',
      pregnancyWeek: 23,
      expectedDeliveryDate: edd,
      lastMenstrualPeriod: lmp,
      bloodGroup: 'O+',
      assignedWorker: newWorker.data._id,
    }, adminHeaders);
    assert('12. Clinical profile created with LMP and assigned worker', womanProfile.status === 201 && womanProfile.data.assignedWorker !== null);

    // 10. Worker schedules Antenatal checkup with digital health records (BP, weight, supplements, prescriptions)
    const checkupDate = new Date();
    checkupDate.setDate(checkupDate.getDate() + 7);

    const checkupRes = await axios.post(`${BASE_URL}/api/worker/checkups`, {
      womanId: womanProfile.data._id,
      date: checkupDate,
      time: '10:30 AM',
      type: 'Routine Antenatal Care',
      bloodPressure: '118/76',
      weight: 58.5,
      hemoglobin: 11.4,
      bloodSugar: '90 mg/dL Fasting',
      fetalHeartRate: 142,
      fundalHeight: 22,
      supplements: [
        { name: 'Iron & Folic Acid (IFA)', dosage: '1 tablet', frequency: 'Once daily (morning)', instructions: 'With water/lemonade' },
        { name: 'Calcium + Vit D3', dosage: '500 mg', frequency: 'Once daily (evening)', instructions: 'After dinner' },
      ],
      prescriptions: [
        { medicineName: 'Paracetamol 500mg', dosage: 'SOS (as needed for mild fever)', instructions: 'Max 2 tabs/day if required' },
      ],
      dangerSigns: [],
      notes: 'Gestation progressing normally. Mother counseled on kick counts and balanced diet.',
      status: 'Upcoming',
    }, workerHeaders);
    assert('13. Worker schedules checkup with digital health records', checkupRes.status === 201 && checkupRes.data.supplements.length === 2);

    // 11. Duplicate checkup booking prevention test
    try {
      await axios.post(`${BASE_URL}/api/worker/checkups`, {
        womanId: womanProfile.data._id,
        date: checkupDate,
        time: '11:00 AM',
        type: 'Routine Antenatal Care',
      }, workerHeaders);
      assert('14. Duplicate booking rejected with 400', false, 'Expected 400 error');
    } catch (dupErr) {
      assert('14. Duplicate booking rejected with 400', dupErr.response?.status === 400);
    }

    // 12. Mother Notification Verification
    const notifs = await axios.get(`${BASE_URL}/api/notifications`, motherHeaders);
    assert('15. Mother received appointment notification', notifs.status === 200 && notifs.data.notifications.length > 0);

    const unreadCount = await axios.get(`${BASE_URL}/api/notifications/unread-count`, motherHeaders);
    assert('16. Unread notification count is accurate', unreadCount.status === 200 && unreadCount.data.unreadCount >= 1);

    // 13. Mark all notifications as read
    const markReadRes = await axios.patch(`${BASE_URL}/api/notifications/mark-all-read`, {}, motherHeaders);
    assert('17. Mark all notifications as read succeeds', markReadRes.status === 200);

    const unreadCountAfter = await axios.get(`${BASE_URL}/api/notifications/unread-count`, motherHeaders);
    assert('18. Unread notification count is now 0', unreadCountAfter.data.unreadCount === 0);

    // 14. Mother Profile & Digital Health Record retrieval
    const motherProfile = await axios.get(`${BASE_URL}/api/woman/profile`, motherHeaders);
    assert('19. Mother can view her pregnancy record, checkups & next appointment',
      motherProfile.status === 200 &&
      motherProfile.data.pregnancyDetails.name === 'Pooja Jadhav' &&
      motherProfile.data.checkups.length === 1 &&
      motherProfile.data.nextAppointment !== null
    );

    // 15. Security Isolation: Mother cannot view other mother records or admin endpoints
    try {
      await axios.get(`${BASE_URL}/api/admin/women`, motherHeaders);
      assert('20. Security: Mother cannot access /api/admin/women (403)', false, 'Expected 403');
    } catch (secErr) {
      assert('20. Security: Mother cannot access /api/admin/women (403)', secErr.response?.status === 403);
    }

    console.log(`\n======================================================`);
    console.log(`ALL 20 VERIFICATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  }
}

runAllTests();
