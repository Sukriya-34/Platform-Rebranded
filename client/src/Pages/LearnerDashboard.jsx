import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {
    fullName: "Learner",
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        // Premium Data matching your Wireframe 2 (Top Courses)
        const fakeCourses = [
          {
            id: "c1",
            title: "Human Computing Language",
            category: "Computer Science",
            rating: 4.8,
            description:
              "A field that studies, designs, and evaluates how humans interact with computers.",
            instructor: "Dr. Arpan",
          },
          {
            id: "c2",
            title: "Digital Marketing Pro",
            category: "Business",
            rating: 4.5,
            description:
              "Master the art of online growth and social media branding.",
            instructor: "Prof. Sarita",
          },
          {
            id: "c3",
            title: "UI/UX Advanced Design",
            category: "Design",
            rating: 4.9,
            description:
              "Create transformative learning experiences through adaptive design.",
            instructor: "Sukriya S.",
          },
        ];

        setCourses(data.length > 0 ? data : fakeCourses);
      } catch (err) {
        console.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light font-poppins text-brand-dark">
      {/* 1. HEADER */}
      <nav className="h-20 bg-white/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-12 border-b border-brand-accent">
        <div className="flex items-center gap-10">
          <h1 className="font-playfair text-2xl font-bold text-brand-primary">
            Platform.
          </h1>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <span className="hover:text-brand-primary cursor-pointer transition-colors">
              Home
            </span>
            <span className="text-brand-primary border-b-2 border-brand-primary">
              Courses
            </span>
            <span className="hover:text-brand-primary cursor-pointer transition-colors">
              About
            </span>
            <span className="hover:text-brand-primary cursor-pointer transition-colors">
              Contact
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-brand-primary">STUDENT MODE</p>
            <p className="text-sm font-medium">{user.fullName}</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative py-24 bg-brand-accent overflow-hidden">
        <div className="max-w-6xl mx-auto px-12 relative z-10 flex flex-col items-center text-center">
          <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Looking for the <br />
            <span className="text-brand-primary">perfect course?</span>
          </h2>
          <p className="max-w-xl text-gray-500 mb-10 text-lg">
            Use our search bar or explore categories like Technology, Business,
            and Design to find what fits your goals.
          </p>
          <div className="w-full max-w-lg relative">
            <input
              type="text"
              placeholder="Search for courses..."
              className="w-full h-14 pl-6 pr-16 rounded-full shadow-xl border-none focus:ring-2 focus:ring-brand-primary outline-none"
            />
            <button className="absolute right-2 top-2 h-10 px-6 bg-brand-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary rounded-full blur-[120px] opacity-10 -mr-20 -mt-20"></div>
      </header>

      {/* 3. COURSE GRID */}
      <main className="max-w-7xl mx-auto py-24 px-12">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h3 className="font-playfair text-4xl font-bold mb-2">
              Top Courses
            </h3>
            <p className="text-brand-secondary">
              Explore trending courses selected to equip you with industry
              skills.
            </p>
          </div>
          <button className="text-brand-primary font-bold border-b-2 border-brand-primary pb-1 hover:opacity-70 transition-opacity">
            VIEW ALL
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-[2rem] border border-brand-accent overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group"
            >
              <div className="h-56 bg-brand-accent relative flex items-center justify-center">
                <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                  📚
                </span>
                <button className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-300 hover:text-red-500 transition-colors">
                  ♥
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {course.category || "General"}
                  </span>
                  <div className="flex text-yellow-400 text-xs">
                    {"★".repeat(Math.floor(course.rating || 5))}
                    {"☆".repeat(5 - Math.floor(course.rating || 5))}
                  </div>
                </div>

                <h4 className="font-playfair text-2xl font-bold mb-3 leading-snug group-hover:text-brand-primary transition-colors">
                  {course.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-brand-accent">
                  <span className="text-xs font-bold text-brand-secondary">
                    by {course.instructor || "Expert"}
                  </span>
                  <button className="px-6 py-2.5 bg-brand-dark text-white text-xs font-bold rounded-xl hover:bg-brand-primary transition-all shadow-lg shadow-black/5">
                    START NOW
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-brand-dark text-brand-accent pt-24 pb-12 px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <h1 className="font-playfair text-3xl font-bold text-brand-primary mb-6">
              Platform.
            </h1>
            <p className="text-sm leading-relaxed opacity-60">
              Expert-led, interactive courses with flexible learning and
              recognized certifications—making quality education accessible to
              all.
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-8 tracking-widest uppercase text-xs text-white">
              Quick Links
            </h5>
            <ul className="space-y-4 text-sm opacity-60">
              <li className="hover:text-brand-primary cursor-pointer transition-colors font-medium">
                Home
              </li>
              <li className="hover:text-brand-primary cursor-pointer transition-colors font-medium">
                About Us
              </li>
              <li className="hover:text-brand-primary cursor-pointer transition-colors font-medium">
                Services
              </li>
              <li className="hover:text-brand-primary cursor-pointer transition-colors font-medium">
                Contact
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-8 tracking-widest uppercase text-xs text-white">
              Get In Touch
            </h5>
            <ul className="space-y-4 text-sm opacity-60">
              <li className="flex items-center gap-3 italic">
                platform123@gmail.com
              </li>
              <li className="flex items-center gap-3">Kathmandu, Nepal</li>
              <li className="flex items-center gap-3 font-medium">
                01-5551234
              </li>
            </ul>
          </div>

          <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
            <h5 className="font-bold mb-6 text-sm text-white">Any Enquiry?</h5>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full bg-white/10 border-none rounded-lg p-3 mb-4 text-xs outline-none focus:ring-1 focus:ring-brand-primary text-white"
            />
            <textarea
              placeholder="Your Message"
              className="w-full bg-white/10 border-none rounded-lg p-3 mb-4 text-xs outline-none focus:ring-1 focus:ring-brand-primary h-20 resize-none text-white"
            ></textarea>
            <button className="w-full py-3 bg-brand-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all">
              Submit
            </button>
          </div>
        </div>

        <div className="text-center pt-12 border-t border-white/5 opacity-40 text-[10px] tracking-[0.3em] font-bold">
          ALL RIGHTS RESERVED 2026 © PLATFORM WEBSITE
        </div>
      </footer>
    </div>
  );
};

export default LearnerDashboard;
