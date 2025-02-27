import { createClient } from '@supabase/supabase-js'

console.log('=== CONFIGURANDO SUPABASE ===');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não definidas');
  throw new Error('Supabase URL and Anon Key must be defined');
}

export const supabase = createClient(supabaseUrl, supabaseKey);




// Função para testar a conexão
export async function testConnection() {
  try {
    // Tentativa de conexão sem uma consulta específica
    await supabase.rpc('ping');

    console.log('Conexão com o Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao Supabase:', error);
    return false;
  }
}

// End of Selection