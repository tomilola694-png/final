
import React, { useState } from 'react';
import { SampleQuestion, SubQuestion, SolutionStep } from '../types';
import Previewer from './Previewer';
import DistributionChart from './DistributionChart';

interface QuestionCardProps {
  question: SampleQuestion;
}

const SolutionStepItem: React.FC<{ step: SolutionStep, index: number }> = ({ step, index }) => {
  return (
    <div className="relative pl-12 pb-10 last:pb-0">
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center shadow-sm z-10">
        <span className="text-[10px] font-black text-pink-600">{index + 1}</span>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col">
          <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{step.label}</h6>
          {step.explanation && (
            <p className="text-sm text-slate-700 font-medium">
              {step.explanation}
            </p>
          )}
        </div>

        <div className="p-4 bg-slate-50/30 rounded-xl border border-dashed border-slate-200 overflow-x-auto">
          <Previewer 
            content={step.math} 
            isMathOnly={true}
            className="bg-transparent" 
          />
        </div>
      </div>
    </div>
  );
};

const SubQuestionBlock: React.FC<{ sub: SubQuestion }> = ({ sub }) => {
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const checkAnswer = () => {
    const normalizedTarget = sub.finalAnswer.replace(/\s/g, '').toLowerCase();
    const normalizedUser = userAnswer.replace(/\s/g, '').toLowerCase();
    
    if (normalizedUser.length > 0 && (normalizedTarget.includes(normalizedUser) || normalizedUser.includes(normalizedTarget))) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          <div className="bg-zinc-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase shrink-0">{sub.part}</div>
          <Previewer 
            content={sub.text} 
            className="text-slate-800 text-lg font-bold leading-relaxed" 
          />
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase whitespace-nowrap pt-2 tracking-widest">[{sub.marks} Marks]</span>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Final numeric value..."
            className={`w-full pl-6 pr-4 py-3 rounded-2xl border-2 outline-none transition-all font-mono text-sm ${
              feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 
              feedback === 'incorrect' ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-pink-500'
            }`}
          />
        </div>
        <button 
          onClick={checkAnswer}
          className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all active:scale-95 shadow-lg"
        >
          CHECK ANSWER
        </button>
      </div>

      <div className="mt-6">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="px-5 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-pink-500 hover:text-pink-600 transition-all flex items-center gap-3"
        >
          {showSolution ? 'Hide Working' : 'View Exam Working'}
          <span className="text-sm">{showSolution ? '▼' : '▶'}</span>
        </button>

        {showSolution && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-8 md:p-10 bg-[#FCFCFD] rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="mb-8 pb-4 border-b border-slate-100">
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Formal Step-by-Step Derivation</h6>
              </div>

              <div className="space-y-2">
                {sub.stepByStepSolution.map((step, idx) => (
                  <SolutionStepItem key={idx} step={step} index={idx} />
                ))}
              </div>

              <div className="mt-10 p-6 bg-white border-2 border-zinc-900 rounded-2xl flex justify-between items-center">
                 <div className="font-black text-[10px] uppercase tracking-widest text-zinc-400">Final Result</div>
                 <div className="text-2xl font-black text-zinc-900 tracking-tighter">
                   <Previewer content={sub.finalAnswer} isMathOnly={true} />
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  // Defensive check: Only render the chart if we have a valid distribution type
  const hasValidChart = question.distParams && 
                        ['normal', 'binomial', 'poisson'].includes(question.distParams.type);

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-10 py-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{question.context}</span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase">Syllabus 9709</span>
      </div>
      
      <div className="p-10 md:p-14">
        <div className="mb-12">
          <Previewer 
            content={question.questionHeader} 
            className="text-slate-900 text-2xl font-black leading-tight" 
          />
        </div>
        
        {hasValidChart && (
          <div className="mb-12">
            <DistributionChart {...question.distParams} />
          </div>
        )}

        <div className="space-y-4">
           {question.subQuestions.map(sub => (
             <SubQuestionBlock key={sub.id} sub={sub} />
           ))}
        </div>
        
        <div className="mt-14 pt-10 border-t border-slate-100">
           <div className="p-8 bg-pink-50/50 rounded-[2rem] border border-pink-100/50 flex gap-6 items-start">
             <div className="text-3xl bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0">🎓</div>
             <div>
               <h5 className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-2">Examiner's Insight</h5>
               <p className="text-md text-slate-700 leading-relaxed font-medium">
                 {question.simplifiedExplanation}
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
