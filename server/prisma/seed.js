import prisma from "../db.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting professional database seeding...");

  // 1. Get or create a ContentCreator user to own the seeded courses
  let creator = await prisma.user.findFirst({
    where: { email: "sukriyashrestha34@gmail.com" },
  });

  if (!creator) {
    console.log("Creating default creator user (sukriyashrestha34@gmail.com)...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    creator = await prisma.user.create({
      data: {
        fullName: "Sukriya Shrestha",
        email: "sukriyashrestha34@gmail.com",
        password: hashedPassword,
        role: "ContentCreator",
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
        bio: "Senior educator and curriculum designer in Web Development and Mathematics.",
        skills: "React, Node.js, Calculus, Educational Design",
      },
    });
  }

  console.log(`✅ Seeding courses for Creator: ${creator.fullName} (ID: ${creator.id})`);

  // 2. Clear old course content to prevent duplicates/orphans
  console.log("Clearing old courses, videos, documents, quizzes, and progress records...");
  await prisma.userProgress.deleteMany();
  await prisma.savedCourse.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.video.deleteMany();
  await prisma.document.deleteMany();
  await prisma.course.deleteMany();

  // 3. Define the detailed course data
  const coursesToCreate = [
    // --- ACADEMIC CLASSIFICATION ---
    {
      title: "Introduction to Calculus",
      description: "Master limits, derivatives, and integration. Learn the foundation of advanced mathematics and engineering physics step-by-step.",
      category: "Mathematics",
      classification: "Academic",
      price: 0, // Free course
      thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Limits & Continuity", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", isFreePreview: true },
          { title: "2. The Derivative Concept", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", isFreePreview: false },
        ],
      },
      documents: {
        create: [
          { title: "Calculus Cheat Sheet & Formulas.pdf", docUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [
          {
            questions: {
              create: [
                {
                  questionText: "What is the derivative of x^2 with respect to x?",
                  options: ["x", "2x", "x^2", "2"],
                  correctAnswer: 1,
                  hint: "Use the Power Rule: d/dx(x^n) = n * x^(n-1)."
                },
                {
                  questionText: "What is the limit of 1/x as x approaches infinity?",
                  options: ["0", "Infinity", "1", "Does not exist"],
                  correctAnswer: 0,
                  hint: "As the denominator gets extremely large, the fraction value gets closer and closer to zero."
                }
              ]
            }
          }
        ]
      }
    },
    {
      title: "Fundamentals of Modern Physics",
      description: "Explore the laws of nature, from Newtonian mechanics and thermodynamics to Einstein's theory of relativity.",
      category: "Physics",
      classification: "Academic",
      price: 120,
      thumbnailUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Newton's Three Laws of Motion", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Mechanics & Inertia Notes.pdf", docUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isFreePreview: false },
        ],
      },
      quizzes: {
        create: [
          {
            questions: {
              create: [
                {
                  questionText: "Which law states that for every action there is an equal and opposite reaction?",
                  options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
                  correctAnswer: 2,
                  hint: "Think about how rockets propel upward by pushing gases downward."
                }
              ]
            }
          }
        ]
      }
    },

    // --- SKILLS CLASSIFICATION ---
    {
      title: "Mastering React Server Components",
      description: "Dive deep into the future of React. Learn about streaming, suspense, and how to build lightning-fast web applications with zero-bundle-size server components.",
      category: "Web Development",
      classification: "Skills",
      price: 150,
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Client vs Server Rendering", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", isFreePreview: true },
          { title: "2. Setting up RSC with Next.js", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", isFreePreview: false },
        ],
      },
      documents: {
        create: [
          { title: "RSC Architecture Guide.pdf", docUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isFreePreview: false },
        ],
      },
      quizzes: {
        create: [
          {
            questions: {
              create: [
                {
                  questionText: "Do React Server Components run on the client browser?",
                  options: ["Yes, always", "No, they only execute on the server", "Only if marked with 'use client'", "Only in development mode"],
                  correctAnswer: 1,
                  hint: "RSC executes exclusively on the server, generating raw JSON data that is streamed to the client."
                }
              ]
            }
          }
        ]
      }
    },
    {
      title: "Advanced UI/UX Masterclass",
      description: "Design is more than just aesthetics. Learn the psychology of user behavior, accessibility guidelines (WCAG), and high-fidelity interactive prototyping in Figma.",
      category: "Design",
      classification: "Skills",
      price: 0, // Free course
      thumbnailUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Visual Hierarchy & White Space", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "UI Checklist & Accessibility Guidelines.pdf", docUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [
          {
            questions: {
              create: [
                {
                  questionText: "What does WCAG stand for in UI/UX Design?",
                  options: ["Web Content Accessibility Guidelines", "Web Color Analysis Group", "Widget Component Alliance Guide", "Web Creator Analytics Gateway"],
                  correctAnswer: 0,
                  hint: "WCAG provides recommendations for making Web content more accessible, particularly for people with disabilities."
                }
              ]
            }
          }
        ]
      }
    },

    // --- HOBBIES CLASSIFICATION ---
    {
      title: "Digital Photography Mastery",
      description: "Learn to compose breathtaking shots. Master the exposure triangle—Aperture, Shutter Speed, and ISO—along with lighting and post-processing techniques.",
      category: "Photography",
      classification: "Hobbies",
      price: 99,
      thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. The Exposure Triangle Explained", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Photography Composition Guide.pdf", docUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isFreePreview: false },
        ],
      },
      quizzes: {
        create: [
          {
            questions: {
              create: [
                {
                  questionText: "Which setting directly controls the depth of field in photography?",
                  options: ["Shutter Speed", "ISO", "Aperture", "White Balance"],
                  correctAnswer: 2,
                  hint: "Aperture (measured in f-stops) determines how wide the lens opening is. A wider aperture (lower f-number) yields a shallower depth of field."
                }
              ]
            }
          }
        ]
      }
    },
    {
      title: "Creative Culinary Arts",
      description: "Unlock the secrets of professional chefs. Learn fundamental knife skills, flavor balancing, and plating layouts for restaurant-quality dishes.",
      category: "Cooking",
      classification: "Hobbies",
      price: 0, // Free
      thumbnailUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600",
      creatorId: creator.id,
      videos: {
        create: [
          { title: "1. Knife Safety & Prep Techniques", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", isFreePreview: true },
        ],
      },
      documents: {
        create: [
          { title: "Essential Spices & Flavors Chart.pdf", docUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", isFreePreview: true },
        ],
      },
      quizzes: {
        create: [
          {
            questions: {
              create: [
                {
                  questionText: "What culinary term means 'putting in place' or gathering all ingredients prior to cooking?",
                  options: ["Sauté", "Mise en place", "Julienne", "Al dente"],
                  correctAnswer: 1,
                  hint: "It is a French phrase used in kitchens globally to denote pre-measurement and arrangement of ingredients."
                }
              ]
            }
          }
        ]
      }
    }
  ];

  // 4. Perform creations
  for (const courseData of coursesToCreate) {
    const course = await prisma.course.create({
      data: courseData,
    });
    console.log(`✅ Created Course: "${course.title}" under [${course.classification}]`);
  }

  console.log("🎉 Seeding finished successfully! Refresh your Dashboard now.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
