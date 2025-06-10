
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, X, Divide, ArrowLeft, RefreshCw } from "lucide-react";
import { Question } from "../pages/Index";
import UserHeader from "./UserHeader";

interface TeacherScreenProps {
  onBack: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
  userName?: string;
  onLogout?: () => void;
}

interface OperationRange {
  min: number;
  max: number;
}

interface OperationRanges {
  soma: OperationRange;
  subtracao: OperationRange;
  multiplicacao: OperationRange;
  divisao: OperationRange;
}

const TeacherScreen = ({ onBack, onQuestionsGenerated, userName, onLogout }: TeacherScreenProps) => {
  const [ranges, setRanges] = useState<OperationRanges>({
    soma: { min: 1, max: 20 },
    subtracao: { min: 1, max: 20 },
    multiplicacao: { min: 1, max: 10 },
    divisao: { min: 2, max: 20 }
  });

  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sinais de LIBRAS para números
  const librasNumbers: { [key: number]: string } = {
    1: "👆", 2: "✌️", 3: "👌", 4: "🤟", 5: "🖐️",
    6: "🤙", 7: "👇", 8: "🤘", 9: "👊", 10: "✊",
    11: "👆👆", 12: "👆✌️", 13: "👆👌", 14: "👆🤟", 15: "👆🖐️",
    16: "👆🤙", 17: "👆👇", 18: "👆🤘", 19: "👆👊", 20: "✌️✊",
    21: "✌️👆", 22: "✌️✌️", 23: "✌️👌", 24: "✌️🤟", 25: "✌️🖐️"
  };

  const updateRange = (operation: keyof OperationRanges, field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setRanges(prev => ({
      ...prev,
      [operation]: {
        ...prev[operation],
        [field]: numValue
      }
    }));
  };

  const generateRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateOptions = (correctAnswer: number): number[] => {
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomOption = correctAnswer + Math.floor(Math.random() * 10) - 5;
      if (randomOption > 0 && !options.includes(randomOption)) {
        options.push(randomOption);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  const generateQuestions = () => {
    setIsGenerating(true);
    const questions: Question[] = [];
    let id = 1;

    // Gerar 3 questões para cada operação
    const operations = [
      { type: 'soma' as const, symbol: '+', range: ranges.soma },
      { type: 'subtracao' as const, symbol: '-', range: ranges.subtracao },
      { type: 'multiplicacao' as const, symbol: '×', range: ranges.multiplicacao },
      { type: 'divisao' as const, symbol: '÷', range: ranges.divisao }
    ];

    operations.forEach(({ type, symbol, range }) => {
      for (let i = 0; i < 3; i++) {
        let num1, num2, result;
        
        if (type === 'divisao') {
          // Para divisão, gerar primeiro o resultado e depois o dividendo
          result = generateRandomNumber(range.min, range.max);
          num2 = generateRandomNumber(2, Math.min(10, range.max));
          num1 = result * num2;
        } else if (type === 'subtracao') {
          // Para subtração, garantir que o resultado seja positivo
          num2 = generateRandomNumber(range.min, range.max);
          const minNum1 = num2 + 1;
          num1 = generateRandomNumber(minNum1, Math.max(minNum1, range.max));
          result = num1 - num2;
        } else {
          num1 = generateRandomNumber(range.min, range.max);
          num2 = generateRandomNumber(range.min, range.max);
          
          if (type === 'soma') {
            result = num1 + num2;
          } else if (type === 'multiplicacao') {
            result = num1 * num2;
          }
        }

        questions.push({
          id: id++,
          operation: `${num1} ${symbol} ${num2} = ?`,
          operationType: type,
          num1,
          num2,
          result: result!,
          options: generateOptions(result!),
          librasSigns: {
            num1: librasNumbers[num1] || num1.toString(),
            num2: librasNumbers[num2] || num2.toString()
          },
          librasNumbers
        });
      }
    });

    // Embaralhar questões
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    setGeneratedQuestions(shuffledQuestions);
    setIsGenerating(false);
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'soma': return <Plus className="h-5 w-5" />;
      case 'subtracao': return <Minus className="h-5 w-5" />;
      case 'multiplicacao': return <X className="h-5 w-5" />;
      case 'divisao': return <Divide className="h-5 w-5" />;
      default: return null;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'soma': return 'from-green-400 to-green-600';
      case 'subtracao': return 'from-red-400 to-red-600';
      case 'multiplicacao': return 'from-blue-400 to-blue-600';
      case 'divisao': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getOperationName = (operation: string) => {
    switch (operation) {
      case 'soma': return 'Soma';
      case 'subtracao': return 'Subtração';
      case 'multiplicacao': return 'Multiplicação';
      case 'divisao': return 'Divisão';
      default: return 'Operação';
    }
  };

  const useGeneratedQuestions = () => {
    onQuestionsGenerated(generatedQuestions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      {userName && onLogout ? (
        <UserHeader 
          userName={userName}
          onLogout={onLogout} 
          isProfessor={true}
          onTeacherMode={onBack}
          isTeacherMode={true}
        />
      ) : (
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="bg-white/80 backdrop-blur-sm p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <h1 className="text-xl font-bold text-gray-800">
                  🎓 Painel do Professor - Elaboração de Questões
                </h1>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Configuração dos Intervalos */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              📊 Configurar Intervalos das Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(ranges).map(([operation, range]) => (
                <div key={operation} className="space-y-4">
                  <div className={`flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r ${getOperationColor(operation)} text-white`}>
                    {getOperationIcon(operation)}
                    <h3 className="text-lg font-semibold">
                      {getOperationName(operation)}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor={`${operation}-min`} className="text-sm font-medium text-gray-700">
                        Mínimo
                      </Label>
                      <Input
                        id={`${operation}-min`}
                        type="number"
                        value={range.min}
                        onChange={(e) => updateRange(operation as keyof OperationRanges, 'min', e.target.value)}
                        className="mt-1"
                        min="1"
                      />
                    </div>
                    
                    <div className="text-lg font-semibold text-gray-500 pt-6">à</div>
                    
                    <div className="flex-1">
                      <Label htmlFor={`${operation}-max`} className="text-sm font-medium text-gray-700">
                        Máximo
                      </Label>
                      <Input
                        id={`${operation}-max`}
                        type="number"
                        value={range.max}
                        onChange={(e) => updateRange(operation as keyof OperationRanges, 'max', e.target.value)}
                        className="mt-1"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={generateQuestions}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    🎯 Gerar Questões
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questões Geradas */}
        {generatedQuestions.length > 0 && (
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-gray-800">
                  📝 Questões Geradas ({generatedQuestions.length})
                </CardTitle>
                <Button
                  onClick={useGeneratedQuestions}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  ✅ Usar Estas Questões
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedQuestions.map((question, index) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getOperationColor(question.operationType)} text-white text-sm font-medium mb-2`}>
                      {getOperationName(question.operationType)}
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      {question.num1} {question.operation.includes('+') ? '+' : question.operation.includes('-') ? '-' : question.operation.includes('×') ? '×' : '÷'} {question.num2} = ?
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Resposta:</strong> {question.result}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Opções:</strong> {question.options.join(', ')}
                    </div>
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

export default TeacherScreen;
