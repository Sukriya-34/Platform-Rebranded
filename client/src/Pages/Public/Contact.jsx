import React, { useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="font-poppins bg-white w-full">
      {/* Banner */}
      <div className="w-full bg-[#B3A9A7] py-24 flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 max-w-2xl text-center text-white border border-white/10">
          <h1 className="text-3xl font-bold font-playfair mb-3">Got Any Questions</h1>
          <p className="text-sm opacity-90 leading-relaxed">
            We're here to help you on your learning journey! Whether it's about a course, technical help, or general info -- don't hesitate to reach out.
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          
          {/* Left Form */}
          <div>
            <h2 className="text-3xl font-playfair font-bold text-ink-black mb-2">Get in Touch</h2>
            <p className="text-sm text-ink-black mb-8">Let us know how to get back to you</p>
            
            {submitted ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 flex items-center justify-center h-64 font-bold">
                Message sent successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <input 
                  type="text" 
                  placeholder="Name" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black"
                />
                <input 
                  type="text" 
                  placeholder="Subject" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black"
                />
                <textarea 
                  placeholder="Message" 
                  required
                  rows="6"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ink-black"
                ></textarea>
                <button 
                  type="submit" 
                  className="w-full bg-[#B3A9A7] hover:bg-[#9c9391] text-white font-bold py-4 rounded-md transition-colors uppercase tracking-widest text-sm"
                >
                  Button
                </button>
              </form>
            )}
          </div>

          {/* Right Info */}
          <div className="flex flex-col pt-4">
            <h2 className="text-2xl font-playfair font-bold text-ink-black mb-4">We'd love to hear from you!</h2>
            <p className="text-xs text-ink-black mb-12 max-w-sm leading-relaxed">
              Reach out to us through the form or contact us via the details below:
            </p>

            <div className="grid grid-cols-2 gap-y-12 gap-x-8 mb-16">
              <div className="flex flex-col items-center text-center">
                <MapPin size={24} className="text-ink-black mb-3" />
                <span className="text-xs font-bold text-ink-black mb-1">Address</span>
                <span className="text-xs text-ink-black">Kathmandu, Nepal</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Mail size={24} className="text-ink-black mb-3" />
                <span className="text-xs font-bold text-ink-black mb-1">Email</span>
                <span className="text-xs text-ink-black">platform123@gmail.com</span>
              </div>
              <div className="flex flex-col items-center text-center col-span-2">
                <Phone size={24} className="text-ink-black mb-3" />
                <span className="text-xs font-bold text-ink-black mb-1">Phone</span>
                <span className="text-xs text-ink-black">01-5551234</span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-8">
              <h3 className="text-sm font-bold text-ink-black mb-4">Follow us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-ink-black hover:text-gray-600 transition-colors">
                  <FacebookIcon />
                </a>
                <a href="#" className="text-ink-black hover:text-gray-600 transition-colors">
                  <InstagramIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-porcelain py-4 border-t border-soft-linen text-center">
         <span className="text-[10px] font-bold text-ink-black">All Rights Reserved 2024 © Platform website</span>
      </div>
    </div>
  );
}
