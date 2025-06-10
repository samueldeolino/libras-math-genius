
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Calculator, LogOut, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserHeaderProps {
  userName: string;
  questionNumber?: number;
  totalQuestions?: number;
  onLogout: () => void;
  isProfessor?: boolean;
  onTeacherMode?: () => void;
  isTeacherMode?: boolean;
}

const UserHeader = ({ 
  userName, 
  questionNumber, 
  totalQuestions, 
  onLogout,
  isProfessor,
  onTeacherMode,
  isTeacherMode
}: UserHeaderProps) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <Card className="bg-white/80 backdrop-blur-sm p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">{userName}</span>
            {isProfessor && (
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                Professor
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {questionNumber && totalQuestions && (
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Questão {questionNumber} de {totalQuestions}
                </span>
              </div>
            )}
            
            {isProfessor && onTeacherMode && (
              <Button
                onClick={onTeacherMode}
                variant="outline"
                size="sm"
                className={isTeacherMode ? "text-purple-600 border-purple-200 bg-purple-50" : "text-green-600 border-green-200 hover:bg-green-50"}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {isTeacherMode ? "Modo Aluno" : "Modo Professor"}
              </Button>
            )}
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserHeader;
