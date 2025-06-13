import { useState, useEffect } from "react";
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
  const [questions, setQuestions] = useState<Question[]>([]);

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

  const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const isLibras = (n: number) => n >= 0 && n <= 9;
  const shuffleArray = (array: any[]) => array.sort(() => Math.random() - 0.5);

  const generateOptions = (correctAnswer: number, neededLibrasOptions: number): number[] => {
    const incorrectOptions = new Set<number>();
    const librasPool = Array.from({ length: 10 }, (_, i) => i).filter(n => n !== correctAnswer);
    const nonLibrasPool = Array.from({ length: 41 }, (_, i) => i + 10).filter(n => n !== correctAnswer);

    shuffleArray(librasPool);
    shuffleArray(nonLibrasPool);

    // Adiciona opções com LIBRAS
    for (let i = 0; i < neededLibrasOptions; i++) {
        if (librasPool.length > 0) incorrectOptions.add(librasPool.pop()!);
    }
    
    // Completa com opções sem LIBRAS
    while (incorrectOptions.size < 3) {
        if (nonLibrasPool.length > 0) incorrectOptions.add(nonLibrasPool.pop()!);
        else { // Fallback caso o pool se esgote
            incorrectOptions.add(getRandomInt(51, 100));
        }
    }
    
    const finalOptions = [correctAnswer, ...Array.from(incorrectOptions)];
    return shuffleArray(finalOptions);
  };

  const createQuestion = (id: number, opType: Question['operationType'], totalLibras: number): Question => {
      while (true) {
        let num1 = 0, num2 = 0, result = 0, operationSymbol = '';

        // Gera números baseados na operação
        switch (opType) {
            case 'soma':
                num1 = getRandomInt(1, 25);
                num2 = getRandomInt(1, 25);
                result = num1 + num2;
                operationSymbol = '+';
                break;
            case 'subtracao':
                num2 = getRandomInt(1, 25);
                num1 = getRandomInt(num2 + 1, 50);
                result = num1 - num2;
                operationSymbol = '-';
                break;
            case 'multiplicacao':
                num1 = getRandomInt(1, 10);
                num2 = getRandomInt(1, 10);
                result = num1 * num2;
                operationSymbol = '×';
                break;
            case 'divisao':
                num2 = getRandomInt(2, 10);
                result = getRandomInt(2, 10);
                num1 = num2 * result;
                operationSymbol = '÷';
                break;
        }

        const uniqueNumbersInProblem = new Set([num1, num2, result]);
        const librasInProblem = Array.from(uniqueNumbersInProblem).filter(isLibras);
        const neededLibrasInOptions = totalLibras - librasInProblem.length;

        if (neededLibrasInOptions >= 0 && neededLibrasInOptions <= 3) {
            const options = generateOptions(result, neededLibrasInOptions);
            return {
                id,
                operation: `${num1} ${operationSymbol} ${num2} = ?`,
                operationType: opType,
                num1, num2, result, options,
                librasSigns: {
                    num1: librasNumbers[num1] || num1.toString(),
                    num2: librasNumbers[num2] || num2.toString(),
                },
                librasNumbers
            };
        }
      }
  };

  const generateQuestions = (): Question[] => {
    const newQuestions: Question[] = [];
    const operations: Question['operationType'][] = ['soma', 'subtracao', 'multiplicacao', 'divisao'];
    
    // Nível Fácil: 4 questões com 3 sinais de LIBRAS
    for (let i = 0; i < 4; i++) {
        newQuestions.push(createQuestion(i + 1, operations[i], 3));
    }
    // Nível Médio: 4 questões com 4 sinais de LIBRAS
    for (let i = 0; i < 4; i++) {
        newQuestions.push(createQuestion(i + 5, operations[i], 4));
    }
    // Nível Difícil: 4 questões com 5 sinais de LIBRAS
    for (let i = 0; i < 4; i++) {
        newQuestions.push(createQuestion(i + 9, operations[i], 5));
    }
    
    return shuffleArray(newQuestions);
  };

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);


  const handleLogin = (email: string, nome: string, tipoUsuario: 'aluno' | 'professor') => {
    setCurrentUser(email);
    setUserName(nome);
    setUserType(tipoUsuario);
    setIsLoggedIn(true);
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
    setQuestions(generateQuestions());
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
    setQuestions(generateQuestions());
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

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

  if (questions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Gerando novo quiz com níveis de dificuldade...</p>
        </div>
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