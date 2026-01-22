// TESTS API SUPABASE - DIGITALBANK

import { createClient } from '@supabase/supabase-js'

// Configuration 
const SUPABASE_URL = 'https://puvjksqfwvfguxeqobqe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dmprc3Fmd3ZmZ3V4ZXFvYnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzkwODEsImV4cCI6MjA4NDU1NTA4MX0.DiyBTgZ2-bsevikSqOc1RMLBs-qyqF7tuD5QCMOK6UA'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// TEST 1 : LOGIN

async function testLogin() {
  console.log('\n TEST 1 : Login')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'jean.dupont@digitalbank.fr',
    password: 'SecureTest123!'
  })
  
  if (error) {
    console.error(' Erreur:', error.message)
    return null
  }
  
  console.log(' Login réussi!')
  console.log('User ID:', data.user.id)
  console.log('Email:', data.user.email)
  
  return data.session.access_token
}

// TEST 2 : Récupérer les comptes (CLIENT)

async function testGetAccounts() {
  console.log('\n TEST 2 : Récupérer les comptes')
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
  
  if (error) {
    console.error(' Erreur:', error.message)
    return
  }
  
  console.log(` ${data.length} compte(s) trouvé(s)`)
  data.forEach(account => {
    console.log(`  - ${account.account_number} : ${account.balance} ${account.currency}`)
  })
}

// TEST 3 : Récupérer les transactions d'un compte

async function testGetTransactions(accountId) {
  console.log('\n TEST 3 : Récupérer les transactions')
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('timestamp', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error(' Erreur:', error.message)
    return
  }
  
  console.log(` ${data.length} transaction(s) trouvée(s)`)
  data.forEach(tx => {
    console.log(`  - ${tx.description}: ${tx.amount} ${tx.currency}`)
  })
}

// TEST 4 : Créer une nouvelle transaction

async function testCreateTransaction(accountId) {
  console.log('\n TEST 4 : Créer une transaction')
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        account_id: accountId,
        transaction_type: 'deposit',
        amount: 100.00,
        currency: 'EUR',
        description: 'Test transaction',
        merchant: 'Test Merchant',
        category: 'test',
        status: 'completed'
      }
    ])
    .select()
  
  if (error) {
    console.error(' Erreur:', error.message)
    return
  }
  
  console.log(' Transaction créée avec succès!')
  console.log('  ID:', data[0].transaction_id)
}

// TEST 5 : Test RLS - Tenter d'accéder aux données d'un autre user

async function testRLS() {
  console.log('\n TEST 5 : Test RLS')
  
  // Se connecter en tant que Jean (client)
  await supabase.auth.signInWithPassword({
    email: 'jean.dupont@digitalbank.fr',
    password: 'SecureTest123!'
  })
  
  // Tenter de récupérer TOUS les comptes (devrait filtrer automatiquement)
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
  
  console.log(`Jean (client) voit ${data.length} compte(s)`)
  
  // Se connecter en tant que Marie (analyst)
  await supabase.auth.signInWithPassword({
    email: 'marie.martin@digitalbank.fr',
    password: 'SecureTest123!'
  })
  
  const { data: data2 } = await supabase
    .from('accounts')
    .select('*')
  
  console.log(`Marie (analyst) voit ${data2.length} compte(s)`)
  
  if (data2.length > data.length) {
    console.log(' RLS fonctionne correctement!')
  } else {
    console.log(' RLS pourrait avoir un problème')
  }
}

// EXÉCUTION DE TOUS LES TESTS

async function runAllTests() {
  console.log(' TESTS API SUPABASE - DIGITALBANK')
  
  try {
    // Test 1 : Login
    await testLogin()
    
    // Test 2 : Récupérer les comptes
    await testGetAccounts()
    
    // Test 3 : Récupérer les transactions (utiliser le premier account_id)
    await testGetTransactions(1) // Remplacer par un vrai account_id
    
    // Test 4 : Créer une transaction
    await testCreateTransaction(1) // Remplacer par un vrai account_id
    
    // Test 5 : Test RLS
    await testRLS()
    
    console.log(' TOUS LES TESTS TERMINÉS')
    
  } catch (error) {
    console.error('\n Erreur globale:', error)
  }
}

// Lancer les tests
runAllTests()