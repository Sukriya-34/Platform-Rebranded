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
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: "success", message: "Message sent successfully!" });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.error || "Failed to send message." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: "", message: "" }), 5000);
    }
  };

  return (
    <div className="font-poppins bg-white w-full">
      {/* Banner */}
      <div 
        className="w-full py-32 flex items-center justify-center relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-ink-black/60 backdrop-blur-[2px]"></div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 max-w-2xl text-center text-white shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-4 drop-shadow-md">Got Any Questions?</h1>
          <p className="text-base opacity-90 leading-relaxed max-w-lg mx-auto">
            We're here to help you on your learning journey! Whether it's about a course, technical help, or general info — don't hesitate to reach out.
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          
          {/* Left Form */}
          <div>
            <h2 className="text-3xl font-playfair font-bold text-ink-black mb-2">Get in Touch</h2>
            <p className="text-sm text-ink-black mb-8">Let us know how to get back to you</p>
            
            {status.message && (
              <div className={`p-4 rounded-xl border font-bold mb-6 text-sm ${status.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                {status.message}
              </div>
            )}
            
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
                  disabled={loading}
                  className="w-full bg-soft-periwinkle hover:bg-[#797A9E] text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
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
