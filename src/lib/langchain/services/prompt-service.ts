import { supabase } from "@/lib/supabase/client";
import { PromptTemplate } from "../agents/agent-interface";
import { v4 as uuidv4 } from "uuid";

/**
 * Interface para filtros de busca de templates
 */
export interface PromptTemplateFilter {
  agentId?: string;
  isDefault?: boolean;
  searchTerm?: string;
}

/**
 * Serviço para gerenciar templates de prompts
 * Permite criar, atualizar, buscar e versionar templates
 */
export class PromptService {
  
  /**
   * Busca um template por ID
   */
  static async getTemplateById(id: string): Promise<PromptTemplate | null> {
    try {
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data as PromptTemplate;
    } catch (error) {
      console.error("Erro ao buscar template:", error);
      return null;
    }
  }
  
  /**
   * Busca o template padrão para um agente
   */
  static async getDefaultTemplate(agentId: string): Promise<PromptTemplate | null> {
    try {
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("agent_id", agentId)
        .eq("is_default", true)
        .single();
        
      if (error) throw error;
      return data as PromptTemplate;
    } catch (error) {
      console.error(`Erro ao buscar template padrão para o agente ${agentId}:`, error);
      return null;
    }
  }
  
  /**
   * Busca templates com filtros
   */
  static async searchTemplates(
    filters: PromptTemplateFilter,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ data: PromptTemplate[]; count: number }> {
    try {
      let query = supabase.from("prompt_templates").select("*", { count: "exact" });
      
      if (filters.agentId) {
        query = query.eq("agent_id", filters.agentId);
      }
      
      if (filters.isDefault !== undefined) {
        query = query.eq("is_default", filters.isDefault);
      }
      
      if (filters.searchTerm) {
        query = query.ilike("name", `%${filters.searchTerm}%`);
      }
      
      // Aplicar paginação
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      // Ordenar por data de atualização
      query = query.order("updated_at", { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: data as PromptTemplate[],
        count: count || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar templates:", error);
      return { data: [], count: 0 };
    }
  }
  
  /**
   * Salva um novo template
   */
  static async saveTemplate(template: Omit<PromptTemplate, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const now = new Date().toISOString();
      const id = uuidv4();
      
      const { error } = await supabase.from("prompt_templates").insert({
        id,
        name: template.name,
        template: template.template,
        version: template.version,
        is_default: template.isDefault,
        variables: template.variables,
        agent_id: template.agentId,
        created_at: now,
        updated_at: now,
      });
      
      if (error) throw error;
      
      // Se for o template padrão, desmarcar outros templates padrão
      if (template.isDefault) {
        await this.setDefaultTemplate(id, template.agentId);
      }
      
      return id;
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      throw error;
    }
  }
  
  /**
   * Atualiza um template existente
   */
  static async updateTemplate(
    id: string,
    updates: Partial<Omit<PromptTemplate, "id" | "createdAt" | "updatedAt">>
  ): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from("prompt_templates")
        .update({
          ...updates,
          updated_at: now,
        })
        .eq("id", id);
      
      if (error) throw error;
      
      // Se for o template padrão, desmarcar outros templates padrão
      if (updates.isDefault) {
        await this.setDefaultTemplate(id, updates.agentId);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar template ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Define um template como padrão para um agente
   */
  private static async setDefaultTemplate(templateId: string, agentId?: string): Promise<void> {
    if (!agentId) {
      // Buscar o agentId do template
      const template = await this.getTemplateById(templateId);
      if (!template?.agentId) {
        throw new Error("AgentId não encontrado para o template");
      }
      agentId = template.agentId;
    }
    
    try {
      // Desmarcar todos os outros templates como padrão
      await supabase
        .from("prompt_templates")
        .update({ is_default: false })
        .eq("agent_id", agentId)
        .neq("id", templateId);
      
      // Marcar este template como padrão
      await supabase
        .from("prompt_templates")
        .update({ is_default: true })
        .eq("id", templateId);
    } catch (error) {
      console.error(`Erro ao definir template padrão ${templateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria uma nova versão de um template
   */
  static async createNewVersion(
    baseTemplateId: string,
    updates: { template: string; name?: string; variables?: string[] }
  ): Promise<string> {
    try {
      // Buscar template base
      const baseTemplate = await this.getTemplateById(baseTemplateId);
      if (!baseTemplate) {
        throw new Error(`Template base ${baseTemplateId} não encontrado`);
      }
      
      // Incrementar versão
      const currentVersion = baseTemplate.version;
      const versionParts = currentVersion.split(".");
      const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;
      
      // Criar novo template
      const newTemplateId = await this.saveTemplate({
        name: updates.name || `${baseTemplate.name} v${newVersion}`,
        template: updates.template,
        version: newVersion,
        isDefault: false, // Não definir como padrão automaticamente
        variables: updates.variables || baseTemplate.variables,
        agentId: baseTemplate.agentId,
      });
      
      return newTemplateId;
    } catch (error) {
      console.error(`Erro ao criar nova versão do template ${baseTemplateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Extrai variáveis de um template
   * Procura por padrões como {variavel} no texto
   */
  static extractTemplateVariables(templateText: string): string[] {
    const variableRegex = /{([^{}]+)}/g;
    const matches = templateText.matchAll(variableRegex);
    const variables = new Set<string>();
    
    for (const match of matches) {
      if (match[1]) {
        variables.add(match[1]);
      }
    }
    
    return Array.from(variables);
  }
} 