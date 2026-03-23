import React from 'react';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/auth-illustration.png'; // Reuse your image!

const RoleSelection = () => {
  const navigate = useNavigate();

  // When they click a role, we send them to the signup page and pass the role along!
  const handleRoleSelect = (selectedRole) => {
    navigate('/signup', { state: { role: selectedRole } });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      
      {/* LEFT SIDE (Same Full Bleed Image) */}
      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        <img 
          src={illustration} 
          alt="Role Selection" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center px-8 sm:px-16 bg-porcelain overflow-y-auto">
        <div className="w-full max-w-md py-8">
          
          <div className="text-center mb-10">
            <h1 className="font-playfair text-4xl font-bold mb-3 text-ink-black">Join Platform</h1>
            <p className="font-playfair text-sm text-gray-600 leading-relaxed">
              How would you like to use our platform? Choose your path below.
            </p>
          </div>

          <div className="space-y-6">
            {/* LEARNER CARD */}
            <button 
              onClick={() => handleRoleSelect('Learner')}
              className="w-full text-left p-6 border-2 border-warm-taupe rounded-xl hover:border-soft-periwinkle hover:bg-soft-periwinkle/5 transition-all duration-200 group"
            >
              <h3 className="font-playfair text-xl font-bold mb-2 group-hover:text-soft-periwinkle">I am a Learner</h3>
              <p className="text-sm text-gray-600">I want to access courses, track my progress, and expand my knowledge.</p>
            </button>

            {/* CREATOR CARD */}
            <button 
              onClick={() => handleRoleSelect('Content Creator')}
              className="w-full text-left p-6 border-2 border-warm-taupe rounded-xl hover:border-soft-periwinkle hover:bg-soft-periwinkle/5 transition-all duration-200 group"
            >
              <h3 className="font-playfair text-xl font-bold mb-2 group-hover:text-soft-periwinkle">I am a Content Creator</h3>
              <p className="text-sm text-gray-600">I want to upload courses, manage students, and build my audience.</p>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <a href="/login" className="text-soft-periwinkle font-semibold hover:underline">Log in</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoleSelection;