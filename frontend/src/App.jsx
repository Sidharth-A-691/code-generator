import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowRight,
  Code,
  Server,
  Bot,
  CheckCircle,
  Loader,
  Zap,
  Download,
  BrainCircuit
} from 'lucide-react'
import clsx from 'clsx'

// --- Tech options with icons ---
const techOptions = {
  frontend: [
    { id: 'react',   name: 'React + Vite', icon: <Code size={20}/> },
    { id: 'vue',     name: 'Vue + Vite',   icon: <Code size={20}/> },
    { id: 'angular', name: 'Angular',      icon: <Code size={20}/> }
  ],
  backend: [
    { id: 'springboot', name: 'Java (Spring Boot)', icon: <Server size={20}/> },
    { id: 'fastapi',    name: 'Python (FastAPI)',  icon: <Server size={20}/> },
    { id: 'nodejs',     name: 'Node.js (Express)', icon: <Server size={20}/> }
  ]
}

// --- Mock project data ---
const mockProjects = {
  'react-frontend': {
    files: ['App.jsx','Dashboard.jsx','LoginForm.jsx','api.js'],
    features: ['Auth','Dashboard UI','Responsive']
  },
  'vue-frontend': {
    files: ['App.vue','Dashboard.vue','LoginForm.vue','router.js'],
    features: ['Vue Router','Pinia','UI Library']
  },
  'springboot-backend': {
    files: ['App.java','UserController.java','UserService.java','SecurityConfig.java'],
    features: ['JWT Auth','JPA','REST API']
  },
  'fastapi-backend': {
    files: ['main.py','user.py','auth.py','db.py'],
    features: ['Async','Pydantic','OAuth2']
  }
}

// --- Half-hexagon component ---
const Hexagon = ({ position, color, half }) => {
  const clipPath = half === 'top'
    ? 'polygon(25% 0%,75% 0%,100% 50%,0% 50%)'
    : 'polygon(0% 50%,100% 50%,75% 100%,25% 100%)'
  return (
    <div
      className={clsx('absolute w-64 h-32', color, position)}
      style={{ clipPath }}
    />
  )
}

