'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle,
  LayoutGrid,
  X,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

interface Test {
  id: number;
  title: string;
  subject: string;
  time_limit: number;
}

export default function AttemptEngine({ 
  test, 
  initialQuestions 
}: { 
  test: Test; 
  initialQuestions: Question[] 
}) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test.time_limit * 60);
  
  const questions = initialQuestions;
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Countdown Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleOptionSelect = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    });
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Calculate Score
      let correctCount = 0;
      const detailedResults = questions.map(q => {
        const userAnswer = (answers[q.id] || '').trim().toLowerCase();
        const correctAnswer = (q.correct_answer || '').trim().toLowerCase();
        const isCorrect = userAnswer === correctAnswer && userAnswer !== '';
        
        if (isCorrect) correctCount++;
        
        const qText = q.question_text || (q as any).question || (q as any).content || "Question text not found";

        return {
          questionId: q.id,
          questionText: qText,
          userAnswer,
          correctAnswer: q.correct_answer,
          isCorrect,
          explanation: q.explanation,
          options: {
            A: q.option_a,
            B: q.option_b,
            C: q.option_c,
            D: q.option_d
          }
        };
      });

      const percentage = Math.round((correctCount / totalQuestions) * 100);

      // 2. Save to Database via API
      const response = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test.id,
          score: correctCount,
          total: totalQuestions,
          percentage: percentage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save results to database');
      }

      // 3. Store in localStorage for the Result page
      const resultData = {
        testId: test.id,
        testTitle: test.title,
        score: correctCount,
        total: totalQuestions,
        percentage,
        results: detailedResults,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`test_result_${test.id}`, JSON.stringify(resultData));

      // 4. Navigate
      router.push(`/mock-tests/${test.id}/result`);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to save your results. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const isOptionSelected = currentQuestion ? !!answers[currentQuestion.id] : false;

  if (totalQuestions === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">No Questions Found</h2>
        <p className="text-slate-500 max-w-md mb-8 font-medium">
          This test doesn't have any questions yet. Please contact support or try another test.
        </p>
        <button 
          onClick={() => router.back()}
          className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-black text-slate-800 leading-tight truncate max-w-[200px] md:max-w-md">
              {test.title}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {test.subject} • Assessment Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold">
            <Clock size={18} className={`${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
            <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-400' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 z-10">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 w-full p-6 md:p-12">
        <div className="flex flex-col md:flex-row gap-12 items-start h-full">
          {/* Question Navigator (Sidebar on Desktop) */}
          <aside className="w-full md:w-96 shrink-0 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hidden lg:block sticky top-28">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Question Palette</h3>
              <LayoutGrid size={20} className="text-slate-300" />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {questions.map((_, i) => {
                const isAnswered = !!answers[questions[i].id];
                const isCurrent = currentIdx === i;
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-base font-black transition-all
                      ${isCurrent 
                        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-400 scale-110 ring-4 ring-blue-50' 
                        : isAnswered 
                          ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' 
                          : 'bg-slate-50 text-slate-400 border-2 border-slate-50 hover:border-slate-200'
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-12 pt-8 border-t border-slate-50 space-y-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Answered</span>
                  </div>
                  <span className="text-emerald-600 font-black">{answeredCount}</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span>Remaining</span>
                  </div>
                  <span className="text-slate-400 font-black">{unansweredCount}</span>
               </div>
            </div>
          </aside>

          {/* Question Content */}
          <div className="flex-1 w-full bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <span className="px-5 py-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full border border-blue-100">
                  Assessment Question {currentIdx + 1} / {totalQuestions}
                </span>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <HelpCircle size={18} />
                  Multiple Choice
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {currentQuestion.question_text || (currentQuestion as any).question || (currentQuestion as any).content || "Question text not found"}
              </h2>
            </div>

            {/* Options */}
            <div className="grid gap-5 mb-16">
              {[
                { id: 'A', text: currentQuestion.option_a },
                { id: 'B', text: currentQuestion.option_b },
                { id: 'C', text: currentQuestion.option_c },
                { id: 'D', text: currentQuestion.option_d },
              ].map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`group flex items-center w-full p-7 md:p-8 rounded-[2rem] border-2 transition-all duration-300 text-left
                      ${isSelected 
                        ? 'border-blue-600 bg-blue-50/40 text-blue-800 shadow-2xl shadow-blue-500/10' 
                        : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50/50 text-slate-700'
                      }`}
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 mr-8 font-black text-lg transition-all duration-500
                      ${isSelected 
                        ? 'border-blue-600 bg-blue-600 text-white scale-110 shadow-xl shadow-blue-400' 
                        : 'border-slate-200 bg-white group-hover:border-slate-300'
                      }`}
                    >
                      {option.id}
                    </div>
                    <span className={`text-xl md:text-2xl font-bold transition-colors ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-6 pt-10 border-t border-slate-50">
              <button 
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-700 font-black rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronLeft size={24} />
                Previous
              </button>

              {currentIdx === totalQuestions - 1 ? (
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex-1 max-w-md flex items-center justify-center gap-3 px-10 py-6 bg-emerald-600 text-white font-black text-xl rounded-[2rem] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none active:scale-95"
                >
                  <CheckCircle2 size={24} />
                  Submit Assessment
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  disabled={!isOptionSelected}
                  className="flex-1 max-w-md flex items-center justify-center gap-3 px-10 py-6 bg-blue-600 text-white font-black text-xl rounded-[2rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-400 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none active:scale-95"
                >
                  Save & Next Question
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Final Submission</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                You are about to complete the assessment. Please review your stats before submitting.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-6 bg-slate-50 rounded-[2rem] text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Answered</span>
                <span className="text-3xl font-black text-slate-900">{answeredCount}</span>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unanswered</span>
                <span className={`text-3xl font-black ${unansweredCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {unansweredCount}
                </span>
              </div>
            </div>

            {unansweredCount > 0 ? (
              <div className="p-6 bg-amber-50 rounded-[2rem] mb-10 border border-amber-100 flex items-start gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-sm font-bold text-amber-700 leading-relaxed">
                  You have {unansweredCount} unanswered questions. We recommend answering all questions for a complete performance analysis.
                </p>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-[2rem] mb-10 border border-emerald-100 flex items-start gap-4">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                <p className="text-sm font-bold text-emerald-700 leading-relaxed">
                  Great job! You have answered all questions. Ready to see your results?
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSubmit}
                disabled={unansweredCount > 0 || isSubmitting}
                className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving Results...
                  </>
                ) : (
                  <>
                    Submit and View Results
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-5 bg-white text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Review My Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
