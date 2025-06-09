
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Question } from "../pages/Index";
import UserHeader from "./UserHeader";

interface QuestionScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: number) => void;
  userEmail: string;
  userName: string;
  correctAnswers: number;
  onLogout: () => void;
}

const QuestionScreen = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  userEmail,
  userName,
  correctAnswers,
  onLogout
}: QuestionScreenProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const getOperationSymbol = (type: string) => {
    switch (type) {
      case 'soma': return '+';
      case 'subtracao': return '-';
      case 'multiplicacao': return '×';
      case 'divisao': return '÷';
      default: return '+';
    }
  };

  const getOperationName = (type: string) => {
    switch (type) {
      case 'soma': return 'Soma';
      case 'subtracao': return 'Subtração';
      case 'multiplicacao': return 'Multiplicação';
      case 'divisao': return 'Divisão';
      default: return 'Operação';
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'soma': return 'from-green-400 to-green-600';
      case 'subtracao': return 'from-red-400 to-red-600';
      case 'multiplicacao': return 'from-blue-400 to-blue-600';
      case 'divisao': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const handleAnswerClick = (answer: number) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1500);
  };

  const progress = (questionNumber / totalQuestions) * 100;

  // Determinar o tipo de legenda baseado no número da questão
  const getLegendType = () => {
    if (questionNumber <= 4) return 'full'; // apenas LIBRAS (sem números)
    if (questionNumber <= 8) return 'libras'; // apenas LIBRAS (1-19)
    return 'none'; // sem legenda
  };

  // Calcular probabilidade de mostrar LIBRAS baseado nos acertos
  const getLibrasProbability = () => {
    const baseProb = 0.3;
    const maxProb = 0.8;
    const progressFactor = correctAnswers / (questionNumber - 1 || 1);
    return Math.min(maxProb, baseProb + (progressFactor * 0.5));
  };

  const shouldShowAsLibras = (index: number) => {
    const probability = getLibrasProbability();
    return (index * 0.123456 + correctAnswers * 0.789) % 1 < probability;
  };

  // Criar legenda com base no tipo
  const createLegend = () => {
    const legendType = getLegendType();
    if (legendType === 'none') return null;

    let numbersToShow = [];
    
    if (legendType === 'full') {
      // Para legenda completa, mostrar apenas números relevantes (sem os números escritos)
      const relevantNumbers = new Set([
        question.num1,
        question.num2,
        question.result,
        ...question.options
      ]);
      numbersToShow = Array.from(relevantNumbers).sort((a, b) => a - b).slice(0, 15);
    } else if (legendType === 'libras') {
      // Para legenda apenas LIBRAS, mostrar números de 1 a 19
      numbersToShow = Array.from({ length: 19 }, (_, i) => i + 1);
    }

    return (
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
          {legendType === 'full' ? '📚 Legenda: Sinais LIBRAS' : '📚 Legenda: Sinais LIBRAS (1-19)'}
        </h3>
        <div className={`grid gap-4 ${legendType === 'libras' ? 'grid-cols-4 md:grid-cols-7' : 'grid-cols-3 md:grid-cols-5'}`}>
          {numbersToShow.map((num) => (
            <div key={num} className="text-center bg-white rounded-lg p-3 shadow-sm">
              <div className="text-3xl mb-2">
                {question.librasNumbers[num] || num.toString()}
              </div>
              {legendType === 'libras' && (
                <div className="text-sm text-gray-500">
                  {num}
                </div>
              )}
            </div>
          ))}
        </div>
        {legendType === 'libras' && (
          <div className="mt-4 text-center text-sm text-blue-600">
            💡 Memorize a posição dos sinais para facilitar a aprendizagem
          </div>
        )}
        {legendType === 'full' && (
          <div className="mt-4 text-center text-sm text-blue-600">
            💡 Use os sinais LIBRAS acima para resolver a operação
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <UserHeader 
        userName={userName}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onLogout={onLogout}
      />

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progresso</span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getOperationColor(question.operationType)} text-white font-medium mb-4`}>
              {getOperationName(question.operationType)}
            </div>
            <CardTitle className="text-2xl text-gray-800 mb-6">
              Resolva a operação matemática
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Legenda */}
            {createLegend()}

            {/* Operação "armada" com LIBRAS misturado */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8">
              <div className="text-center space-y-6">
                <div className="text-4xl font-mono font-bold text-gray-800">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {shouldShowAsLibras(0) ? question.librasSigns.num1 : question.num1}
                      </div>
                    </div>
                    <div className="text-5xl text-purple-600 font-bold">
                      {getOperationSymbol(question.operationType)}
                    </div>
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {shouldShowAsLibras(1) ? question.librasSigns.num2 : question.num2}
                      </div>
                    </div>
                    <div className="text-5xl text-purple-600 font-bold">=</div>
                    <div className="text-5xl text-purple-600 font-bold">?</div>
                  </div>
                </div>
                <div className="text-lg text-gray-600">
                  {getLegendType() !== 'none' && (
                    <div className="mb-2 text-blue-600 font-medium">
                      💡 Use a legenda acima para identificar os sinais LIBRAS
                    </div>
                  )}
                  {correctAnswers > 3 && (
                    <div className="mb-2 text-green-600 font-medium">
                      🎉 Nível {Math.floor(correctAnswers / 3)}: Mais sinais LIBRAS aparecem!
                    </div>
                  )}
                  Resolva a operação acima
                </div>
              </div>
            </div>

            {/* Opções de resposta misturando LIBRAS e números */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
                Escolha a resposta correta:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, index) => {
                  const showAsLibras = shouldShowAsLibras(index + 2);
                  const librasSign = question.librasNumbers[option] || option.toString();
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => handleAnswerClick(option)}
                      disabled={showFeedback}
                      className={`h-20 text-xl font-semibold transition-all duration-200 ${
                        showFeedback
                          ? selectedAnswer === option
                            ? option === question.result
                              ? 'bg-green-500 hover:bg-green-500 text-white'
                              : 'bg-red-500 hover:bg-red-500 text-white'
                            : option === question.result
                            ? 'bg-green-500 hover:bg-green-500 text-white'
                            : 'bg-gray-300 hover:bg-gray-300 text-gray-500'
                          : selectedAnswer === option
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-200 hover:border-purple-300'
                      }`}
                      variant={showFeedback ? "default" : selectedAnswer === option ? "default" : "outline"}
                    >
                      <div className="flex items-center justify-center">
                        <div className="text-4xl">
                          {showAsLibras ? librasSign : option}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className="text-center p-4">
                {selectedAnswer === question.result ? (
                  <div className="text-green-600 text-lg font-semibold">
                    🎉 Correto! Muito bem!
                  </div>
                ) : (
                  <div className="text-red-600 text-lg font-semibold">
                    ❌ Resposta incorreta. A resposta correta é {question.result}.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionScreen;
