
import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Lock, CheckCircle, Play, ChevronRight, AlertTriangle, RefreshCw, Clock, Brain, MessageSquare, Settings } from 'lucide-react';
import { generateTopicsFromText, generateQuizForTopic, analyzeQuizPerformance, extractTextFromFile, askStudyQuestion } from '../services/geminiService';
import { QuizQuestion, QuizResult, Topic, QuizConfig } from '../types';

interface StudyHubProps {
  isVerified: boolean;
  hasAccess: boolean; // Trial or Premium check
  onShareResult: (score: number, total: number) => void;
  topics: Topic[];
  onUpdateTopics: (topics: Topic[]) => void;
}

export const StudyHub: React.FC<StudyHubProps> = ({ isVerified, hasAccess, onShareResult, topics, onUpdateTopics }) => {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Quiz Session State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  
  // New States for Settings/Modes
  const [mode, setMode] = useState<'OVERVIEW' | 'CONFIG' | 'QUIZ' | 'ASK_AI' | 'RESULT'>('OVERVIEW');
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({ numQuestions: 10, isTimed: false, timePerQuestion: 60 });
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Ask AI State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  // Timer Effect
  useEffect(() => {
    if (mode === 'QUIZ' && quizConfig.isTimed && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (mode === 'QUIZ' && quizConfig.isTimed && timeLeft === 0) {
      // Time up for this question/quiz? 
      // If we want per question timer:
      // handleNextQuestion();
      // For now, let's treat it as a visual alert or auto-submit if it was global.
      // Implementing Per Question Logic below in render:
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, mode, quizConfig.isTimed]);

  // Handle File Upload & Processing
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
      {/* Header */}
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold dark:text-white">StudyHub AI</h2>
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
        <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
           {isProcessing ? (
             <div className="animate-pulse flex flex-col items-center">
               <RefreshCw className="animate-spin text-green-600 mb-4" size={32} />
               <p className="font-semibold dark:text-white">Analyzing Document & Generating Topics...</p>
             </div>
           ) : (
             <>
               <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                 <Upload size={32} />
               </div>
               <h3 className="text-xl font-bold mb-2 dark:text-white">Upload Study Material</h3>
               <p className="text-slate-500 mb-6">PDF, DOCX, or TXT formats supported.</p>
               <input 
                 type="file" 
                 id="doc-upload" 
                 className="hidden" 
                 onChange={handleFileUpload} 
                 accept=".pdf,.docx,.txt"
               />
               <label htmlFor="doc-upload" className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-green-700 transition-colors shadow-lg shadow-green-200 dark:shadow-none">
                 Select Document
               </label>
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        topic.isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : topic.isLocked 
                             ? 'bg-slate-100 text-slate-400' 
                             : 'bg-green-600 text-white'
                      }`}>
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
              <p className="text-sm text-slate-500">Chat with the document to clarify doubts before testing.</p>
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
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
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
                    {quizConfig.isTimed && (
                       <div>
                          <label className="flex justify-between text-xs text-slate-500 mb-1">
                             <span>Time per question</span>
                             <span>{quizConfig.timePerQuestion}s</span>
                          </label>
                          <input 
                            type="range" 
                            min="30" 
                            max="120" 
                            step="10"
                            value={quizConfig.timePerQuestion}
                            onChange={(e) => setQuizConfig({...quizConfig, timePerQuestion: parseInt(e.target.value)})}
                            className="w-full accent-green-600"
                          />
                       </div>
                    )}
                 </div>

                 <button 
                   onClick={handleStartQuiz}
                   className="w-full mt-2 bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 transition-colors"
                 >
                   Start Quiz
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ask AI Interface */}
      {mode === 'ASK_AI' && activeTopic && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
           <h3 className="font-bold text-xl mb-4 flex items-center dark:text-white">
             <Brain className="mr-2 text-blue-500" />
             Ask about "{activeTopic.title}"
           </h3>
           
           <div className="h-64 overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-xl p-4 mb-4 bg-slate-50 dark:bg-slate-900">
              {aiAnswer ? (
                <div className="flex items-start space-x-3">
                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">AI</div>
                   <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{aiAnswer}</p>
                </div>
              ) : (
                <p className="text-center text-slate-400 mt-20">Type a question below to get clarification on this topic.</p>
              )}
           </div>

           <div className="flex space-x-2">
              <input 
                type="text" 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ex: Explain the key concept of..."
                className="flex-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button 
                onClick={handleAskAI}
                disabled={isProcessing || !aiQuestion.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Thinking...' : 'Ask'}
              </button>
           </div>
        </div>
      )}

      {/* Quiz Interface */}
      {mode === 'QUIZ' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
           {isProcessing ? (
              <div className="text-center py-12">
                 <RefreshCw className="animate-spin mx-auto text-green-600 mb-4" />
                 <p className="dark:text-white">Generating Questions...</p>
              </div>
           ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                      <h3 className="text-sm font-bold text-green-600 mt-1">{activeTopic?.title}</h3>
                   </div>
                   {quizConfig.isTimed && (
                     <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-mono font-bold ${timeLeft < 10 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                        <Clock size={14} />
                        <span>{timeLeft}s</span>
                     </div>
                   )}
                </div>
                
                <h3 className="text-xl font-bold mb-6 dark:text-white">{quizQuestions[currentQuestionIdx]?.question}</h3>
                
                <div className="space-y-3 mb-8">
                   {quizQuestions[currentQuestionIdx]?.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          answers[currentQuestionIdx] === idx
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
                            : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                         {opt}
                      </button>
                   ))}
                </div>

                <div className="flex justify-end">
                   <button 
                     onClick={handleNextQuestion}
                     className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none flex items-center space-x-2"
                   >
                     <span>{currentQuestionIdx < quizQuestions.length - 1 ? 'Next Question' : 'Submit Assessment'}</span>
                     <ChevronRight size={18} />
                   </button>
                </div>
              </>
           )}
        </div>
      )}

      {/* Result View */}
      {mode === 'RESULT' && result && (
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-w-2xl mx-auto">
            <div className={`${result.passed ? 'bg-green-600' : 'bg-red-500'} text-white p-8 text-center`}>
               <h3 className="text-3xl font-bold mb-2">{result.passed ? 'Topic Mastered!' : 'Needs Improvement'}</h3>
               <p className="opacity-90">{result.passed ? 'You can now proceed to the next topic.' : 'Review the material and try again.'}</p>
               <div className="mt-6 inline-block bg-white/20 rounded-full px-6 py-2 font-mono text-2xl font-bold">
                  {Math.round((result.score / result.total) * 100)}%
               </div>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <h4 className="flex items-center text-green-600 font-bold mb-3"><CheckCircle size={18} className="mr-2" /> Strengths</h4>
                     <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                        {result.strengths.map((s,i) => <li key={i}>• {s}</li>)}
                     </ul>
                  </div>
                  <div>
                     <h4 className="flex items-center text-red-500 font-bold mb-3"><AlertTriangle size={18} className="mr-2" /> Focus Areas</h4>
                     <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                        {result.weaknesses.map((w,i) => <li key={i}>• {w}</li>)}
                     </ul>
                  </div>
               </div>

               <button 
                 onClick={() => setMode('OVERVIEW')}
                 className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
               >
                  Back to Topics
               </button>
            </div>
         </div>
      )}
    </div>
  );
};
