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
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom'
import {
  ArrowRight,
  Code,
  Server,
  Bot,
  CheckCircle,
  Loader,
  Zap,
  BrainCircuit,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  File
} from 'lucide-react'
import clsx from 'clsx'
import MonacoEditor from '@monaco-editor/react'
import {
  generateCode,
  getFileTree,
  getFileContent,
  writeFileContent,
  downloadProject
} from './api/apiClient'
import './index.css'

// --- ThemeContext & Hook ---
const ThemeContext = createContext()
const useTheme = () => useContext(ThemeContext)

// --- AppStateContext ---
const AppStateContext = createContext()
const useAppState = () => useContext(AppStateContext)

// --- SnackbarContext ---
const SnackbarContext = createContext();

// --- Theme definitions ---
const themes = {
  dark: {
    snackbar: {
      info:   { bg: 'bg-blue-900/70',   text: 'text-blue-200' },
      success:{ bg: 'bg-green-900/70',  text: 'text-green-200' },
      error:  { bg: 'bg-red-900/70',    text: 'text-red-200' }
    },
    bgPrimary: 'bg-gray-900',
    bgSecondary: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    textTertiary: 'text-gray-300',
    border: 'border-white/10',
    borderHover: 'hover:border-white/40',
    hexagonPrimary: 'bg-gray-800',
    hexagonSecondary: 'bg-gray-900',
    navbar: 'bg-gray-900/90',
    card: 'bg-gray-900',
    input: 'bg-gray-700 border-gray-600',
    circuitLine: 'from-red-500/20 via-purple-500/20 to-blue-500/20'
  },
  light: {
    snackbar: {
      info:   { bg: 'bg-blue-100/90',   text: 'text-blue-900' },
      success:{ bg: 'bg-green-100/90',  text: 'text-green-900' },
      error:  { bg: 'bg-red-100/90',    text: 'text-red-900' }
    },
    bgPrimary: 'bg-gray-100',
    bgSecondary: 'bg-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-700',
    border: 'border-gray-200',
    borderHover: 'hover:border-gray-400',
    hexagonPrimary: 'bg-gray-200',
    hexagonSecondary: 'bg-gray-100',
    navbar: 'bg-gray-200/90',
    card: 'bg-gray-200',
    input: 'bg-white border-gray-300',
    circuitLine: 'from-red-300/40 via-purple-300/40 to-blue-300/40'
  }
}

// --- Tech options ---
const techOptions = {
  frontend: [
    { id: 'react', name: 'React + Vite', icon: <Code size={20} /> },
    { id: 'vue', name: 'Vue + Vite', icon: <Code size={20} /> },
    { id: 'angular', name: 'Angular', icon: <Code size={20} /> }
  ],
  backend: [
    { id: 'springboot', name: 'Java (Spring Boot)', icon: <Server size={20} /> },
    { id: 'fastapi', name: 'Python (FastAPI)', icon: <Server size={20} /> },
    { id: 'nodejs', name: 'Node.js (Express)', icon: <Server size={20} /> }
  ]
}

// --- ThemeToggle ---
const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'p-2 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer',
        isDarkMode
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
export const useSnackbar = () => useContext(SnackbarContext);

const SnackbarProvider = ({ children }) => {
  const { theme } = useTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // Auto-close after 3s
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(
        () => setSnackbar((s) => ({ ...s, open: false })),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const showSnackbar = (message, type = "info") => {
    setSnackbar({ open: true, message, type });
  };

  // Use theme-defined colors
  const snackbarTheme = theme.snackbar[snackbar.type];

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      {snackbar.open && (
        <div
          className={clsx(
            "fixed bottom-8 right-8 px-5 py-3 rounded-lg shadow-lg z-[9999] flex items-start min-w-[240px] max-w-[360px] transition-all duration-300",
            snackbarTheme.bg,
            snackbarTheme.text
          )}
          style={{
            textAlign: "left",
            fontSize: "1rem",
            lineHeight: "1.5",
          }}
        >
          <div className="flex-1 pr-4">{snackbar.message}</div>
          <button
            className={clsx(
              "ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
            )}
            aria-label="Close"
            onClick={() => setSnackbar((s) => ({ ...s, open: false }))}
            tabIndex={0}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              className={clsx(
                theme.bgPrimary === "bg-gray-900"
                  ? "text-gray-300"
                  : "text-gray-700"
              )}
            >
              <path
                d="M6 6l8 8M6 14L14 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
    </SnackbarContext.Provider>
  );
};
// --- Hexagon ---
const Hexagon = ({ position, color, half }) => {
  const { theme } = useTheme()
  const clipPath =
    half === 'top'
      ? 'polygon(25% 0%,75% 0%,100% 50%,0% 50%)'
      : 'polygon(0% 50%,100% 50%,75% 100%,25% 100%)'
  return (
    <div
      className={clsx('absolute w-64 h-30', theme[color], position)}
      style={{ clipPath }}
    />
  )
}

// --- ProgressCircuit ---
const ProgressCircuit = ({ currentStep, completedSteps, onStepClick }) => {
  const { theme } = useTheme();
  const steps = [
    { id: 'stories', label: 'User Stories', available: true },
    { id: 'setup', label: 'Project Setup', available: completedSteps.includes('stories') },
    { id: 'download', label: 'Generated Project', available: completedSteps.includes('setup') }
  ];

  return (
    <div className="fixed left-8 bottom-8 hidden lg:block z-40">
      <div className="relative flex flex-col items-start gap-0">
        {steps.map((step, idx) => {
          const active = currentStep === step.id;
          const completed = completedSteps.includes(step.id);
          const available = step.available;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="relative flex flex-col items-start">
              <div
                className={clsx(
                  'flex items-center',
                  available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
                onClick={() => available && onStepClick(step.id)}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    active
                      ? 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/50'
                      : completed
                        ? 'border-green-400 bg-green-400/20'
                        : available
                          ? clsx(
                              'border-gray-600',
                              theme.bgPrimary === 'bg-gray-900'
                                ? 'bg-gray-800'
                                : 'bg-gray-200'
                            )
                          : 'border-gray-700 bg-gray-800'
                  )}
                >
                  {completed && (
                    <CheckCircle size={16} className="text-green-400" />
                  )}
                  {active && !completed && (
                    <Zap size={16} className="text-blue-400 animate-pulse" />
                  )}
                </div>
                <div
                  className={clsx(
                    'ml-4 text-sm font-medium whitespace-nowrap',
                    available ? theme.text : theme.textSecondary
                  )}
                >
                  {step.label}
                </div>
              </div>
              {/* Render the line only between steps */}
              {!isLast && (
                <div
                  className={clsx(
                    'ml-4 w-0.5 h-12 bg-gradient-to-b',
                    theme.circuitLine
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
// --- NavLink ---
const NavLink = ({ active, onClick, children, disabled = false }) => {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-4 py-2 text-sm font-medium transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : active
            ? theme.text
            : clsx(theme.textSecondary, `hover:${theme.text}`)
      )}
    >
      {children}
    </button>
  )
}

// --- Navbar ---
const Navbar = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { completedSteps, hasStarted, setHasStarted, setCurrentStep } = useAppState()

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isHomePage = location.pathname === '/'

  // "Create" tab logic: always clickable, acts like Get Started if not started
  const handleCreateClick = () => {
    if (!hasStarted) {
      setHasStarted(true)
      setCurrentStep('stories')
      setTimeout(() => scrollToSection('stories'), 100)
    } else {
      scrollToSection('stories')
    }
    if (!isHomePage) navigate('/')
  }

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b',
        theme.navbar,
        theme.border
      )}
    >
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Bot size={28} className="text-red-500" />
          <span className={clsx('text-2xl font-bold', theme.text)}>
            CodeGen
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4 ">
          <NavLink
            active={isHomePage && !hasStarted}
            onClick={() => {
              if (!isHomePage) navigate('/')
              setTimeout(() => scrollToSection('home'), 100)
            }}
          >
            Home
          </NavLink>
          <NavLink
            active={isHomePage && hasStarted}
            onClick={handleCreateClick}
          >
            Create
          </NavLink>
          <NavLink
            onClick={() => navigate('/editor')}
            disabled={!completedSteps.includes('setup')}
            active={location.pathname === '/editor'}
          >
            Editor
          </NavLink>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  )
}

// --- Section ---
const Section = forwardRef(
  ({ id, className, children, topHexagon, bottomHexagon }, ref) => {
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
  }
)

// --- FileTreeNode ---
const FileTreeNode = ({
  node,
  onFileClick,
  indent = 0,
  unsaved = {},
  currentFile = null,
}) => {
  const [open, setOpen] = useState(false);
  const isDir = node.type === "directory";
  const isUnsaved = unsaved[node.path];
  const isActive = currentFile === node.path;

  return (
    <div style={{ paddingLeft: indent }}>
      <div
        className={clsx(
          "flex items-center cursor-pointer hover:bg-gray-300/20 p-1 rounded",
          isActive && "bg-blue-100/20"
        )}
        onClick={() => {
          if (isDir) setOpen((o) => !o);
          else onFileClick(node.path);
        }}
      >
        {isDir ? (
          open ? (
            <ChevronDown size={16} className="mr-1" />
          ) : (
            <ChevronRight size={16} className="mr-1" />
          )
        ) : (
          <File size={16} className="mr-1" />
        )}
        <span className="flex items-center">
          {node.name}
          {isUnsaved && (
            <span
              className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"
              title="Unsaved changes"
            />
          )}
        </span>
      </div>
      {isDir &&
        open &&
        node.children?.map((child) => (
          <FileTreeNode
            key={child.path}
            node={child}
            onFileClick={onFileClick}
            indent={indent + 16}
            unsaved={unsaved}
            currentFile={currentFile}
          />
        ))}
    </div>
  );
};

const EditorPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const { completedSteps, projectName } = useAppState();
  const [tree, setTree] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  // Minimal unsaved state
  const [unsavedContent, setUnsavedContent] = useState({});
  const unsavedFiles = Object.keys(unsavedContent);
  const unsavedCount = unsavedFiles.length;

  // Dropdown
  const [showUnsavedDropdown, setShowUnsavedDropdown] = useState(false);
  const dropdownRef = useRef();

  // Fetching deduplication
  const [fetchingFiles, setFetchingFiles] = useState(new Set());

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUnsavedDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUnsavedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUnsavedDropdown]);

  // Redirect if setup not completed
  useEffect(() => {
    if (!completedSteps.includes("setup")) {
      navigate("/");
    }
  }, [completedSteps, navigate]);

  useEffect(() => {
    if (projectName) {
      getFileTree(decodeURIComponent(projectName))
        .then((res) => setTree(res.data))
        .catch(console.error);
    }
  }, [projectName]);

  // Open file logic with unsaved and fetch deduplication
  const openFile = (relPath) => {
    const cleanPath = relPath.startsWith(projectName)
      ? relPath.substring(projectName.length + 1)
      : relPath;

    // If already fetching, do nothing
    if (fetchingFiles.has(cleanPath)) return;

    // If unsaved content exists, show that instead of fetching
    if (unsavedContent[cleanPath] !== undefined) {
      setCurrentFile(cleanPath);
      setCode(unsavedContent[cleanPath]);
      return;
    }

    setFetchingFiles((prev) => new Set(prev).add(cleanPath));
    getFileContent(decodeURIComponent(projectName), cleanPath)
      .then((res) => {
        setCurrentFile(cleanPath);
        setCode(res.data.content);
        setUnsavedContent((prev) => {
          const copy = { ...prev };
          delete copy[cleanPath];
          return copy;
        });
      })
      .catch(console.error)
      .finally(() => {
        setFetchingFiles((prev) => {
          const copy = new Set(prev);
          copy.delete(cleanPath);
          return copy;
        });
      });
  };

  // Track unsaved changes and content
  const onEditorChange = (v) => {
    setCode(v);
    if (currentFile) {
      setUnsavedContent((prev) => ({ ...prev, [currentFile]: v }));
    }
  };

  // Save file and clear unsaved state
  const saveFile = () => {
    if (!currentFile) return;
    setSaving(true);
    writeFileContent({
      project_name: decodeURIComponent(projectName),
      relative_path: currentFile,
      content: code,
    })
      .then(() => {
        showSnackbar("Saved!", "success");
        setUnsavedContent((prev) => {
          const copy = { ...prev };
          delete copy[currentFile];
          return copy;
        });
      })
      .catch((err) => showSnackbar("Save failed: " + err, "error"))
      .finally(() => setSaving(false));
  };

  const download = () => {
    downloadProject({
      project_name: decodeURIComponent(projectName),
    })
      .then((resp) => {
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName}.zip`;
        a.click();
      })
      .catch(console.error);
  };

  if (!completedSteps.includes("setup")) return null;

  return (
    <div className={clsx(theme.bgPrimary, theme.text, "h-screen pt-15")}>
      <div className="flex h-full">
        <aside
          className={clsx("w-64 border-r overflow-y-auto p-2", theme.border)}
        >
          <h3 className="font-bold p-3">Files</h3>
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              onFileClick={openFile}
              unsaved={unsavedContent}
              currentFile={currentFile}
            />
          ))}
        </aside>
        <div className="flex-1 flex flex-col">
          <div
            className={clsx(
              "flex items-center justify-between p-2 border-b",
              theme.bgSecondary,
              theme.border
            )}
          >
            <span className="font-medium">
              {currentFile || "Select a file…"}
              {currentFile && unsavedContent[currentFile] !== undefined && (
                <span
                  className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"
                  title="Unsaved changes"
                />
              )}
            </span>
            <div className="flex items-center">
              {/* Unsaved Count and Dropdown as text */}
              <div className="relative mr-4" ref={dropdownRef}>
                <span
                  className={clsx(
                    "font-semibold text-sm flex items-center cursor-pointer select-none",
                    unsavedCount > 0
                      ? "text-red-500"
                      : "text-gray-400"
                  )}
                  style={{ minWidth: 80 }}
                  onClick={() => unsavedCount > 0 && setShowUnsavedDropdown((v) => !v)}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="listbox"
                  aria-expanded={showUnsavedDropdown}
                >
                  Unsaved
                  <span className="ml-1 font-bold">
                    ({unsavedCount})
                  </span>
                  <ChevronDown size={16} className="ml-1" />
                </span>
                {showUnsavedDropdown && unsavedCount > 0 && (
                  <div
                    className={clsx(
                      "absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50"
                    )}
                  >
                    <ul className="max-h-60 overflow-auto py-2">
                      {unsavedFiles.map((file) => (
                        <li
                          key={file}
                          className="px-4 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            setShowUnsavedDropdown(false);
                            openFile(file);
                          }}
                        >
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={saveFile}
                disabled={saving || !currentFile || unsavedContent[currentFile] === undefined}
                className="mr-2 px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 h-[40px] cursor-pointer"
                style={{ minHeight: 40 }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={download}
                className="px-3 py-1 bg-green-500 text-white rounded h-[40px] cursor-pointer"
                style={{ minHeight: 40 }}
              >
                Download Project
              </button>
            </div>
          </div>
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language={currentFile?.split(".").pop() || "javascript"}
              theme={theme.bgPrimary === "bg-gray-900" ? "vs-dark" : "vs-light"}
              value={code}
              onChange={onEditorChange}
              options={{ automaticLayout: true }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
const HomePage = () => {
  const { theme } = useTheme();
  const {
    hasStarted,
    setHasStarted,
    userStories,
    setUserStories,
    branch,
    setBranch,
    tech,
    setTech,
    genState,
    setGenState,
    completedSteps,
    setCompletedSteps,
    currentStep,
    setCurrentStep,
    design,
    setDesign,
    setProjectName,
    projectName,
  } = useAppState();

  const showSnackbar = useSnackbar();
  const navigate = useNavigate();
  const storyRef = useRef(null);
  const setupRef = useRef(null);
  const resultsRef = useRef(null);

  // --- NEW: Pending state for branch/tech ---
  const [pendingBranch, setPendingBranch] = useState(null);
  const [pendingTech, setPendingTech] = useState(null);

  // Sync pending state with main state on mount or when branch/tech changes (for hydration)
  useEffect(() => {
    setPendingBranch(branch);
    setPendingTech(tech);
  }, [branch, tech]);

  const handleGetStarted = () => {
    setHasStarted(true);
    setCurrentStep('stories');
    setTimeout(() => {
      storyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
    const refs = { stories: storyRef, setup: setupRef, download: resultsRef };
    const targetRef = refs[stepId];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- CHANGED: On Next, clear all setup state and localStorage ---
  const handleStoriesNext = () => {
    if (!userStories.trim()) return;

    // Clear all setup-related state
    setBranch(null);
    setTech(null);
    setGenState('idle');
    setDesign(null);
    setProjectName('');
    setPendingBranch(null);
    setPendingTech(null);

    // Also clear from localStorage
    saveAppState({
      hasStarted,
      userStories,
      branch: null,
      tech: null,
      genState: 'idle',
      completedSteps: [...new Set([...completedSteps, 'stories'])],
      currentStep: 'setup',
      design: null,
      projectName: '',
    });

    setCompletedSteps((prev) => [...new Set([...prev, 'stories'])]);
    setCurrentStep('setup');
    setTimeout(() => {
      setupRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- CHANGED: Only update pending state on selection ---
  const handleBranchSelect = (b) => {
    setPendingBranch(b);
    setPendingTech(null);
  };

  const handleTechSelect = (t) => {
    setPendingTech(t);
  };

  // --- CHANGED: On Generate, clear design, then update branch/tech ---
  const handleGenerate = () => {
    setGenState('generating');
    setDesign(null); // Clear design in state

    // Clear design in localStorage, and update branch/tech/projectName
    const newBranch = pendingBranch;
    const newTech = pendingTech;
    const newProjectName = newBranch === 'backend' ? 'backend' : 'frontend';

    saveAppState({
      hasStarted,
      userStories,
      branch: newBranch,
      tech: newTech,
      genState: 'generating',
      completedSteps,
      currentStep,
      design: null,
      projectName: newProjectName,
    });

    setBranch(newBranch);
    setTech(newTech);
    setProjectName(newProjectName);

    generateCode({
      user_stories: userStories,
      project_type: newBranch,
      language: newTech,
      project_name: newProjectName,
    })
      .then((res) => {
        setDesign(res.data);
        setCompletedSteps((prev) => {
          const newSteps = [...new Set([...prev, 'setup'])];
          saveAppState({
            hasStarted: true,
            userStories,
            branch: newBranch,
            tech: newTech,
            genState: 'ready',
            completedSteps: newSteps,
            currentStep: 'download',
            design: res.data,
            projectName: newProjectName,
          });
          return newSteps;
        });
        setGenState('ready');
        setCurrentStep('download');
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      })
      .catch((err) => {
        console.error(err);
        showSnackbar('Generation failed', 'error');
        setGenState('idle');
      });
  };

  const goToEditor = () => {
    navigate('/editor');
  };

  // Only show stepper if not on home section and hasStarted
  const showStepper =
    hasStarted &&
    currentStep !== 'home' &&
    ['stories', 'setup', 'download'].includes(currentStep);

  // --- UI: Use pendingBranch/pendingTech for selection, but keep UI unchanged ---
  return (
    <div className={clsx(theme.bgPrimary, 'min-h-screen')}>
      {showStepper && (
        <ProgressCircuit
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      )}
      <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {/* Home Section */}
        <Section
          id="home"
          className={theme.bgPrimary}
          bottomHexagon={{ position: '-bottom-16 left-1/4', color: 'hexagonPrimary' }}
        >
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
              <span className="text-red-500">//</span> AI agents that
            </h1>
            <h1 className="text-6xl md:text-8xl font-extrabold text-blue-400 mb-8">
              build your code <span className="text-red-500">//</span>
            </h1>
            <p className="text-xl mb-12">
              Describe your app in plain English. We'll generate production-ready code.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-red-500 py-4 px-10 rounded-lg text-xl font-bold hover:bg-red-600 transition-all h-[56px] text-white"
              style={{ minHeight: 56 }}
            >
              Get Started <ArrowRight className="inline ml-2" />
            </button>
          </div>
        </Section>

        {/* Stories Section */}
        {hasStarted && (
          <Section
            ref={storyRef}
            id="stories"
            className={theme.bgSecondary}
            topHexagon={{ position: '-top-16 right-1/4', color: 'hexagonSecondary' }}
            bottomHexagon={{ position: '-bottom-16 left-1/2', color: 'hexagonSecondary' }}
          >
            <div className="flex flex-col md:flex-row w-full max-w-4xl h-full">
              <div className="md:w-1/3 flex flex-col justify-center items-center md:items-start">
                <div className="w-full flex flex-col items-center md:items-start">
                  <h2 className="text-5xl font-bold mb-2 text-left">
                    <span className="text-red-500">//</span> Step 1
                  </h2>
                  <p className={clsx(theme.textTertiary, 'text-xl text-left')}>Your Vision</p>
                </div>
              </div>
              <div className="md:w-2/3 flex flex-col">
                <textarea
                  value={userStories}
                  onChange={(e) => setUserStories(e.target.value)}
                  placeholder="Describe your application in plain English..."
                  className={clsx(
                    'w-full h-40 p-6 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none',
                    theme.input,
                    theme.text
                  )}
                />
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleStoriesNext}
                    disabled={!userStories.trim()}
                    className="bg-blue-500 py-3 px-8 rounded-lg text-lg font-bold hover:bg-blue-600 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed h-[56px] text-white"
                    style={{ minHeight: 56 }}
                  >
                    Next: Project Setup <ArrowRight className="inline ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Setup Section */}
        {completedSteps.includes('stories') && (
          <Section
            ref={setupRef}
            id="setup"
            className={theme.bgPrimary}
            topHexagon={{ position: '-top-16 left-[16.666%]', color: 'hexagonPrimary' }}
            bottomHexagon={{ position: '-bottom-16 right-[25%]', color: 'hexagonPrimary' }}
          >
            <div className="flex flex-col md:flex-row w-full max-w-4xl h-full">
              <div className="md:w-1/3 flex flex-col justify-center items-center md:items-start">
                <div className="w-full flex flex-col items-center md:items-start">
                  <h2 className="text-5xl font-bold mb-2 text-left">
                    <span className="text-red-500">//</span> Step 2
                  </h2>
                  <p className={clsx(theme.textTertiary, 'text-xl text-left')}>Project Setup</p>
                </div>
              </div>
              <div className="md:w-2/3 space-y-8">
                {!pendingBranch ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['frontend', 'backend'].map((b) => (
                      <div
                        key={b}
                        onClick={() => handleBranchSelect(b)}
                        className={clsx(
                          'group relative p-8 border-2 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105',
                          b === 'frontend'
                            ? 'border-blue-400 hover:bg-blue-400/5'
                            : 'border-green-400 hover:bg-green-400/5'
                        )}
                        style={{ minHeight: 56 }}
                      >
                        <div className="flex justify-center mb-6">
                          <div
                            className={clsx(
                              'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300',
                              b === 'frontend'
                                ? 'bg-blue-500/20 group-hover:bg-blue-500/30'
                                : 'bg-green-500/20 group-hover:bg-green-500/30'
                            )}
                          >
                            {b === 'frontend' ? (
                              <Code size={32} className="text-blue-400" />
                            ) : (
                              <Server size={32} className="text-green-400" />
                            )}
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-2 capitalize text-center">
                          {b}
                        </h3>
                        <ArrowRight
                          className={clsx(
                            'absolute bottom-4 right-4 transition-opacity duration-300',
                            b === 'frontend' ? 'text-blue-400' : 'text-green-400',
                            'opacity-0 group-hover:opacity-100'
                          )}
                          size={24}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {['frontend', 'backend'].map((b) => {
                        const color = b === 'frontend' ? 'blue' : 'green';
                        return (
                          <div
                            key={b}
                            onClick={() => handleBranchSelect(b)}
                            className={clsx(
                              'px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-300 transform hover:scale-105',
                              pendingBranch === b
                                ? `border-${color}-400 bg-${color}-400/10 text-${color}-400 scale-105`
                                : clsx(theme.border, theme.textSecondary, theme.borderHover)
                            )}
                          >
                            {b.charAt(0).toUpperCase() + b.slice(1)}
                          </div>
                        );
                      })}
                    </div>

                    {pendingBranch && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {techOptions[pendingBranch].map((t) => (
                            <div
                              key={t.id}
                              onClick={() => handleTechSelect(t.id)}
                              className={clsx(
                                'group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-500 transform hover:scale-105',
                                pendingTech === t.id
                                  ? 'border-purple-400 bg-purple-400/10 scale-105'
                                  : 'border-white/20 hover:border-purple-400 hover:bg-purple-400/5'
                              )}
                              style={{ minHeight: 56 }}
                            >
                              <div className="flex justify-center mb-4">
                                <div
                                  className={clsx(
                                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300',
                                    pendingTech === t.id
                                      ? 'bg-purple-500/30'
                                      : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                                  )}
                                >
                                  {t.icon}
                                </div>
                              </div>
                              <h3 className="text-xl font-bold mb-2 text-center">{t.name}</h3>
                              <ArrowRight
                                className={clsx(
                                  'absolute bottom-3 right-3 text-purple-400 transition-opacity duration-300',
                                  pendingTech === t.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                )}
                                size={20}
                              />
                            </div>
                          ))}
                        </div>

                        {pendingTech && (
                          <div className="flex justify-end">
                            <button
                              onClick={handleGenerate}
                              disabled={genState === 'generating'}
                              className={clsx(
                                'py-4 px-10 rounded-lg text-xl font-bold flex items-center transition-all duration-300 text-white',
                                genState === 'generating'
                                  ? 'bg-red-400 cursor-not-allowed'
                                  : 'bg-red-500 hover:bg-red-600 hover:scale-105'
                              )}
                              style={{ minHeight: 56 }}
                            >
                              {genState === 'generating' ? (
                                <>
                                  <Loader size={20} className="animate-spin mr-3" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <BrainCircuit size={20} className="mr-3" />
                                  Generate
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Results Section */}
        {completedSteps.includes('setup') && (
          <Section
            ref={resultsRef}
            id="results"
            className={theme.bgSecondary}
            topHexagon={{ position: '-top-16 left-[16.666%]', color: 'hexagonSecondary' }}
          >
            <div className="flex flex-col md:flex-row w-full max-w-4xl h-full">
              <div className="md:w-1/3 flex flex-col justify-center items-center md:items-start">
                <div className="w-full flex flex-col items-center md:items-start">
                  <h2 className="text-5xl font-bold mb-2 text-left">
                    <span className="text-red-500">//</span> Step 3
                  </h2>
                  <p className={clsx(theme.textTertiary, 'text-xl text-left')}>Design Plan</p>
                </div>
              </div>
              <div className="md:w-2/3">
                {design && (
                  <>
                    <div className={clsx('p-6 rounded-2xl border max-h-[70vh] overflow-auto', theme.card, theme.border)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">High-level Design</h4>
                          <p className="text-sm">{design.high_level_design}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Low-level Design</h4>
                          <p className="text-sm">{design.low_level_design}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={goToEditor}
                        className="bg-blue-500 py-3 px-8 rounded-lg text-lg font-bold hover:bg-blue-600 transition-all h-[56px] text-white"
                        style={{ minHeight: 56 }}
                      >
                        Go to Editor
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Section>
        )}
      </main>
    </div>
  );
};


// --- Local Storage helpers ---
const APP_STATE_KEY = 'codegen_app_state'
const THEME_KEY = 'codegen_theme'

function loadAppState() {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}
function saveAppState(state) {
  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state))
  } catch { }
}
function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch { }
}

// --- App ---
export default function App() {
  // Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = loadTheme()
    return stored ? stored === 'dark' : true
  })
  const theme = useMemo(() => (isDarkMode ? themes.dark : themes.light), [isDarkMode])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    saveTheme(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])
  const toggleTheme = () => setIsDarkMode((d) => !d)

  // App State
  const [hasStarted, setHasStarted] = useState(false)
  const [userStories, setUserStories] = useState('')
  const [branch, setBranch] = useState(null)
  const [tech, setTech] = useState(null)
  const [genState, setGenState] = useState('idle')
  const [completedSteps, setCompletedSteps] = useState([])
  const [currentStep, setCurrentStep] = useState('stories')
  const [design, setDesign] = useState(null)
  const [projectName, setProjectName] = useState('')

  // Hydration flag
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadAppState()
    if (loaded) {
      setHasStarted(loaded.hasStarted)
      setUserStories(loaded.userStories)
      setBranch(loaded.branch)
      setTech(loaded.tech)
      setGenState(loaded.genState)
      setCompletedSteps(loaded.completedSteps)
      setCurrentStep(loaded.currentStep)
      setDesign(loaded.design)
      setProjectName(loaded.projectName)
    }
    setHydrated(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (!hydrated) return // Don't save until hydrated
    saveAppState({
      hasStarted,
      userStories,
      branch,
      tech,
      genState,
      completedSteps,
      currentStep,
      design,
      projectName
    })
  }, [
    hydrated,
    hasStarted,
    userStories,
    branch,
    tech,
    genState,
    completedSteps,
    currentStep,
    design,
    projectName
  ])

  const appState = {
    hasStarted,
    setHasStarted,
    userStories,
    setUserStories,
    branch,
    setBranch,
    tech,
    setTech,
    genState,
    setGenState,
    completedSteps,
    setCompletedSteps,
    currentStep,
    setCurrentStep,
    design,
    setDesign,
    projectName,
    setProjectName
  }

  // Only render app after hydration
  if (!hydrated) return null // or a spinner

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      <AppStateContext.Provider value={appState}>
        <SnackbarProvider>
          <Router>
            <div className={clsx(theme.bgPrimary, theme.text, 'font-sans min-h-screen')}>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </AppStateContext.Provider>
    </ThemeContext.Provider>
  )
}