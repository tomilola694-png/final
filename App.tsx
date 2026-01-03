
import React, { useState, useEffect } from 'react';
import { TOPICS } from './constants.tsx';
import { StatTopic, TopicConfig, BlueprintOutput, SampleQuestion } from './types.ts';
import { generateBlueprint, generateSampleQuestions } from './services/geminiService.ts';
import TopicCard from './components/TopicCard.tsx';
import CodeBlock from './components/CodeBlock.tsx';
import Previewer from './components/Previewer.tsx';
import QuestionCard from './components/QuestionCard.tsx';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<TopicConfig | null>(null);
  const [viewMode, setViewMode] = useState<'practice' | 'architect'>('practice');
  const [paperFilter, setPaperFilter] = useState<'ALL' | 'S1' | 'S2'>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);
  const [formulaTab, setFormulaTab] = useState<'CH2-5' | 'CH6-9' | 'CH10-12' | 'TABLES'>('CH2-5');
  
  const [blueprint, setBlueprint] = useState<BlueprintOutput | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<SampleQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'template' | 'logic' | 'assessment'>('template');
  
  const [masteryData, setMasteryData] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('statarch_mastery');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('statarch_mastery', JSON.stringify(masteryData));
  }, [masteryData]);

  const handleTopicSelection = (topic: TopicConfig) => {
    setSelectedTopic(topic);
    handleAutoGenerate(topic);
  };

  const handleAutoGenerate = async (topic: TopicConfig) => {
    setLoading(true);
    setError(null);
    setBlueprint(null);
    setPracticeQuestions([]);

    try {
      const [questions, result] = await Promise.all([
        generateSampleQuestions(topic.id),
        generateBlueprint(topic.id)
      ]);

      setPracticeQuestions(questions);
      setBlueprint(result);
      setViewMode('practice');
      
      setMasteryData(prev => ({
        ...prev,
        [topic.id]: Math.min((prev[topic.id] || 0) + 5, 100)
      }));
    } catch (err: any) {
      console.error(err);
      setError("Failed to synchronize with Gemini API. Check your project configuration.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = TOPICS.filter(t => paperFilter === 'ALL' || t.paper === paperFilter);

  return (
    <div className="min-h-screen pb-24 bg-[#FAFAFA] relative overflow-x-hidden animate-in fade-in duration-1000">
      {/* Sidebar Navigation for Formulas */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] lg:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out border-l border-slate-100 p-0 flex flex-col ${showFormulaSheet ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-zinc-900 text-white">
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm text-pink-500">Official Reference Sheet</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Syllabus 9709 Comprehensive</p>
          </div>
          <button onClick={() => setShowFormulaSheet(false)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-pink-500 transition-colors">✕</button>
        </div>

        <div className="flex bg-zinc-800 p-1">
          {(['CH2-5', 'CH6-9', 'CH10-12', 'TABLES'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setFormulaTab(tab)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-tighter transition-all ${formulaTab === tab ? 'bg-zinc-900 text-pink-500 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab.replace('CH', 'Chapters ')}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {formulaTab === 'CH2-5' && (
            <section className="space-y-6">
              <h4 className="font-black text-zinc-900 text-[11px] uppercase border-b-2 border-pink-500 pb-1 w-fit">Probability & Distributions</h4>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Poisson Mean/Variance</p>
                <Previewer content="E(X) = \lambda, \quad Var(X) = \lambda" isMathOnly={true} />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Binomial Mean/Variance</p>
                <Previewer content="E(X) = np, \quad Var(X) = np(1-p)" isMathOnly={true} />
              </div>
            </section>
          )}
          {formulaTab === 'TABLES' && (
            <section className="space-y-6">
              <h4 className="font-black text-zinc-900 text-[11px] uppercase border-b-2 border-pink-500 pb-1 w-fit">Greek Symbols</h4>
              <div className="grid grid-cols-4 gap-2">
                {[{l:'μ',n:'Mu'}, {l:'σ',n:'Sigma'}, {l:'Σ',n:'Sum'}, {l:'λ',n:'Lambda'}].map((g, i) => (
                  <div key={i} className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-2xl font-serif">{g.l}</span>
                    <span className="text-[7px] uppercase font-black text-slate-400">{g.n}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <header className="bg-white border-b border-slate-100 py-10 px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center rotate-3 shadow-xl">
                 <span className="text-pink-500 text-3xl font-black">Σ</span>
               </div>
               <div>
                 <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">STATARCH</h1>
                 <p className="text-pink-600 text-[9px] font-black tracking-[0.4em] uppercase">Cambridge Examiner Suite</p>
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
               {['ALL', 'S1', 'S2'].map(p => (
                 <button 
                  key={p}
                  onClick={() => setPaperFilter(p as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${paperFilter === p ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {p}
                 </button>
               ))}
            </div>
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setViewMode('practice')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'practice' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-500 hover:text-pink-600'}`}
              >
                Practice
              </button>
              <button 
                onClick={() => setViewMode('architect')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'architect' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-500 hover:text-pink-600'}`}
              >
                Architect
              </button>
            </div>
            <button 
              onClick={() => setShowFormulaSheet(true)}
              className="bg-black text-white text-[10px] font-black px-6 py-3 rounded-2xl hover:bg-zinc-800 transition-all uppercase tracking-widest shadow-xl active:scale-95"
            >
              Formula Ref
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <aside className="lg:col-span-4 space-y-12">
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] border-b-4 border-pink-500 pb-1">Syllabus Browser</h2>
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">{filteredTopics.length} Topics</span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {filteredTopics.map(topic => (
                <TopicCard 
                  key={topic.id}
                  topic={topic}
                  mastery={masteryData[topic.id] || 0}
                  selected={selectedTopic?.id === topic.id}
                  onSelect={handleTopicSelection}
                />
              ))}
            </div>
          </section>
        </aside>

        <div className="lg:col-span-8">
          {!selectedTopic ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 bg-white rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-zinc-900" />
              <div className="text-9xl mb-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-700">📐</div>
              <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Select a Module</h3>
              <p className="text-slate-400 max-w-sm font-bold uppercase text-[11px] tracking-[0.3em] leading-relaxed italic opacity-60">Begin the procedural generation of your Statistics 9709 examination suite.</p>
              <div className="mt-16 flex gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-200 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-pink-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          ) : (
            <div className="space-y-12">
               {loading ? (
                 <div className="space-y-12">
                   {[1, 2].map(i => (
                     <div key={i} className="bg-white p-16 rounded-[4rem] shadow-sm border border-slate-50 relative overflow-hidden animate-pulse">
                        <div className="h-10 bg-slate-100 rounded-full w-3/4 mb-10" />
                        <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-16" />
                        <div className="h-72 bg-slate-50 rounded-[3rem]" />
                     </div>
                   ))}
                 </div>
               ) : error ? (
                 <div className="bg-white p-16 rounded-[4rem] border-2 border-red-100 flex flex-col items-center text-center">
                    <div className="text-6xl mb-8">🚫</div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{error}</h3>
                    <p className="text-slate-400 text-sm mt-4 font-medium uppercase tracking-widest">Ensure your Gemini API Key is valid.</p>
                    <button onClick={() => handleAutoGenerate(selectedTopic)} className="mt-10 px-8 py-3 bg-zinc-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl active:scale-95">Retry Sync</button>
                 </div>
               ) : viewMode === 'practice' ? (
                 <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                   {practiceQuestions.map(q => <QuestionCard key={q.id} question={q} />)}
                 </div>
               ) : blueprint && (
                 <div className="space-y-10 animate-in fade-in duration-500">
                   <div className="flex bg-slate-100 p-1 rounded-[2rem] border border-slate-200 w-fit mx-auto">
                    {['template', 'logic', 'assessment'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-pink-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  {activeTab === 'template' && <Previewer content={blueprint.questionTemplate} className="bg-white rounded-[3rem] border border-slate-50 p-16 shadow-inner" />}
                  {activeTab === 'logic' && <CodeBlock title="SymPy Analysis" language="python" code={blueprint.sympyCode} />}
                  {activeTab === 'assessment' && <CodeBlock title="STACK Verification" language="maxima" code={blueprint.stackPrtLogic} />}
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 py-5 px-10 z-40">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex gap-10">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Procedural Core Ready</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Topic: {selectedTopic?.id || 'None'}</span>
               </div>
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">9709 S1-S2 ARCHITECT</div>
         </div>
      </footer>
    </div>
  );
};

export default App;
