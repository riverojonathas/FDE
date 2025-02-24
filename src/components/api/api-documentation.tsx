'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from 'lucide-react'

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  request?: any
  response?: any
}

const endpoints: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/v1/corrections/batch',
    description: 'Envia um lote de respostas para correção',
    request: {
      responses: [
        {
          student_id: "aluno@escola.com",
          question_code: "RED-2024-001",
          answer: "Texto da resposta do aluno..."
        }
      ]
    },
    response: {
      batch_id: "batch_123",
      status: "processing",
      total_items: 1,
      results: []
    }
  },
  {
    method: 'GET',
    path: '/api/v1/corrections/batch/:batchId',
    description: 'Consulta o status de um lote de correções',
    response: {
      batch_id: "batch_123",
      status: "completed",
      total_items: 1,
      results: [
        {
          student_id: "aluno@escola.com",
          question_code: "RED-2024-001",
          score: 8.5,
          feedback: "Boa argumentação...",
          details: {
            strengths: ["Argumentação clara", "Boa estrutura"],
            weaknesses: ["Alguns erros gramaticais"],
            suggestions: ["Revisar pontuação"]
          }
        }
      ]
    }
  }
]

const integrationExamples = {
  curl: `curl -X POST https://api.correcao.ai/v1/corrections/batch \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "responses": [
      {
        "student_id": "aluno@escola.com",
        "question_code": "RED-2024-001",
        "answer": "Texto da resposta..."
      }
    ]
  }'`,
  python: `import requests

api_key = "YOUR_API_KEY"
url = "https://api.correcao.ai/v1/corrections/batch"

payload = {
    "responses": [
        {
            "student_id": "aluno@escola.com",
            "question_code": "RED-2024-001",
            "answer": "Texto da resposta..."
        }
    ]
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()
print(result)`,
  javascript: `const apiKey = 'YOUR_API_KEY';
const url = 'https://api.correcao.ai/v1/corrections/batch';

const payload = {
  responses: [
    {
      student_id: 'aluno@escola.com',
      question_code: 'RED-2024-001',
      answer: 'Texto da resposta...'
    }
  ]
};

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(result => console.log(result));`
}

export function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, language: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(language)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Endpoints</h2>
        {endpoints.map((endpoint) => (
          <Card key={endpoint.path}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold
                  ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'}`}>
                  {endpoint.method}
                </span>
                <code className="text-sm">{endpoint.path}</code>
              </div>
              <CardDescription>{endpoint.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoint.request && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Request:</h4>
                    <pre className="bg-muted rounded-md p-4 text-sm">
                      {JSON.stringify(endpoint.request, null, 2)}
                    </pre>
                  </div>
                )}
                {endpoint.response && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Response:</h4>
                    <pre className="bg-muted rounded-md p-4 text-sm">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Exemplos de Integração</h2>
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="curl">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>
              {Object.entries(integrationExamples).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(code, lang)}
                    >
                      {copiedCode === lang ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                      {code}
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Autenticação</h2>
        <Card>
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>
              Todas as requisições devem incluir sua chave de API no header Authorization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-muted rounded-md p-2 text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 