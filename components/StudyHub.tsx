
import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Lock, CheckCircle, Play, ChevronRight, RefreshCw, Clock, Brain, Download, Layers, BookOpen, Trash2, Zap, HelpCircle } from 'lucide-react';
import { generateTopicsFromText, generateQuizForTopic, analyzeQuizPerformance, extractTextFromFile, askStudyQuestion, aiExamSolver, generateStudyFlashcards, generateSmartSummary } from '../services/geminiService';
import { QuizQuestion, QuizResult, Topic, QuizConfig, Flashcard, SolverResult, SummaryResult, User } from '../types';

interface StudyHubProps {
  user: User;
  hasAccess: boolean;
  onShareResult: (score: number, total: number) => void;
  topics: Topic[];
  onUpdateTopics: (topics: Topic[]) => void;
  checkLimit: (type: 'UPLOAD' | 'QUIZ' | 'AI') => boolean;
}

export const StudyHub: React.FC<StudyHubProps> = ({ user, hasAccess, onShareResult, topics, onUpdateTopics, checkLimit }) => {
  const [activeTab, setActiveTab] = useState<'PATH' | 'AI_ENGINE'>('PATH');

  // --- PATH MODE STATES ---
  const [file, setFile] = useState<File | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [mode, setMode] = useState<'OVERVIEW' | 'CONFIG' | 'QUIZ' | 'ASK_AI' | 'RESULT'>('OVERVIEW');
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({ numQuestions: 10, isTimed: false, timePerQuestion: 60 });
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<any>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  // --- AI ENGINE STATES ---
  const [engineMode, setEngineMode] = useState<'MENU' | 'SOLVER' | 'FLASHCARDS' | 'SUMMARY'>('MENU');
  const [engineFiles, setEngineFiles] = useState<File[]>([]);
  const [enginePastQFiles, setEnginePastQFiles] = useState<File[]>([]);
  
  // Results
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  
  // Flashcard Nav
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Timer
  useEffect(() => {
    if (mode === 'QUIZ' && quizConfig.isTimed && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, mode, quizConfig.isTimed]);

  // File Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (!checkLimit('UPLOAD')) return; // Limit Check

      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      setIsProcessing(true);
      try {
        const text = await extractTextFromFile(uploadedFile);
        const generatedTopics = await generateTopicsFromText(text);
        onUpdateTopics(generatedTopics);
      } catch (err) {
        alert("Error processing document");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleEngineFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setEngineFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const handleEnginePastQ = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setEnginePastQFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const processFiles = async (files: File[]) => {
    const texts = await Promise.all(files.map(extractTextFromFile));
    return texts.join("\n\n");
  };

  // AI Actions
  const runSolver = async () => {
    if (!checkLimit('AI')) return;
    if (!engineFiles.length || !enginePastQFiles.length) return alert("Upload both Course Material and Past Questions.");
    setIsProcessing(true);
    try {
      const course = await processFiles(engineFiles);
      const pastQ = await processFiles(enginePastQFiles);
      const res = await aiExamSolver(course, pastQ);
      setSolverResult(res);
    } catch (e) { alert("Error solving."); }
    setIsProcessing(false);
  };

  const runFlashcards = async () => {
    if (!checkLimit('AI')) return;
    if (!engineFiles.length) return alert("Upload Course Material.");
    setIsProcessing(true);
    try {
      const course = await processFiles(engineFiles);
      const pastQ = await processFiles(enginePastQFiles);
      const res = await generateStudyFlashcards(course + "\n\n" + pastQ);
      setFlashcards(res);
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
    } catch (e) { alert("Error generating flashcards."); }
    setIsProcessing(false);
  };

  const runSummary = async () => {
    if (!checkLimit('AI')) return;
    if (!engineFiles.length) return alert("Upload Course Material.");
    setIsProcessing(true);
    try {
      const course = await processFiles(engineFiles);
      const res = await generateSmartSummary(course);
      setSummaryResult(res);
    } catch (e) { alert("Error summarizing."); }
    setIsProcessing(false);
  };

  const handleAskAI = async () => {
     if (!checkLimit('AI')) return;
     if (!activeTopic || !aiQuestion) return;
     setIsProcessing(true);
     try {
       const ans = await askStudyQuestion(activeTopic.description, aiQuestion);
       setAiAnswer(ans);
     } catch(e) {
       setAiAnswer("Could not get an answer.");
     }
     setIsProcessing(false);
  };

  const downloadText = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- PATH MODE LOGIC (Quizzes) ---
  const handleStartQuiz = async () => {
    if (!activeTopic) return;
    if (!checkLimit('QUIZ')) return; // Check quiz limit

    setIsProcessing(true);
    const context = `Context for ${activeTopic.title}: ${activeTopic.description}`;
    const questions = await generateQuizForTopic(activeTopic.title, context, quizConfig.numQuestions);
    setQuizQuestions(questions);
    setAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestionIdx(0);
    setResult(null);
    if (quizConfig.isTimed) setTimeLeft(quizConfig.timePerQuestion);
    setMode('QUIZ');
    setIsProcessing(false);
  };

  const submitQuiz = async () => {
    setIsProcessing(true);
    const analysis = await analyzeQuizPerformance(quizQuestions, answers);
    setResult(analysis);
    if (analysis.passed && activeTopic) {
      const updatedTopics = topics.map((t, idx) => {
        if (t.id === activeTopic.id) return { ...t, isCompleted: true, lastScore: analysis.score };
        if (idx > 0 && topics[idx-1].id === activeTopic.id) return { ...t, isLocked: false };
        return t;
      });
      onUpdateTopics(updatedTopics);
    }
    setMode('RESULT');
    setIsProcessing(false);
  };

  if (!hasAccess && user.subscriptionPlan === 'FREE') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Lock size={48} className="text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold dark:text-white">StudyHub Locked</h2>
        <p className="text-slate-500 mt-2 max-w-md">Upgrade to a Premium Plan (Scholar or Elite) to access AI study tools and quizzes.</p>
        <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-full font-bold">View Plans</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-center mb-6">
        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl flex shadow-sm border border-slate-200 dark:border-slate-700">
          <button onClick={() => setActiveTab('PATH')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'PATH' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>Topic Path</button>
          <button onClick={() => setActiveTab('AI_ENGINE')} className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 ${activeTab === 'AI_ENGINE' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>
            <Brain size={16} /><span>AI Engine</span>
          </button>
        </div>
      </div>

      {activeTab === 'PATH' && (
        <>
          <div className="flex justify-between items-center">
             <div><h2 className="text-2xl font-bold dark:text-white">StudyHub Path</h2></div>
             {topics.length > 0 && mode === 'OVERVIEW' && <button onClick={() => {onUpdateTopics([]); setFile(null);}} className="text-green-600 text-sm font-bold">New Document</button>}
             {mode !== 'OVERVIEW' && <button onClick={() => setMode('OVERVIEW')} className="text-slate-500">Back</button>}
          </div>

          {topics.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center relative">
               {isProcessing ? (
                 <div className="animate-pulse"><Brain size={48} className="text-green-600 mx-auto mb-4" /><p className="dark:text-white">Analyzing...</p></div>
               ) : (
                 <>
                   <Upload size={36} className="mx-auto text-green-600 mb-4" />
                   <h3 className="text-2xl font-bold dark:text-white mb-2">Upload Material</h3>
                   <p className="text-sm text-slate-500 mb-4">Uploads left this week: <span className="font-bold">
                     {['PLAN_STUDY_PREMIUM', 'PLAN_MERCHANT_PREMIUM'].includes(user.subscriptionPlan) ? 'Unlimited' : 
                       (user.subscriptionPlan.includes('STANDARD') ? Math.max(0, 5 - user.weeklyUploads) : 
                       (user.subscriptionPlan.includes('BASIC') ? Math.max(0, 1 - user.weeklyUploads) : 
                       (hasAccess ? Math.max(0, 1 - user.weeklyUploads) : 0)))}
                   </span></p>
                   <input type="file" id="doc-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
                   <label htmlFor="doc-upload" className="inline-block bg-slate-900 dark:bg-green-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:opacity-90">Generate Quiz Path</label>
                 </>
               )}
            </div>
          ) : (
            <>
              {mode === 'OVERVIEW' && (
                <div className="space-y-4">
                  {topics.map((t, i) => (
                    <div key={t.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${t.isCompleted ? 'bg-green-100 text-green-600' : t.isLocked ? 'bg-slate-100 text-slate-400' : 'bg-green-600 text-white'}`}>{t.isCompleted ? <CheckCircle size={16} /> : i+1}</div>
                        <div><h3 className="font-bold dark:text-white">{t.title}</h3><p className="text-xs text-slate-500">{t.description}</p></div>
                      </div>
                      {!t.isLocked && <button onClick={() => { setActiveTopic(t); setMode('CONFIG'); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><Play size={16} /></button>}
                    </div>
                  ))}
                </div>
              )}
              {mode === 'CONFIG' && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-lg mx-auto text-center">
                  <h3 className="text-2xl font-bold mb-6 dark:text-white">{activeTopic?.title}</h3>
                  <div className="space-y-4">
                    <button onClick={handleStartQuiz} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Start Quiz</button>
                    <button onClick={() => setMode('ASK_AI')} className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100">Ask AI</button>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">Quizzes left this week: {
                    ['PLAN_STUDY_PREMIUM', 'PLAN_MERCHANT_PREMIUM'].includes(user.subscriptionPlan) ? 'Unlimited' : 
                    (user.subscriptionPlan.includes('STANDARD') ? Math.max(0, 15 - user.weeklyQuizzes) :
                    (user.subscriptionPlan.includes('BASIC') ? Math.max(0, 3 - user.weeklyQuizzes) :
                    (hasAccess ? Math.max(0, 1 - user.weeklyQuizzes) : 0)))
                  }</p>
                </div>
              )}
              {mode === 'ASK_AI' && (
                 <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-lg mx-auto">
                    <h3 className="font-bold dark:text-white mb-4">Ask AI Tutor</h3>
                    <textarea 
                       value={aiQuestion} 
                       onChange={e => setAiQuestion(e.target.value)} 
                       placeholder="Ask about this topic..." 
                       className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4"
                       rows={3}
                    />
                    <button onClick={handleAskAI} disabled={!aiQuestion || isProcessing} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mb-4">Get Answer</button>
                    {aiAnswer && (
                       <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 rounded-xl text-sm">
                          {aiAnswer}
                       </div>
                    )}
                 </div>
              )}
              {mode === 'QUIZ' && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold dark:text-white">Question {currentQuestionIdx + 1}/{quizQuestions.length}</h3>
                     {quizConfig.isTimed && <span className="font-mono text-red-500">{timeLeft}s</span>}
                  </div>
                  <p className="text-lg mb-6 dark:text-slate-200">{quizQuestions[currentQuestionIdx]?.question}</p>
                  <div className="space-y-3">{quizQuestions[currentQuestionIdx]?.options.map((o, i) => (
                    <button key={i} onClick={() => { const ans = [...answers]; ans[currentQuestionIdx] = i; setAnswers(ans); }} className={`w-full text-left p-4 rounded-xl border transition-colors ${answers[currentQuestionIdx] === i ? 'bg-green-50 border-green-500 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:border-slate-700 dark:text-slate-300'}`}>{o}</button>
                  ))}</div>
                  <button onClick={() => currentQuestionIdx < quizQuestions.length - 1 ? setCurrentQuestionIdx(p=>p+1) : submitQuiz()} className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-bold">Next</button>
                </div>
              )}
              {mode === 'RESULT' && result && (
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl">
                  <h3 className="text-3xl font-bold mb-4 dark:text-white">{result.passed ? 'Passed!' : 'Keep Trying'}</h3>
                  <p className="text-xl mb-6 dark:text-slate-300">{Math.round((result.score/result.total)*100)}%</p>
                  <button onClick={() => setMode('OVERVIEW')} className="bg-slate-100 dark:bg-slate-700 px-8 py-3 rounded-xl font-bold">Back</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'AI_ENGINE' && (
        <div>
          {engineMode === 'MENU' && (
            <div className="space-y-8 text-center">
              <h2 className="text-3xl font-bold dark:text-white">AI Study Engine</h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold mb-4 dark:text-white">1. Upload Materials</h3>
                  <div className="space-y-4 text-left">
                    <div className="p-4 border border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <label className="block text-xs font-bold text-slate-500 mb-2">COURSE MATERIAL (Required)</label>
                      <input type="file" onChange={handleEngineFiles} multiple className="w-full text-sm dark:text-slate-300" />
                    </div>
                    <div className="p-4 border border-dashed rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <label className="block text-xs font-bold text-blue-500 mb-2">PAST QUESTIONS (Optional)</label>
                      <input type="file" onChange={handleEnginePastQ} multiple className="w-full text-sm dark:text-slate-300" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 justify-center">
                  <button onClick={() => { runSolver(); setEngineMode('SOLVER'); }} disabled={!engineFiles.length || !enginePastQFiles.length} className="p-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50">
                    <Brain className="inline mr-2" /> AI Exam Solver
                  </button>
                  <button onClick={() => { runFlashcards(); setEngineMode('FLASHCARDS'); }} disabled={!engineFiles.length} className="p-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
                    <Layers className="inline mr-2" /> Flashcards
                  </button>
                  <button onClick={() => { runSummary(); setEngineMode('SUMMARY'); }} disabled={!engineFiles.length} className="p-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50">
                    <BookOpen className="inline mr-2" /> Smart Summary
                  </button>
                </div>
              </div>
              {isProcessing && <div className="text-green-600 font-bold animate-pulse">Processing... Please wait.</div>}
            </div>
          )}

          {engineMode === 'SOLVER' && solverResult && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm">
              <div className="flex justify-between mb-6">
                <button onClick={() => setEngineMode('MENU')} className="text-slate-500">Back</button>
                <button onClick={() => downloadText('exam_solver.txt', solverResult.markdownText)} className="text-green-600 font-bold flex items-center"><Download size={16} className="mr-1"/> Download</button>
              </div>
              <h2 className="text-2xl font-bold mb-6 border-b pb-4 dark:text-white">AI Exam Solutions</h2>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">
                {solverResult.markdownText}
              </div>
            </div>
          )}

          {engineMode === 'FLASHCARDS' && flashcards.length > 0 && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-between mb-6">
                <button onClick={() => setEngineMode('MENU')} className="text-slate-500">Back</button>
                <button onClick={() => downloadText('flashcards.txt', flashcards.map(f => `${f.term}\n${f.definition}`).join('\n\n'))} className="text-indigo-600 font-bold flex items-center"><Download size={16} className="mr-1"/> Download</button>
              </div>
              <div className="perspective-1000 w-full h-80 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{flashcards[currentFlashcardIndex].term.replace(/\*\*Q:\*\*/g, '')}</h3>
                    <p className="text-sm text-slate-400 mt-4">Tap to Flip</p>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 overflow-y-auto">
                    <p className="text-lg font-medium">{flashcards[currentFlashcardIndex].definition.replace(/\*\*A:\*\*/g, '')}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center space-x-8 mt-8">
                <button onClick={() => { setCurrentFlashcardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length); setIsFlipped(false); }} className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md"><ChevronRight className="rotate-180" /></button>
                <span className="font-bold dark:text-white">{currentFlashcardIndex + 1} / {flashcards.length}</span>
                <button onClick={() => { setCurrentFlashcardIndex(prev => (prev + 1) % flashcards.length); setIsFlipped(false); }} className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md"><ChevronRight /></button>
              </div>
            </div>
          )}

          {engineMode === 'SUMMARY' && summaryResult && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm">
              <div className="flex justify-between mb-6">
                <button onClick={() => setEngineMode('MENU')} className="text-slate-500">Back</button>
                <button onClick={() => downloadText('smart_summary.txt', summaryResult.markdownText)} className="text-orange-600 font-bold flex items-center"><Download size={16} className="mr-1"/> Download</button>
              </div>
              <h2 className="text-2xl font-bold mb-6 border-b pb-4 dark:text-white">Smart Summary</h2>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">
                {summaryResult.markdownText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
