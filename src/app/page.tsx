'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Cpu, 
  LineChart, 
  Users, 
  Scale,
  Clock,
  Database,
  Shield,
  Code,
  Network,
  GitBranch,
  Workflow,
  BookOpen,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Header Técnico */}
      <section className="py-12 px-4">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              Protótipo Técnico v1.0.0
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              Projeto FDE
            </Badge>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-mono text-white">
                  Sistema de Avaliação Automatizada
                  <span className="text-blue-400 block mt-2">Powered by GPT-4</span>
                </h1>
                <p className="text-sm text-slate-400 mt-2">
                  Desenvolvido pela Equipe de Tecnologia da Fundação para o Desenvolvimento da Educação
                </p>
              </div>
              <div className="space-y-4 text-slate-400">
                <p className="font-mono">
                  {'>'} Processamento de avaliações dissertativas em larga escala
                </p>
                <p className="font-mono">
                  {'>'} Integração com sistemas da Secretaria da Educação
                </p>
                <p className="font-mono">
                  {'>'} Analytics e insights em tempo real
                </p>
              </div>
            </div>
            <Card className="bg-slate-900 border-slate-800">
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
              <pre className="p-4 text-sm text-blue-400 font-mono overflow-x-auto">
                <code>{`// Exemplo de Integração
const correction = await api.evaluate({
  question: "Análise crítica sobre...",
  answer: "O texto apresenta...",
  rubric: {
    criteria: ["Argumentação", "Coesão"],
    weights: [0.6, 0.4]
  },
  settings: {
    model: "gpt-4-turbo",
    temperature: 0.3
  }
});

// Resultado
{
  score: 8.5,
  feedback: "Boa argumentação...",
  metrics: {
    confidence: 0.92,
    timeMs: 1250
  }
}`}</code>
              </pre>
            </Card>
          </div>
        </div>
      </section>

      {/* Capacidades Técnicas */}
      <section className="py-12 px-4">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Workflow className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-mono text-white">Fluxo de Correção</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Processamento em lote (batch)</li>
                <li>• Filas assíncronas com Redis</li>
                <li>• Retry automático em falhas</li>
                <li>• Webhooks para notificações</li>
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-mono text-white">Modelos IA</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• GPT-4 para análise semântica</li>
                <li>• Fine-tuning específico</li>
                <li>• Validação cruzada</li>
                <li>• Calibração automática</li>
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-mono text-white">Armazenamento</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• PostgreSQL + PostGIS</li>
                <li>• Criptografia em repouso</li>
                <li>• Backup incremental</li>
                <li>• Retenção configurável</li>
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-mono text-white">Versionamento</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Controle de versão de prompts</li>
                <li>• Histórico de calibrações</li>
                <li>• Rollback de modelos</li>
                <li>• Auditoria completa</li>
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Network className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-mono text-white">Integração</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• REST API documentada</li>
                <li>• SDK para Python/Node</li>
                <li>• SSO via SAML/OAuth</li>
                <li>• Export em múltiplos formatos</li>
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-mono text-white">Segurança</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Conformidade LGPD</li>
                <li>• Logs criptografados</li>
                <li>• Rate limiting</li>
                <li>• Análise de vulnerabilidades</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Nova seção de Integração Governamental */}
      <section className="py-12 px-4 bg-blue-600/10">
        <div className="container max-w-6xl">
          <h2 className="text-2xl font-mono text-white mb-8">Integração com Sistemas Governamentais</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h3 className="text-lg font-mono text-white mb-4">Secretaria da Educação</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Sistema de Gestão Escolar</li>
                <li>• Portal do Professor</li>
                <li>• Banco de Questões</li>
                <li>• Sistema de Avaliação</li>
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <h3 className="text-lg font-mono text-white mb-4">Conformidade</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• LGPD</li>
                <li>• Padrões e-Gov</li>
                <li>• Acessibilidade</li>
                <li>• Transparência</li>
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <h3 className="text-lg font-mono text-white mb-4">Infraestrutura</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Data Centers Governamentais</li>
                <li>• Rede Intragov</li>
                <li>• Backup Distribuído</li>
                <li>• Monitoramento 24/7</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Métricas de Performance */}
      <section className="py-12 px-4 bg-slate-900">
        <div className="container max-w-6xl">
          <h2 className="text-2xl font-mono text-white mb-8">Métricas de Performance</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-3xl font-mono text-blue-400">45ms</div>
              <div className="text-sm text-slate-400">Latência Média</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-3xl font-mono text-blue-400">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-3xl font-mono text-blue-400">10k/s</div>
              <div className="text-sm text-slate-400">Throughput</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-3xl font-mono text-blue-400">0.5TB</div>
              <div className="text-sm text-slate-400">Dados Processados/dia</div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentação */}
      <section className="py-12 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-8">
            <p className="text-slate-400 mb-4">
              Projeto desenvolvido e mantido pela equipe de Tecnologia da FDE - Fundação para o Desenvolvimento da Educação
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-blue-500 text-blue-400">
              <Code className="mr-2 h-4 w-4" />
              Documentação API
            </Button>
            <Button variant="outline" className="border-blue-500 text-blue-400">
              <BookOpen className="mr-2 h-4 w-4" />
              Manual Técnico
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-400"
              asChild
            >
              <Link href="/cases">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Cases de Uso
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
