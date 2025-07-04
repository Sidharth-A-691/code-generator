import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef
} from 'react'
import {
  ArrowRight,
  Code,
  Server,
  Bot,
  CheckCircle,
  Loader,
  Zap,
  Download,
  BrainCircuit,
  Sun,
  Moon
} from 'lucide-react'
import clsx from 'clsx'
import './index.css' // your scrollbar CSS

// --- ThemeContext & Hook ---
const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

// --- Theme definitions ---
const themes = {
  dark: {
    bgPrimary: 'bg-gray-900',
    bgSecondary: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-white/10',
    borderHover: 'hover:border-white/40',
    hexagonPrimary: 'bg-gray-800',
    hexagonSecondary: 'bg-gray-900',
    navbar: 'bg-gray-900/90',
    input: 'bg-gray-700 border-gray-600',
    circuitLine: 'from-red-500/20 via-purple-500/20 to-blue-500/20'
  },
  light: {
    bgPrimary: 'bg-gray-100',
    bgSecondary: 'bg-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    borderHover: 'hover:border-gray-400',
    hexagonPrimary: 'bg-gray-200',
    hexagonSecondary: 'bg-gray-100',
    navbar: 'bg-gray-200/90',
    input: 'bg-white border-gray-300',
    circuitLine: 'from-red-300/40 via-purple-300/40 to-blue-300/40'
  }
}

// --- Tech options ---
const techOptions = {
  frontend: [
    { id: 'react', name: 'React + Vite', icon: <Code size={20}/> },
    { id: 'vue',   name: 'Vue + Vite',   icon: <Code size={20}/> },
    { id: 'angular', name: 'Angular',     icon: <Code size={20}/> }
  ],
  backend: [
    { id: 'springboot', name: 'Java (Spring Boot)', icon: <Server size={20}/> },
    { id: 'fastapi',    name: 'Python (FastAPI)',  icon: <Server size={20}/> },
    { id: 'nodejs',     name: 'Node.js (Express)', icon: <Server size={20}/> }
  ]
}

// --- Mock projects ---
const mockProjects = {
  'react-frontend':    { files:['App.jsx','Dashboard.jsx','LoginForm.jsx','api.js'],    features:['Auth','Dashboard UI','Responsive'] },
  'vue-frontend':      { files:['App.vue','Dashboard.vue','LoginForm.vue','router.js'], features:['Vue Router','Pinia','UI Library'] },
  'springboot-backend':{ files:['App.java','UserController.java','UserService.java','SecurityConfig.java'], features:['JWT Auth','JPA','REST API'] },
  'fastapi-backend':   { files:['main.py','user.py','auth.py','db.py'],                 features:['Async','Pydantic','OAuth2'] }
}

// --- Theme Toggle ---
const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'p-2 rounded-lg transition hover:scale-110',
        isDarkMode
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
    </button>
  )
}

// --- Hexagon component ---
const Hexagon = ({ position, color, half }) => {
  const { theme } = useTheme()
  const clip = half === 'top'
    ? 'polygon(25% 0%,75% 0%,100% 50%,0% 50%)'
    : 'polygon(0% 50%,100% 50%,75% 100%,25% 100%)'
  return (
    <div
      className={clsx('absolute w-64 h-30', theme[color], position)}
      style={{ clipPath: clip }}
    />
  )
}

