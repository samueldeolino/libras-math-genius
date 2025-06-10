
-- Criar enum para tipos de perfil
CREATE TYPE public.user_type AS ENUM ('aluno', 'professor');

-- Adicionar coluna tipo_usuario na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN tipo_usuario user_type DEFAULT 'aluno';

-- Atualizar usuários existentes para serem alunos por padrão
UPDATE public.usuarios 
SET tipo_usuario = 'aluno' 
WHERE tipo_usuario IS NULL;

-- Tornar a coluna não nula
ALTER TABLE public.usuarios 
ALTER COLUMN tipo_usuario SET NOT NULL;
