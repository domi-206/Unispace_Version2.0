import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Lock, CheckCircle, Play, ChevronRight, RefreshCw, Clock, Brain, Download, BookOpen, Layers, HelpCircle, Trash2, Zap } from 'lucide-react';
import { generateTopicsFromText, generateQuizForTopic, analyzeQuizPerformance, extractTextFromFile, askStudyQuestion, analyzeCourseMaterial, generateFlashcards } from '../services/geminiService';
import { QuizQuestion, QuizResult, Topic, QuizConfig, AIAnalysisResult, Flashcard } from '../types';

interface StudyHubProps {
  isVerified: boolean;
  hasAccess: boolean; // Trial or Premium check
  onShareResult: (score: number, total: number) => void;
  topics: Topic[];
  onUpdateTopics: (topics: Topic[]) => void;
}

export const StudyHub: React.FC<StudyHubProps> = ({ isVerified, hasAccess, onShareResult, topics, onUpdateTopics }) => {
  // Main Tab State
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
  const [engineMode, setEngineMode] = useState<'INPUT' | 'RESULT_ANALYZE' | 'RESULT_FLASHCARDS'>('INPUT');
  const [engineCourseFiles, setEngineCourseFiles] = useState<File[]>([]);
  const [enginePastQFiles, setEnginePastQFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (mode === 'QUIZ' && quizConfig.isTimed && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (mode === 'QUIZ' && quizConfig.isTimed && timeLeft === 0) {
      // Time up
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, mode, quizConfig.isTimed]);

  // Handle File Upload & Processing (PATH MODE)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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

  const openTopicConfig = (topic: Topic) => {
    if (topic.isLocked) return;
    setActiveTopic(topic);
    setMode('CONFIG');
  };

  const handleStartQuiz = async () => {
    if (!activeTopic) return;
    setIsProcessing(true);
    
    // Simulate context retrieval based on topic
    const context = `Context for ${activeTopic.title}: ${activeTopic.description}. (Mock content for quiz generation)`;
    const questions = await generateQuizForTopic(activeTopic.title, context, quizConfig.numQuestions);
    
    setQuizQuestions(questions);
    setAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestionIdx(0);
    setResult(null);
    
    if (quizConfig.isTimed) {
      setTimeLeft(quizConfig.timePerQuestion);
    }
    
    setMode('QUIZ');
    setIsProcessing(false);
  };

  const handleAskAI = async () => {
    if (!activeTopic || !aiQuestion.trim()) return;
    setIsProcessing(true);
    const context = `Context for ${activeTopic.title}: ${activeTopic.description}`;
    const answer = await askStudyQuestion(context, aiQuestion);
    setAiAnswer(answer);
    setIsProcessing(false);
  };

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      if (quizConfig.isTimed) {
        setTimeLeft(quizConfig.timePerQuestion);
      }
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsProcessing(true);
    const analysis = await analyzeQuizPerformance(quizQuestions, answers);
    setResult(analysis);
    
    // Update Topic Status
    if (analysis.passed && activeTopic) {
      const updatedTopics = topics.map((t, idx) => {
        if (t.id === activeTopic.id) return { ...t, isCompleted: true, lastScore: analysis.score };
        // Unlock next topic
        if (idx > 0 && topics[idx-1].id === activeTopic.id) return { ...t, isLocked: false };
        return t;
      });
      onUpdateTopics(updatedTopics);
    }
    
    setMode('RESULT');
    setIsProcessing(false);
  };

  // --- AI ENGINE HANDLERS ---

  const handleCourseFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEngineCourseFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handlePastQFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEnginePastQFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeCourseFile = (index: number) => {
    setEngineCourseFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removePastQFile = (index: number) => {
    setEnginePastQFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFilesToString = async (files: File[]) => {
    const texts = await Promise.all(files.map(extractTextFromFile));
    return texts.join("\n\n--- NEXT DOCUMENT ---\n\n");
  };

  const handleEngineAnalyze = async () => {
    if (engineCourseFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const courseText = await processFilesToString(engineCourseFiles);
      const pastQText = await processFilesToString(enginePastQFiles);
      
      const result = await analyzeCourseMaterial(courseText, pastQText);
      setAnalysisResult(result);
      setEngineMode('RESULT_ANALYZE');
    } catch (e) {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEngineFlashcards = async () => {
    if (engineCourseFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const courseText = await processFilesToString(engineCourseFiles);
      const pastQText = await processFilesToString(enginePastQFiles);
      const fullText = courseText + "\n\n--- PAST QUESTIONS ---\n" + pastQText;

      const cards = await generateFlashcards(fullText);
      setFlashcards(cards);
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
      setEngineMode('RESULT_FLASHCARDS');
    } catch (e) {
      alert("Flashcard generation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTextFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadAnalysis = () => {
    if (!analysisResult) return;
    let content = "GENERATED SOLUTIONS\nBased strictly on uploaded course material.\n\n";
    
    // FORMAT: QUESTION: ... \n ANSWER: ... (Matches Python Script output)
    if (analysisResult.pastQuestionAnswers.length > 0) {
      analysisResult.pastQuestionAnswers.forEach((pq) => {
        content += `QUESTION: ${pq.question}\n`;
        content += `ANSWER: ${pq.answer}\n\n`;
        content += "--------------------------------------------------\n\n";
      });
    }

    downloadTextFile(`solved_past_questions.txt`, content);
  };

  const handleDownloadFlashcards = () => {
    if (flashcards.length === 0) return;
    let content = "";
    flashcards.forEach((card) => {
      // Ensure prefixes are present
      const term = card.term.trim();
      const def = card.definition.trim();
      
      const qText = term.startsWith('Q:') ? term : `Q: ${term}`;
      const aText = def.startsWith('A:') ? def : `A: ${def}`;
      
      content += `${qText}\n${aText}\n\n`;
    });
    downloadTextFile(`Flashcards_${new Date().toISOString().split('T')[0]}.txt`, content);
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <Lock size={48} className="text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Access Locked</h2>
        <p className="text-slate-500 max-w-md mt-2">Your 7-day free trial has expired. Please upgrade to Premium to continue accessing StudyHub.</p>
        <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-full font-bold">Upgrade Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Menu Switcher */}
      <div className="flex justify-center mb-6">
        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl flex shadow-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('PATH')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'PATH' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Topic Path
          </button>
          <button 
            onClick={() => setActiveTab('AI_ENGINE')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'AI_ENGINE' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Brain size={16} />
            <span>AI Engine</span>
          </button>
        </div>
      </div>

      {/* --- CONTENT FOR TOPIC PATH --- */}
      {activeTab === 'PATH' && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold dark:text-white">StudyHub Path</h2>
                <p className="text-slate-500 text-sm">Upload documents, master topics, track progress.</p>
             </div>
             {topics.length > 0 && mode === 'OVERVIEW' && (
               <button onClick={() => {onUpdateTopics([]); setFile(null); setMode('OVERVIEW');}} className="text-sm text-green-600 font-semibold hover:underline">
                 Upload New Document
               </button>
             )}
             {mode !== 'OVERVIEW' && (
               <button onClick={() => setMode('OVERVIEW')} className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                 Back to Topics
               </button>
             )}
          </div>

          {/* Upload Section */}
          {topics.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
               {isProcessing ? (
                 <div className="flex flex-col items-center z-10">
                   <div className="relative w-32 h-32 mb-8">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Brain size={48} className="text-green-600 animate-pulse" />
                      </div>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 animate-pulse">Neural Analysis in Progress</h3>
                   <p className="text-slate-500 text-sm max-w-xs mx-auto">Extracting concepts...</p>
                 </div>
               ) : (
                 <>
                   <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-green-600 shadow-lg shadow-green-100 dark:shadow-none">
                     <Upload size={36} />
                   </div>
                   <h3 className="text-2xl font-bold mb-3 dark:text-white">Upload Study Material</h3>
                   <p className="text-slate-500 mb-8 max-w-md mx-auto">Drag & drop your lecture notes or textbooks here. We support PDF, DOCX, and TXT.</p>
                   
                   <div className="relative">
                      <input 
                        type="file" 
                        id="doc-upload" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        accept=".pdf,.docx,.txt"
                      />
                      <label htmlFor="doc-upload" className="inline-flex items-center space-x-2 bg-slate-900 dark:bg-green-600 text-white px-8 py-4 rounded-xl font-bold cursor-pointer hover:bg-slate-800 dark:hover:bg-green-700 transition-all hover:shadow-xl">
                        <Zap size={20} className="text-yellow-400" />
                        <span>Generate Quiz Path</span>
                      </label>
                   </div>
                 </>
               )}
            </div>
          )}

          {/* Topics Overview */}
          {mode === 'OVERVIEW' && topics.length > 0 && (
            <div className="space-y-4">
               {topics.map((topic, index) => (
                 <div key={topic.id} className={`group bg-white dark:bg-slate-800 rounded-2xl p-6 border ${topic.isLocked ? 'border-slate-100 dark:border-slate-700 opacity-70' : 'border-slate-200 dark:border-slate-600 hover:border-green-400'} transition-all`}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${topic.isCompleted ? 'bg-green-100 text-green-600' : topic.isLocked ? 'bg-slate-100 text-slate-400' : 'bg-green-600 text-white'}`}>
                             {topic.isCompleted ? <CheckCircle size={20} /> : index + 1}
                          </div>
                          <div>
                             <h3 className="font-bold text-lg dark:text-white">{topic.title}</h3>
                             <p className="text-sm text-slate-500">{topic.description}</p>
                          </div>
                       </div>
                       
                       <div>
                         {topic.isLocked ? (
                           <Lock className="text-slate-300" />
                         ) : (
                           <button 
                             onClick={() => openTopicConfig(topic)}
                             className="flex items-center space-x-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors"
                           >
                             {topic.isCompleted ? 'Retake' : 'Start'}
                             <Play size={16} />
                           </button>
                         )}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* Configuration Mode */}
          {mode === 'CONFIG' && activeTopic && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-2 dark:text-white">{activeTopic.title}</h3>
              <p className="text-slate-500 mb-8">Choose how you want to study this topic.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button 
                  onClick={() => setMode('ASK_AI')}
                  className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left group"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-green-100 group-hover:text-green-600">
                    <Brain size={24} />
                  </div>
                  <h4 className="font-bold text-lg dark:text-white mb-1">Ask AI</h4>
                  <p className="text-sm text-slate-500">Chat with the document to clarify doubts.</p>
                </button>

                <div className="p-6 border-2 border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-slate-800 rounded-2xl">
                  <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="font-bold text-lg dark:text-white mb-4">Take Quiz</h4>
                  <div className="space-y-4">
                     <div>
                        <label className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Questions</span>
                          <span className="text-green-600">{quizConfig.numQuestions}</span>
                        </label>
                        <input 
                          type="range" min="10" max="100" step="5"
                          value={quizConfig.numQuestions}
                          onChange={(e) => setQuizConfig({...quizConfig, numQuestions: parseInt(e.target.value)})}
                          className="w-full accent-green-600"
                        />
                     </div>
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Timed Quiz</label>
                           <button 
                             onClick={() => setQuizConfig({...quizConfig, isTimed: !quizConfig.isTimed})}
                             className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${quizConfig.isTimed ? 'bg-green-600' : 'bg-slate-300'}`}
                           >
                              <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${quizConfig.isTimed ? 'translate-x-5' : ''}`}></div>
                           </button>
                        </div>
                     </div>
                     <button onClick={handleStartQuiz} className="w-full mt-2 bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 transition-colors">Start Quiz</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ask AI & Quiz Interfaces */}
          {mode === 'ASK_AI' && activeTopic && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
               <h3 className="font-bold text-xl mb-4 flex items-center dark:text-white">
                 <Brain className="mr-2 text-blue-500" /> Ask about "{activeTopic.title}"
               </h3>
               <div className="h-64 overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-xl p-4 mb-4 bg-slate-50 dark:bg-slate-900">
                  {aiAnswer ? <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{aiAnswer}</p> : <p className="text-center text-slate-400 mt-20">Type a question below.</p>}
               </div>
               <div className="flex space-x-2">
                  <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="Type your question..." className="flex-1 border dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-2" />
                  <button onClick={handleAskAI} disabled={isProcessing} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700">{isProcessing ? '...' : 'Ask'}</button>
               </div>
            </div>
          )}

          {mode === 'QUIZ' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
               {isProcessing ? (
                  <div className="text-center py-12"><RefreshCw className="animate-spin mx-auto text-green-600 mb-4" /><p className="dark:text-white">Generating...</p></div>
               ) : (
                  <>
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {currentQuestionIdx + 1}</span>
                       {quizConfig.isTimed && <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-bold bg-slate-100 dark:bg-slate-700 dark:text-white"><Clock size={14} /><span>{timeLeft}s</span></div>}
                    </div>
                    <h3 className="text-xl font-bold mb-6 dark:text-white">{quizQuestions[currentQuestionIdx]?.question}</h3>
                    <div className="space-y-3 mb-8">
                       {quizQuestions[currentQuestionIdx]?.options.map((opt, idx) => (
                          <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left p-4 rounded-xl border transition-all ${answers[currentQuestionIdx] === idx ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{opt}</button>
                       ))}
                    </div>
                    <div className="flex justify-end">
                       <button onClick={handleNextQuestion} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center space-x-2"><span>Next</span><ChevronRight size={18} /></button>
                    </div>
                  </>
               )}
            </div>
          )}

          {mode === 'RESULT' && result && (
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-w-2xl mx-auto p-8 text-center">
                <h3 className={`text-3xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-red-500'}`}>{result.passed ? 'Passed!' : 'Try Again'}</h3>
                <div className="mt-6 inline-block bg-slate-100 dark:bg-slate-700 rounded-full px-6 py-2 font-mono text-2xl font-bold dark:text-white">{Math.round((result.score / result.total) * 100)}%</div>
                <button onClick={() => setMode('OVERVIEW')} className="mt-8 w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl">Back to Topics</button>
             </div>
          )}
        </>
      )}

      {/* --- CONTENT FOR AI ENGINE --- */}
      {activeTab === 'AI_ENGINE' && (
        <div className="animate-in slide-in-from-right duration-300">
          {/* Engine Input Mode */}
          {engineMode === 'INPUT' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 text-center max-w-3xl mx-auto">
              {isProcessing ? (
                <div className="py-12">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-green-200 dark:border-green-900 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white mb-2">Processing Course Material...</h3>
                  <p className="text-slate-500">Extracting and Solving Questions.</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Intelligent Exam Solver</h2>
                    <p className="text-slate-500 dark:text-slate-400">Upload Course Material AND Past Questions. The AI will extract and solve questions strictly based on the material.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Primary Upload */}
                    <div className={`border-2 border-dashed rounded-2xl p-6 transition-all ${engineCourseFiles.length > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-green-400'}`}>
                      <div className="mb-4">
                        <FileText size={32} className={`mx-auto ${engineCourseFiles.length > 0 ? 'text-green-600' : 'text-slate-400'}`} />
                      </div>
                      <h4 className="font-bold text-sm mb-1 dark:text-white">1. Course Material</h4>
                      <p className="text-xs text-slate-500 mb-4">Textbooks, Notes, Slides</p>
                      <input type="file" id="engine-course-upload" className="hidden" onChange={handleCourseFilesSelect} accept=".pdf,.docx,.txt" multiple />
                      <label htmlFor="engine-course-upload" className="inline-block px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white shadow-sm">
                        {engineCourseFiles.length > 0 ? 'Add More' : 'Select Files'}
                      </label>
                      {engineCourseFiles.length > 0 && <div className="mt-4 text-left max-h-32 overflow-y-auto space-y-1">{engineCourseFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-1.5 rounded">
                          <span className="truncate flex-1">{f.name}</span>
                          <button onClick={() => removeCourseFile(i)} className="ml-2 text-green-800 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      ))}</div>}
                    </div>

                    {/* Past Questions Upload */}
                    <div className={`border-2 border-dashed rounded-2xl p-6 transition-all ${enginePastQFiles.length > 0 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}>
                      <div className="mb-4">
                        <HelpCircle size={32} className={`mx-auto ${enginePastQFiles.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      <h4 className="font-bold text-sm mb-1 dark:text-white">2. Past Questions</h4>
                      <p className="text-xs text-slate-500 mb-4">Exam papers to solve</p>
                      <input type="file" id="engine-pq-upload" className="hidden" onChange={handlePastQFilesSelect} accept=".pdf,.docx,.txt" multiple />
                      <label htmlFor="engine-pq-upload" className="inline-block px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white shadow-sm">
                        {enginePastQFiles.length > 0 ? 'Add More' : 'Select Files'}
                      </label>
                      {enginePastQFiles.length > 0 && <div className="mt-4 text-left max-h-32 overflow-y-auto space-y-1">{enginePastQFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-xs text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded">
                          <span className="truncate flex-1">{f.name}</span>
                          <button onClick={() => removePastQFile(i)} className="ml-2 text-blue-800 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      ))}</div>}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={handleEngineAnalyze}
                      disabled={engineCourseFiles.length === 0 || enginePastQFiles.length === 0}
                      className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center space-x-2 w-full sm:w-auto"
                    >
                      <Brain size={20} />
                      <span>🧠 Solve Past Questions</span>
                    </button>
                    <button 
                      onClick={handleEngineFlashcards}
                      disabled={engineCourseFiles.length === 0}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center space-x-2 w-full sm:w-auto"
                    >
                      <Layers size={20} />
                      <span>⚡ Flashcards (Coming Soon)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Engine Analysis Result */}
          {engineMode === 'RESULT_ANALYZE' && analysisResult && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <button onClick={() => setEngineMode('INPUT')} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-sm flex items-center">
                  <ChevronRight className="rotate-180 mr-1" size={16} /> Back to Upload
                </button>
                <button 
                  onClick={handleDownloadAnalysis}
                  className="flex items-center space-x-1 text-green-600 font-semibold text-sm hover:underline bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  <span>Download Solutions (TXT)</span>
                </button>
              </div>

              {/* Past Questions - PRIMARY VIEW */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-6 flex items-center dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                  <CheckCircle className="mr-2 text-green-600" /> GENERATED SOLUTIONS
                </h3>
                {analysisResult.pastQuestionAnswers.length === 0 ? (
                   <p className="text-slate-500 text-center py-4">No questions detected in the uploaded files.</p>
                ) : (
                   <div className="space-y-8">
                    {analysisResult.pastQuestionAnswers.map((pq, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                        {/* Question */}
                        <div className="mb-4">
                          <span className="font-bold text-slate-900 dark:text-white text-lg block leading-snug">
                            **Q{i + 1}: {pq.question}**
                          </span>
                        </div>
                        
                        {/* Answer */}
                        <div className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="w-full">
                             <span className="block font-bold text-green-600 dark:text-green-400 mb-2 italic">*Answer:*</span>
                             <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">{pq.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                   </div>
                )}
              </section>
            </div>
          )}

          {/* Engine Flashcards Result */}
          {engineMode === 'RESULT_FLASHCARDS' && flashcards.length > 0 && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setEngineMode('INPUT')} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-sm flex items-center">
                  <ChevronRight className="rotate-180 mr-1" size={16} /> Back
                </button>
                <button onClick={handleDownloadFlashcards} className="flex items-center space-x-1 text-indigo-600 font-semibold text-sm hover:underline bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors">
                  <Download size={16} /> <span>Download Flashcards</span>
                </button>
              </div>
              <div className="perspective-1000 w-full h-80 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* FRONT: QUESTION */}
                  <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{flashcards[currentFlashcardIndex].term}</h3>
                    <p className="text-sm text-slate-400 mt-4 animate-pulse">Click to see Answer</p>
                  </div>
                  {/* BACK: ANSWER */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8">
                    <p className="text-lg font-medium leading-relaxed">{flashcards[currentFlashcardIndex].definition}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center space-x-8 mt-8">
                <button onClick={() => { setCurrentFlashcardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length); setIsFlipped(false); }} className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md hover:scale-110 transition-transform dark:text-white">
                  <ChevronRight className="rotate-180" size={24} />
                </button>
                <span className="text-slate-500 dark:text-slate-400 font-bold">{currentFlashcardIndex + 1} / {flashcards.length}</span>
                <button onClick={() => { setCurrentFlashcardIndex(prev => (prev + 1) % flashcards.length); setIsFlipped(false); }} className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-md hover:scale-110 transition-transform dark:text-white">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};