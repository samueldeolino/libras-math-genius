import { useState } from "react";
import React from "react";
import LoginForm from "../components/LoginForm";
import QuestionScreen from "../components/QuestionScreen";
import ResultsScreen from "../components/ResultsScreen";
import TeacherScreen from "../components/TeacherScreen";

export interface Question {
  id: number;
  operation: string;
  operationType: 'soma' | 'subtracao' | 'multiplicacao' | 'divisao';
  num1: number;
  num2: number;
  result: number;
  options: number[];
  librasSigns: { num1: React.ReactNode; num2: React.ReactNode };
  librasNumbers: { [key: number]: React.ReactNode };
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userType, setUserType] = useState<'aluno' | 'professor'>('aluno');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showTeacherScreen, setShowTeacherScreen] = useState(false);

  // Sinais de LIBRAS para números (representação por imagem)
  const imageClass = "h-[1.2em] w-[1.2em] inline-block align-middle";
  const librasNumbers: { [key: number]: React.ReactNode } = {
    0: <img src="/numero-0.jpg" alt="Número 0 em LIBRAS" className={imageClass} />,
    1: <img src="/numero-1.jpg" alt="Número 1 em LIBRAS" className={imageClass} />,
    2: <img src="/numero-2.jpg" alt="Número 2 em LIBRAS" className={imageClass} />,
    3: <img src="/numero-3.jpg" alt="Número 3 em LIBRAS" className={imageClass} />,
    4: <img src="/numero-4.jpg" alt="Número 4 em LIBRAS" className={imageClass} />,
    5: <img src="/numero-5.jpg" alt="Número 5 em LIBRAS" className={imageClass} />,
    6: <img src="/numero-6.jpg" alt="Número 6 em LIBRAS" className={imageClass} />,
    7: <img src="/numero-7.jpg" alt="Número 7 em LIBRAS" className={imageClass} />,
    8: <img src="/numero-8.jpg" alt="Número 8 em LIBRAS" className={imageClass} />,
    9: <img src="/numero-9.jpg" alt="Número 9 em LIBRAS" className={imageClass} />,
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

  const [questions, setQuestions] = useState<Question[]>(generateQuestions());

  const handleLogin = (email: string, nome: string, tipoUsuario: 'aluno' | 'professor') => {
    setCurrentUser(email);
    setUserName(nome);
    setUserType(tipoUsuario);
    setIsLoggedIn(true);
    
    // Verificar se é professor e mostrar tela de professor se for
    if (tipoUsuario === 'professor') {
      setShowTeacherScreen(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    setUserName("");
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setShowTeacherScreen(false);
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

  // Calcular acertos até agora
  const getCurrentCorrectAnswers = () => {
    let correct = 0;
    for (let i = 0; i < currentQuestionIndex; i++) {
      if (userAnswers[i] === questions[i].result) {
        correct++;
      }
    }
    return correct;
  };

  const handleQuestionsGenerated = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    setShowTeacherScreen(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const handleBackFromTeacher = () => {
    setShowTeacherScreen(false);
  };

  const toggleTeacherMode = () => {
    setShowTeacherScreen(!showTeacherScreen);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (showTeacherScreen) {
    return (
      <TeacherScreen
        onBack={handleBackFromTeacher}
        onQuestionsGenerated={handleQuestionsGenerated}
        userName={userName}
        onLogout={handleLogout}
      />
    );
  }

  if (showResults) {
    const results = calculateResults();
    return (
      <ResultsScreen
        results={results}
        userEmail={currentUser}
        userName={userName}
        onRestart={resetGame}
        onLogout={handleLogout}
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
      correctAnswers={getCurrentCorrectAnswers()}
      onLogout={handleLogout}
      userType={userType}
      onTeacherMode={userType === 'professor' ? toggleTeacherMode : undefined}
    />
  );
};

export default Index;