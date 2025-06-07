
import { useState } from "react";
import LoginForm from "../components/LoginForm";
import QuestionScreen from "../components/QuestionScreen";
import ResultsScreen from "../components/ResultsScreen";

export interface Question {
  id: number;
  operation: string;
  operationType: 'soma' | 'subtracao' | 'multiplicacao' | 'divisao';
  num1: number;
  num2: number;
  result: number;
  options: number[];
  librasSigns: { num1: string; num2: string };
  librasNumbers: { [key: number]: string };
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Sinais de LIBRAS para números (representação textual)
  const librasNumbers: { [key: number]: string } = {
    1: "👆", 2: "✌️", 3: "👌", 4: "🤟", 5: "🖐️",
    6: "🤙", 7: "👇", 8: "🤘", 9: "👊", 10: "✊",
    11: "👆👆", 12: "👆✌️", 13: "👆👌", 14: "👆🤟", 15: "👆🖐️",
    16: "👆🤙", 17: "👆👇", 18: "👆🤘", 19: "👆👊", 20: "✌️✊",
    21: "✌️👆", 22: "✌️✌️", 23: "✌️👌", 24: "✌️🤟", 25: "✌️🖐️"
  };

  // Gerar questões matemáticas
  const generateQuestions = (): Question[] => {
    const questions: Question[] = [];
    let id = 1;

    // 3 questões de soma
    const somaQuestions = [
      { num1: 5, num2: 3, result: 8 },
      { num1: 7, num2: 4, result: 11 },
      { num1: 6, num2: 9, result: 15 }
    ];

    // 3 questões de subtração
    const subtracaoQuestions = [
      { num1: 10, num2: 4, result: 6 },
      { num1: 15, num2: 7, result: 8 },
      { num1: 12, num2: 5, result: 7 }
    ];

    // 3 questões de multiplicação
    const multiplicacaoQuestions = [
      { num1: 3, num2: 4, result: 12 },
      { num1: 5, num2: 3, result: 15 },
      { num1: 2, num2: 8, result: 16 }
    ];

    // 3 questões de divisão
    const divisaoQuestions = [
      { num1: 20, num2: 4, result: 5 },
      { num1: 18, num2: 3, result: 6 },
      { num1: 24, num2: 4, result: 6 }
    ];

    // Criar questões de soma
    somaQuestions.forEach((q) => {
      questions.push({
        id: id++,
        operation: `${q.num1} + ${q.num2} = ?`,
        operationType: 'soma',
        num1: q.num1,
        num2: q.num2,
        result: q.result,
        options: generateOptions(q.result),
        librasSigns: {
          num1: librasNumbers[q.num1] || q.num1.toString(),
          num2: librasNumbers[q.num2] || q.num2.toString()
        },
        librasNumbers
      });
    });

    // Criar questões de subtração
    subtracaoQuestions.forEach((q) => {
      questions.push({
        id: id++,
        operation: `${q.num1} - ${q.num2} = ?`,
        operationType: 'subtracao',
        num1: q.num1,
        num2: q.num2,
        result: q.result,
        options: generateOptions(q.result),
        librasSigns: {
          num1: librasNumbers[q.num1] || q.num1.toString(),
          num2: librasNumbers[q.num2] || q.num2.toString()
        },
        librasNumbers
      });
    });

    // Criar questões de multiplicação
    multiplicacaoQuestions.forEach((q) => {
      questions.push({
        id: id++,
        operation: `${q.num1} × ${q.num2} = ?`,
        operationType: 'multiplicacao',
        num1: q.num1,
        num2: q.num2,
        result: q.result,
        options: generateOptions(q.result),
        librasSigns: {
          num1: librasNumbers[q.num1] || q.num1.toString(),
          num2: librasNumbers[q.num2] || q.num2.toString()
        },
        librasNumbers
      });
    });

    // Criar questões de divisão
    divisaoQuestions.forEach((q) => {
      questions.push({
        id: id++,
        operation: `${q.num1} ÷ ${q.num2} = ?`,
        operationType: 'divisao',
        num1: q.num1,
        num2: q.num2,
        result: q.result,
        options: generateOptions(q.result),
        librasSigns: {
          num1: librasNumbers[q.num1] || q.num1.toString(),
          num2: librasNumbers[q.num2] || q.num2.toString()
        },
        librasNumbers
      });
    });

    // Embaralhar questões
    return questions.sort(() => Math.random() - 0.5);
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

  const [questions] = useState<Question[]>(generateQuestions());

  const handleLogin = (email: string, nome: string) => {
    setCurrentUser(email);
    setUserName(nome);
    setIsLoggedIn(true);
  };

  const handleAnswer = (selectedAnswer: number) => {
    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.result) {
        correct++;
      }
    });
    return {
      correct,
      incorrect: questions.length - correct,
      total: questions.length
    };
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (showResults) {
    const results = calculateResults();
    return (
      <ResultsScreen
        results={results}
        userEmail={currentUser}
        userName={userName}
        onRestart={resetGame}
        questions={questions}
        userAnswers={userAnswers}
      />
    );
  }

  return (
    <QuestionScreen
      question={questions[currentQuestionIndex]}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={questions.length}
      onAnswer={handleAnswer}
      userEmail={currentUser}
      userName={userName}
    />
  );
};

export default Index;