// --- Progress Circuit ---
const ProgressCircuit = ({ scrollTo, currentStep, completed }) => {
  const { theme } = useTheme()
  const steps = ['stories','setup','download']
  const labels = { stories:'User Stories', setup:'Project Setup', download:'Download' }
  const mapTo = { stories:'stories', setup:'branches', download:'results' }

  return (
    <div className="fixed left-8 bottom-8 hidden lg:block z-40">
      <div className="relative">
        <div
          className={clsx(
            'absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b',
            theme.circuitLine
          )}
        />
        <div className="relative flex flex-col gap-[48px]">
          {steps.map(s => {
            const active = currentStep===s
            const done   = completed.includes(s)
            return (
              <div
                key={s}
                className="relative cursor-pointer"
                onClick={()=>scrollTo(mapTo[s])}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    active
                      ? 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/50'
                      : done
                        ? 'border-green-400 bg-green-400/20'
                        : clsx(
                            'border-gray-600',
                            theme.bgPrimary==='bg-gray-900'
                              ? 'bg-gray-800'
                              : 'bg-gray-200'
                          )
                  )}
                >
                  {done   && <CheckCircle size={16} className="text-green-400"/>}
                  {active && !done && <Zap size={16} className="text-blue-400 animate-pulse"/>}
                </div>
                <div
                  className={clsx(
                    'absolute left-12 top-1/2 -translate-y-1/2 text-sm font-medium',
                    theme.text
                  )}
                >
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

// --- NavLink ---
const NavLink = ({ to, active, scrollTo, children }) => {
  const { theme } = useTheme()
  return (
    <button
      onClick={()=>scrollTo(to)}
      className={clsx(
        'px-4 py-2 text-sm font-medium transition-colors',
        active
          ? theme.text
          : clsx(theme.textSecondary, `hover:${theme.text}`)
      )}
    >
      {children}
    </button>
  )
}

// --- Section wrapper ---
const Section = forwardRef(({ id, className, children, topHexagon, bottomHexagon }, ref) => {
  const { theme } = useTheme()
  return (
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
})

// --- Main App ---
export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = useMemo(
    () => (isDarkMode ? themes.dark : themes.light),
    [isDarkMode]
  )
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    )
  }, [isDarkMode])
  const toggleTheme = () => setIsDarkMode(d=>!d)

  // Flow state
  const [activeSection, setActiveSection] = useState('home')
  const refs = {
    home:    useRef(null),
    stories: useRef(null),
    branches:useRef(null),
    results: useRef(null)
  }
  const [userStories, setUserStories] = useState(
    'As a user, I want to sign up, log in, and see a dashboard.'
  )
  const [branch, setBranch]     = useState(null)
  const [tech, setTech]         = useState(null)
  const [genState, setGenState] = useState('idle')
  const [project, setProject]   = useState(null)
  const [completed, setCompleted] = useState([])

  // Scroll helper
  const scrollTo = id =>
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth' })

  // Intersection observer
  useEffect(()=>{
    const obs = new IntersectionObserver(
      es=> es.forEach(e=> e.isIntersecting && setActiveSection(e.target.id)),
      { threshold:0.6 }
    )
    Object.values(refs).forEach(r=> r.current && obs.observe(r.current))
    return ()=> Object.values(refs).forEach(r=> r.current && obs.unobserve(r.current))
  },[])

  // Current step
  const currentStep = (
    activeSection==='stories' ? 'stories'
    : activeSection==='branches'? 'setup'
    : activeSection==='results' ? 'download'
    : null
  )

  // Handlers
  const handleStoriesNext = () => {
    if(!userStories.trim()) return
    setCompleted(p=>[...new Set([...p,'stories'])])
    scrollTo('branches')
  }
  const handleBranchSelect = b => {
    setBranch(b); setTech(null); setGenState('idle')
  }
  const handleTechSelect = t => {
    setTech(t); setGenState('idle')
  }
  const handleGenerate = () => {
    setGenState('generating')
    setTimeout(()=>{
      const key = `${tech}-${branch}`
      setProject(mockProjects[key]||mockProjects['react-frontend'])
      setGenState('ready')
      setCompleted(p=>[...new Set([...p,'setup'])])
      scrollTo('results')
    },2000)
  }
  const handleDownload = () => {
    const name = `${tech}-${branch}-project.zip`
    const blob = new Blob(['// code'], { type:'application/zip' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href=url; a.download=name; a.click()
    URL.revokeObjectURL(url)
    setCompleted(p=>[...new Set([...p,'download'])])
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      <div className={clsx(theme.bgPrimary, theme.text, 'font-sans overflow-x-hidden')}>
        {currentStep && (
          <ProgressCircuit
            scrollTo={scrollTo}
            currentStep={currentStep}
            completed={completed}
          />
        )}
        <header className={clsx(
          'fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b',
          theme.navbar,
          theme.border
        )}>
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot size={28} className="text-red-500"/>
              <span className={clsx('text-2xl font-bold', theme.text)}>CodeGen</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="home"    active={activeSection==='home'}    scrollTo={scrollTo}>Home</NavLink>
              <NavLink to="stories" active={activeSection==='stories'} scrollTo={scrollTo}>Create</NavLink>
              <NavLink to="results" active={activeSection==='results'} scrollTo={scrollTo}>Projects</NavLink>
            </div>
            <ThemeToggle />
          </nav>
        </header>
        <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
          {/* Home */}
          <Section
            ref={refs.home}
            id="home"
            className={theme.bgPrimary}
            bottomHexagon={{ position:'-bottom-16 left-1/4', color:'hexagonPrimary' }}
          >
            <div className="text-center max-w-4xl">
              <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
                <span className="text-red-500">//</span> AI agents that
              </h1>
              <h1 className="text-6xl md:text-8xl font-extrabold text-blue-400 mb-8">
                build your code <span className="text-red-500">//</span>
              </h1>
              <p className={clsx(theme.textSecondary,'text-xl mb-12')}>
                Describe your app in plain English. We'll generate production-ready code.
              </p>
              <button
                onClick={()=>scrollTo('stories')}
                className="bg-red-500 py-4 px-10 rounded-lg text-xl font-bold hover:bg-red-600 transition-all text-white"
              >
                Start Building <ArrowRight className="inline ml-2"/>
              </button>
            </div>
          </Section>
          {/* Stories */}
          <Section
            ref={refs.stories}
            id="stories"
            className={theme.bgSecondary}
            topHexagon   ={{ position:'-top-16 right-1/4', color:'hexagonSecondary' }}
            bottomHexagon={{ position:'-bottom-16 left-1/2',   color:'hexagonSecondary' }}
          >
            <div className="flex flex-col md:flex-row w-full max-w-4xl">
              <div className="md:w-1/3 pr-8 text-left">
                <h2 className="text-5xl font-bold mb-2">
                  <span className="text-red-500">//</span> Step 1
                </h2>
                <p className={clsx(theme.textTertiary,'text-xl')}>Your Vision</p>
              </div>
              <div className="md:w-2/3 flex flex-col">
                <textarea
                  value={userStories}
                  onChange={e=>setUserStories(e.target.value)}
                  className={clsx(
                    'w-full h-40 p-6 rounded-xl focus:ring-2 focus:ring-blue-500',
                    theme.input, theme.text
                  )}
                />
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleStoriesNext}
                    disabled={!userStories.trim()}
                    className="bg-blue-500 py-3 px-8 rounded-lg text-lg font-bold hover:bg-blue-600 transition-all disabled:bg-gray-600 text-white"
                  >
                    Next: Project Setup <ArrowRight className="inline ml-2"/>
                  </button>
                </div>
              </div>
            </div>
          </Section>
          {/* Branches */}
          <Section
            ref={refs.branches}
            id="branches"
            className={theme.bgPrimary}
            topHexagon   ={{ position:'-top-16 left-[16.666%]', color:'hexagonPrimary' }}
            bottomHexagon={{ position:'-bottom-16 right-[25%]',  color:'hexagonPrimary' }}
          >
            <div className="flex flex-col md:flex-row w-full max-w-4xl">
              <div className="md:w-1/3 pr-8 text-left">
                <h2 className="text-5xl font-bold mb-2">
                  <span className="text-red-500">//</span> Step 2
                </h2>
                <p className={clsx(theme.textTertiary,'text-xl')}>Project Setup</p>
              </div>
              <div className="md:w-2/3 space-y-8">
                {!branch ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['frontend','backend'].map(b=>(
                      <div
                        key={b}
                        onClick={()=>handleBranchSelect(b)}
                        className={clsx(
                          'group relative p-8 border-2 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105',
                          b==='frontend'
                            ? 'border-blue-400 hover:bg-blue-400/5'
                            : 'border-green-400 hover:bg-green-400/5'
                        )}
                      >
                        <div className="flex justify-center mb-6">
                          <div className={clsx(
                            'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300',
                            b==='frontend'
                              ? 'bg-blue-500/20 group-hover:bg-blue-500/30'
                              : 'bg-green-500/20 group-hover:bg-green-500/30'
                          )}>
                            {b==='frontend'
                              ? <Code size={32} className="text-blue-400"/>
                              : <Server size={32} className="text-green-400"/>}
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-2 capitalize text-center">
                          {b}
                        </h3>
                        <ArrowRight
                          className={clsx(
                            'absolute bottom-4 right-4 transition-opacity duration-300',
                            b==='frontend' ? 'text-blue-400':'text-green-400',
                            'opacity-0 group-hover:opacity-100'
                          )}
                          size={24}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {['frontend','backend'].map(b=>{
                      const color = b==='frontend'?'blue':'green'
                      return (
                        <div
                          key={b}
                          onClick={()=>handleBranchSelect(b)}
                          className={clsx(
                            'px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-300 transform hover:scale-105',
                            branch===b
                              ? `border-${color}-400 bg-${color}-400/10 text-${color}-400 scale-105`
                              : clsx(theme.border, theme.textSecondary, theme.borderHover)
                          )}
                        >
                          {b.charAt(0).toUpperCase()+b.slice(1)}
                        </div>
                      )
                    })}
                  </div>
                )}
                {branch && (
                  <div className="relative min-h-[200px]">
                    {/* Tech Cards */}
                    <div className={clsx('transition-opacity duration-300',{
                      'opacity-0 pointer-events-none': tech,
                      'opacity-100': !tech
                    })}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {techOptions[branch].map(t=>(
                          <div
                            key={t.id}
                            onClick={()=>handleTechSelect(t.id)}
                            className="group relative p-6 border-2 border-white/20 rounded-xl cursor-pointer transition-all duration-500 transform hover:scale-105 hover:border-purple-400 hover:bg-purple-400/5"
                          >
                            <div className="flex justify-center mb-4">
                              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                                {t.icon}
                              </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-center">
                              {t.name}
                            </h3>
                            <ArrowRight className="absolute bottom-3 right-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={20}/>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Tech Chips + Generate */}
                    <div className={clsx('absolute top-0 left-0 w-full space-y-8 transition-opacity duration-300',{
                      'opacity-100': tech,
                      'opacity-0 pointer-events-none': !tech
                    })}>
                      <div className="flex flex-wrap items-center gap-2">
                        {techOptions[branch].map(tOpt=>(
                          <div
                            key={tOpt.id}
                            onClick={()=>handleTechSelect(tOpt.id)}
                            className={clsx(
                              'px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-300 transform hover:scale-105',
                              tech===tOpt.id
                                ? 'border-purple-400 bg-purple-400/10 text-purple-400 scale-105'
                                : clsx(theme.border, theme.textSecondary, theme.borderHover)
                            )}
                          >
                            {tOpt.name}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleGenerate}
                          disabled={genState==='generating'}
                          className={clsx(
                            'py-4 px-10 rounded-lg text-xl font-bold flex items-center transition-all duration-300 text-white',
                            genState==='generating'
                              ? 'bg-red-400 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600 hover:scale-105'
                          )}
                        >
                          {genState==='generating'
                            ? <> <Loader size={20} className="animate-spin mr-3"/>Generating... </>
                            : <> <BrainCircuit size={20} className="mr-3"/>Generate </>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>
          {/* Results */}
          <Section
            ref={refs.results}
            id="results"
            className={theme.bgSecondary}
            topHexagon={{ position:'-top-16 left-[16.666%]', color:'hexagonSecondary' }}
          >
            <div className="flex flex-col md:flex-row w-full max-w-4xl">
              <div className="md:w-1/3 pr-8 text-left">
                <h2 className="text-5xl font-bold mb-2">
                  <span className="text-red-500">//</span> Step 3
                </h2>
                <p className={clsx(theme.textTertiary,'text-xl')}>Your Project</p>
              </div>
              <div className="md:w-2/3">
                {genState==='ready' && project && (
                  <div className={clsx('p-8 rounded-2xl border', theme.card, theme.border)}>
                    <div className="flex justify-center mb-6">
                      <CheckCircle size={64} className="text-green-400"/>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 capitalize text-center">
                      {tech} {branch} Ready!
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-bold text-blue-400 mb-3">Files</h4>
                        <ul className={clsx(theme.textSecondary,'space-y-1')}>
                          {project.files.map(f=> <li key={f}>📄 {f}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-400 mb-3">Features</h4>
                        <ul className={clsx(theme.textSecondary,'space-y-1')}>
                          {project.features.map(fe=> <li key={fe}>✨ {fe}</li>)}
                        </ul>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={handleDownload}
                        className="bg-green-500 py-4 px-10 rounded-lg text-xl font-bold hover:bg-green-600 transform hover:scale-105 transition-all text-white"
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
    </ThemeContext.Provider>
  )
}