
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onLogin: (email: string, nome: string, tipoUsuario: 'aluno' | 'professor') => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<'aluno' | 'professor'>('aluno');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!isLogin && !nome) {
      setError("Por favor, preencha o nome");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um email válido");
      return;
    }

    if (password.length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres");
      return;
    }

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setError("Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.");
            return;
          }
          setError("Email ou senha incorretos");
          return;
        }

        // Verificar se o email foi confirmado
        if (!data.user?.email_confirmed_at) {
          setError("Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.");
          // Fazer logout do usuário
          await supabase.auth.signOut();
          return;
        }

        // Buscar dados do usuário na tabela usuarios
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome, tipo_usuario')
          .eq('email', email)
          .single();

        if (userError) {
          setError("Erro ao buscar dados do usuário");
          return;
        }

        onLogin(email, userData.nome, userData.tipo_usuario);
      } else {
        // Cadastro com redirecionamento correto
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          setError("Erro ao criar conta: " + error.message);
          return;
        }

        // Criar registro na tabela usuarios
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              nome,
              email,
              acertos: 0,
              erros: 0,
              questoes_resolvidas: 0,
              tipo_usuario: tipoUsuario
            }
          ]);

        if (insertError) {
          setError("Erro ao salvar dados do usuário");
          return;
        }

        // Mostrar mensagem de confirmação de email
        setShowEmailConfirmation(true);
        setError("");
      }
    } catch (err) {
      setError("Erro interno. Tente novamente.");
    }
  };

  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                <Calculator className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Confirme seu Email
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enviamos um link de confirmação para seu email
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 text-sm">
                ✉️ Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
              </p>
            </div>
            
            <p className="text-gray-600 text-sm">
              Após confirmar seu email, você poderá fazer login no sistema.
            </p>

            <Button 
              onClick={() => {
                setShowEmailConfirmation(false);
                setIsLogin(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LIBRAS + Matemática
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sistema de ensino de matemática com sinais de LIBRAS
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoUsuario" className="text-sm font-medium text-gray-700">
                    Tipo de Usuário
                  </Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoUsuario"
                        value="aluno"
                        checked={tipoUsuario === 'aluno'}
                        onChange={() => setTipoUsuario('aluno')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-700">Aluno</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoUsuario"
                        value="professor"
                        checked={tipoUsuario === 'professor'}
                        onChange={() => setTipoUsuario('professor')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-700">Professor</span>
                    </label>
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
            >
              {isLogin ? "Entrar no Sistema" : "Criar Conta"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🤟 Aprenda matemática de forma inclusiva! 🤟</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
