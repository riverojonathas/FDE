'use client'

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { BaseGradingRules, EssayGradingRules } from "@/types/common"

interface GradingRulesConfigProps {
  type: 'dissertativa' | 'redacao'
  rules: BaseGradingRules | EssayGradingRules
  onChange: (rules: BaseGradingRules | EssayGradingRules) => void
}

export function GradingRulesConfig({ type, rules, onChange }: GradingRulesConfigProps) {
  const isRedacao = type === 'redacao'
  const total = Object.values(rules).reduce((sum, value) => sum + value, 0)
  const isValid = total === 100

  if (isRedacao) {
    const essayRules = rules as EssayGradingRules
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Competência 1: Domínio da norma culta ({essayRules.competencia1}%)</Label>
          <Slider
            value={[essayRules.competencia1]}
            onValueChange={([value]) => onChange({
              ...essayRules,
              competencia1: value
            })}
            max={100}
            step={5}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Competência 2: Compreensão da proposta ({essayRules.competencia2}%)</Label>
          <Slider
            value={[essayRules.competencia2]}
            onValueChange={([value]) => onChange({
              ...essayRules,
              competencia2: value
            })}
            max={100}
            step={5}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Competência 3: Argumentação ({essayRules.competencia3}%)</Label>
          <Slider
            value={[essayRules.competencia3]}
            onValueChange={([value]) => onChange({
              ...essayRules,
              competencia3: value
            })}
            max={100}
            step={5}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Competência 4: Coesão textual ({essayRules.competencia4}%)</Label>
          <Slider
            value={[essayRules.competencia4]}
            onValueChange={([value]) => onChange({
              ...essayRules,
              competencia4: value
            })}
            max={100}
            step={5}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Competência 5: Proposta de intervenção ({essayRules.competencia5}%)</Label>
          <Slider
            value={[essayRules.competencia5]}
            onValueChange={([value]) => onChange({
              ...essayRules,
              competencia5: value
            })}
            max={100}
            step={5}
          />
        </div>
      </div>
    )
  }

  const baseRules = rules as BaseGradingRules
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Conteúdo ({baseRules.content}%)</Label>
        <Slider
          value={[baseRules.content]}
          onValueChange={([value]) => onChange({
            ...baseRules,
            content: value
          })}
          max={100}
          step={5}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Clareza ({baseRules.clarity}%)</Label>
        <Slider
          value={[baseRules.clarity]}
          onValueChange={([value]) => onChange({
            ...baseRules,
            clarity: value
          })}
          max={100}
          step={5}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Gramática ({baseRules.grammar}%)</Label>
        <Slider
          value={[baseRules.grammar]}
          onValueChange={([value]) => onChange({
            ...baseRules,
            grammar: value
          })}
          max={100}
          step={5}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Estrutura ({baseRules.structure}%)</Label>
        <Slider
          value={[baseRules.structure]}
          onValueChange={([value]) => onChange({
            ...baseRules,
            structure: value
          })}
          max={100}
          step={5}
        />
      </div>
    </div>
  )
} 