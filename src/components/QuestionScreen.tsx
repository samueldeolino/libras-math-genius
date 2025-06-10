import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Question } from "../pages/Index";
import UserHeader from "./UserHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuestionScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedAnswer: number) => void;
  userEmail: string;
  userName: string;
  correctAnswers: number;
  onLogout: () => void;
  userType?: 'aluno' | 'professor';
  onTeacherMode?: () => void;
}

const QuestionScreen = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  userEmail,
  userName,
  correctAnswers,
  onLogout,
  userType,
  onTeacherMode
}: QuestionScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionClick = (option: number) => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;

    setIsSubmitting(true);

    try {
      // Salvar a resposta no banco de dados
      const isCorrect = selectedOption === question.result;

      // Primeiro, buscar os valores atuais do usuário
      const { data: userData, error: fetchError } = await supabase
        .from('usuarios')
        .select('acertos, erros, questoes_resolvidas')
        .eq('email', userEmail)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar dados do usuário:', fetchError);
        toast.error('Erro ao buscar dados do usuário');
        return;
      }

      // Calcular os novos valores
      const newAcertos = (userData.acertos || 0) + (isCorrect ? 1 : 0);
      const newErros = (userData.erros || 0) + (!isCorrect ? 1 : 0);
      const newQuestoesResolvidas = (userData.questoes_resolvidas || 0) + 1;

      // Atualizar com os novos valores
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          acertos: newAcertos,
          erros: newErros,
          questoes_resolvidas: newQuestoesResolvidas
        })
        .eq('email', userEmail);

      if (updateError) {
        console.error('Erro ao salvar estatísticas:', updateError);
        toast.error('Erro ao salvar estatísticas');
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      onAnswer(selectedOption);
      setSelectedOption(null);
      setIsSubmitting(false);
    }
  };

  // Determinar quais números mostrar na legenda de LIBRAS
  const showLibrasLegend = questionNumber <= 7;
  const showNumbersWithLegend = questionNumber <= 4;
  
  // Determinar quais números incluir na legenda (1-19)
  const legendNumbers = Array.from({ length: 19 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <UserHeader 
        userName={userName} 
        questionNumber={questionNumber} 
        totalQuestions={totalQuestions} 
        onLogout={onLogout}
        isProfessor={userType === 'professor'}
        onTeacherMode={onTeacherMode}
        isTeacherMode={false}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progresso */}
        <div className="flex items-center justify-between mb-6">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
            <span className="font-medium text-green-600">{correctAnswers}</span>
            <span className="text-gray-500"> respostas corretas</span>
          </div>
        </div>

        {/* Questão */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Operação em LIBRAS */}
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-gray-700">
                  Qual é o resultado da operação?
                </h2>
                
                <div className="flex items-center justify-center space-x-6 text-5xl py-4">
                  <div className="flex flex-col items-center">
                    <span className="mb-2">{question.librasSigns.num1}</span>
                  </div>

                  <span className="text-3xl text-purple-600 font-bold">
                    {question.operationType === 'soma' && '+'}
                    {question.operationType === 'subtracao' && '-'}
                    {question.operationType === 'multiplicacao' && '×'}
                    {question.operationType === 'divisao' && '÷'}
                  </span>

                  <div className="flex flex-col items-center">
                    <span className="mb-2">{question.librasSigns.num2}</span>
                  </div>

                  <span className="text-3xl text-purple-600 font-bold">=</span>
                  
                  <span className="text-3xl bg-blue-100 text-blue-600 w-16 h-16 flex items-center justify-center rounded-full">?</span>
                </div>
              </div>

              {/* Opções de resposta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    variant={selectedOption === option ? "default" : "outline"}
                    className={`h-16 text-xl transition-all ${
                      selectedOption === option
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Botão de enviar */}
              <div className="pt-4 text-center">
                <Button
                  onClick={handleSubmit}
                  disabled={selectedOption === null || isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg w-full sm:w-auto"
                >
                  {isSubmitting ? "Enviando..." : "Confirmar Resposta"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legenda de LIBRAS */}
        {showLibrasLegend && (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-base font-medium text-gray-700 mb-3">
                Legenda: Sinais de LIBRAS
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {legendNumbers.map((num) => (
                  <div key={num} className="flex flex-col items-center">
                    <div className="text-2xl mb-1">{question.librasNumbers[num]}</div>
                    {showNumbersWithLegend && <div className="text-sm text-gray-700">{num}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuestionScreen;
