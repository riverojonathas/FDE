import { useState, useEffect } from 'react';
import { useAgent, usePrompt } from 'langchain';
import OrchestratorAgent from '../agents/OrchestratorAgent';

function usePromptFlow() {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const orchestratorAgent = useAgent(OrchestratorAgent);

  useEffect(() => {
    if (prompt) {
      setLoading(true);
      setError(null);
      orchestratorAgent.analyzeText(prompt)
        .then((result) => {
          setResponse(result);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [prompt, orchestratorAgent]);

  return {
    text,
    setText,
    prompt,
    setPrompt,
    response,
    loading,
    error,
  };
}

export default usePromptFlow; 