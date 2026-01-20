const sequelize = require('../config/database');
const Project = require('../models/Project');

async function testPrivateKey() {
  try {
    console.log('🔍 Testing privateKey storage...\n');

    // Create a test project with a private key
    const testPrivateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...(test key)...';
    
    const testProject = await Project.create({
      name: 'Test Project with SSH Key',
      type: 'nodejs',
      host: 'test.example.com',
      username: 'testuser',
      password: '', // Empty password since we're using privateKey
      privateKey: testPrivateKey,
      deployPath: '/var/www/test',
      repoUrl: 'https://github.com/test/repo.git',
      branch: 'main'
    });

    console.log('✅ Project created with ID:', testProject.id);
    console.log('✅ Private key stored (length):', testProject.privateKey?.length || 0);

    // Retrieve the project
    const retrieved = await Project.findByPk(testProject.id);
    
    console.log('\n🔍 Retrieved project from database...');
    console.log('✅ Private key retrieved (length):', retrieved.privateKey?.length || 0);
    console.log('✅ Private key matches:', retrieved.privateKey === testPrivateKey);

    // Clean up
    await testProject.destroy();
    console.log('\n🧹 Test project deleted');
    
    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPrivateKey();
