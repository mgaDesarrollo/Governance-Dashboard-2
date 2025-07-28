const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndFixDiscordOAuth() {
  console.log('🔧 Checking Discord OAuth Configuration...\n');

  // Check environment variables
  const requiredEnvVars = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'NEXTAUTH_URL'
  ];

  console.log('📋 Environment Variables Check:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***SET***' : value}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
    }
  });

  console.log('\n🔗 Discord OAuth URLs:');
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (clientId) {
    console.log(`Discord Application URL: https://discord.com/developers/applications/${clientId}/oauth2/general`);
    console.log(`Redirect URI for localhost: http://localhost:3000/api/auth/callback/discord`);
    console.log(`Redirect URI for production: https://your-domain.vercel.app/api/auth/callback/discord`);
  }

  console.log('\n📝 Steps to Fix Discord OAuth:');
  console.log('1. Go to https://discord.com/developers/applications');
  console.log('2. Select your application');
  console.log('3. Go to OAuth2 > General');
  console.log('4. Add these redirect URIs:');
  console.log('   - http://localhost:3000/api/auth/callback/discord');
  console.log('   - https://your-domain.vercel.app/api/auth/callback/discord');
  console.log('5. Save changes');
  console.log('6. Copy Client ID and Client Secret to your .env.local file');

  console.log('\n🔧 Database Connection Test:');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user creation
    const testUser = await prisma.user.upsert({
      where: { id: 'test-oauth-fix' },
      update: {},
      create: {
        id: 'test-oauth-fix',
        name: 'Test OAuth Fix',
        email: 'test@oauth.fix',
        role: 'CORE_CONTRIBUTOR',
        status: 'AVAILABLE'
      }
    });
    console.log('✅ User creation test successful');
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: 'test-oauth-fix' }
    });
    console.log('✅ Database cleanup successful');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎯 Common Issues and Solutions:');
  console.log('1. "400 Bad Request": Check redirect URIs in Discord Developer Portal');
  console.log('2. "Invalid client": Verify DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET');
  console.log('3. "Redirect URI mismatch": Add localhost:3000 to Discord OAuth redirects');
  console.log('4. "Database connection failed": Check DATABASE_URL format');
  console.log('5. "Session not persisting": Check NEXTAUTH_SECRET and cookie settings');

  console.log('\n🚀 Next Steps:');
  console.log('1. Update Discord OAuth redirect URIs');
  console.log('2. Restart your development server');
  console.log('3. Clear browser cookies and cache');
  console.log('4. Try logging in again');
}

checkAndFixDiscordOAuth().catch(console.error); 