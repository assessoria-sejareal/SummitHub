const axios = require('axios');

const API_URL = 'https://summithub-production.up.railway.app/api';

async function createStations() {
  try {
    // Create 5 stations
    for (let i = 1; i <= 5; i++) {
      const response = await axios.post(`${API_URL}/admin/stations`, {
        number: i,
        status: 'ACTIVE'
      });
      console.log(`Station ${i} created:`, response.data);
    }
    console.log('All stations created successfully!');
  } catch (error) {
    console.error('Error creating stations:', error.response?.data || error.message);
  }
}

createStations();
