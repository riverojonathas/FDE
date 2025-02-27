import React from 'react';
import { usePromptFlow } from '../hooks';

function PromptFlow() {
  const {
    text,
    setText,
    prompt,
    setPrompt,
    response,
    loading,
    error,
  } = usePromptFlow();

  return (
    <div>
      <h1>Prompt Flow</h1>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => setPrompt(text)}>Analisar Texto</button>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error.message}</p>}
      {response && <p>Resposta: {response}</p>}
    </div>
  );
}

export default PromptFlow; 