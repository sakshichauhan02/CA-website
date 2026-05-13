'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Send, 
  Info, 
  CheckCircle2, 
  XCircle, 
  BarChart, 
  RefreshCw,
  Home,
  Sparkles
} from 'lucide-react';
import '@/components/MockTests.css';
import Link from 'next/link';

const questions = [
  {
    id: 1,
    text: "Which of the following is not a characteristic of a company?",
    options: [
      "Separate legal entity",
      "Perpetual succession",
      "Limited liability",
      "Mutual agency"
    ],
    correct: 3
  },
  {
    id: 2,
    text: "As per AS-1, which of the following is not a fundamental accounting assumption?",
    options: [
      "Going concern",
      "Consistency",
      "Accrual",
      "Materiality"
    ],
    correct: 3
  },
  {
    id: 3,
    text: "The maximum number of partners in a banking partnership firm as per Companies Act 2013 is:",
    options: [
      "10",
      "20",
      "50",
      "100"
    ],
    correct: 2
  }
];

export default function TestEnginePage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQ]: optionIdx });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });
    return score;
  };

  if (isSubmitted) {
    const score = calculateScore();
    const accuracy = Math.round((score / questions.length) * 100);
    
    return (
      <div className="engine-container">
        <div className="result-card reveal-anim">
          <Sparkles className="text-blue-600 mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-black text-slate-900 mb-2">Test Completed!</h1>
          <p className="text-slate-500 mb-8 font-medium">Here is your performance breakdown for CA Inter Accounts Mock.</p>

          <div className="score-circle">
            <span className="text-5xl font-black text-blue-600">{score}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Score</span>
          </div>

          <div className="result-stats">
            <div className="stat-item">
              <span className="stat-val text-emerald-600">{score}</span>
              <span className="stat-lbl">Correct</span>
            </div>
            <div className="stat-item">
              <span className="stat-val text-red-500">{questions.length - score}</span>
              <span className="stat-lbl">Incorrect</span>
            </div>
            <div className="stat-item">
              <span className="stat-val text-blue-600">{accuracy}%</span>
              <span className="stat-lbl">Accuracy</span>
            </div>
          </div>

          <div className="mt-12 flex gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2">
              <RefreshCw size={18} />
              Review Answers
            </button>
            <Link href="/dashboard" className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2">
              <Home size={18} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="engine-container">
      {/* Header */}
      <header className="engine-header">
        <div className="flex items-center gap-4">
          <Link href="/mock-tests" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ChevronLeft />
          </Link>
          <div>
            <h2 className="font-black text-slate-800">CA Inter Group 1 Mock</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accounting Standard 1</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black">
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => setIsSubmitted(true)}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            Submit Test
            <Send size={16} />
          </button>
        </div>
      </header>

      {/* Main Engine */}
      <main className="engine-main">
        <div className="question-area reveal-anim">
          <div className="flex items-center justify-between mb-8">
            <span className="px-4 py-2 bg-slate-50 text-slate-500 rounded-lg text-xs font-black uppercase tracking-widest">
              Question {currentQ + 1} of {questions.length}
            </span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-8 rounded-full transition-all ${i === currentQ ? 'bg-blue-600' : 'bg-slate-100'}`} 
                />
              ))}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 leading-relaxed mb-10">
            {questions[currentQ].text}
          </h3>

          <div className="grid gap-4">
            {questions[currentQ].options.map((opt, i) => (
              <div 
                key={i}
                className={`option-card ${answers[currentQ] === i ? 'selected' : ''}`}
                onClick={() => handleSelect(i)}
              >
                <div className="option-letter">{String.fromCharCode(65 + i)}</div>
                {opt}
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-12 flex justify-between border-t border-slate-50 pt-8">
            <button 
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={20} />
              Previous Question
            </button>
            <button 
              onClick={() => currentQ < questions.length - 1 ? setCurrentQ(prev => prev + 1) : setIsSubmitted(true)}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              {currentQ === questions.length - 1 ? 'Finish Test' : 'Save & Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Navigator Panel */}
        <div className="navigator-panel hidden lg:block reveal-anim" style={{ animationDelay: '0.1s' }}>
          <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-4">Question Navigator</h4>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-3 h-3 bg-blue-600 rounded-sm" /> Answered
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-3 h-3 bg-slate-100 rounded-sm" /> Not Visited
            </div>
          </div>
          
          <div className="q-grid">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`q-dot ${currentQ === i ? 'current' : ''} ${answers[i] !== undefined ? 'answered' : ''}`}
                onClick={() => setCurrentQ(i)}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 shrink-0" size={18} />
              <p className="text-xs font-medium text-blue-700 leading-relaxed">
                Ensure you have answered all mandatory questions before final submission.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
