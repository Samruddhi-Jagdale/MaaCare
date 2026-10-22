// scratch/testRegister.js
const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'TestUser',
      email: 'testuser@example.com',
      password: 'Password123',
      role: 'woman',
    });
    console.log('Response:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();
