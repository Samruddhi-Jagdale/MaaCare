// backend/scratch/testLoginAxios.js
const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'testuser2@example.com',
      password: 'Password123'
    });
    console.log('Login response:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
})();
