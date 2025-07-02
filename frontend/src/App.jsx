import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Download, ArrowRight, Code, Server, BrainCircuit, Bot, FileArchive, CheckCircle, XCircle, Loader, Zap } from 'lucide-react';
import clsx from 'clsx';

// --- Technology Data ---
const techOptions = {
  frontend: [
    { id: 'react', name: 'React + Vite', icon: <Code size={20} /> },
    { id: 'vue', name: 'Vue + Vite', icon: <Code size={20} /> },
    { id: 'angular', name: 'Angular', icon: <Code size={20} /> },
  ],
  backend: [
    { id: 'springboot', name: 'Java (Spring Boot)', icon: <Server size={20} /> },
    { id: 'fastapi', name: 'Python (FastAPI)', icon: <Server size={20} /> },
    { id: 'nodejs', name: 'Node.js (Express)', icon: <Server size={20} /> },
  ],
};

// Hardcoded project data
const mockProjects = {
  'react-frontend': {
    files: ['App.jsx', 'components/Dashboard.jsx', 'components/LoginForm.jsx', 'utils/api.js'],
    structure: 'Modern React app with component architecture',
    features: ['User Authentication', 'Dashboard UI', 'Responsive Design']
  },
  'vue-frontend': {
    files: ['App.vue', 'components/Dashboard.vue', 'components/LoginForm.vue', 'router/index.js'],
    structure: 'Vue 3 application with Composition API',
    features: ['Vue Router', 'Pinia State Management', 'Component Library']
  },
  'springboot-backend': {
    files: ['Application.java', 'controller/UserController.java', 'service/UserService.java', 'config/SecurityConfig.java'],
    structure: 'Spring Boot REST API with security',
    features: ['JWT Authentication', 'JPA Repositories', 'REST Endpoints']
  },
  'fastapi-backend': {
    files: ['main.py', 'models/user.py', 'routers/auth.py', 'database.py'],
    structure: 'FastAPI with async support',
    features: ['Async Operations', 'Pydantic Models', 'OAuth2 Security']
  }
};

