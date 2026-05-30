import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, ChevronLeft, FileText, Lock, ShieldAlert, BookOpen, Send, BrainCircuit, Award, MapPin, Mail, Phone, User } from "lucide-react";

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export default function PublicCourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        
        // Fetch creator details
        if (data.creatorId) {
           const profileRes = await fetch(`http://localhost:5000/api/profile/public/${data.creatorId}`);
           if (profileRes.ok) {
              const profileData = await profileRes.json();
              data.creator = profileData.user;
           }
        }
        
        // Fetch quiz
        const quizRes = await fetch(`http://localhost:5000/api/learner/quiz/${id}`);
        if (quizRes.ok) {
           data.quiz = await quizRes.json();
        }
        
        setCourse(data);
      } catch (err) {
        setCourse({ error: true });
      }
    };
    fetchCourse();
  }, [id]);

  if (course?.error) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white">
      <h2 className="text-4xl font-playfair mb-4">Course not found.</h2>
      <Link to="/courses" className="text-soft-periwinkle hover:underline">Return to Catalog</Link>
    </div>
  );
  
  if (!course) return (
    <div className="h-[70vh] flex items-center justify-center bg-white font-poppins text-lavender-grey animate-pulse">
      Loading Course Data...
    </div>
  );

  return (
    <div className="font-poppins bg-white w-full">
      {/* Hero Section */}
      <div className="w-full bg-[#B3A9A7] py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
           <div className="bg-white p-8 md:p-12 rounded-lg flex flex-col md:flex-row gap-8 items-stretch shadow-md">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-playfair text-ink-black mb-4">
                    {course.title || "Course Title"}
                  </h1>
                  <p className="text-sm text-ink-black/80 leading-relaxed max-w-xl mb-8">
                    {course.description || "A multidisciplinary field of study focusing on the design of computer technology and, in particular, the interaction between humans (the users) and computers. It encompasses understanding how humans use technology and how to create systems that are user-friendly, efficient, and enjoyable."}
                  </p>
                </div>
                
                <div className="flex items-end justify-between border-t border-gray-200 pt-6 mt-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
                        {course.creator?.profilePic ? (
                           <img src={course.creator.profilePic} alt="Instructor" className="w-full h-full object-cover" />
                        ) : (
                           <User size={20} />
                        )}
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Instructor</p>
                        <p className="text-sm font-semibold text-ink-black">{course.creator?.fullName || "Instructor Name"}</p>
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-[350px] shrink-0 flex flex-col gap-4">
                <div className="flex-1 bg-gray-300 rounded-lg min-h-[200px] relative overflow-hidden group flex items-center justify-center text-white">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <Play size={48} className="opacity-50" />
                  )}
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-md transition-colors text-sm uppercase tracking-wide"
                >
                  Add to cart
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16">
        <div className="max-w-4xl">
          {/* About */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold font-playfair text-ink-black mb-4">About this Programme</h2>
            <p className="text-sm text-ink-black/80 leading-relaxed text-justify">
              {course.about || "Human-Computer Interaction (HCI) is a multidisciplinary field that focuses on the design and use of computer technology, focusing particularly on the interfaces between people (users) and computers. Researchers in the field of HCI observe the ways in which humans interact with computers and design technologies that let humans interact with computers in novel ways. As a field of research, HCI is situated at the intersection of computer science, behavioral sciences, design, media studies, and several other fields of study."}
            </p>
          </section>

          {/* Curriculum */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold font-playfair text-ink-black mb-4">Programme curriculum</h2>
            <p className="text-sm text-ink-black/80 leading-relaxed mb-8">
              Understand the foundations of technology and human interaction. Walk through practical real-world applications of these principles.
            </p>
            
            <div className="space-y-12">
              {/* Fallback mock modules if course has no videos */}
              {(course.videos && course.videos.length > 0) ? (
                 course.videos.map((vid, idx) => (
                    <div key={vid.id} className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-playfair text-ink-black mb-3">
                          Module {idx + 1}: {vid.title}
                        </h3>
                        <p className="text-sm text-ink-black/70 leading-relaxed text-justify">
                           Explore the core concepts of this module. This section delves into the foundational theories and practical applications necessary for mastering {vid.title.toLowerCase()}. You will gain hands-on insights into modern practices.
                        </p>
                      </div>
                      <div className="w-full md:w-[280px] h-40 bg-gray-300 shrink-0 rounded-sm"></div>
                    </div>
                 ))
              ) : (
                <>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold font-playfair text-ink-black mb-3">Module 1: Introduction to HCI</h3>
                      <p className="text-sm text-ink-black/70 leading-relaxed text-justify">
                        Explore the history, scope, and significance of HCI. Learn how HCI has evolved from early command-line interfaces to modern touch screens and virtual reality. Topics include user-centered design, usability, accessibility, and the human factors that influence interaction.
                      </p>
                    </div>
                    <div className="w-full md:w-[280px] h-40 bg-gray-300 shrink-0 rounded-sm"></div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold font-playfair text-ink-black mb-3">Module 2: Principle of Good Interface Design</h3>
                      <p className="text-sm text-ink-black/70 leading-relaxed text-justify">
                        Dive into the principles that guide effective interface design, including visibility, feedback, consistency, affordance, and error prevention. Learn how cognitive load, attention span, and human perception influence the way users interact with technology.
                      </p>
                    </div>
                    <div className="w-full md:w-[280px] h-40 bg-gray-300 shrink-0 rounded-sm"></div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Test Your Knowledge */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold font-playfair text-ink-black mb-6">Test your Knowledge</h2>
            
            <div className="space-y-6">
               {course.quiz?.questions ? (
                 course.quiz.questions.map((q, idx) => (
                   <div key={q.id}>
                     <p className="text-sm font-semibold text-ink-black mb-2">{idx + 1}. {q.questionText}</p>
                     <ul className="text-sm text-ink-black/70 space-y-1 ml-4 list-disc">
                       {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                     </ul>
                   </div>
                 ))
               ) : (
                 <>
                   <div>
                     <p className="text-sm font-semibold text-ink-black mb-2">1. Original key focus area:</p>
                     <ul className="text-sm text-ink-black/70 space-y-1 ml-4 list-disc">
                       <li>Data systems</li>
                       <li>Visual aesthetics</li>
                     </ul>
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-ink-black mb-2">2. Visibility of system status means:</p>
                     <ul className="text-sm text-ink-black/70 space-y-1 ml-4 list-disc">
                       <li>White space usage</li>
                       <li>Keeping users informed</li>
                     </ul>
                   </div>
                 </>
               )}
            </div>
            
            <button 
              onClick={() => navigate('/login')}
              className="mt-8 bg-ink-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-md transition-colors text-sm"
            >
              Submit
            </button>
          </section>
        </div>
      </div>

      {/* Footer Contact Section */}
      <div className="w-full bg-[#B3A9A7] py-16">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-ink-black">
           <div>
             <h3 className="font-bold text-sm mb-4">Platform</h3>
             <ul className="text-xs space-y-2 opacity-80">
               <li>Empowering learners globally with high-quality education and expert guidance.</li>
             </ul>
           </div>
           <div>
             <h3 className="font-bold text-sm mb-4">Quick Links</h3>
             <ul className="text-xs space-y-2 opacity-80">
               <li><Link to="/">Home</Link></li>
               <li><Link to="/courses">Courses</Link></li>
               <li><Link to="/about">About Us</Link></li>
               <li><Link to="/blog">Blog</Link></li>
             </ul>
           </div>
           <div>
             <h3 className="font-bold text-sm mb-4">Contact Details</h3>
             <ul className="text-xs space-y-2 opacity-80">
               <li>Email: support@platformx.com</li>
               <li>Phone: +1 234 567 890</li>
               <li>Address: 123 Learning Street, NY</li>
             </ul>
           </div>
           <div>
             <h3 className="font-bold text-sm mb-4">Any Enquiry?</h3>
             <form className="space-y-2">
               <input type="text" placeholder="Your Name" className="w-full bg-white/50 border border-ink-black/20 rounded px-3 py-2 text-xs focus:outline-none" />
               <input type="text" placeholder="Your Message" className="w-full bg-white/50 border border-ink-black/20 rounded px-3 py-2 text-xs focus:outline-none" />
               <button type="button" className="w-full bg-ink-black text-white text-xs font-bold py-2 rounded hover:bg-gray-800">Submit</button>
             </form>
           </div>
        </div>
      </div>
      <div className="w-full bg-[#B3A9A7] py-4 border-t border-ink-black/10 text-center">
         <span className="text-[10px] font-bold text-ink-black">All Rights Reserved 2024 © Platform website</span>
      </div>
    </div>
  );
}
