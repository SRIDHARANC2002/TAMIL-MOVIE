import axios from 'axios';

const API_URL = 'http://localhost:5005/api/users';

export const authService = {
    register: async (userData) => {
        try {
            console.log('🚀 Starting registration process...');
            console.log('📤 Sending registration data:', {
                ...userData,
                password: '[HIDDEN]',
                confirmPassword: '[HIDDEN]'
            });
            
            const response = await axios.post(`${API_URL}/register`, userData);
            console.log('✅ Registration successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Registration error:', {
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error.response?.data?.message || 'Registration failed';
        }
    },

    login: async (credentials) => {
        try {
            console.log('🔑 Attempting login...');
            const response = await axios.post(`${API_URL}/login`, credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('✅ Login successful');
            }
            return response.data;
        } catch (error) {
            console.error('❌ Login error:', error.response?.data);
            throw error.response?.data?.message || 'Login failed';
        }
    },

    logout: () => {
        console.log('👋 Logging out...');
        localStorage.removeItem('token');
        console.log('✅ Logout successful');
    }
};
