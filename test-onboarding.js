import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3002/api';
const CLIENT_EMAIL = 'client@example.com';
const CLIENT_PASSWORD = 'client123';

async function testOnboardingAPI() {
  console.log('🧪 Testing Client Onboarding API...\n');

  try {
    // Step 1: Login as client
    console.log('1. Logging in as client...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: CLIENT_EMAIL,
        password: CLIENT_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');

    // Step 2: Check onboarding status
    console.log('2. Checking onboarding status...');
    const statusResponse = await fetch(`${API_BASE}/onboarding/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Onboarding status:', statusData);
    } else {
      console.log('ℹ️  No onboarding started yet (this is expected)');
    }
    console.log('');

    // Step 3: Start onboarding
    console.log('3. Starting onboarding...');
    const startResponse = await fetch(`${API_BASE}/onboarding/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        businessName: 'Test Business Inc.',
        businessType: 'LLC',
        industry: 'Professional Services',
        businessAddress: '123 Test St, Test City, TC 12345',
        businessPhone: '(555) 123-4567',
        taxId: '12-3456789',
        businessStartDate: '2023-01-01',
        accountingMethod: 'cash',
        fiscalYearEnd: '12-31'
      })
    });

    if (startResponse.ok) {
      const startData = await startResponse.json();
      console.log('✅ Onboarding started successfully');
      console.log('   Business:', startData.onboarding.businessName);
    } else {
      const errorData = await startResponse.json();
      console.log('❌ Failed to start onboarding:', errorData.error);
    }
    console.log('');

    // Step 4: Update step 2
    console.log('4. Updating step 2...');
    const step2Response = await fetch(`${API_BASE}/onboarding/step/2`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        data: {
          expectedMonthlyRevenue: 10000,
          numberOfEmployees: 5,
          currentBookkeepingSystem: 'Excel/Spreadsheets',
          servicesNeeded: ['Monthly Bookkeeping', 'Tax Preparation']
        }
      })
    });

    if (step2Response.ok) {
      console.log('✅ Step 2 updated successfully');
    } else {
      const errorData = await step2Response.json();
      console.log('❌ Failed to update step 2:', errorData.error);
    }
    console.log('');

    // Step 5: Check final status
    console.log('5. Checking final onboarding status...');
    const finalStatusResponse = await fetch(`${API_BASE}/onboarding/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (finalStatusResponse.ok) {
      const finalStatusData = await finalStatusResponse.json();
      console.log('✅ Final status:', {
        status: finalStatusData.status,
        step: finalStatusData.step,
        progress: finalStatusData.progress + '%'
      });
    }

    console.log('\n🎉 Onboarding API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOnboardingAPI();