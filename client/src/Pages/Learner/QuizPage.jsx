import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BrainCircuit, X, Check, XCircle, ArrowRight, Sparkles, MessageSquare, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "../../components/SharedForms";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id;
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flow State
  const [currentStep, setCurrentStep] = useState(0); 
  const [answers, setAnswers] = useState({}); // { qIndex: selectedOptionIndex }
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Gamification States
  const [isRedemptionPhase, setIsRedemptionPhase] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [redemptionQuestionIndex, setRedemptionQuestionIndex] = useState(null);
  const [mysteryPhase, setMysteryPhase] = useState(0); // 0: inactive, 1: pick door, 2: answering
  const [redemptionResult, setRedemptionResult] = useState(null);
  
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/learner/quiz/${courseId}`);
        if (res.ok) {
          setQuiz(await res.json());
        }
      } catch (err) {
        console.error("No quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId]);

  const handleSelectOption = (oIndex) => {
    if (hasAnsweredCurrent) return; // Prevent changing answer
    setAnswers({ ...answers, [currentStep]: oIndex });
    setHasAnsweredCurrent(true);
  };

  const finishQuiz = async (finalScore) => {
    setIsFinished(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;
      await fetch("http://localhost:5000/api/learner/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, quizId: quiz.id, courseId: quiz.courseId })
      });
      
      // Log quiz completion to activity timeline
      await fetch("http://localhost:5000/api/learner/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          action: "COMPLETED_QUIZ", 
          metadata: `Scored ${finalScore} on quiz` 
        })
      });
    } catch(err) {
      console.error("Failed to update quiz progress", err);
    }
  };

  const handleNext = () => {
    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setHasAnsweredCurrent(false);
    } else {
      let correctCount = 0;
      let wrong = [];
      quiz.questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) correctCount++;
        else wrong.push(i);
      });
      setScore(correctCount);

      if (wrong.length > 0 && !isRedemptionPhase) {
         setWrongQuestions(wrong);
         setIsRedemptionPhase(true);
         setMysteryPhase(1); // Slide into pick-a-door phase
      } else {
         finishQuiz(correctCount);
      }
    }
  };

  const handleSelectDoor = () => {
     const randomIndex = Math.floor(Math.random() * wrongQuestions.length);
     setRedemptionQuestionIndex(wrongQuestions[randomIndex]);
     setMysteryPhase(2);
     setHasAnsweredCurrent(false);
  };

  const handleRedemptionSelect = (oIndex) => {
     if (hasAnsweredCurrent) return;
     const correct = oIndex === quiz.questions[redemptionQuestionIndex].correctAnswer;
     setRedemptionResult({ isCorrect: correct, oIndex });
     setHasAnsweredCurrent(true);
  };

  const handleRedemptionNext = () => {
     let finalScore = score;
     if (redemptionResult?.isCorrect) {
        finalScore += 1;
        setScore(finalScore);
     }
     setIsRedemptionPhase(false);
     finishQuiz(finalScore);
  };
  
  const onClose = () => {
    navigate(-1); 
  };

  if (loading) return (
     <div className="min-h-screen bg-porcelain flex items-center justify-center font-poppins">
        <p className="text-lavender-grey font-bold flex items-center gap-2 animate-pulse">
           <BrainCircuit size={20} /> Loading assessment...
        </p>
     </div>
  );

  return (
    <div className="flex flex-col h-screen bg-porcelain font-poppins text-ink-black overflow-hidden relative selection:bg-soft-periwinkle selection:text-white">
      
      {/* ---------------- TOP NAVBAR ---------------- */}
      <header className="w-full bg-ink-black text-white p-4 h-[72px] shrink-0 flex items-center justify-between shadow-md relative z-30">
         <div className="flex items-center gap-4">
            <button 
              onClick={onClose} 
              className="hover:bg-white/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
            >
               <ChevronLeft size={18} /> Back to Course
            </button>
            <div className="h-6 w-px bg-white/20 hidden md:block"></div>
            <span className="font-playfair font-bold text-lg hidden md:flex items-center gap-2">
               <BrainCircuit size={20} className="text-soft-periwinkle" /> 
               Knowledge Assessment
            </span>
         </div>
         
         {quiz && !isFinished && (
            <div className="flex items-center gap-4 bg-white/5 px-5 py-2 rounded-full border border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B5B7E5]">
                 Question {currentStep + 1} of {quiz.questions.length}
              </span>
              <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden hidden md:block">
                 <div className="h-full bg-[#22c55e] transition-all duration-500" style={{ width: `${((currentStep) / quiz.questions.length) * 100}%` }}></div>
              </div>
            </div>
         )}
      </header>

      {/* ---------------- PROGRESS STRIPE (Below Navbar) ---------------- */}
      {quiz && !isFinished && (
         <div className="w-full bg-white border-b border-soft-linen relative z-20 px-4 md:px-8 py-3 flex items-center gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <span className="text-xs font-bold text-lavender-grey uppercase tracking-widest shrink-0">
               Course Progress
            </span>
            <div className="flex-1 h-2 md:h-2.5 bg-porcelain rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#22c55e] transition-all duration-500 ease-out rounded-full" 
                 style={{ width: `${((currentStep) / quiz.questions.length) * 100}%` }}
               ></div>
            </div>
            <span className="text-sm font-bold text-ink-black shrink-0 w-[40px] text-right">
               {Math.round(((currentStep) / quiz.questions.length) * 100)}%
            </span>
         </div>
      )}

      {/* ---------------- SPLIT VIEW ---------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---------------- LEFT PANEL: QUIZ Core ---------------- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative px-4 md:px-12 py-8 lg:py-12 bg-gradient-to-br from-porcelain to-[#f4f5f9]">
        
        {/* Main Content Area */}
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center pb-20">
          {!quiz ? (
             <div className="bg-white p-16 rounded-[2rem] text-center flex flex-col items-center shadow-sm border border-soft-linen">
                <div className="w-24 h-24 bg-porcelain rounded-full flex items-center justify-center mb-6">
                  <BrainCircuit size={40} className="text-lavender-grey" />
                </div>
                <h2 className="text-3xl font-bold font-playfair text-ink-black mb-3">No Assessment Found</h2>
                <p className="text-lavender-grey text-lg max-w-md">There are currently no active quiz questions assigned to this module.</p>
                <Button onClick={onClose} className="mt-10 px-10 py-4 shadow-xl">Return to Overview</Button>
             </div>
          ) : isReviewMode ? (
             <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-fadeIn pb-24 relative mt-10">
                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-soft-linen flex flex-col md:flex-row items-center justify-between sticky top-0 z-20 gap-4">
                   <div>
                     <h2 className="text-2xl font-bold font-playfair text-ink-black">Review Responses</h2>
                     <p className="text-sm font-medium text-lavender-grey">Score: {score} / {quiz.questions.length}</p>
                   </div>
                   <button onClick={() => setIsReviewMode(false)} className="px-6 py-3 bg-porcelain rounded-xl font-bold text-sm text-ink-black hover:bg-soft-periwinkle hover:text-white transition-colors shadow-sm">Close Review</button>
                </div>
                {quiz.questions.map((q, qIndex) => {
                   const uAns = answers[qIndex];
                   const isCorrect = uAns === q.correctAnswer;
                   const wasRedeemed = redemptionResult && redemptionResult.qIndex === qIndex;
                   
                   let badge = isCorrect ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Correct</span> :
                                           <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Incorrect</span>;
                   
                   if (wasRedeemed) {
                      badge = redemptionResult.isCorrect ? <span className="bg-soft-periwinkle/20 border border-soft-periwinkle/50 text-soft-periwinkle px-3 py-1 rounded-full text-xs font-bold uppercase drop-shadow-sm">+1 Redeemed</span> : <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Incorrect (Redeemed)</span>;
                   }

                   return (
                     <div key={qIndex} className={`bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-[3px] ${isCorrect || (wasRedeemed && redemptionResult.isCorrect) ? 'border-green-500/30' : 'border-red-500/20'} flex flex-col gap-4 relative overflow-hidden transition-all hover:-translate-y-1`}>
                        <div className="flex items-center justify-between mb-2">
                           <span className="font-bold text-lavender-grey text-sm tracking-widest uppercase">Question {qIndex + 1}</span>
                           {badge}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold font-playfair text-ink-black leading-tight border-b border-porcelain pb-6">{q.questionText}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                           {q.options.map((opt, oIndex) => {
                              const isRedeemedPick = wasRedeemed && redemptionResult.oIndex === oIndex;
                              let optionStyles = "p-4 rounded-xl border-2 flex items-center gap-3 text-ink-black transition-all ";
                              
                              if (oIndex === q.correctAnswer) {
                                  optionStyles += "bg-green-500/10 border-green-500 ring-2 ring-green-500/20";
                              } else if (uAns === oIndex || isRedeemedPick) {
                                  optionStyles += "bg-red-500/10 border-red-400 opacity-90";
                              } else {
                                  optionStyles += "border-soft-linen bg-porcelain/30 opacity-60";
                              }

                              return (
                                <div key={oIndex} className={optionStyles}>
                                   <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 shadow-sm ${oIndex === q.correctAnswer ? 'bg-green-500 text-white border-none' : uAns === oIndex || isRedeemedPick ? 'bg-red-500 text-white border-none' : 'bg-white border-2 border-lavender-grey/30 text-lavender-grey'}`}>
                                      {oIndex === q.correctAnswer ? <Check size={16} strokeWidth={3} /> : uAns === oIndex || isRedeemedPick ? <X size={16} strokeWidth={3} /> : oIndex + 1}
                                   </div>
                                   <span className="font-semibold text-[15px] leading-tight">{opt}</span>
                                </div>
                              );
                           })}
                        </div>
                        {q.hint && (
                           <div className="mt-4 p-5 bg-gradient-to-r from-soft-periwinkle/10 to-transparent rounded-2xl border-l-[4px] border-soft-periwinkle text-[15px] font-medium text-ink-black/90">
                              <span className="font-extrabold flex items-center gap-2 mb-1"><Sparkles size={16} className="text-soft-periwinkle"/> Explanation</span> {q.hint}
                           </div>
                        )}
                     </div>
                   );
                })}
             </div>
          ) : isRedemptionPhase ? (
             <div className="animate-fadeIn relative w-full h-full flex flex-col items-center justify-center pt-8">
                {mysteryPhase === 1 ? (
                   <div className="text-center w-full max-w-2xl bg-white/60 backdrop-blur-md p-10 md:p-14 rounded-[3rem] shadow-2xl border border-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 text-soft-periwinkle opacity-10"><BrainCircuit size={150} /></div>
                      <h2 className="text-4xl md:text-5xl font-extrabold font-playfair text-ink-black mb-4 tracking-tight drop-shadow-sm">Redemption Question</h2>
                      <p className="text-lavender-grey text-lg mb-12 font-medium tracking-wide">Reattempt a question you got wrong... <span className="text-soft-periwinkle font-bold">choose wisely.</span></p>
                      
                      <div className="flex items-center justify-center gap-4 md:gap-8">
                         {[1, 2, 3].map((door) => (
                            <button key={door} onClick={handleSelectDoor} className="w-[100px] h-[130px] md:w-[130px] md:h-[160px] rounded-3xl bg-gradient-to-br from-[#2D2D3E] to-ink-black border-[3px] border-soft-periwinkle/50 flex flex-col items-center justify-center gap-2 group hover:-translate-y-4 hover:scale-105 transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_rgba(181,183,229,0.5)] hover:border-soft-periwinkle relative cursor-pointer overflow-hidden">
                               <div className="absolute inset-0 bg-soft-periwinkle/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                               <div className="w-8 h-8 rounded-full bg-soft-periwinkle/20 border border-soft-periwinkle/50 flex items-center justify-center">
                                 <div className="w-2 h-2 rounded-full bg-soft-periwinkle animate-pulse"></div>
                               </div>
                               <span className="text-white text-5xl font-extrabold drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-b from-white to-silver/50">?</span>
                            </button>
                         ))}
                      </div>
                   </div>
                ) : (
                   <div className="w-full">
                      <div className="bg-gradient-to-r from-soft-periwinkle/20 to-transparent text-soft-periwinkle px-5 py-2 rounded-xl font-bold text-sm tracking-widest uppercase mb-10 flex items-center gap-2 border-l-[4px] border-soft-periwinkle self-start"><Sparkles size={16}/> Second Chance</div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-playfair text-ink-black mb-12 leading-tight text-center max-w-3xl mx-auto drop-shadow-sm">
                        {quiz.questions[redemptionQuestionIndex].questionText}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full mb-8">
                         {quiz.questions[redemptionQuestionIndex].options.map((opt, oIndex) => {
                            const isSelected = redemptionResult?.oIndex === oIndex;
                            const isCorrectOption = oIndex === quiz.questions[redemptionQuestionIndex].correctAnswer;
                            
                            let btnBaseClass = "w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all flex items-start gap-4 group bg-white shadow-sm hover:-translate-y-1 ";
                            let iconBaseClass = "text-sm font-bold w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-all border shadow-sm ";
                            
                            if (!hasAnsweredCurrent) {
                               btnBaseClass += "border-soft-linen hover:border-soft-periwinkle/50 hover:shadow-lg";
                               iconBaseClass += "bg-porcelain border-soft-linen text-lavender-grey group-hover:bg-soft-periwinkle/10 group-hover:text-soft-periwinkle group-hover:border-soft-periwinkle/30";
                            } else {
                               if (isCorrectOption) {
                                  btnBaseClass += "border-green-500 bg-green-50/50 ring-2 ring-green-500/30";
                                  iconBaseClass += "bg-green-500 text-white border-green-600";
                               } else if (isSelected) {
                                  btnBaseClass += "border-red-500 bg-red-50/50 opacity-90 cursor-not-allowed";
                                  iconBaseClass += "bg-red-500 text-white border-red-600";
                               } else {
                                  btnBaseClass += "border-soft-linen opacity-40 grayscale cursor-not-allowed transform-none";
                                  iconBaseClass += "bg-porcelain border-soft-linen text-lavender-grey";
                               }
                            }

                            return (
                              <button key={oIndex} onClick={() => handleRedemptionSelect(oIndex)} disabled={hasAnsweredCurrent} className={btnBaseClass}>
                                 <div className={iconBaseClass}>
                                    {hasAnsweredCurrent && isCorrectOption ? <Check size={20} strokeWidth={3} /> : hasAnsweredCurrent && isSelected && !isCorrectOption ? <X size={20} strokeWidth={3} /> : oIndex + 1}
                                 </div>
                                 <span className="font-semibold text-lg text-ink-black mt-1.5 leading-snug">{opt}</span>
                              </button>
                            );
                         })}
                      </div>

                      {hasAnsweredCurrent && (
                        <div className="mt-8 animate-slideUp">
                           <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-2 border-soft-periwinkle/20 shadow-[-10px_10px_30px_rgba(181,183,229,0.1)]">
                              <div className="flex-1">
                                 <h4 className={`font-extrabold text-sm uppercase tracking-widest flex items-center gap-2 mb-2 ${redemptionResult?.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    {redemptionResult?.isCorrect ? <><Check strokeWidth={3}/> Redeemed (+1 Point!)</> : <><XCircle strokeWidth={3}/> Incorrect</>}
                                 </h4>
                                 <p className="text-ink-black/80 font-medium leading-relaxed bg-porcelain p-4 rounded-xl mt-3 border border-soft-linen">
                                    <span className="font-bold text-ink-black mr-2">Hint:</span>{quiz.questions[redemptionQuestionIndex].hint || "Always review the concept materials before retaking the module assessment."}
                                 </p>
                              </div>
                              <Button onClick={handleRedemptionNext} className="shrink-0 w-full md:w-auto px-10 py-5 text-base font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-soft-periwinkle/30 hover:-translate-y-1 transition-all">
                                Finish Quiz
                                <ArrowRight size={20} />
                              </Button>
                           </div>
                        </div>
                      )}
                   </div>
                )}
             </div>
          ) : !isFinished ? (
            <div className="animate-fadeIn relative w-full">
               
               {/* Question Title */}
               <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-playfair text-ink-black mb-12 leading-tight text-center max-w-3xl mx-auto">
                 {quiz.questions[currentStep].questionText}
               </h2>
               
               {/* Options Grid (2x2) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full mb-8">
                 {quiz.questions[currentStep].options.map((opt, oIndex) => {
                    const isSelected = answers[currentStep] === oIndex;
                    const isCorrectOption = oIndex === quiz.questions[currentStep].correctAnswer;
                    
                    // Style determination based on Immediate Feedback phase
                    let btnBaseClass = "w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all flex items-start gap-4 group bg-white ";
                    let iconBaseClass = "text-sm font-bold w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-all border shadow-sm ";
                    
                    if (!hasAnsweredCurrent) {
                       // Idle State
                       btnBaseClass += "border-soft-linen hover:border-soft-periwinkle/40 shadow-sm hover:shadow-md hover:-translate-y-0.5";
                       iconBaseClass += "bg-porcelain border-soft-linen text-lavender-grey group-hover:bg-soft-periwinkle/10 group-hover:text-soft-periwinkle group-hover:border-soft-periwinkle/30";
                    } else {
                       // Answered State
                       if (isCorrectOption) {
                          btnBaseClass += "border-green-500 bg-green-50/30 ring-1 ring-green-500/20";
                          iconBaseClass += "bg-green-500 text-white border-green-600";
                       } else if (isSelected) {
                          btnBaseClass += "border-red-500 bg-red-50/30 opacity-80 cursor-not-allowed";
                          iconBaseClass += "bg-red-500 text-white border-red-600";
                       } else {
                          btnBaseClass += "border-soft-linen opacity-50 grayscale cursor-not-allowed";
                          iconBaseClass += "bg-porcelain border-soft-linen text-lavender-grey";
                       }
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelectOption(oIndex)}
                        disabled={hasAnsweredCurrent}
                        className={btnBaseClass}
                      >
                         <div className={iconBaseClass}>
                            {hasAnsweredCurrent && isCorrectOption ? <Check size={20} strokeWidth={3} /> : 
                             hasAnsweredCurrent && isSelected && !isCorrectOption ? <X size={20} strokeWidth={3} /> : 
                             oIndex + 1}
                         </div>
                         <span className="font-semibold text-lg text-ink-black mt-1.5 leading-snug">{opt}</span>
                      </button>
                    );
                 })}
               </div>

               {/* Explanation & Next Trigger (Slide in from bottom) */}
               {hasAnsweredCurrent && (
                 <div className="mt-8 animate-slideUp">
                    <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-2 border-soft-periwinkle/20 shadow-xl shadow-soft-periwinkle/5">
                       <div className="flex-1">
                          <h4 className="text-soft-periwinkle font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-2">
                             <Sparkles size={16} /> 
                             {answers[currentStep] === quiz.questions[currentStep].correctAnswer ? "Correct!" : "Explanation"}
                          </h4>
                          <p className="text-ink-black/80 font-medium leading-relaxed">
                             {quiz.questions[currentStep].hint || "The text provides sufficient details to verify this is the correct answer."}
                          </p>
                       </div>
                       <Button onClick={handleNext} className="shrink-0 w-full md:w-auto px-10 py-4 text-base font-bold flex items-center justify-center gap-2">
                         {currentStep === quiz.questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
                         <ArrowRight size={20} />
                       </Button>
                    </div>
                 </div>
               )}

            </div>
          ) : (
            <div className="bg-white p-12 lg:p-20 rounded-[3rem] text-center flex flex-col items-center justify-center shadow-xl shadow-black/5 border-2 border-white relative overflow-hidden max-w-3xl mx-auto w-full group mt-6">
               <div className="absolute inset-0 bg-gradient-to-b from-porcelain/50 to-transparent pointer-events-none"></div>
               <div className="w-40 h-40 rounded-full border-[10px] border-porcelain bg-white shadow-inner flex items-center justify-center mb-10 relative z-10">
                  <div className="absolute inset-0 rounded-full border-[10px] border-soft-periwinkle" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${(score/quiz.questions.length)*100}%, 0 ${(score/quiz.questions.length)*100}%)`, borderColor: score === quiz.questions.length ? '#22c55e' : undefined }}></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[2.75rem] font-extrabold font-playfair text-ink-black relative z-10 leading-none tracking-tight">{score}</span>
                    <div className="h-px w-12 bg-lavender-grey/30 my-1"></div>
                    <span className="text-xl font-bold text-lavender-grey">{quiz.questions.length}</span>
                  </div>
               </div>
               <h2 className="font-playfair text-4xl lg:text-5xl font-extrabold text-ink-black mb-4 tracking-tight relative z-10">
                  {score === quiz.questions.length ? "Flawless Victory!" : score >= quiz.questions.length/2 ? "Great Job!" : "Keep Practicing"}
               </h2>
               <p className="text-lavender-grey text-lg max-w-lg mb-12 font-medium relative z-10">
                  You successfully completed the module assessment. Review your answers or return to the course dashboard to proceed.
               </p>
               
               <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center relative z-10">
                  <button onClick={() => setIsReviewMode(true)} className="w-full md:w-auto px-10 py-4 rounded-xl border-2 border-soft-periwinkle text-soft-periwinkle font-bold text-lg hover:bg-soft-periwinkle/10 transition-colors">
                     Review Answers
                  </button>
                  <Button onClick={onClose} className="w-full md:w-auto px-10 py-4 text-lg shadow-xl shadow-soft-periwinkle/20 hover:shadow-soft-periwinkle/40">
                     Course Dashboard
                  </Button>
               </div>
            </div>
          )}
        </div>
      </div>


      </div>
    </div>
  );
}
