async function test() {
  try {
    const res = await fetch('https://swift-fix-backend-96vr.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'admin@flowfix.io', password: 'admin123' })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

test();
