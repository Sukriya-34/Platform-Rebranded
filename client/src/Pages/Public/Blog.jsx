import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User } from "lucide-react";

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "The Future of E-Learning in 2026",
      excerpt: "Explore how AI, VR, and personalized learning paths are revolutionizing education globally.",
      category: "EdTech",
      author: "Alex Morgan",
      date: "May 28, 2026",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Mastering React: Hooks Best Practices",
      excerpt: "A deep dive into useEffect, useCallback, and managing state effectively in large applications.",
      category: "Programming",
      author: "Sarah Chen",
      date: "May 25, 2026",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "10 Essential Knife Skills Every Chef Needs",
      excerpt: "From julienne to chiffonade, master the fundamental cuts that form the basis of culinary arts.",
      category: "Culinary Arts",
      author: "Chef Marcus",
      date: "May 20, 2026",
      image: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="font-poppins bg-porcelain min-h-[80vh] pt-12 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-playfair text-ink-black mb-4">Latest Insights</h1>
          <p className="text-lavender-grey text-lg max-w-2xl mx-auto">Discover articles on technology, education, and skills to help you thrive in your learning journey.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-soft-linen flex flex-col group">
              <div className="relative h-48 overflow-hidden bg-ink-black">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-ink-black">
                  {post.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs font-bold text-lavender-grey uppercase tracking-wider mb-4">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
                </div>
                <h2 className="text-xl font-bold font-playfair text-ink-black mb-3 leading-snug group-hover:text-soft-periwinkle transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-lavender-grey leading-relaxed mb-6 flex-1">
                  {post.excerpt}
                </p>
                <Link to="#" className="inline-flex items-center gap-2 text-sm font-bold text-ink-black hover:text-soft-periwinkle transition-colors w-fit">
                  Read Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
