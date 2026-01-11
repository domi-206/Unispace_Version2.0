
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, FileText, Brain, Rocket, MessageCircle, Clock, 
  ChevronRight, RefreshCw, Trophy, AlertCircle, X, 
  Search, BookOpen, Send, Zap, Eye, CheckCircle2,
  Settings, Timer, Info, Plus, ArrowLeft, Lock, Loader2,
  ChevronLeft, FileSearch, NotebookPen, HelpCircle
} from 'lucide-react';
import { 
  generateTopicsFromText, generateQuizForTopic, analyzeQuizPerformance, 
  extractTextFromFile, askStudyQuestion, generateExamForTopic, gradeExamSubmission 
} from '../services/geminiService';
import { QuizQuestion, QuizResult, Topic, QuizConfig, User, TheorySection, ExamConfig, ExamResult } from '../types';

interface StudyHubProps {
  user: User;
  hasAccess: boolean;
  onShareResult: (score: number, total: number) => void;
  topics: Topic[];
  onUpdateTopics: (topics: Topic[]) => void;
  checkLimit: (type: 'UPLOAD' | 'QUIZ' | 'AI' | 'MARKET_POST') => boolean;
}

type HubView = 'UPLOAD' | 'CHOICE' | 'QUIZ_CONFIG' | 'QUIZ_SESSION' | 'QUIZ_RESULT' | 'AI_CHAT' | 'EXAM_CONFIG' | 'EXAM_SESSION' | 'EXAM_RESULT';