// --- Vertical progress circuit ---
// FINAL FIX: Positioned to bottom-left, corrected step order, and reduced gap.
const ProgressCircuit = ({ scrollTo, currentStep, completed }) => {
  const steps = ['stories', 'setup', 'download']
  const labels = { stories: 'User Stories', setup: 'Project Setup', download: 'Download' }
  const mapTo = { stories: 'stories', setup: 'branches', download: 'results' }

  return (
    // Anchor the whole component to the bottom-left
    <div className="fixed left-8 bottom-8 hidden lg:block z-40">
      <div className="relative">
        {/* The line connects the centers of the icons */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-500/20 via-purple-500/20 to-blue-500/20" />
        <div className="relative flex flex-col gap-[48px]">
          {steps.slice().map((s) => { // .slice().reverse() to correctly order
            const active = currentStep === s
            const done = completed.includes(s)
            return (
              <div
                key={s}
                className="relative cursor-pointer"
                onClick={() => scrollTo(mapTo[s])}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                  active
                    ? 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/50'
                    : done
                    ? 'border-green-400 bg-green-400/20'
                    : 'border-gray-600 bg-gray-800'
                )}>
                  {done && <CheckCircle size={16} className="text-green-400" />}
                  {active && !done && <Zap size={16} className="text-blue-400 animate-pulse" />}
                </div>
                <div className="absolute left-12 top-1/2 -translate-y-1/2 text-sm font-medium whitespace-nowrap">
                  {labels[s]}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


// --- Navbar link ---
const NavLink = ({ to, active, scrollTo, children }) => (
  <button
    onClick={() => scrollTo(to)}
    className={clsx(
      'px-4 py-2 text-sm font-medium transition-colors',
      active ? 'text-white' : 'text-gray-400 hover:text-white'
    )}
  >
    {children}
  </button>
)

// --- Section wrapper with hexagon slots ---
const Section = React.forwardRef(
  ({ id, className, children, topHexagon, bottomHexagon }, ref) => (
    <section
      ref={ref}
      id={id}
      className={clsx(
        'relative overflow-hidden min-h-screen w-full flex flex-col items-center justify-center p-8 snap-start',
        className
      )}
    >
      {topHexagon && (
        <Hexagon
          position={topHexagon.position}
          color={topHexagon.color}
          half="bottom"
        />
      )}
      {bottomHexagon && (
        <Hexagon
          position={bottomHexagon.position}
          color={bottomHexagon.color}
          half="top"
        />
      )}
      {children}
    </section>
  )
)

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const refs = {
    home: useRef(null),
    stories: useRef(null),
    branches: useRef(null),
    results: useRef(null)
  }

  // Flow state
  const [userStories, setUserStories] = useState(
    'As a user, I want to sign up, log in, and see a dashboard.'
  )
  const [branch, setBranch] = useState(null)
  const [tech, setTech]     = useState(null)
  const [genState, setGenState] = useState('idle')
  const [project, setProject]   = useState(null)
  const [completed, setCompleted] = useState([])

  // Scroll helper
  const scrollTo = id => {
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Current step
  const currentStep = (() => {
    if (activeSection === 'stories')  return 'stories'
    if (activeSection === 'branches') return 'setup'
    if (activeSection === 'results')  return 'download'
    return null
  })()

  // Observe sections
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActiveSection(e.target.id)),
      { threshold: 0.6 }
    )
    Object.values(refs).forEach(r => r.current && obs.observe(r.current))
    return () => Object.values(refs).forEach(r => r.current && obs.unobserve(r.current))
  }, [])

  // Handlers
  const handleStoriesNext = () => {
    if (!userStories.trim()) return
    setCompleted(p => [...new Set([...p, 'stories'])])
    scrollTo('branches')
  }
  const handleBranchSelect = b => {
    setBranch(b)
    setTech(null) // Reset tech when branch changes
    setGenState('idle')
  }
  const handleTechSelect = t => {
    setTech(t)
    setGenState('idle')
  }
  const handleGenerate = () => {
    setGenState('generating')
    setTimeout(() => {
      const key = `${tech}-${branch}`
      setProject(mockProjects[key] || mockProjects['react-frontend'])
      setGenState('ready')
      setCompleted(p => [...new Set([...p, 'setup'])])
      scrollTo('results')
    }, 2000)
  }
  const handleDownload = () => {
    const name = `${tech}-${branch}-project.zip`
    const blob = new Blob(['// code'], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url)
    setCompleted(p => [...new Set([...p, 'download'])])
  }

  return (
    <div className="bg-gray-900 text-white font-sans overflow-x-hidden">
      {/* Stepper */}
      {currentStep && (
        <ProgressCircuit
          scrollTo={scrollTo}
          currentStep={currentStep}
          completed={completed}
        />
      )}

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-b border-white/10 z-50">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot size={28} className="text-red-500"/>
            <span className="text-2xl font-bold">CodeGen</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="home"    active={activeSection==='home'}    scrollTo={scrollTo}>Home</NavLink>
            <NavLink to="stories" active={activeSection==='stories'} scrollTo={scrollTo}>Create</NavLink>
            <NavLink to="results" active={activeSection==='results'} scrollTo={scrollTo}>Projects</NavLink>
          </div>
        </nav>
      </header>

      {/* Main scroll container */}
      <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {/* Home */}
        <Section
          ref={refs.home}
          id="home"
          className="bg-gray-900"
          bottomHexagon={{ position: '-bottom-16 left-1/4', color: 'bg-gray-800' }}
        >
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
              <span className="text-red-500">//</span> AI agents that
            </h1>
            <h1 className="text-6xl md:text-8xl font-extrabold text-blue-400 mb-8">
              build your code <span className="text-red-500">//</span>
            </h1>
            <p className="text-gray-400 text-xl mb-12">
              Describe your app in plain English. We'll generate production-ready code.
            </p>
            <button
              onClick={() => scrollTo('stories')}
              className="bg-red-500 py-4 px-10 rounded-lg text-xl font-bold hover:bg-red-600 transition-all"
            >
              Start Building <ArrowRight className="inline ml-2"/>
            </button>
          </div>
        </Section>

        {/* Step 1: Stories */}
        <Section
          ref={refs.stories}
          id="stories"
          className="bg-gray-800"
          topHexagon    ={{ position: '-top-16 right-1/4', color: 'bg-gray-900' }}
          bottomHexagon ={{ position: '-bottom-16 left-1/2',   color: 'bg-gray-900' }}
        >
          <div className="flex flex-col md:flex-row w-full max-w-4xl">
            <div className="md:w-1/3 pr-8 text-left">
              <h2 className="text-5xl font-bold mb-2">
                <span className="text-red-500">//</span> Step 1
              </h2>
              <p className="text-gray-300 text-xl">Your Vision</p>
            </div>
            <div className="md:w-2/3 flex flex-col">
              <textarea
                value={userStories}
                onChange={e => setUserStories(e.target.value)}
                className="w-full h-40 p-6 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleStoriesNext}
                  disabled={!userStories.trim()}
                  className="bg-blue-500 py-3 px-8 rounded-lg text-lg font-bold hover:bg-blue-600 transition-all disabled:bg-gray-600"
                >
                  Next: Project Setup <ArrowRight className="inline ml-2"/>
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Step 2: Project Setup */}
        <Section
          ref={refs.branches}
          id="branches"
          className="bg-gray-900"
          topHexagon    ={{ position: '-top-16 left-[16.666%]', color: 'bg-gray-800' }}
          bottomHexagon ={{ position: '-bottom-16 right-[25%]',   color: 'bg-gray-800' }}
        >
          <div className="flex flex-col md:flex-row w-full max-w-4xl">
            <div className="md:w-1/3 pr-8 text-left">
              <h2 className="text-5xl font-bold mb-2">
                <span className="text-red-500">//</span> Step 2
              </h2>
              <p className="text-gray-300 text-xl">Project Setup</p>
            </div>

            {/* FIX 2 & 3: Restructured this block for smooth transitions */}
            <div className="md:w-2/3 space-y-8">
              {/* Branch selection (Cards or Chips) */}
              {!branch ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['frontend','backend'].map(b => (
                    <div
                      key={b}
                      onClick={() => handleBranchSelect(b)}
                      className={clsx(
                        'group relative p-8 border-2 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105',
                        b === 'frontend'
                          ? 'border-blue-400 hover:bg-blue-400/5'
                          : 'border-green-400 hover:bg-green-400/5'
                      )}
                    >
                      <div className="flex justify-center mb-6">
                        <div className={clsx(
                          'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300',
                          b === 'frontend'
                            ? 'bg-blue-500/20 group-hover:bg-blue-500/30'
                            : 'bg-green-500/20 group-hover:bg-green-500/30'
                        )}>
                          {b === 'frontend'
                            ? <Code size={32} className="text-blue-400"/>
                            : <Server size={32} className="text-green-400"/>}
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold mb-2 capitalize text-center">{b}</h3>
                      <ArrowRight className={clsx('absolute bottom-4 right-4 transition-opacity duration-300', b === 'frontend' ? 'text-blue-400' : 'text-green-400', 'opacity-0 group-hover:opacity-100')} size={24} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {['frontend','backend'].map(b => {
                    const color = b === 'frontend' ? 'blue' : 'green'
                    return (
                      <div
                        key={b}
                        onClick={() => handleBranchSelect(b)}
                        className={clsx(
                          'px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-300 transform hover:scale-105',
                          branch === b
                            ? `border-${color}-400 bg-${color}-400/10 text-${color}-400 scale-105`
                            : 'border-white/20 text-gray-400 hover:border-white/40'
                        )}
                      >
                        {b.charAt(0).toUpperCase() + b.slice(1)}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tech selection and Generate Button - wrapped for smooth transition */}
              {branch && (
                <div className="relative min-h-[200px]">
                  {/* State 1: Show Tech Cards (fades out when a tech is selected) */}
                  <div className={clsx("transition-opacity duration-300", { "opacity-0 pointer-events-none": tech, "opacity-100": !tech })}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {techOptions[branch].map(t => (
                        <div
                          key={t.id}
                          onClick={() => handleTechSelect(t.id)}
                          className="group relative p-6 border-2 border-white/20 rounded-xl cursor-pointer transition-all duration-500 transform hover:scale-105 hover:border-purple-400 hover:bg-purple-400/5"
                        >
                          <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                              {t.icon}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-center">{t.name}</h3>
                          <ArrowRight className="absolute bottom-3 right-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={20} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* State 2: Show Tech Chips + Button (fades in when a tech is selected) */}
                  <div className={clsx("absolute top-0 left-0 w-full space-y-8 transition-opacity duration-300", { "opacity-100": tech, "opacity-0 pointer-events-none": !tech })}>
                    {/* Tech Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      {techOptions[branch].map(tOpt => (
                        <div
                          key={tOpt.id}
                          onClick={() => handleTechSelect(tOpt.id)}
                          className={clsx(
                            'px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-300 transform hover:scale-105',
                            tech === tOpt.id
                              ? 'border-purple-400 bg-purple-400/10 text-purple-400 scale-105'
                              : 'border-white/20 text-gray-400 hover:border-white/40'
                          )}
                        >
                          {tOpt.name}
                        </div>
                      ))}
                    </div>

                    {/* Generate Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleGenerate}
                        disabled={genState === 'generating'}
                        className={clsx(
                          'py-4 px-10 rounded-lg text-xl font-bold transition-all duration-300 flex items-center',
                          genState === 'generating'
                            ? 'bg-red-400 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 transform hover:scale-105'
                        )}
                      >
                        {genState === 'generating' ? (
                          <>
                            <Loader size={20} className="animate-spin mr-3"/>Generating...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="mr-3" size={20}/>Generate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Step 3: Results */}
        <Section
          ref={refs.results}
          id="results"
          className="bg-gray-800"
          topHexagon={{ position: '-top-16 left-[16.666%]', color: 'bg-gray-900' }}
        >
          <div className="flex flex-col md:flex-row w-full max-w-4xl">
            <div className="md:w-1/3 pr-8 text-left">
              <h2 className="text-5xl font-bold mb-2">
                <span className="text-red-500">//</span> Step 3
              </h2>
              <p className="text-gray-300 text-xl">Your Project</p>
            </div>
            <div className="md:w-2/3">
              {genState === 'ready' && project && (
                <div className="bg-gray-900 p-8 rounded-2xl border border-white/10">
                  <div className="flex justify-center mb-6">
                    <CheckCircle size={64} className="text-green-400"/>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 capitalize text-center">
                    {tech} {branch} Ready!
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h4 className="font-bold text-blue-400 mb-3">Files</h4>
                      <ul className="text-gray-400 space-y-1">
                        {project.files.map(f => <li key={f}>📄 {f}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-400 mb-3">Features</h4>
                      <ul className="text-gray-400 space-y-1">
                        {project.features.map(fe => <li key={fe}>✨ {fe}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="bg-green-500 py-4 px-10 rounded-lg text-xl font-bold hover:bg-green-600 transition-all transform hover:scale-105"
                    >
                      <Download className="inline mr-3"/>Download ZIP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>
    </div>
  )
}