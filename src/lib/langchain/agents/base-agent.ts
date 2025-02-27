import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

export abstract class BaseAgent {
  protected id: string;
  protected model: ChatOpenAI;

  constructor(id: string) {
    this.id = id;
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
    });
  }

  protected async execute(prompt: string): Promise<string> {
    try {
      const promptTemplate = new PromptTemplate({
        template: prompt,
        inputVariables: [],
      });

      const formattedPrompt = await promptTemplate.format({});

      const response = await this.model.call([
        {
          role: 'user',
          content: formattedPrompt,
        },
      ]);

      return response.content as string;
    } catch (error) {
      console.error(`Erro ao executar agente ${this.id}:`, error);
      throw error;
    }
  }
} 