export const StudyHub: React.FC<StudyHubProps> = ({ user, topics, onUpdateTopics, checkLimit }) => {
  const [view, setView] = useState<HubView>('UPLOAD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');

  // States
  const [topicGrades, setTopicGrades] = useState<Record<string, number>>({});

  // AI Chat
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiReady, setIsAiReady] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Quiz
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    numQuestions: 10,
    isTimed: false,
    timePerQuestion: 30,
    totalSessionTime: 300
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showRef, setShowRef] = useState<string | null>(null);

  // Theory Exam
  const [examConfig, setExamConfig] = useState<ExamConfig>({ totalQuestions: 5, difficulty: 'Moderate', timeLimit: 3600 });
  const [examSections, setExamSections] = useState<TheorySection[]>([]);
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [requiredAnswers, setRequiredAnswers] = useState(3);

  const timerRef = useRef<any>(null);

  const loadingMessages = useMemo(() => [
    "Initializing 'U' Neural Hub...",
    "Scanning PDF for terminologies...",
    "Building Mastery Sections...",
    "Calibrating AI Examiner...",
    "Entering study dimension..."
  ], []);

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setUploadProgress(0);
      let p = 0;
      interval = setInterval(() => {
        p += Math.random() * 20; 
        if (p >= 99) { p = 99; clearInterval(interval); }
        setUploadProgress(p);
        const msgIdx = Math.min(Math.floor(p / 20), loadingMessages.length - 1);
        setLoadingMsg(loadingMessages[msgIdx]);
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isProcessing, loadingMessages]);

  useEffect(() => {
    if ((view === 'QUIZ_SESSION' || view === 'EXAM_SESSION')) {
      timerRef.current = setInterval(() => {
        if (view === 'QUIZ_SESSION' && quizConfig.isTimed) {
          setTimeLeft(prev => {
            if (prev <= 1) { handleNext(); return quizConfig.timePerQuestion; }
            return prev - 1;
          });
        }
        setTotalTimeLeft(prev => {
          if (prev <= 1) { 
             view === 'QUIZ_SESSION' ? finishQuiz() : finishExam(); 
             return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view]);

  const transitionTo = (nextView: HubView) => {
    setUploadProgress(100);
    setTimeout(() => {
      setView(nextView);
      setIsProcessing(false);
    }, 400);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) { alert("File limit 5MB."); return; }
    if (!checkLimit('UPLOAD')) return;
    setIsProcessing(true);
    setFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      setFileContent(text);
      const generatedTopics = await generateTopicsFromText(text);
      onUpdateTopics(generatedTopics.map(t => ({ ...t, isCompleted: false })));
      setIsAiReady(true);
      transitionTo('CHOICE');
    } catch (err) { setIsProcessing(false); }
  };

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !isAiReady || !checkLimit('AI')) return;
    setIsLaunching(true);
    const q = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    try {
      const resp = await askStudyQuestion(fileContent, q);
      setChatHistory(prev => [...prev, { role: 'ai', text: resp }]);
    } finally {
      setIsLaunching(false);
    }
  };

  const startQuizFlow = async () => {
    if (!selectedTopic || !checkLimit('QUIZ')) return;
    setIsProcessing(true);
    setLoadingMsg("Syncing Quiz Matrix...");
    try {
      const questions = await generateQuizForTopic(selectedTopic.title, fileContent, quizConfig.numQuestions);
      setQuizQuestions(questions);
      setUserAnswers(new Array(questions.length).fill(-1));
      setCurrentIdx(0);
      setTimeLeft(quizConfig.timePerQuestion);
      setTotalTimeLeft(quizConfig.totalSessionTime);
      transitionTo('QUIZ_SESSION');
    } catch (err) { setIsProcessing(false); }
  };

  const startExamFlow = async () => {
    if (!selectedTopic || !checkLimit('QUIZ')) return;
    setIsProcessing(true);
    setLoadingMsg("Generating Theory Gate...");
    try {
      const req = examConfig.totalQuestions === 5 ? 3 : 5;
      setRequiredAnswers(req);
      const sections = await generateExamForTopic(selectedTopic.title, fileContent, examConfig.totalQuestions, examConfig.difficulty);
      setExamSections(sections);
      setTheoryAnswers({});
      setCurrentIdx(0);
      setTotalTimeLeft(examConfig.timeLimit);
      transitionTo('EXAM_SESSION');
    } catch (err) { setIsProcessing(false); }
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    setIsProcessing(true);
    setLoadingMsg("Evaluating Matrix Accuracy...");
    try {
      const res = await analyzeQuizPerformance(quizQuestions, userAnswers);
      setQuizResult(res);
      const pct = Math.round((res.score / res.total) * 100);
      setTopicGrades(prev => ({ ...prev, [selectedTopic!.id]: Math.max(prev[selectedTopic!.id] || 0, pct) }));
      if (res.passed && selectedTopic) onUpdateTopics(topics.map(t => t.id === selectedTopic.id ? { ...t, isCompleted: true } : t));
      transitionTo('QUIZ_RESULT');
    } catch (err) { setIsProcessing(false); }
  };

  const finishExam = async () => {
    clearInterval(timerRef.current);
    setIsProcessing(true);
    setLoadingMsg("Scanning Terminology Logic...");
    try {
      const res = await gradeExamSubmission(examSections, theoryAnswers);
      setExamResult(res);
      setTopicGrades(prev => ({ ...prev, [selectedTopic!.id]: Math.max(prev[selectedTopic!.id] || 0, (res.score / 70) * 100) }));
      if (res.score >= 45 && selectedTopic) onUpdateTopics(topics.map(t => t.id === selectedTopic.id ? { ...t, isCompleted: true } : t));
      transitionTo('EXAM_RESULT');
    } catch (err) { setIsProcessing(false); }
  };

  const handleNext = () => {
    if (view === 'QUIZ_SESSION' && currentIdx < quizQuestions.length - 1) { setCurrentIdx(p => p + 1); setTimeLeft(quizConfig.timePerQuestion); }
    else if (view === 'EXAM_SESSION' && currentIdx < examSections.length - 1) { setCurrentIdx(p => p + 1); }
    else if (view === 'QUIZ_SESSION') { finishQuiz(); }
    else if (view === 'EXAM_SESSION') { finishExam(); }
  };

  const handlePrev = () => { if (currentIdx > 0) setCurrentIdx(p => p - 1); };

  const answeredCount = Object.keys(theoryAnswers).filter(k => theoryAnswers[k].trim().length > 0).length;

  const ULogoLoading = ({ progress, message }: { progress: number, message: string }) => (
    <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-1000">
      <div className="perspective-1000 mb-20 group">
        <div className="w-48 h-48 relative transform-style-3d animate-logoSpin">
          <div className="absolute inset-0 bg-[#07bc0c] rounded-[56px] flex items-center justify-center shadow-3xl backface-hidden">
             <span className="text-white text-9xl font-black italic">U</span>
          </div>
          <div className="absolute inset-0 bg-slate-900 rounded-[56px] flex items-center justify-center shadow-2xl backface-hidden rotate-y-180 border-4 border-[#07bc0c]">
             <span className="text-[#07bc0c] text-9xl font-black italic">U</span>
          </div>
          <div className="absolute -inset-10 bg-[#07bc0c] blur-[100px] opacity-10 rounded-full animate-uPulse"></div>
        </div>
      </div>
      <div className="relative w-full max-w-md h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-12 shadow-inner border border-slate-200 dark:border-slate-700">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#07bc0c] via-green-400 to-[#07bc0c] transition-all duration-300 shadow-[0_0_15px_#07bc0c]" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="text-center">
        <p className="text-8xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter tabular-nums">{Math.round(progress)}%</p>
        <div className="inline-flex items-center space-x-3 bg-white dark:bg-slate-900 px-8 py-3 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
           <Loader2 className="animate-spin text-[#07bc0c]" size={24} />
           <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs">{message}</p>
        </div>
      </div>
    </div>
  );

  if (isProcessing) return <ULogoLoading progress={uploadProgress} message={loadingMsg} />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      {view === 'UPLOAD' && (
        <div className="bg-white dark:bg-slate-800 rounded-[72px] border-4 border-dashed border-slate-100 dark:border-slate-700 p-24 text-center animate-slideUp shadow-3xl">
          <div className="w-32 h-32 bg-green-50 dark:bg-green-900/30 rounded-[44px] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-green-100/50">
            <Upload size={56} className="text-[#07bc0c]" />
          </div>
          <h2 className="text-7xl font-black dark:text-white mb-8 tracking-tight">StudyHub AI</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-20 max-w-md mx-auto font-bold text-xl leading-relaxed">
            Unleash the 'U' Neural Hub. <br/><span className="text-[#07bc0c] underline decoration-green-200">PDF context is the single source of truth.</span>
          </p>
          <input type="file" id="hub-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
          <label htmlFor="hub-upload" className="inline-flex items-center space-x-6 bg-[#07bc0c] text-white px-20 py-8 rounded-[48px] font-black text-3xl cursor-pointer hover:bg-green-700 shadow-2xl transition-all active:scale-95"><Plus size={36} /><span>Upload Context</span></label>
        </div>
      )}

      {view === 'CHOICE' && (
        <div className="space-y-16 animate-slideUp">
           <div className="text-center">
              <h2 className="text-6xl font-black dark:text-white mb-4 tracking-tight">System Synced</h2>
              <div className="inline-flex items-center space-x-4 bg-green-50 dark:bg-green-900/30 px-8 py-4 rounded-full border border-green-100 dark:border-green-800">
                <FileText size={24} className="text-[#07bc0c]" />
                <span className="font-black text-green-700 dark:text-green-400 uppercase text-lg">{fileName}</span>
              </div>
           </div>
           <div className="grid md:grid-cols-3 gap-10">
            <button onClick={() => setView('AI_CHAT')} className="bg-white dark:bg-slate-800 p-12 rounded-[56px] border-2 border-slate-100 dark:border-slate-700 hover:border-[#07bc0c] group text-left h-full shadow-2xl transition-all flex flex-col">
              <div className="w-20 h-20 bg-green-50 rounded-[28px] flex items-center justify-center text-[#07bc0c] mb-12 group-hover:bg-[#07bc0c] group-hover:text-white transition-all shadow-md"><MessageCircle size={44} /></div>
              <h3 className="text-4xl font-black dark:text-white mb-6 tracking-tight">AI Tutor</h3>
              <p className="text-slate-500 text-lg font-bold mb-12 flex-1">Instant semantic responses locked strictly to your document.</p>
              <div className="flex items-center text-[#07bc0c] font-black text-sm uppercase tracking-widest"><span>Open Tutor</span><ChevronRight size={20} /></div>
            </button>
            <button onClick={() => setView('QUIZ_CONFIG')} className="bg-slate-900 dark:bg-black p-12 rounded-[56px] hover:scale-[1.03] transition-all text-left h-full shadow-4xl flex flex-col">
              <div className="w-20 h-20 bg-[#07bc0c] rounded-[28px] flex items-center justify-center text-white mb-12 shadow-2xl"><Zap size={44} /></div>
              <h3 className="text-4xl font-black text-white mb-6 tracking-tight">Quizmetric</h3>
              <p className="text-slate-400 text-lg font-bold mb-12 flex-1">70% passing threshold. Unlock next topics by mastering current ones.</p>
              <div className="flex items-center text-green-400 font-black text-sm uppercase tracking-widest"><span>Initialize Path</span><ChevronRight size={20} /></div>
            </button>
            <button onClick={() => setView('EXAM_CONFIG')} className="bg-white dark:bg-slate-800 p-12 rounded-[56px] border-2 border-slate-100 dark:border-slate-700 hover:border-purple-600 group text-left h-full shadow-2xl transition-all flex flex-col">
              <div className="w-20 h-20 bg-purple-50 rounded-[28px] flex items-center justify-center text-purple-600 mb-12 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md"><NotebookPen size={44} /></div>
              <h3 className="text-4xl font-black dark:text-white mb-6 tracking-tight">Theory Exam</h3>
              <p className="text-slate-500 text-lg font-bold mb-12 flex-1">Answer 3/5 or 5/7 questions. 45/70 terminologies required to pass.</p>
              <div className="flex items-center text-purple-600 font-black text-sm uppercase tracking-widest"><span>Enter Exam</span><ChevronRight size={20} /></div>
            </button>
           </div>
        </div>
      )}

      {view === 'AI_CHAT' && (
        <div className="flex flex-col h-[750px] bg-white dark:bg-slate-800 rounded-[56px] border-2 border-slate-100 dark:border-slate-700 overflow-hidden animate-slideUp shadow-4xl">
          <div className="p-8 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-[#07bc0c]">
                <Brain size={32} />
              </div>
              <div>
                <h3 className="font-black dark:text-white text-2xl tracking-tight">Neural Tutor Core</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Context: {fileName}</p>
              </div>
            </div>
            <button onClick={() => setView('CHOICE')} className="p-4 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[24px] transition-all text-slate-400 hover:text-slate-600"><X size={32}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-slate-50/30 dark:bg-slate-900/30">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 text-center">
                <HelpCircle size={64} className="opacity-20" />
                <p className="font-bold text-xl">Ask anything found in the document.</p>
                <p className="text-xs uppercase tracking-widest opacity-50">Strict document grounding enabled</p>
              </div>
            )}
            {chatHistory.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-8 py-5 rounded-[32px] ${chat.role === 'user' ? 'bg-[#07bc0c] text-white rounded-br-none shadow-xl' : 'bg-white dark:bg-slate-700 dark:text-white rounded-bl-none border dark:border-slate-600 shadow-md'}`}>
                  <p className="text-lg font-medium leading-relaxed">{chat.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAskAI} className="p-10 border-t dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center space-x-6">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Query context..." className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-[32px] px-10 py-6 focus:ring-4 focus:ring-green-500/10 dark:text-white font-bold text-xl" />
            <button type="submit" disabled={isLaunching} className={`p-6 bg-[#07bc0c] text-white rounded-[28px] hover:bg-green-700 transition-all shadow-xl ${isLaunching ? 'animate-rocket opacity-50' : 'hover:scale-110'}`}><Rocket size={32} /></button>
          </form>
        </div>
      )}

      {view === 'EXAM_CONFIG' && (
        <div className="bg-white dark:bg-slate-800 rounded-[64px] p-20 border-2 border-slate-100 dark:border-slate-700 animate-slideUp shadow-3xl">
          <button onClick={() => setView('CHOICE')} className="mb-12 text-slate-400 font-black text-sm uppercase tracking-[0.4em] hover:text-[#07bc0c] flex items-center"><ArrowLeft size={24} className="mr-4"/> Return to Hub</button>
          <h2 className="text-6xl font-black mb-16 dark:text-white tracking-tight">Theory Exam Setup</h2>
          <div className="space-y-16">
            <div>
              <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-8">1. SELECT TOPIC ZONE</label>
              <div className="grid grid-cols-1 gap-4">
                {topics.map(t => {
                  const isSel = selectedTopic?.id === t.id;
                  const grade = topicGrades[t.id] || 0;
                  return (
                    <button key={t.id} onClick={() => setSelectedTopic(t)} className={`p-10 rounded-[40px] border-2 text-left transition-all ${isSel ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-xl' : 'hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/40'}`}>
                      <div className="flex justify-between items-center"><p className="font-black text-2xl dark:text-white tracking-tight">{t.title}</p><div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mastery</p><p className={`text-2xl font-black ${grade >= 64 ? 'text-green-600' : 'text-slate-300'}`}>{Math.round(grade)}%</p></div></div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-8">2. EXAM FORMAT</label>
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => setExamConfig({...examConfig, totalQuestions: 5, timeLimit: 3600})} className={`p-8 rounded-[32px] border-2 text-left transition-all ${examConfig.totalQuestions === 5 ? 'border-[#07bc0c] bg-green-50 shadow-lg' : 'border-slate-100 dark:border-slate-700'}`}>
                    <p className="font-black text-2xl dark:text-white">3 of 5</p><p className="text-sm font-bold text-slate-500 mt-2">Core Session</p>
                  </button>
                  <button onClick={() => setExamConfig({...examConfig, totalQuestions: 7, timeLimit: 5400})} className={`p-8 rounded-[32px] border-2 text-left transition-all ${examConfig.totalQuestions === 7 ? 'border-[#07bc0c] bg-green-50 shadow-lg' : 'border-slate-100 dark:border-slate-700'}`}>
                    <p className="font-black text-2xl dark:text-white">5 of 7</p><p className="text-sm font-bold text-slate-500 mt-2">Deep Session</p>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-8">3. DEPTH</label>
                <div className="flex gap-4">
                  {['Easy', 'Moderate', 'Hard'].map((lvl) => (
                    <button key={lvl} onClick={() => setExamConfig({...examConfig, difficulty: lvl as any})} className={`flex-1 p-5 rounded-[20px] border-2 text-center transition-all ${examConfig.difficulty === lvl ? 'border-purple-600 bg-purple-50' : 'border-slate-100 dark:border-slate-700'}`}>
                       <p className="font-black text-sm dark:text-white uppercase tracking-widest">{lvl}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={startExamFlow} disabled={!selectedTopic} className="w-full bg-purple-600 text-white py-12 rounded-[48px] font-black text-4xl hover:bg-purple-700 shadow-4xl shadow-purple-600/20 transition-all active:scale-95 flex items-center justify-center space-x-6"><span>Initialize Theory Gate</span><Rocket size={48} /></button>
          </div>
        </div>
      )}

      {view === 'EXAM_SESSION' && (
        <div className="bg-white dark:bg-slate-800 rounded-[64px] p-20 border-2 border-slate-100 dark:border-slate-700 animate-slideUp shadow-4xl relative">
          <div className="flex justify-between items-center mb-16">
            <div>
              <span className="bg-purple-600 text-white px-8 py-4 rounded-[28px] text-sm font-black uppercase tracking-[0.3em]">EXAM SECTION {currentIdx + 1}</span>
              <p className="text-xs font-bold text-slate-400 mt-4 ml-2">Answered: {answeredCount} / {requiredAnswers}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em]">Session Clock</p>
              <p className="font-mono text-5xl font-black text-purple-600">{Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>
          
          <div className="mb-20">
            <h3 className="text-6xl font-black dark:text-white leading-[1.1] tracking-tighter mb-6">{examSections[currentIdx]?.mainQuestion}</h3>
            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Document context mapping required for each response.</p>
          </div>

          <div className="space-y-16 mb-20">
            {examSections[currentIdx]?.subQuestions.map(sq => {
              const isDisabled = answeredCount >= requiredAnswers && !theoryAnswers[sq.id];
              return (
                <div key={sq.id} className={`animate-in fade-in slide-in-from-left-6 duration-700 border-l-8 border-purple-500 pl-10 py-4 ${isDisabled ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-black text-xl shadow-sm">{sq.id}</span>
                    <p className="text-3xl font-bold dark:text-white leading-relaxed">{sq.text}</p>
                  </div>
                  <textarea 
                    value={theoryAnswers[sq.id] || ''} 
                    onChange={e => setTheoryAnswers({ ...theoryAnswers, [sq.id]: e.target.value })} 
                    className="w-full h-56 p-10 rounded-[48px] bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:bg-white dark:focus:bg-slate-950 outline-none font-bold text-xl text-slate-900 dark:text-white shadow-inner transition-all resize-none" 
                    placeholder={isDisabled ? "Limit reached" : "Enter detailed response..."} 
                  />
                </div>
              );
            })}
          </div>

          <div className="flex space-x-8">
            <button onClick={handlePrev} disabled={currentIdx === 0} className="flex-1 py-10 border-4 border-slate-100 dark:border-slate-700 rounded-[44px] font-black text-2xl flex items-center justify-center space-x-6 disabled:opacity-10 dark:text-white hover:bg-slate-50 transition-all"><ChevronLeft size={40} /><span>Previous</span></button>
            <button 
              onClick={handleNext} 
              disabled={currentIdx === examSections.length - 1 && answeredCount < requiredAnswers}
              className={`flex-[2] py-10 rounded-[44px] font-black text-3xl flex items-center justify-center space-x-6 shadow-4xl transition-all active:scale-[0.98] ${answeredCount < requiredAnswers && currentIdx === examSections.length - 1 ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
            >
              <span>{currentIdx === examSections.length - 1 ? 'Submit Exam' : 'Next Section'}</span>
              <ChevronRight size={40} />
            </button>
          </div>
        </div>
      )}

      {view === 'EXAM_RESULT' && examResult && (
        <div className="space-y-20 animate-slideUp pb-64">
          <div className="bg-white dark:bg-slate-800 rounded-[80px] p-24 text-center shadow-4xl border-2 border-slate-100 dark:border-slate-700 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-6 bg-slate-100">
                <div className={`h-full transition-all duration-3000 ease-out ${examResult.score >= 45 ? 'bg-[#07bc0c] shadow-[0_0_20px_#07bc0c]' : 'bg-red-500 shadow-[0_0_20px_#ef4444]'}`} style={{ width: `${(examResult.score / 70) * 100}%` }}></div>
             </div>
             <div className="relative inline-block mb-16">
                <div className="absolute inset-0 bg-green-400 blur-[150px] opacity-20"></div>
                <div className="relative flex flex-col items-center justify-center w-80 h-80 border-[24px] rounded-full border-slate-100 dark:border-slate-700">
                   <div className={`absolute inset-[-24px] rounded-full border-[24px] ${examResult.score >= 45 ? 'border-[#07bc0c]' : 'border-red-500'} border-t-transparent border-l-transparent transition-all duration-3000`} style={{ transform: `rotate(${(examResult.score/70)*360}deg)` }}></div>
                   <span className="text-9xl font-black dark:text-white tabular-nums">{Math.round(examResult.score)}</span>
                   <span className="text-sm font-black text-slate-400 uppercase tracking-[0.5em] mt-4">Pts / 70</span>
                </div>
             </div>
             <h2 className="text-7xl font-black dark:text-white mb-8 tracking-tight">{examResult.score >= 45 ? 'Mastery Confirmed!' : 'Evaluation Failed'}</h2>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-2xl max-w-2xl mx-auto mb-16 leading-relaxed">
               {examResult.score >= 45 ? "Terminology threshold met (45/70). You've mastered this topic." : "Score below 45/70. Refine terminology usage from the document."}
             </p>
             <div className="flex flex-col sm:flex-row gap-10 justify-center">
                <button onClick={() => setView('CHOICE')} className="px-20 py-8 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-[44px] font-black text-2xl uppercase tracking-widest shadow-xl transition-all">Hub Home</button>
                <button onClick={() => setView('EXAM_CONFIG')} className="px-20 py-8 bg-purple-600 text-white rounded-[44px] font-black text-2xl shadow-4xl uppercase tracking-widest transition-all">Retry Exam</button>
             </div>
          </div>
          
          <div className="space-y-16">
             <h3 className="text-5xl font-black px-16 dark:text-white tracking-tight">Review Session</h3>
             {examSections.map((sec, sIdx) => (
                <div key={sec.id} className="bg-white dark:bg-slate-800 p-16 rounded-[64px] border-2 border-slate-100 dark:border-slate-700 shadow-2xl transition-all">
                   <div className="flex items-start space-x-12">
                      <div className="flex-shrink-0 w-16 h-16 rounded-[28px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-2xl dark:text-white shadow-inner">{sIdx+1}</div>
                      <div className="flex-1">
                         <h4 className="text-4xl font-black mb-12 dark:text-white tracking-tighter">{sec.mainQuestion}</h4>
                         <div className="space-y-12">
                            {sec.subQuestions.map(sq => {
                               if (!theoryAnswers[sq.id]) return null;
                               const graded = examResult.gradedAnswers.find(ga => ga.subId === sq.id);
                               const isExp = showRef === sq.id;
                               return (
                                 <div key={sq.id} className="bg-slate-50 dark:bg-slate-950/40 p-12 rounded-[56px] border dark:border-slate-800 shadow-inner group">
                                   <div className="flex justify-between items-center mb-8">
                                      <span className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Exam Part {sq.id}</span>
                                      <span className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm ${graded?.score && graded.score > 5 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>GRADED</span>
                                   </div>
                                   <p className="text-3xl font-bold dark:text-slate-200 mb-10 leading-relaxed italic">"{theoryAnswers[sq.id] || '[NO DATA]'}"</p>
                                   <div className="flex flex-wrap gap-4 mb-10">
                                      {sq.keywords.map(kw => (
                                        <span key={kw} className={`px-6 py-2 rounded-full text-sm font-black border transition-all ${graded?.keywordsFound.includes(kw) ? 'bg-green-100 border-green-500 text-green-700' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 opacity-60'}`}>{kw}</span>
                                      ))}
                                   </div>
                                   <button onClick={() => setShowRef(isExp ? null : sq.id)} className="flex items-center space-x-5 text-[#07bc0c] font-black text-sm uppercase tracking-[0.4em] hover:bg-green-50 dark:hover:bg-green-900/20 px-8 py-4 rounded-[32px] transition-all border-2 border-transparent hover:border-[#07bc0c] shadow-sm"><Eye size={24} /><span>Review Page {sq.pageNumber} Reference</span></button>
                                   {isExp && (
                                     <div className="mt-10 p-10 bg-blue-50 dark:bg-blue-900/30 border-l-[24px] border-blue-500 rounded-r-[56px] animate-slideUp shadow-3xl">
                                       <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-[0.6em] mb-10 italic">Source Extract (Page {sq.pageNumber})</p>
                                       <p className="text-4xl italic text-blue-900 dark:text-blue-100 leading-[1.8] font-serif font-medium">"{sq.referenceText}"</p>
                                     </div>
                                   )}
                                 </div>
                               );
                            })}
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {view === 'QUIZ_CONFIG' && (
        <div className="bg-white dark:bg-slate-800 rounded-[72px] p-20 border-2 border-slate-100 dark:border-slate-700 shadow-4xl animate-slideUp">
          <button onClick={() => setView('CHOICE')} className="mb-12 text-slate-400 font-black text-sm uppercase tracking-[0.5em] hover:text-[#07bc0c] flex items-center"><ArrowLeft size={24} className="mr-4"/> Hub Control</button>
          <h2 className="text-6xl font-black mb-16 dark:text-white tracking-tight">Quizmetric Matrix</h2>
          <div className="space-y-16">
            <div className="grid grid-cols-1 gap-6">
              {topics.map(t => (
                <button key={t.id} onClick={() => setSelectedTopic(t)} className={`p-10 rounded-[40px] border-2 text-left transition-all ${selectedTopic?.id === t.id ? 'border-[#07bc0c] bg-green-50 shadow-xl' : 'hover:border-slate-300'}`}>
                  <div className="flex justify-between items-center"><p className="font-black text-2xl dark:text-white">{t.title}</p><p className="text-2xl font-black text-slate-300">{Math.round(topicGrades[t.id] || 0)}%</p></div>
                </button>
              ))}
            </div>
            <button onClick={startQuizFlow} disabled={!selectedTopic} className="w-full bg-[#07bc0c] text-white py-12 rounded-[48px] font-black text-4xl shadow-4xl shadow-[#07bc0c]/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center space-x-8"><span>Launch Quiz Session</span><Rocket size={48} /></button>
          </div>
        </div>
      )}

      {view === 'QUIZ_SESSION' && (
         <div className="bg-white dark:bg-slate-800 rounded-[72px] p-16 border-2 border-[#07bc0c]/20 shadow-4xl animate-slideUp relative">
            <div className="flex justify-between items-center mb-16"><span className="bg-[#07bc0c] text-white px-8 py-4 rounded-[28px] text-sm font-black uppercase tracking-[0.3em]">Query {currentIdx + 1} of {quizQuestions.length}</span><div className="text-right">{quizConfig.isTimed && <><p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em]">Matrix Timer</p><p className="font-mono text-5xl font-black text-[#07bc0c]">{timeLeft}S</p></>}</div></div>
            <div className="mb-20"><div className="w-full bg-slate-100 dark:bg-slate-900 h-6 rounded-full mb-16 overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800"><div className="bg-[#07bc0c] h-full rounded-full transition-all duration-1000 shadow-[0_0_25px_#07bc0c]" style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}></div></div><p className="text-6xl font-black dark:text-white leading-[1.1] tracking-tighter">{quizQuestions[currentIdx]?.question}</p></div>
            <div className="grid grid-cols-1 gap-6 mb-20">{quizQuestions[currentIdx]?.options.map((opt, i) => (
              <button key={i} onClick={() => { const newAns = [...userAnswers]; newAns[currentIdx] = i; setUserAnswers(newAns); }} className={`w-full text-left p-10 rounded-[44px] border-2 transition-all flex items-center justify-between group ${userAnswers[currentIdx] === i ? 'border-[#07bc0c] bg-green-50 text-green-900 shadow-xl' : 'border-slate-100 hover:border-slate-300'}`}>
                <div className="flex items-center space-x-8"><span className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-xl ${userAnswers[currentIdx] === i ? 'bg-[#07bc0c] text-white' : 'bg-slate-100 text-slate-500'}`}>{String.fromCharCode(65 + i)}</span><span className="font-black text-3xl">{opt}</span></div>{userAnswers[currentIdx] === i && <CheckCircle2 size={40} className="text-[#07bc0c]" />}
              </button>))}</div>
            <div className="flex space-x-8"><button onClick={handlePrev} disabled={currentIdx === 0} className="flex-1 py-10 border-4 border-slate-100 rounded-[40px] font-black text-2xl flex items-center justify-center space-x-6 disabled:opacity-10 transition-all"><ChevronLeft size={40} /><span>Previous</span></button><button onClick={handleNext} className="flex-[2] py-10 bg-slate-900 text-white rounded-[40px] font-black text-3xl hover:bg-black flex items-center justify-center space-x-6 shadow-4xl transition-all active:scale-[0.98]"><span>{currentIdx === quizQuestions.length - 1 ? 'Analyze Final Path' : 'Continue Path'}</span><ChevronRight size={40} /></button></div>
         </div>
      )}

      {view === 'QUIZ_RESULT' && quizResult && (
        <div className="space-y-20 animate-slideUp pb-64">
          <div className="bg-white dark:bg-slate-800 rounded-[80px] p-24 text-center shadow-4xl border-2 border-slate-100 dark:border-slate-700 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-6 bg-slate-100">
                <div className={`h-full transition-all duration-2000 ease-out ${quizResult.passed ? 'bg-[#07bc0c]' : 'bg-orange-500'}`} style={{ width: `${(quizResult.score / quizResult.total) * 100}%` }}></div>
             </div>
             <div className="relative inline-block mb-16">
                <div className="absolute inset-0 bg-green-400 blur-[150px] opacity-20"></div>
                <div className="relative flex items-center justify-center w-80 h-80 border-[24px] rounded-full border-slate-100 dark:border-slate-700">
                   <div className={`absolute inset-[-24px] rounded-full border-[24px] ${quizResult.passed ? 'border-[#07bc0c]' : 'border-orange-500'} border-t-transparent border-l-transparent transition-all duration-3000`} style={{ transform: `rotate(${(quizResult.score/quizResult.total)*360}deg)` }}></div>
                   <span className="text-9xl font-black dark:text-white tabular-nums">{Math.round((quizResult.score / quizResult.total) * 100)}%</span>
                </div>
             </div>
             <h2 className="text-7xl font-black dark:text-white mb-8 tracking-tight">{quizResult.passed ? 'Matrix Path Cleared!' : 'Synchronization Failed'}</h2>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-2xl max-w-2xl mx-auto mb-16 leading-relaxed">
               {quizResult.passed ? "70% score reached. Next topic access granted." : "70% mastery required to proceed. Retake the path."}
             </p>
             <div className="flex flex-col sm:flex-row gap-10 justify-center">
                <button onClick={() => setView('CHOICE')} className="px-20 py-8 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-[44px] font-black text-2xl uppercase tracking-widest shadow-xl transition-all">Hub Home</button>
                <button onClick={() => setView('QUIZ_CONFIG')} className="px-20 py-8 bg-[#07bc0c] text-white rounded-[44px] font-black text-2xl shadow-4xl uppercase tracking-widest transition-all">Retry Path</button>
             </div>
          </div>
          <div className="space-y-12">
            {quizQuestions.map((q, idx) => {
              const isCorrect = userAnswers[idx] === q.correctAnswer;
              const isExp = showRef === q.id.toString();
              return (
                <div key={q.id} className="bg-white dark:bg-slate-800 p-12 rounded-[56px] border-2 shadow-sm transition-all hover:shadow-lg">
                  <div className="flex items-start space-x-10">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-[28px] flex items-center justify-center font-black text-2xl shadow-inner ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{idx+1}</div>
                    <div className="flex-1">
                      <p className="text-4xl font-black mb-10 dark:text-white leading-tight">{q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`p-8 rounded-[36px] border-2 flex items-center justify-between transition-all ${i === q.correctAnswer ? 'bg-green-50 border-green-200' : (userAnswers[idx] === i && !isCorrect ? 'bg-red-50 border-red-200' : 'dark:border-slate-700')}`}>
                             <span className="text-xl font-bold">{opt}</span>
                             {i === q.correctAnswer && <CheckCircle2 size={28} className="text-green-600" />}
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[44px] border dark:border-slate-700 shadow-inner mb-8">
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Neural Logic</span>
                         <p className="text-2xl font-medium leading-relaxed italic">"{q.explanation}"</p>
                      </div>
                      <button onClick={() => setShowRef(isExp ? null : q.id.toString())} className="flex items-center space-x-4 text-[#07bc0c] font-black text-sm uppercase tracking-[0.4em] hover:bg-green-50 dark:hover:bg-green-900/20 px-8 py-4 rounded-[28px] transition-all"><Eye size={24} /><span>Review Page {q.pageNumber} Reference</span></button>
                      {isExp && q.referenceText && (
                        <div className="mt-8 p-10 bg-blue-50 dark:bg-blue-900/30 border-l-[24px] border-blue-500 rounded-r-[56px] animate-slideUp shadow-3xl">
                           <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest italic mb-6">PDF Extraction Verified (Page {q.pageNumber})</p>
                           <p className="text-4xl italic text-blue-900 dark:text-blue-100 leading-[1.8] font-serif font-medium">"{q.referenceText}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
