import prisma from "../db.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting expansive database seeding with real images & docs...");

  let creator = await prisma.user.findFirst({
    where: { email: "sukriyashrestha34@gmail.com" },
  });

  if (!creator) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    creator = await prisma.user.create({
      data: {
        fullName: "Sukriya Shrestha",
        email: "sukriyashrestha34@gmail.com",
        password: hashedPassword,
        role: "ContentCreator",
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
        bio: "Senior educator and curriculum designer.",
        skills: "React, Node.js, Calculus, Educational Design",
      },
    });
  }

  console.log("Clearing old data...");
  await prisma.userProgress.deleteMany();
  await prisma.savedCourse.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.video.deleteMany();
  await prisma.document.deleteMany();
  await prisma.course.deleteMany();

  const coursesToCreate = [
    // --- MATHEMATICS ---
    {
      title: "Introduction to Calculus",
      description: "Master limits, derivatives, and integration. Learn the foundation of advanced mathematics.",
      category: "Mathematics",
      classification: "Academic",
      price: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Limits & Continuity", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Calculus Wikipedia Guide", docUrl: "https://en.wikipedia.org/wiki/Calculus", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "What is the derivative of x^2?", options: ["x", "2x", "x^2", "2"], correctAnswer: 1, hint: "Power Rule" },
              { questionText: "What is the limit of 1/x as x approaches infinity?", options: ["0", "Infinity", "1", "DNE"], correctAnswer: 0, hint: "Denominator gets very large" },
              { questionText: "What is the integral of 2x?", options: ["x^2", "x", "2", "x^2 + C"], correctAnswer: 3, hint: "Don't forget the constant of integration!" },
              { questionText: "What is the derivative of sin(x)?", options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], correctAnswer: 0, hint: "Basic trig derivative." },
              { questionText: "What is the slope of a horizontal line?", options: ["1", "Infinity", "0", "-1"], correctAnswer: 2, hint: "There is no rise." }
            ]
          }
        }]
      }
    },
    {
      title: "Linear Algebra Fundamentals",
      description: "Vectors, matrices, and linear transformations. The math behind Machine Learning.",
      category: "Mathematics",
      classification: "Academic",
      price: 100,
      thumbnailUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Vectors & Matrices", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Linear Algebra Fundamentals", docUrl: "https://en.wikipedia.org/wiki/Linear_algebra", isFreePreview: false },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "What is the determinant of the identity matrix?", options: ["0", "1", "Infinity", "-1"], correctAnswer: 1, hint: "Multiply the diagonal elements." },
              { questionText: "Can you multiply a 2x3 matrix by a 3x4 matrix?", options: ["Yes", "No", "Only if square", "None of above"], correctAnswer: 0, hint: "Inner dimensions must match." },
              { questionText: "What is an eigenvector?", options: ["A vector that doesn't change direction", "A unit vector", "A zero vector", "A matrix column"], correctAnswer: 0, hint: "Transformation only scales it." },
              { questionText: "What is the rank of a matrix?", options: ["Number of columns", "Number of rows", "Number of linearly independent rows", "The determinant"], correctAnswer: 2, hint: "Measures non-redundant information." },
              { questionText: "Is matrix multiplication commutative?", options: ["Always", "Never", "Generally No", "Only for inverse"], correctAnswer: 2, hint: "AB is not usually BA." }
            ]
          }
        }]
      }
    },

    // --- PHYSICS ---
    {
      title: "Fundamentals of Modern Physics",
      description: "Explore Newtonian mechanics, thermodynamics, and relativity.",
      category: "Physics",
      classification: "Academic",
      price: 120,
      thumbnailUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Newton's Laws", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Modern Physics Read", docUrl: "https://en.wikipedia.org/wiki/Modern_physics", isFreePreview: false },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "Newton's Third Law states?", options: ["F=ma", "Every action has an equal/opposite reaction", "Inertia", "Gravity"], correctAnswer: 1, hint: "Action/Reaction." },
              { questionText: "What is the unit of Force?", options: ["Joule", "Watt", "Newton", "Pascal"], correctAnswer: 2, hint: "Named after Isaac." },
              { questionText: "What is the speed of light in vacuum?", options: ["3x10^8 m/s", "3x10^5 m/s", "3x10^10 m/s", "Instant"], correctAnswer: 0, hint: "299,792,458 m/s." },
              { questionText: "What measures resistance?", options: ["Ampere", "Volt", "Ohm", "Watt"], correctAnswer: 2, hint: "Symbol is Omega." },
              { questionText: "What is kinetic energy?", options: ["Energy of position", "Energy of motion", "Stored energy", "Thermal energy"], correctAnswer: 1, hint: "Moving objects have this." }
            ]
          }
        }]
      }
    },
    {
      title: "Quantum Mechanics Basics",
      description: "Dive into the microscopic world of atoms and subatomic particles.",
      category: "Physics",
      classification: "Academic",
      price: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1636572583808-7243c9233be1?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Wave-Particle Duality", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Quantum Mechanics History", docUrl: "https://en.wikipedia.org/wiki/Quantum_mechanics", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "Who proposed the uncertainty principle?", options: ["Einstein", "Heisenberg", "Bohr", "Planck"], correctAnswer: 1, hint: "Famous for breaking bad too." },
              { questionText: "What is a quantum of light called?", options: ["Proton", "Electron", "Photon", "Neutron"], correctAnswer: 2, hint: "Starts with P." },
              { questionText: "Which experiment showed wave-particle duality?", options: ["Double-slit", "Michelson-Morley", "Rutherford", "Cathode ray"], correctAnswer: 0, hint: "Two openings." },
              { questionText: "What describes a quantum state?", options: ["Velocity", "Wave function", "Temperature", "Density"], correctAnswer: 1, hint: "Psi symbol." },
              { questionText: "Can particles be entangled?", options: ["Yes", "No", "Only in theory", "Only photons"], correctAnswer: 0, hint: "Spooky action at a distance." }
            ]
          }
        }]
      }
    },

    // --- WEB DEVELOPMENT ---
    {
      title: "Mastering React Server Components",
      description: "Learn about streaming, suspense, and next-gen React.",
      category: "Web Development",
      classification: "Skills",
      price: 150,
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Client vs Server Rendering", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "React Library Intro", docUrl: "https://en.wikipedia.org/wiki/React_(software)", isFreePreview: false },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "Do RSC run on the client?", options: ["Yes", "No", "Sometimes", "Only on mobile"], correctAnswer: 1, hint: "The name implies where they run." },
              { questionText: "What is the directive to make a client component?", options: ["'use client'", "'use server'", "'use react'", "'is client'"], correctAnswer: 0, hint: "Put this at the top of the file." },
              { questionText: "Can Server Components use useState?", options: ["Yes", "No", "Only for strings", "Yes in Next.js"], correctAnswer: 1, hint: "State implies interactivity, which needs a client." },
              { questionText: "Which framework popularized RSC?", options: ["Vue", "Angular", "Next.js", "SvelteKit"], correctAnswer: 2, hint: "Created by Vercel." },
              { questionText: "What does RSC reduce?", options: ["Server cost", "Database queries", "Client bundle size", "Developer experience"], correctAnswer: 2, hint: "Less JavaScript sent to the browser." }
            ]
          }
        }]
      }
    },
    {
      title: "Advanced CSS Flexbox & Grid",
      description: "Build beautiful layouts without relying on Bootstrap or Tailwind.",
      category: "Web Development",
      classification: "Skills",
      price: 50,
      thumbnailUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. The Flex Container", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "CSS Flexbox Official Draft", docUrl: "https://en.wikipedia.org/wiki/CSS_Flexible_Box_Layout", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "Which property makes a container a flexbox?", options: ["display: flex", "display: grid", "align: flex", "justify: box"], correctAnswer: 0, hint: "It changes the display type." },
              { questionText: "How to center items horizontally in flex-row?", options: ["align-items: center", "justify-content: center", "text-align: center", "margin: auto"], correctAnswer: 1, hint: "Along the main axis." },
              { questionText: "CSS Grid is primarily for?", options: ["1D layouts", "2D layouts", "3D transforms", "Animations"], correctAnswer: 1, hint: "Rows AND columns." },
              { questionText: "What does 'fr' stand for in Grid?", options: ["Frame", "Fraction", "Free", "Front"], correctAnswer: 1, hint: "A part of the available space." },
              { questionText: "Can you combine Grid and Flexbox?", options: ["Yes", "No", "Only in Chrome", "It breaks layouts"], correctAnswer: 0, hint: "They complement each other." }
            ]
          }
        }]
      }
    },

    // --- DESIGN ---
    {
      title: "Advanced UI/UX Masterclass",
      description: "Psychology of user behavior, WCAG guidelines, and Figma prototyping.",
      category: "Design",
      classification: "Skills",
      price: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Visual Hierarchy", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "User Experience Design", docUrl: "https://en.wikipedia.org/wiki/User_experience_design", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "What does WCAG stand for?", options: ["Web Content Accessibility Guidelines", "Web Color Analysis Group", "Widget Component Guide", "Web Creator Analytics"], correctAnswer: 0, hint: "It's about making the web accessible." },
              { questionText: "What is white space in design?", options: ["Literally white pixels", "Empty space between elements", "Space for ads", "Background color"], correctAnswer: 1, hint: "Also known as negative space." },
              { questionText: "Which tool is industry standard for UI design?", options: ["MS Paint", "Figma", "Notepad", "Excel"], correctAnswer: 1, hint: "Starts with F." },
              { questionText: "What is a wireframe?", options: ["A finished design", "A code blueprint", "A low-fidelity visual guide", "A color palette"], correctAnswer: 2, hint: "Skeletal framework." },
              { questionText: "What does UX stand for?", options: ["User XML", "User Experience", "User Examination", "Unified X-axis"], correctAnswer: 1, hint: "How the user feels." }
            ]
          }
        }]
      }
    },

    // --- PHOTOGRAPHY ---
    {
      title: "Digital Photography Mastery",
      description: "Master the exposure triangle and lighting.",
      category: "Photography",
      classification: "Hobbies",
      price: 99,
      thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Exposure Triangle", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Digital Photography Elements", docUrl: "https://en.wikipedia.org/wiki/Digital_photography", isFreePreview: false },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "Which setting controls depth of field?", options: ["Shutter Speed", "ISO", "Aperture", "White Balance"], correctAnswer: 2, hint: "f-stops." },
              { questionText: "What does ISO measure?", options: ["Sensor sensitivity to light", "Lens width", "Flash brightness", "Color temp"], correctAnswer: 0, hint: "Higher number means grainier but brighter." },
              { questionText: "A fast shutter speed is used to?", options: ["Create motion blur", "Freeze action", "Increase depth of field", "Darken image"], correctAnswer: 1, hint: "Catch sports moments." },
              { questionText: "What does 'bokeh' refer to?", options: ["Camera brand", "Aesthetic quality of the blur", "A type of flash", "Memory card error"], correctAnswer: 1, hint: "The blurry background." },
              { questionText: "Which file format captures raw sensor data?", options: ["JPEG", "PNG", "RAW", "GIF"], correctAnswer: 2, hint: "Unprocessed." }
            ]
          }
        }]
      }
    },

    // --- COOKING ---
    {
      title: "Creative Culinary Arts",
      description: "Learn fundamental knife skills, flavor balancing, and plating.",
      category: "Cooking",
      classification: "Hobbies",
      price: 0,
      thumbnailUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Knife Safety", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Culinary Arts Wikipedia", docUrl: "https://en.wikipedia.org/wiki/Culinary_arts", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [{
          questions: {
            create: [
              { questionText: "What does 'Mise en place' mean?", options: ["Sauté", "Everything in its place", "Julienne", "Al dente"], correctAnswer: 1, hint: "Prep work." },
              { questionText: "At what temp does water boil (Sea level)?", options: ["100C", "90C", "120C", "80C"], correctAnswer: 0, hint: "Celsius standard." },
              { questionText: "What is the Maillard reaction?", options: ["Freezing", "Browning of food", "Boiling", "Fermentation"], correctAnswer: 1, hint: "Searing a steak causes this." },
              { questionText: "Which is a primary taste?", options: ["Spicy", "Umami", "Crunchy", "Hot"], correctAnswer: 1, hint: "Savory flavor." },
              { questionText: "What does 'al dente' refer to?", options: ["Overcooked", "Firm to the bite", "Raw", "Burnt"], correctAnswer: 1, hint: "Used for pasta." }
            ]
          }
        }]
      }
    }
  ];

  for (const courseData of coursesToCreate) {
    const course = await prisma.course.create({
      data: courseData,
    });
    console.log(`✅ Created Course: "${course.title}" under [${course.classification}]`);
  }

  console.log("🎉 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
