const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('🔄 Testing Registration...');
    
    const userData = {
      fullName: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    console.log('📤 Sending Data:', userData);

    const response = await axios.post('http://localhost:5002/api/users/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration Successful!');
    console.log('📥 Response:', response.data);
  } catch (error) {
    console.error('❌ Registration Failed:', error.response?.data || error.message);
  }
};

testRegistration();
