const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 SCAMS Backend running on http://localhost:${PORT}`);
  console.log('\n📋 Test Accounts:');
  console.log('  member@test.com   / password123  (Member)');
  console.log('  exec@test.com     / password123  (Executive)');
  console.log('  advisor@test.com  / password123  (Advisor)\n');
});
