-- Tabela para armazenar análises gramaticais
CREATE TABLE IF NOT EXISTS grammar_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correction_id UUID NOT NULL REFERENCES corrections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar análises temáticas
CREATE TABLE IF NOT EXISTS theme_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correction_id UUID NOT NULL REFERENCES corrections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar avaliações técnicas
CREATE TABLE IF NOT EXISTS technical_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correction_id UUID NOT NULL REFERENCES corrections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  evaluation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar feedbacks detalhados
CREATE TABLE IF NOT EXISTS detailed_feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correction_id UUID NOT NULL REFERENCES corrections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  feedback_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar sínteses finais
CREATE TABLE IF NOT EXISTS final_syntheses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correction_id UUID NOT NULL REFERENCES corrections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  synthesis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_grammar_analyses_correction_id ON grammar_analyses(correction_id);
CREATE INDEX IF NOT EXISTS idx_theme_analyses_correction_id ON theme_analyses(correction_id);
CREATE INDEX IF NOT EXISTS idx_technical_evaluations_correction_id ON technical_evaluations(correction_id);
CREATE INDEX IF NOT EXISTS idx_detailed_feedbacks_correction_id ON detailed_feedbacks(correction_id);
CREATE INDEX IF NOT EXISTS idx_final_syntheses_correction_id ON final_syntheses(correction_id);

-- Triggers para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grammar_analyses_updated_at
BEFORE UPDATE ON grammar_analyses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theme_analyses_updated_at
BEFORE UPDATE ON theme_analyses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technical_evaluations_updated_at
BEFORE UPDATE ON technical_evaluations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detailed_feedbacks_updated_at
BEFORE UPDATE ON detailed_feedbacks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_final_syntheses_updated_at
BEFORE UPDATE ON final_syntheses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 