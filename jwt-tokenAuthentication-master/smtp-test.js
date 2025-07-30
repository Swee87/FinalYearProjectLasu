const net = require('net');

function testConnection(host, port) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = 5000;

    console.log(`Testing connection to ${host}:${port}...`);
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✅ Successfully connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`❌ Connection timeout for ${host}:${port} (${timeout}ms)`);
      socket.destroy();
      reject(new Error('Timeout'));
    });

    socket.on('error', (err) => {
      console.log(`❌ Connection failed for ${host}:${port} - ${err.message}`);
      reject(err);
    });

    socket.connect(port, host);
  });
}

async function testSMTP() {
  console.log('🔍 Testing SMTP connectivity...\n');
  
  const tests = [
    { host: 'smtp.gmail.com', port: 465, name: 'Gmail SSL' },
    { host: 'smtp.gmail.com', port: 587, name: 'Gmail STARTTLS' },
    { host: 'smtp-mail.outlook.com', port: 587, name: 'Outlook' },
    { host: 'smtp.sendgrid.net', port: 587, name: 'SendGrid' },
    { host: 'smtp.mailtrap.io', port: 2525, name: 'Mailtrap' }
  ];

  const results = [];

  for (const test of tests) {
    try {
      await testConnection(test.host, test.port);
      results.push({ ...test, status: 'SUCCESS' });
    } catch (err) {
      results.push({ ...test, status: 'FAILED', error: err.message });
    }
    console.log(''); // Empty line for readability
  }

  console.log('📋 Summary of Results:');
  console.log('========================');
  results.forEach(result => {
    const status = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.host}:${result.port}) - ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  console.log(`\n📊 ${successCount}/${results.length} services are accessible`);

  if (successCount === 0) {
    console.log('\n🚨 No SMTP services are accessible from your network.');
    console.log('This suggests your ISP or firewall is blocking SMTP ports.');
    console.log('Consider using:');
    console.log('- A VPN to bypass restrictions');
    console.log('- SendGrid API (bypasses SMTP entirely)');
    console.log('- A different network (mobile hotspot)');
  } else {
    console.log('\n✨ You can use the accessible services for sending emails!');
  }
}

testSMTP().catch(console.error);