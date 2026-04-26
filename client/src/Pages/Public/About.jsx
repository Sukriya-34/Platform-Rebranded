import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function About() {
  return (
    <div className="w-full bg-white font-poppins text-ink-black animate-fadeIn">
      {/* 1. Hero Section */}
      <section 
         className="relative w-full h-[350px] md:h-[450px] flex items-center justify-center px-6 bg-cover bg-center"
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80")' }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 bg-black/30 backdrop-blur-md px-8 py-10 md:py-14 rounded-2xl shadow-2xl max-w-3xl text-center border border-white/10">
          <h1 className="text-3xl md:text-5xl font-bold font-playfair text-white mb-4">
             Innovating the Future of Learning
          </h1>
          <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
             We are committed to lifelong learning and dynamic innovation. Join thousands of students who are fundamentally transforming their foundational skills through our AI-guided platform ecosystem.
          </p>
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-6 py-20 lg:py-28 space-y-28 lg:space-y-40">
        
        {/* 2. Who are we (Left Text, Right Image) */}
        <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold font-playfair">Who are we</h2>
            <p className="text-lavender-grey leading-relaxed text-lg pb-4">
              At Platform.X, we believe in making education hyper-flexible, accessible, and high-quality for learners worldwide. Rather than relying on static video lectures, our platform provides an expert-led, deeply interactive ecosystem designed to equip individuals with industry-relevant, future-ready skills.
            </p>
            <p className="text-lavender-grey leading-relaxed text-lg">
              We empower students to achieve both their personal and professional goals by stripping away traditional barriers to entry and replacing them with intuitive user interfaces.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-soft-periwinkle translate-x-4 -translate-y-4 rounded-3xl opacity-20"></div>
            <img 
               src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
               alt="Team Collaboration" 
               className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl relative z-10"
            />
          </div>
        </section>

        {/* 3. Our Mission (Left Image, Right Text) */}
        <section className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-ink-black -translate-x-4 translate-y-4 rounded-3xl opacity-10"></div>
            <img 
               src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80" 
               alt="Focused Learning" 
               className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl relative z-10"
            />
          </div>
          <div className="flex-1 space-y-6 text-left lg:text-right">
            <h2 className="text-4xl lg:text-5xl font-bold font-playfair">Our Mission</h2>
            <p className="text-lavender-grey leading-relaxed text-lg max-w-xl ml-auto">
              Our mission is to permanently bridge the gap between abstract education and real-world opportunity by providing ultra-affordable, world-class learning experiences. 
            </p>
            <p className="text-lavender-grey leading-relaxed text-lg max-w-xl ml-auto">
              Through the integration of immediate-feedback assessment engines and advanced document processing, we aim to empower our learners with the exact cognitive skills they require to succeed in an ever-evolving digital world.
            </p>
          </div>
        </section>

        {/* 4. Our Vision (Left Text, Right Image) */}
        <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold font-playfair">Our Vision</h2>
            <p className="text-lavender-grey leading-relaxed text-lg pb-4">
              To become the undisputed global leader in online education infrastructure, fostering a massive digital community where active learning is unequivocally inclusive, engaging, and deeply transformative.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-soft-periwinkle translate-x-4 -translate-y-4 rounded-[6rem] opacity-20"></div>
            <img 
               src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80" 
               alt="Global Future" 
               className="w-full aspect-video object-cover rounded-[6rem] shadow-xl relative z-10"
            />
          </div>
        </section>

        {/* 5. What we offer (Left Image, Right List) */}
        <section className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24">
          <div className="flex-1 w-full flex items-start">
            <img 
               src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" 
               alt="Technology Hub" 
               className="w-full h-full object-cover rounded-3xl shadow-lg min-h-[400px]"
            />
          </div>
          <div className="flex-1 space-y-8 py-8">
            <h2 className="text-4xl lg:text-5xl font-bold font-playfair">What we offer</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                 <CheckCircle className="text-soft-periwinkle shrink-0 mt-1" size={20} />
                 <div>
                    <span className="font-bold text-ink-black block mb-1">Dynamic Assessment Engine</span>
                    <span className="text-lavender-grey text-sm">Courses accompanied by immersive 2x2 grid-based quizzing modules ensuring knowledge retention.</span>
                 </div>
              </li>
              <li className="flex items-start gap-4">
                 <CheckCircle className="text-soft-periwinkle shrink-0 mt-1" size={20} />
                 <div>
                    <span className="font-bold text-ink-black block mb-1">Upcoming AI-Tutors</span>
                    <span className="text-lavender-grey text-sm">Prepare for conversational chatbot integrations capable of parsing attached course documents automatically.</span>
                 </div>
              </li>
              <li className="flex items-start gap-4">
                 <CheckCircle className="text-soft-periwinkle shrink-0 mt-1" size={20} />
                 <div>
                    <span className="font-bold text-ink-black block mb-1">Immersive 4K Video Encoding</span>
                    <span className="text-lavender-grey text-sm">Flawless synchronization with external premium CDN layers allowing high-density learning arrays.</span>
                 </div>
              </li>
              <li className="flex items-start gap-4">
                 <CheckCircle className="text-soft-periwinkle shrink-0 mt-1" size={20} />
                 <div>
                    <span className="font-bold text-ink-black block mb-1">Self-Paced Fluid Architecture</span>
                    <span className="text-lavender-grey text-sm">Completely robust backend infrastructures allowing unrestricted scheduling logic tailored to your exact lifestyle constraints.</span>
                 </div>
              </li>
              <li className="flex items-start gap-4">
                 <CheckCircle className="text-soft-periwinkle shrink-0 mt-1" size={20} />
                 <div>
                    <span className="font-bold text-ink-black block mb-1">Lifetime Access Memory</span>
                    <span className="text-lavender-grey text-sm">Local caching mechanisms combined with persistent cloud syncs guaranteeing your study notes live forever.</span>
                 </div>
              </li>
            </ul>
            <div className="pt-6">
               <Link to="/courses" className="inline-block bg-ink-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:-translate-y-1">
                 Explore the Curriculum
               </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
