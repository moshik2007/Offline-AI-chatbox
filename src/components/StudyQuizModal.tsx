import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/quizData';

interface StudyQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyQuizModal: React.FC<StudyQuizModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Offline Exam Prep & CS Quiz</span>
            </h2>
            <p className="text-xs text-slate-400">
              Test your knowledge offline · No internet connection needed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {!isFinished ? (
            <>
              {/* Progress & Category */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-indigo-400 uppercase tracking-wide">
                  {currentQ.topic}
                </span>
                <span>
                  Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';

                  if (showExplanation) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-medium';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'opacity-40 bg-slate-950 border-slate-800 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0 text-xs font-semibold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {showExplanation && idx === currentQ.correctIndex && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {showExplanation && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box */}
              {showExplanation && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    {selectedOption === currentQ.correctIndex ? (
                      <span className="text-emerald-400">✓ Correct!</span>
                    ) : (
                      <span className="text-rose-400">✗ Incorrect!</span>
                    )}
                  </div>
                  <p className="text-slate-400 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {showExplanation && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>{currentIndex + 1 === QUIZ_QUESTIONS.length ? 'View Results' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Results Summary */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quiz Completed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You scored <span className="text-indigo-400 font-bold text-sm">{score}</span> out of{' '}
                  <span className="font-bold text-slate-200">{QUIZ_QUESTIONS.length}</span> (
                  {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 max-w-sm mx-auto text-left space-y-1.5">
                <div className="font-medium text-white">Study Recommendation:</div>
                <p className="text-slate-400">
                  {score >= 6
                    ? 'Outstanding grasp of AI & CS concepts! Keep practicing your programming.'
                    : 'Good attempt! Review topics like HTML, Python syntax, and JVM architecture in the chat!'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Back to Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
