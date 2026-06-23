const http = require('http');

const API_URL = 'localhost';
const API_PORT = 5000;

function makeRequest(path, method, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_URL,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testCustomerAPI() {
  try {
    console.log('Testing login...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@ocean.com',
      password: 'admin123'
    });
    console.log('✅ Login successful');
    const token = loginRes.token;
    
    console.log('\nTesting get all customers...');
    const customersRes = await makeRequest('/api/users/customers', 'GET', null, token);
    console.log('✅ Customers fetched:', customersRes.length);
    console.log('First customer:', JSON.stringify(customersRes[0], null, 2));
    
    if (customersRes.length > 0) {
      const customerId = customersRes[0]._id;
      console.log(`\nTesting get customer profile for ID: ${customerId}...`);
      const profileRes = await makeRequest(`/api/users/customers/${customerId}/profile`, 'GET', null, token);
      console.log('✅ Customer profile fetched:', JSON.stringify(profileRes, null, 2));
    }
    
    console.log('\n✅ All customer API tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Customer API test failed:', error.message);
    process.exit(1);
  }
}

testCustomerAPI();
