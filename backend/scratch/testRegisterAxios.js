// backend/scratch/testRegisterAxios.js
const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/register', {
      name: 'TestUser2',
      email: 'testuser2@example.com',
      password: 'Password123',
      role: 'woman',
    });
    console.log('Response data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();
