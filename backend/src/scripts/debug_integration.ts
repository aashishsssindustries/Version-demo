
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'demo-user-001@wealthmax.app',
            password: 'password123'
        });

        const token = loginRes.data.data.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        console.log('Fetching Alignment...');
        const alignRes = await axios.get(`${API_URL}/portfolio/alignment`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000 // 5s timeout
        });

        console.log('Alignment Status:', alignRes.status);
        console.log('Score:', alignRes.data.data.alignmentScore);

    } catch (error: any) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out!');
        } else {
            console.error('Error:', error.message);
        }
    }
}

test();
