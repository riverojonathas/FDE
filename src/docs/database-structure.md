# Estrutura do Banco de Dados - Sistema de Correção IA

Este documento descreve a estrutura do banco de dados utilizada no sistema de correção assistida por IA.

## Tabelas Principais

### 1. corrections

Armazena as correções principais e é a tabela central do sistema.

**Campos:**
- `id` (UUID, PK): Identificador único da correção
- `student_id` (UUID, FK): Referência ao estudante (opcional)
- `theme_id` (UUID, FK): Tema ou questão relacionada
- `text_content` (TEXT): Conteúdo textual a ser analisado
- `status` (STRING): Status da correção ('pending', 'in_progress', 'completed', 'error')
- `metadata` (JSON): Metadados adicionais da correção
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data da última atualização

**Relacionamentos:**
- `student_id` → `students.id`
- `theme_id` → `themes.id`

### 2. student_responses

Armazena as respostas dos estudantes, que podem ser usadas para criar correções.

**Campos:**
- `id` (UUID, PK): Identificador único da resposta
- `student_id` (UUID, FK): Referência ao estudante
- `question_id` (UUID, FK): Questão respondida
- `content` (TEXT): Conteúdo da resposta
- `created_at` (TIMESTAMP): Data de criação
- `status` (STRING): Status da resposta

**Relacionamentos:**
- `student_id` → `students.id`
- `question_id` → `questions.id`

**Observação sobre Redundância:**
Existe alguma redundância entre `corrections` e `student_responses`. A tabela `corrections` é mais abrangente e pode conter correções de textos que não são necessariamente respostas de estudantes. Para simplificar, poderia-se considerar a consolidação dessas tabelas no futuro.

## Tabelas de Análise

### 3. grammar_analyses

Armazena análises gramaticais realizadas pelos agentes.

**Campos:**
- `id` (UUID, PK): Identificador único da análise
- `correction_id` (UUID, FK): Referência à correção
- `status` (STRING): Status da análise ('pending', 'in_progress', 'completed', 'error')
- `analysis_data` (JSON): Resultados da análise gramatical
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data da última atualização

**Relacionamentos:**
- `correction_id` → `corrections.id`

### 4. theme_analyses

Armazena análises temáticas realizadas pelos agentes.

**Campos:**
- `id` (UUID, PK): Identificador único da análise
- `correction_id` (UUID, FK): Referência à correção
- `status` (STRING): Status da análise
- `analysis_data` (JSON): Resultados da análise temática
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data da última atualização

**Relacionamentos:**
- `correction_id` → `corrections.id`

### 5. technical_evaluations

Armazena avaliações técnicas realizadas pelos agentes.

**Campos:**
- `id` (UUID, PK): Identificador único da avaliação
- `correction_id` (UUID, FK): Referência à correção
- `status` (STRING): Status da avaliação
- `evaluation_data` (JSON): Resultados da avaliação técnica
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data da última atualização

**Relacionamentos:**
- `correction_id` → `corrections.id`

### 6. detailed_feedbacks

Armazena feedbacks detalhados gerados pelos agentes.

**Campos:**
- `id` (UUID, PK): Identificador único do feedback
- `correction_id` (UUID, FK): Referência à correção
- `status` (STRING): Status do feedback
- `feedback_data` (JSON): Conteúdo do feedback detalhado
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data da última atualização

**Relacionamentos:**
- `correction_id` → `corrections.id`

## Tabelas de Apoio

### 7. students

Armazena informações sobre estudantes.

**Campos:**
- `id` (UUID, PK): Identificador único do estudante
- `name` (STRING): Nome do estudante
- `email` (STRING): Email do estudante
- `created_at` (TIMESTAMP): Data de criação

### 8. themes

Armazena temas para questões/correções.

**Campos:**
- `id` (UUID, PK): Identificador único do tema
- `title` (STRING): Título do tema
- `description` (TEXT): Descrição do tema
- `created_at` (TIMESTAMP): Data de criação

### 9. questions

Armazena questões disponíveis no sistema.

**Campos:**
- `id` (UUID, PK): Identificador único da questão
- `title` (STRING): Título da questão
- `content` (TEXT): Conteúdo da questão
- `theme_id` (UUID, FK): Tema relacionado
- `created_at` (TIMESTAMP): Data de criação

**Relacionamentos:**
- `theme_id` → `themes.id`

## Diagrama de Relacionamentos

```
corrections
  │
  ├─── student_id → students
  ├─── theme_id → themes
  │
  ├─── grammar_analyses
  ├─── theme_analyses
  ├─── technical_evaluations
  └─── detailed_feedbacks

student_responses
  │
  ├─── student_id → students
  └─── question_id → questions

questions
  │
  └─── theme_id → themes
```

## Observações Importantes

1. **Uso Correto de IDs**: Todos os serviços e componentes DEVEM usar o UUID da correção (`corrections.id`) ao criar registros relacionados nas tabelas de análise.

2. **Não use IDs de Passos**: Nunca use strings como "grammar-analysis" ou "theme-analysis" como IDs. Estes são apenas identificadores internos de passos e não são UUIDs válidos.

3. **Validação de IDs**: Todos os serviços implementam validação para garantir que apenas UUIDs válidos sejam usados em operações de banco de dados.

4. **Possíveis Melhorias Futuras**:
   - Consolidar `corrections` e `student_responses` em uma única tabela
   - Adicionar índices para melhorar o desempenho das consultas
   - Implementar mais validações nos serviços para garantir a integridade dos dados 