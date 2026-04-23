async function test() {
  try {
    const signupRes = await fetch('https://swift-fix-backend-96vr.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Live Test', email: 'live@test.com', password: 'password123', role: 'customer' })
    });
    
    console.log('Signup Status:', signupRes.status);
    console.log('Signup Body:', await signupRes.text());

    const loginRes = await fetch('https://swift-fix-backend-96vr.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'live@test.com', password: 'password123' })
    });
    
    console.log('Login Status:', loginRes.status);
    console.log('Login Body:', await loginRes.text());
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
