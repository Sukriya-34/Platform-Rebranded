import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-porcelain font-poppins flex flex-col">
      {/* NAVBAR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-soft-linen sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/pathway.svg" alt="Logo" className="h-8 w-auto object-contain" />
          </Link>
          
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-lavender-grey">
            <Link to="/" className="hover:text-ink-black transition-colors">Home</Link>
            <Link to="/courses" className="hover:text-ink-black transition-colors">Courses</Link>
            <Link to="/blog" className="hover:text-ink-black transition-colors">Blog</Link>
            <Link to="/about" className="hover:text-ink-black transition-colors">About</Link>
            <Link to="/contact" className="hover:text-ink-black transition-colors">Contact us</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-ink-black hover:text-soft-periwinkle transition-colors">
              Login
            </Link>
            <Link to="/signup" className="text-sm font-bold bg-soft-periwinkle hover:bg-[#797A9E] text-white px-5 py-2 rounded-xl transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="grow">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-ink-black text-white pt-16 pb-8 px-6 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div>
            <div className="flex items-center gap-2 font-bold font-playfair text-2xl mb-6">
              PLATFORM<span className="text-soft-periwinkle">.X</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering learners globally with high-quality, accessible education and expert guidance.
            </p>
          </div>

          <div>
             <h4 className="font-bold text-lg mb-6 text-soft-periwinkle">Quick Links</h4>
             <ul className="space-y-3 text-gray-400">
               <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
               <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
               <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
               <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="font-bold text-lg mb-6 text-soft-periwinkle">Contact Details</h4>
             <ul className="space-y-3 text-gray-400">
               <li>Email: support@platformx.com</li>
               <li>Phone: +1 234 567 890</li>
               <li>Address: 123 Learning Street, NY 10001, USA</li>
             </ul>
          </div>

          <div>
             <h4 className="font-bold text-lg mb-6 text-soft-periwinkle">Any Enquiry?</h4>
             <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
               <input type="text" placeholder="Your Name" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-soft-periwinkle text-white text-sm" />
               <textarea rows="3" placeholder="Your Message" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-soft-periwinkle resize-none text-white text-sm"></textarea>
               <button className="w-full bg-soft-periwinkle text-white py-2 rounded-xl font-bold hover:bg-[#797A9E] transition-colors">Submit</button>
             </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>© 2026 Platform.x - All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