// --- Progress Circuit Component ---
const ProgressCircuit = ({ currentStep, completedSteps }) => {
  const steps = ['stories', 'branch', 'tech', 'generate', 'download'];
  
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="relative">
        {/* Vertical main line */}
        <div className="absolute left-4 top-0 w-0.5 h-full bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-red-500/20"></div>
        
        {steps.map((step, index) => {
          const isActive = currentStep === step;
          const isCompleted = completedSteps.includes(step);
          const position = index * 120;
          
          return (
            <div key={step} className="relative" style={{ top: `${position}px` }}>
              {/* Circuit node */}
              <div className={clsx(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                isActive ? "border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/50" : 
                isCompleted ? "border-green-400 bg-green-400/20" : "border-gray-600 bg-gray-800"
              )}>
                {isCompleted && <CheckCircle size={16} className="text-green-400" />}
                {isActive && !isCompleted && <Zap size={16} className="text-blue-400 animate-pulse" />}
              </div>
              
              {/* Branch lines for tech selection */}
              {step === 'tech' && currentStep === 'tech' && (
                <>
                  <div className="absolute left-8 top-4 w-16 h-0.5 bg-blue-400/50"></div>
                  <div className="absolute left-24 top-0 w-0.5 h-8 bg-blue-400/50"></div>
                  <div className="absolute left-24 top-8 w-0.5 h-8 bg-blue-400/50"></div>
                </>
              )}
              
              {/* Step label */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 text-sm font-medium capitalize">
                {step === 'stories' ? 'User Stories' : 
                 step === 'branch' ? 'Project Type' :
                 step === 'tech' ? 'Technology' :
                 step === 'generate' ? 'Generate' : 'Download'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Reusable Components ---
const NavLink = ({ children, sectionId, activeSection, scrollTo }) => (
  <button
    onClick={() => scrollTo(sectionId)}
    className={clsx(
      "px-4 py-2 text-sm font-medium transition-colors duration-300 relative",
      activeSection === sectionId ? "text-white" : "text-gray-400 hover:text-white"
    )}
  >
    {children}
    {activeSection === sectionId && (
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-red-500 rounded-full"></span>
    )}
  </button>
);

const Section = React.forwardRef(({ children, id, className }, ref) => (
  <section
    ref={ref}
    id={id}
    className={clsx(
      "min-h-screen w-full flex flex-col items-center justify-center p-8 snap-start snap-always",
      className
    )}
  >
    {children}
  </section>
));

// --- Main App Component ---
export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const sectionRefs = {
    home: useRef(null),
    stories: useRef(null),
    branches: useRef(null),
    technologies: useRef(null),
    generator: useRef(null),
    results: useRef(null),
  };

  // State for the flow
  const [userStories, setUserStories] = useState("As a user, I want to be able to sign up, log in, and see a dashboard with my recent activity.");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [generationState, setGenerationState] = useState('idle');
  const [generatedProject, setGeneratedProject] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Current step logic
  const getCurrentStep = () => {
    if (activeSection === 'stories') return 'stories';
    if (activeSection === 'branches') return 'branch';
    if (activeSection === 'technologies') return 'tech';
    if (activeSection === 'generator') return 'generate';
    if (activeSection === 'results') return 'download';
    return 'stories';
  };

  const scrollTo = (id) => {
    sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6,
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      Object.values(sectionRefs).forEach(ref => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  const handleStoriesNext = () => {
    if (userStories.trim()) {
      setCompletedSteps(prev => [...prev, 'stories']);
      scrollTo('branches');
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setCompletedSteps(prev => [...prev, 'branch']);
    scrollTo('technologies');
  };

  const handleTechSelect = (tech) => {
    setSelectedTech(tech);
    setCompletedSteps(prev => [...prev, 'tech']);
    scrollTo('generator');
  };

  const handleGenerate = () => {
    setGenerationState('generating');
    setCompletedSteps(prev => [...prev, 'generate']);
    
    // Simulate generation
    setTimeout(() => {
      const projectKey = `${selectedTech}-${selectedBranch}`;
      setGeneratedProject(mockProjects[projectKey] || mockProjects['react-frontend']);
      setGenerationState('ready');
      scrollTo('results');
    }, 3000);
  };

  const handleDownload = () => {
    // Simulate download
    const projectName = `${selectedTech}-${selectedBranch}-project.zip`;
    const blob = new Blob(['// Mock project files\n// Generated project structure'], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = projectName;
    a.click();
    URL.revokeObjectURL(url);
    
    setCompletedSteps(prev => [...prev, 'download']);
  };

  return (
    <div className="bg-gray-900 text-white font-sans overflow-x-hidden">
      {/* Progress Circuit */}
      <ProgressCircuit currentStep={getCurrentStep()} completedSteps={completedSteps} />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-white/10">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot size={28} className="text-red-500"/>
            <span className="text-2xl font-bold">CodeGen</span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <NavLink sectionId="home" activeSection={activeSection} scrollTo={scrollTo}>Home</NavLink>
            <NavLink sectionId="stories" activeSection={activeSection} scrollTo={scrollTo}>Stories</NavLink>
            <NavLink sectionId="branches" activeSection={activeSection} scrollTo={scrollTo}>Branches</NavLink>
            <NavLink sectionId="technologies" activeSection={activeSection} scrollTo={scrollTo}>Tech</NavLink>
            <NavLink sectionId="generator" activeSection={activeSection} scrollTo={scrollTo}>Generate</NavLink>
            <NavLink sectionId="results" activeSection={activeSection} scrollTo={scrollTo}>Results</NavLink>
          </div>
          <button className="bg-red-500 text-white font-semibold px-5 py-2 rounded-md hover:bg-red-600 transition-colors">
            Get Started
          </button>
        </nav>
      </header>

      {/* Scroll Container */}
      <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {/* Home Section */}
        <Section ref={sectionRefs.home} id="home" className="bg-gray-900">
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
              <span className="text-red-500">//</span> AI agents that
            </h1>
            <h1 className="text-6xl md:text-8xl font-extrabold text-blue-400 mb-8">
              build your code <span className="text-red-500">//</span>
            </h1>
            <p className="max-w-3xl mx-auto text-gray-400 text-xl mb-12">
              Describe your application in plain English. Our AI agent will understand your requirements,
              structure the project, and generate production-ready code in the framework of your choice.
            </p>
            <button 
              onClick={() => scrollTo('stories')} 
              className="bg-red-500 text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            >
              Start Building Now <ArrowRight className="inline ml-2" />
            </button>
          </div>
        </Section>

        {/* User Stories Section */}
        <Section ref={sectionRefs.stories} id="stories" className="bg-gray-800">
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-red-500">//</span> Step 1: Your Vision
            </h2>
            <p className="text-gray-400 text-xl mb-8">Tell us what your application should do</p>
            
            <div className="bg-gray-900 p-8 rounded-2xl border border-white/10">
              <textarea
                value={userStories}
                onChange={(e) => setUserStories(e.target.value)}
                placeholder="e.g., As a user, I want to view a list of products, add them to cart, and checkout securely..."
                className="w-full h-40 p-6 bg-gray-800 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-lg"
              />
              
              <button
                onClick={handleStoriesNext}
                disabled={!userStories.trim()}
                className="mt-6 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
              >
                Next: Choose Project Type <ArrowRight className="inline ml-2" />
              </button>
            </div>
          </div>
        </Section>

        {/* Branches Section */}
        <Section ref={sectionRefs.branches} id="branches" className="bg-gray-900">
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-red-500">//</span> Step 2: Project Type
            </h2>
            <p className="text-gray-400 text-xl mb-12">Choose your development path</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                onClick={() => handleBranchSelect('frontend')}
                className="group p-8 border-2 border-white/20 rounded-2xl cursor-pointer transition-all duration-500 hover:border-blue-400 hover:bg-blue-400/5 hover:scale-105"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Code className="text-blue-400" size={32} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4">Frontend</h3>
                <p className="text-gray-400 text-lg">Generate user interfaces with modern frameworks like React, Vue, or Angular</p>
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="mx-auto text-blue-400" size={24} />
                </div>
              </div>
              
              <div
                onClick={() => handleBranchSelect('backend')}
                className="group p-8 border-2 border-white/20 rounded-2xl cursor-pointer transition-all duration-500 hover:border-green-400 hover:bg-green-400/5 hover:scale-105"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <Server className="text-green-400" size={32} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4">Backend</h3>
                <p className="text-gray-400 text-lg">Build robust server-side applications and APIs with Spring Boot, FastAPI, or Node.js</p>
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="mx-auto text-green-400" size={24} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Technologies Section */}
        <Section ref={sectionRefs.technologies} id="technologies" className="bg-gray-800">
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-red-500">//</span> Step 3: Technology
            </h2>
            <p className="text-gray-400 text-xl mb-12">
              Select your preferred {selectedBranch} technology
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedBranch && techOptions[selectedBranch].map(tech => (
                <div
                  key={tech.id}
                  onClick={() => handleTechSelect(tech.id)}
                  className="group p-6 border-2 border-white/20 rounded-xl cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-purple-400/5 hover:scale-105"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      {tech.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="mx-auto text-purple-400" size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Generator Section */}
        <Section ref={sectionRefs.generator} id="generator" className="bg-gray-900">
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-red-500">//</span> Step 4: Generate
            </h2>
            <p className="text-gray-400 text-xl mb-12">Ready to create your project?</p>
            
            <div className="bg-gray-800 p-8 rounded-2xl border border-white/10 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-left">
                  <h4 className="font-bold text-blue-400 mb-2">User Stories</h4>
                  <p className="text-sm text-gray-400 truncate">{userStories}</p>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-purple-400 mb-2">Project Type</h4>
                  <p className="text-sm text-gray-400 capitalize">{selectedBranch}</p>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-green-400 mb-2">Technology</h4>
                  <p className="text-sm text-gray-400">{selectedTech}</p>
                </div>
              </div>
              
              {generationState === 'idle' && (
                <button
                  onClick={handleGenerate}
                  className="bg-red-500 text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                >
                  <BrainCircuit className="inline mr-3" />
                  Generate My Code
                </button>
              )}
              
              {generationState === 'generating' && (
                <div className="flex flex-col items-center">
                  <Loader size={48} className="text-blue-400 mb-4 animate-spin"/>
                  <p className="text-xl font-semibold">AI is analyzing and generating...</p>
                  <p className="text-gray-400 mt-2">This may take a moment</p>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Results Section */}
        <Section ref={sectionRefs.results} id="results" className="bg-gray-800">
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-red-500">//</span> Step 5: Your Project
            </h2>
            
            {generationState === 'ready' && generatedProject && (
              <div className="bg-gray-900 p-8 rounded-2xl border border-white/10">
                <div className="flex items-center justify-center mb-6">
                  <CheckCircle size={64} className="text-green-400"/>
                </div>
                
                <h3 className="text-3xl font-bold mb-4 capitalize">
                  {selectedTech} {selectedBranch} Project Ready!
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="text-left">
                    <h4 className="font-bold text-blue-400 mb-3">Generated Files</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {generatedProject.files.map(file => (
                        <li key={file}>📄 {file}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-purple-400 mb-3">Features Included</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {generatedProject.features.map(feature => (
                        <li key={feature}>✨ {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  className="bg-green-500 text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="inline mr-3" />
                  Download Project ZIP
                </button>
              </div>
            )}
          </div>
        </Section>
      </main>
    </div>
  );
}