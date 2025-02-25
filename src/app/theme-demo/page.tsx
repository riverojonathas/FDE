import { ThemeExample } from '@/components/theme/theme-example'

export default function ThemeDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Demonstração de Tema</h1>
      <p className="text-muted-foreground mb-8">
        Esta página demonstra como os componentes respondem ao tema escolhido pelo usuário.
        Use o botão de tema no cabeçalho para alternar entre os temas claro e escuro.
      </p>
      
      <ThemeExample />
    </div>
  )
} 