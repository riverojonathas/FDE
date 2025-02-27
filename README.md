# Sistema de Correção Automática de Textos

Um sistema para correção automática de redações e textos dissertativos utilizando Inteligência Artificial, com interface para execução manual e supervisão humana.

## Funcionalidades

- Pipeline manual para correção de textos passo a passo
- Análise gramatical, de coerência/coesão e de desenvolvimento do tema
- Integração com Supabase para persistência dos dados
- Interface intuitiva para enviar prompts para modelos de IA e processar respostas
- Orquestração dos resultados para gerar um feedback compilado

## Tecnologias Utilizadas

- Next.js 14 com App Router
- TypeScript
- Supabase (PostgreSQL)
- TailwindCSS + shadcn/ui
- LangChain (para agentes de IA)

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Chaves de API (OpenAI ou Anthropic)

### Passos para Configuração

1. Clone o repositório:
   ```bash
   git clone [url-do-repositorio]
   cd correcao-ia
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Supabase:
   - Crie um novo projeto no [Supabase](https://supabase.com)
   - No SQL Editor, execute o script em `supabase/migrations/create_tables.sql`
   - Copie a URL e a Anon Key do projeto

4. Configure o arquivo de ambiente:
   ```bash
   cp .env.example .env.local
   ```
   E preencha as seguintes variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
   OPENAI_API_KEY=sua-chave-api-da-openai
   ANTHROPIC_API_KEY=sua-chave-api-da-anthropic
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3000/dashboard/manual-pipeline` para usar a pipeline manual

## Uso da Pipeline Manual

A pipeline manual permite executar cada etapa da correção individualmente:

1. **Configuração Inicial**:
   - Selecione um tema/questão
   - Insira o texto para análise (mínimo 50 palavras)
   - Escolha o modelo de IA que você usará manualmente

2. **Para cada Agente de Análise**:
   - Copie o prompt gerado
   - Envie para a IA de sua preferência
   - Cole a resposta no campo apropriado
   - Valide o formato da resposta
   - Visualize o resultado processado
   - Avance para o próximo passo

3. **Orquestrador Final**:
   - O sistema compilará todos os resultados anteriores
   - Calculará uma pontuação final
   - Gerará um feedback consolidado
   - Salvará todos os dados no Supabase

## Estrutura do Projeto

- `/src/app/dashboard/manual-pipeline`: Interface da pipeline manual
- `/src/lib/langchain/agents`: Agentes de análise de texto
- `/src/lib/supabase`: Integração com o Supabase
- `/supabase/migrations`: Scripts para configuração do banco de dados

## Licença

Este projeto está licenciado sob a licença MIT.
