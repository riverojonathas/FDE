import { createClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

// Verificando se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam ser definidas.'
  );
}

// Criando o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log para debug
console.log('Supabase client initialized with URL:', supabaseUrl);

// Teste de conexão
async function testConnection() {
  try {
    await supabase.from('questions').select('count').single();
    console.log('Supabase connection test successful');
  } catch (error) {
    console.error('Supabase connection test failed:', error);
  }
}

// Executar teste de conexão
testConnection(); 