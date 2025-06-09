
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw, CheckCircle, XCircle, Target } from "lucide-react";
import { Question } from "../pages/Index";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "./UserHeader";

interface ResultsScreenProps {
  results: {
    correct: number;
    incorrect: number;
    total: number;
  };
  userEmail: string;
  userName: string;
  onRestart: () => void;
  onLogout: () => void;
  questions: Question[];
  userAnswers: number[];
}

const ResultsScreen = ({ results, userEmail, userName, onRestart, onLogout, questions, userAnswers }: ResultsScreenProps) => {
  const percentage = Math.round((results.correct / results.total) * 100);
  
  useEffect(() => {
    // Salvar resultados no banco de dados
    const saveResults = async () => {
      try {
        // Primeiro, verificar se o usuário já existe
        const { data: existingUser, error: fetchError } = await supabase
          .from('usuarios')
          .select('acertos, erros, questoes_resolvidas')
          .eq('email', userEmail)
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao buscar dados do usuário:', fetchError);
          return;
        }

        if (existingUser) {
          // Usuário existe, atualizar dados
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({
              acertos: existingUser.acertos + results.correct,
              erros: existingUser.erros + results.incorrect,
              questoes_resolvidas: existingUser.questoes_resolvidas + results.total,
              updated_at: new Date().toISOString()
            })
            .eq('email', userEmail);

          if (updateError) {
            console.error('Erro ao atualizar resultados:', updateError);
          } else {
            console.log('Resultados atualizados com sucesso!');
          }
        } else {
          // Usuário não existe, criar novo registro
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert({
              email: userEmail,
              nome: userName,
              acertos: results.correct,
              erros: results.incorrect,
              questoes_resolvidas: results.total
            });

          if (insertError) {
            console.error('Erro ao criar novo usuário:', insertError);
          } else {
            console.log('Novo usuário criado com sucesso!');
          }
        }
      } catch (error) {
        console.error('Erro ao salvar no banco:', error);
      }
    };

    saveResults();
  }, [results, userEmail, userName]);
  
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: "Excelente!", color: "bg-green-500", emoji: "🏆" };
    if (percentage >= 70) return { level: "Muito Bom!", color: "bg-blue-500", emoji: "🎉" };
    if (percentage >= 50) return { level: "Bom!", color: "bg-yellow-500", emoji: "👏" };
    return { level: "Continue Praticando!", color: "bg-red-500", emoji: "💪" };
  };

  const performance = getPerformanceLevel(percentage);

  const getOperationName = (type: string) => {
    switch (type) {
      case 'soma': return 'Soma';
      case 'subtracao': return 'Subtração';
      case 'multiplicacao': return 'Multiplicação';
      case 'divisao': return 'Divisão';
      default: return 'Operação';
    }
  };

  const getOperationSymbol = (type: string) => {
    switch (type) {
      case 'soma': return '+';
      case 'subtracao': return '-';
      case 'multiplicacao': return '×';
      case 'divisao': return '÷';
      default: return '+';
    }
  };

  // Filtrar apenas as questões que o usuário errou
  const wrongAnswers = questions.filter((question, index) => userAnswers[index] !== question.result);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <UserHeader 
        userName={userName}
        onLogout={onLogout}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultado Principal */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-6 rounded-full ${performance.color} text-white`}>
                <Trophy className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              {performance.emoji} {performance.level}
            </CardTitle>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {percentage}%
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{results.correct}</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{results.incorrect}</div>
                <div className="text-sm text-gray-600">Erros</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Botão de Reiniciar */}
            <div className="text-center">
              <Button
                onClick={onRestart}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 px-8 text-lg"
                size="lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Fazer Novo Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo das Questões Erradas */}
        {wrongAnswers.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600" />
                Questões que Você Errou - Vamos Revisar!
              </CardTitle>
              <p className="text-sm text-gray-600">
                Revise estas questões para melhorar seu desempenho
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wrongAnswers.map((question, wrongIndex) => {
                  const originalIndex = questions.findIndex(q => q.id === question.id);
                  const userAnswer = userAnswers[originalIndex];
                  
                  return (
                    <div
                      key={question.id}
                      className="p-4 rounded-lg border-2 bg-red-50 border-red-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="destructive">
                          {getOperationName(question.operationType)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Questão {originalIndex + 1}
                        </span>
                      </div>
                      
                      {/* Operação */}
                      <div className="bg-white rounded-lg p-4 mb-3">
                        <div className="text-center text-2xl font-mono font-bold text-gray-800">
                          {question.num1} {getOperationSymbol(question.operationType)} {question.num2} = ?
                        </div>
                      </div>
                      
                      {/* Respostas */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-600 font-semibold">
                          ❌ Sua resposta: {userAnswer}
                        </span>
                        <span className="text-green-600 font-semibold">
                          ✅ Resposta correta: {question.result}
                        </span>
                      </div>
                      
                      {/* Explicação */}
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        💡 <strong>Explicação:</strong> {question.num1} {getOperationSymbol(question.operationType)} {question.num2} = {question.result}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalhamento Completo das Respostas */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Detalhamento Completo das Respostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions.map((question, index) => {
                const isCorrect = userAnswers[index] === question.result;
                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {getOperationName(question.operationType)}
                        </Badge>
                        <span className="font-mono text-lg">
                          {question.num1} {getOperationSymbol(question.operationType)} {question.num2} = ?
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="text-sm text-gray-600">
                          Sua resposta: <span className="font-semibold">{userAnswers[index]}</span>
                          {!isCorrect && (
                            <span className="text-green-600 ml-2">
                              (Correto: {question.result})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsScreen;
