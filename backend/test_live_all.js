async function testLive() {
  const users = [
    { email: 'admin@flowfix.io', password: 'admin123' },
    { email: 'emma@mail.com', password: 'customer123' },
    { email: 'mike@flowfix.io', password: 'plumber123' }
  ];

  for (let u of users) {
    try {
      const res = await fetch('https://swift-fix-backend-96vr.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      console.log(`Login ${u.email}: ${res.status}`);
    } catch(e) {
      console.error(`Error logging in ${u.email}:`, e.message);
    }
  }

  // Test Categories
  try {
    const res = await fetch('https://swift-fix-backend-96vr.onrender.com/api/services/categories');
    console.log(`Categories API: ${res.status}`);
    const data = await res.json();
    console.log(`Categories found:`, Array.isArray(data) ? data.length : data);
  } catch(e) {
    console.error('Categories error:', e.message);
  }
}

testLive();
