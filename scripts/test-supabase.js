import { createClient } from '@supabase/supabase-js'

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n')
  
  // Check if environment variables are set
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    console.log('\n📝 Please set these variables in your .env file')
    return false
  }
  
  console.log('✅ Environment variables found')
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  try {
    // Test basic connection
    console.log('📡 Testing database connection...')
    const { data, error } = await supabase.from('user').select('count', { count: 'exact' })
    
    if (error) {
      if (error.message.includes('_relation "user" does not exist_')) {
        console.log('⚠️  User table does not exist yet - this is expected if database not initialized')
        console.log('💡 Run: npx prisma db push')
      } else {
        console.error('❌ Database connection failed:', error.message)
        return false
      }
    } else {
      console.log('✅ Database connection successful')
    }
    
    // Test auth
    console.log('🔐 Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Invalid authentication credentials') {
      console.error('❌ Authentication test failed:', authError.message)
      return false
    } else {
      console.log('✅ Authentication system accessible')
    }
    
    console.log('\n🎉 Supabase setup verification complete!')
    console.log('📋 Next steps:')
    console.log('1. If tables missing, run: npx prisma db push')
    console.log('2. Start development: npm run dev')
    console.log('3. Visit http://localhost:3000/authentication')
    
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Run the test
testSupabaseConnection().catch(console.error)