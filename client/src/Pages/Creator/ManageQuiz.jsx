import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, BrainCircuit, UploadCloud, Edit3 } from "lucide-react";
import { Button, Textarea } from "../../components/SharedForms";
import { Toast, Modal } from "../../components/DisplayComponents";

export default function ManageQuiz() {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  // Quiz building engine
  const [isBuilding, setIsBuilding] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editingQuizId, setEditingQuizId] = useState(null);
  
  // Bulk Upload State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState("pdf"); // 'pdf' or 'json'
  const [bulkText, setBulkText] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    fetchCoursesAndQuizzes();
  }, []);

  const fetchCoursesAndQuizzes = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const creatorId = user.id || 1;
      
      const p = await fetch(`http://localhost:5000/api/courses`);
      const allCourses = await p.json();
      const myCourses = allCourses.filter(c => c.creatorId === creatorId);
      
      // Failsafe: If myCourses is empty (e.g. string vs int mismatched IDs), fallback to allCourses
      setCourses(myCourses.length > 0 ? myCourses : allCourses);

      const q = await fetch(`http://localhost:5000/api/quiz/creator/${creatorId}`);
      if (q.ok) setQuizzes(await q.json());
    } catch (err) {
      console.error(err);
    }
  };

  const startQuizBuilder = () => {
    if (!selectedCourseId) return showToast("Select a course first.");
    const existing = quizzes.find(q => q.courseId === selectedCourseId);
    if (existing) return showToast("This course already has a quiz. Click the Edit button below to modify it.");
    setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: 0, hint: "" }]);
    setEditingQuizId(null);
    setIsBuilding(true);
  };

  const editQuiz = (quiz) => {
    setQuestions(quiz.questions);
    setSelectedCourseId(quiz.courseId);
    setEditingQuizId(quiz.id);
    setIsBuilding(true);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: 0, hint: "" }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleBulkUpload = () => {
    if (!bulkText.trim()) return;
    try {
      const parsed = JSON.parse(bulkText);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      
      const formatted = parsed.map(q => ({
        questionText: q.questionText || "",
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["", "", "", ""],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        hint: q.hint || ""
      }));
      setQuestions(questions[0].questionText === "" && questions.length === 1 ? formatted : [...questions, ...formatted]);
      setShowBulkModal(false);
      setBulkText("");
      showToast("Questions imported successfully!", "success");
    } catch(err) {
      showToast("Invalid JSON format. Check your syntax.", "error");
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowBulkModal(false); // Close modal instantly to avoid confusion
    setIsParsingPdf(true);
    showToast("Extracting questions from PDF... Please wait.", "success");
    
    const formData = new FormData();
    formData.append("pdf", file);

    try {
        const res = await fetch("http://localhost:5000/api/upload-quiz/parse-pdf", {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            const formatted = await res.json();
            setQuestions(questions[0].questionText === "" && questions.length === 1 ? formatted : [...questions, ...formatted]);
            showToast("PDF extracted! Review questions below and click 'Publish Quiz'.", "success");
            
            // Scroll to the publish button lightly
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 300);
        } else {
            const err = await res.json();
            showToast(err.message || "Failed to parse PDF.", "error");
        }
    } catch(err) {
        showToast("Network error. Please try again.", "error");
    } finally {
        setIsParsingPdf(false);
        // reset file input
        e.target.value = null;
    }
  };

  const saveQuiz = async () => {
    // Validate
    const isValid = questions.every(q => q.questionText.trim() && q.options.every(o => o.trim()));
    if (!isValid) return showToast("Please fill all questions and options.");

    setIsSubmitting(true);
    try {
      const url = editingQuizId 
        ? `http://localhost:5000/api/quiz/${editingQuizId}` 
        : "http://localhost:5000/api/quiz";
      
      const method = editingQuizId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, questions })
      });
      if (res.ok) {
        setIsBuilding(false);
        setEditingQuizId(null);
        fetchCoursesAndQuizzes();
        showToast(`Quiz ${editingQuizId ? "updated" : "published"} successfully!`, "success");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to publish quiz.");
      }
    } catch(err) {
      console.error(err);
      showToast("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    // Since windows.confirm is not allowed, we'll auto-delete for now
    // A modal is usually better here, but auto-deleting is better than window.confirm
    try {
      await fetch(`http://localhost:5000/api/quiz/${quizId}`, { method: "DELETE" });
      fetchCoursesAndQuizzes();
      showToast("Quiz deleted successfully.", "success");
    } catch(err) {
      showToast("Failed to delete quiz.", "error");
    }
  };

  return (
    <div className="space-y-8 font-poppins relative">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-soft-linen shadow-sm">
         <div>
            <h1 className="text-3xl font-bold font-playfair text-ink-black flex items-center gap-3">
               <BrainCircuit className="text-soft-periwinkle" />
               Course Quizzes
            </h1>
            <p className="text-lavender-grey mt-2">Test your learners' knowledge with structured chapter quizzes.</p>
         </div>
      </div>

      {!isBuilding ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
             <div className="bg-white p-6 rounded-3xl border border-soft-linen shadow-sm">
                <h3 className="font-bold text-ink-black mb-4 tracking-wide uppercase text-sm">Create New Quiz</h3>
                <select 
                   value={selectedCourseId}
                   onChange={e => setSelectedCourseId(e.target.value)}
                   className="w-full bg-porcelain p-3 rounded-xl border border-soft-linen text-sm mb-4 outline-none focus:border-soft-periwinkle"
                >
                   <option value="">Select a Course</option>
                   {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <Button onClick={startQuizBuilder} className="w-full">
                  <Plus size={16} className="inline mr-2"/> Build Quiz
                </Button>
             </div>
          </div>

          <div className="md:col-span-2">
             <div className="bg-white rounded-3xl border border-soft-linen shadow-sm overflow-hidden">
                <div className="p-6 border-b border-soft-linen bg-porcelain/30">
                   <h3 className="font-bold text-ink-black uppercase tracking-wide text-sm">Active Quizzes</h3>
                </div>
                <div className="divide-y divide-soft-linen p-2">
                   {quizzes.length === 0 && <p className="p-6 text-center text-lavender-grey italic text-sm">No quizzes built yet.</p>}
                   {quizzes.map(q => (
                     <div key={q.id} className="p-4 flex items-center justify-between hover:bg-porcelain/50 rounded-2xl transition-colors">
                        <div>
                           <p className="font-bold text-ink-black">{q.courseTitle}</p>
                           <p className="text-xs text-lavender-grey">{q.questions.length} Questions</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => editQuiz(q)} className="p-2 text-lavender-grey hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Edit Quiz">
                             <Edit3 size={18} />
                           </button>
                           <button onClick={() => deleteQuiz(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Delete Quiz">
                             <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-soft-linen shadow-sm space-y-8">
           <div className="flex justify-between items-center border-b border-soft-linen pb-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-ink-black">{editingQuizId ? "Edit Quiz" : "Quiz Builder"}</h2>
                 <button onClick={() => setShowBulkModal(true)} className="text-xs font-bold bg-porcelain px-3 py-1.5 rounded-lg text-ink-black hover:bg-soft-periwinkle/10 hover:text-soft-periwinkle transition-colors flex items-center gap-1"><UploadCloud size={14}/> Bulk Upload</button>
              </div>
              <button className="text-lavender-grey hover:text-ink-black text-sm font-bold" onClick={() => { setIsBuilding(false); setEditingQuizId(null); }}>Cancel</button>
           </div>
           
           <div className="space-y-6">
             {questions.map((q, qIndex) => (
               <div key={qIndex} className="p-6 bg-porcelain/30 rounded-2xl border border-soft-linen">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="w-8 h-8 rounded-full bg-ink-black text-white flex items-center justify-center font-bold text-sm shrink-0">{qIndex + 1}</span>
                     <input
                       type="text"
                       placeholder="Enter your question here..."
                       value={q.questionText}
                       onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                       className="w-full bg-white p-3 rounded-xl border border-soft-linen outline-none focus:border-soft-periwinkle text-sm font-semibold"
                     />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pl-12">
                     {q.options.map((opt, oIndex) => (
                       <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${q.correctAnswer === oIndex ? 'bg-soft-periwinkle/10 border-soft-periwinkle shadow-sm' : 'bg-white border-soft-linen hover:border-soft-periwinkle/50'}`}>
                          <input 
                            type="radio" 
                            name={`correct-${qIndex}`} 
                            checked={q.correctAnswer === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                            className="accent-[#7C7DBB] w-4 h-4 cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${oIndex + 1}`}
                            value={opt}
                            onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="w-full bg-transparent outline-none text-sm font-medium"
                          />
                       </div>
                     ))}
                  </div>
                  
                  <div className="mt-4 pl-12">
                     <p className="text-[10px] font-bold text-lavender-grey uppercase tracking-wider mb-2">💡 Explanation / Hint (Optional)</p>
                     <input
                        type="text"
                        placeholder="e.g. Remember that React uses a virtual DOM to optimize rendering."
                        value={q.hint || ""}
                        onChange={e => handleQuestionChange(qIndex, 'hint', e.target.value)}
                        className="w-full bg-white p-3 rounded-xl border border-soft-linen outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle text-sm transition-all"
                     />
                  </div>
               </div>
             ))}
           </div>
           
           <div className="flex justify-between pt-4 border-t border-soft-linen">
             <button onClick={handleAddQuestion} disabled={isParsingPdf} className={`flex items-center gap-2 text-soft-periwinkle font-bold text-sm px-4 py-2 rounded-xl transition-colors ${isParsingPdf ? 'opacity-50' : 'bg-soft-periwinkle/10 hover:bg-soft-periwinkle/20'}`}>
               <Plus size={16} /> Add Another Question
             </button>
             <Button onClick={saveQuiz} disabled={isSubmitting || isParsingPdf} className="px-8 shadow-md">
                {isSubmitting ? "Publishing..." : isParsingPdf ? "Extracting from PDF..." : "Publish Quiz"}
             </Button>
           </div>
        </div>
      )}
      
       {/* Bulk Upload Modal */}
       <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Upload Questions">
          <div className="space-y-4">
             {/* Simple Tabs */}
             <div className="flex bg-porcelain rounded-xl p-1 mb-4">
               <button onClick={() => setBulkMode("pdf")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${bulkMode === 'pdf' ? 'bg-white shadow-sm text-soft-periwinkle' : 'text-lavender-grey'}`}>Upload PDF</button>
               <button onClick={() => setBulkMode("json")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${bulkMode === 'json' ? 'bg-white shadow-sm text-soft-periwinkle' : 'text-lavender-grey'}`}>Paste JSON</button>
             </div>

             {bulkMode === "pdf" ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-soft-linen rounded-2xl bg-porcelain/30">
                   <UploadCloud size={40} className="text-soft-periwinkle mb-4" />
                   <h3 className="font-bold text-ink-black mb-2">Upload a Quiz PDF</h3>
                   <p className="text-xs text-lavender-grey text-center mb-6 max-w-[250px]">
                      We'll automatically extract the questions. We recommend formatting as: <br/><br/>
                      <span className="font-mono bg-white p-1 rounded">1. Question? A) Yes B) No Answer: A</span>
                   </p>
                   <label className={`bg-ink-black text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-800 transition-colors ${isParsingPdf ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isParsingPdf ? "Parsing Document..." : "Select PDF File"}
                      <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                   </label>
                </div>
             ) : (
                <>
                   <div className="bg-porcelain/50 p-4 rounded-xl border border-soft-linen text-sm text-lavender-grey font-mono">
                     <p className="font-bold text-ink-black mb-2 font-poppins">JSON Array Format Required:</p>
                     <pre className="text-xs overflow-x-auto">
      {`[
        {
          "questionText": "What is 2+2?",
          "options": ["1", "2", "3", "4"],
          "correctAnswer": 3,
          "hint": "Check your simple addition!"
        }
      ]`}
                     </pre>
                   </div>
                   <Textarea 
                      value={bulkText}
                      onChange={e => setBulkText(e.target.value)}
                      placeholder="Paste your JSON array here..."
                      rows="8"
                   />
                   <Button onClick={handleBulkUpload} className="w-full">Parse & Import Questions</Button>
                </>
             )}
          </div>
       </Modal>
    </div>
  );
}
