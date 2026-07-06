/**
 * CyberFusion AI — Main React Application
 * SOC Threat Intelligence & Incident Response Platform
 * 
 * Step 8 Polish: Enhanced animations, toast notifications, loading screens,
 * page transitions, hover effects, success screens, empty states,
 * responsive design, accessibility, performance, and code quality.
 */

const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

// ═══════════════════════════════════════════
// CONSTANTS & THEME
// ═══════════════════════════════════════════

const COLORS = {
  bg: '#0b0e14',
  panel: '#181c25',
  panelLight: '#1f2430',
  border: '#2a3245',
  primary: '#05c280',
  primaryHover: '#04a36b',
  textMuted: '#7c8ba1',
};

const INVESTIGATION_TYPES = [
  { id: 'website', title: 'Website Analysis', icon: 'globe', desc: 'Scan URL for SSL configuration, security headers, & tech details.', placeholder: 'e.g., https://google-gruyere.appspot.com' },
  { id: 'logs', title: 'Security Logs', icon: 'terminal', desc: 'Audit server access, auth logs, or firewall rules for threats.', placeholder: 'Paste security logs here...' },
  { id: 'threat', title: 'Threat Intelligence', icon: 'shield', desc: 'Investigate target IPs, domains, or malware MD5 hashes (IoCs).', placeholder: 'e.g., 185.190.140.9, APT29, malicious_file_hash' },
  { id: 'question', title: 'Ask a Question', icon: 'helpCircle', desc: 'Ask compliance (NIST, SOC 2, HIPAA) or cybersecurity advice.', placeholder: 'e.g., What are typical mitigation steps for Log4j (CVE-2021-44228)?' }
];

const SOC_AGENTS = [
  { id: 'coord', name: 'Coordinator Agent', avatar: 'settings', role: 'Pipeline Manager', task: 'Deconstruct input parameters and initialize CrewAI team.', tool: 'None', tokens: 'Prompt: 850, Comp: 120', desc: 'Orchestrates the Crew, parses raw objectives, assigns specific sub-tasks, and reviews outputs.', backstory: 'A veteran digital commander trained to manage complexity and route Intel dynamically under fire.' },
  { id: 'recon', name: 'Recon Agent', avatar: 'search', role: 'Information Reconnaissance', task: 'Parse text patterns to identify IP addresses, domain names, and file hashes.', tool: 'regex_extractor', tokens: 'Prompt: 1.1k, Comp: 150', desc: 'Extracts critical indicators (IPs, emails, usernames, file hashes, timestamps) from raw unstructured fields.', backstory: 'A detail-oriented regex master who sifts through chaos to capture targets.' },
  { id: 'threat', name: 'Threat Agent', avatar: 'shield', role: 'Vector Classification', task: 'Query security index datasets and threat intelligence databases.', tool: 'virustotal_lookup', tokens: 'Prompt: 1.4k, Comp: 320', desc: 'Cross-references variables with MITRE ATT&CK guidelines and classifies active attack frameworks.', backstory: 'A deep-web analyst containing global databases of advanced persistent threat (APT) actor profiles.' },
  { id: 'log', name: 'Log Agent', avatar: 'terminal', role: 'Security Auditor', task: 'Review web server syslogs, anomalies, and active port configurations.', tool: 'web_scraper', tokens: 'Prompt: 2.1k, Comp: 450', desc: 'Performs vulnerability scanning and parses structured log streams, performing port lookups and security header checks.', backstory: 'An fastidious auditor who loves parsing access logs and diagnosing SSL mismatches.' },
  { id: 'risk', name: 'Risk Agent', avatar: 'activity', role: 'Impact Scorer', task: 'Calculate CVSS score metrics and draft business impact summaries.', tool: 'cvss_calculator', tokens: 'Prompt: 1.8k, Comp: 280', desc: 'Scores severity indexes (1-100), reviews financial/data impact vectors, and synthesizes mitigation items.', backstory: 'A calculated analyst assessing corporate risk exposure and detailing business continuity impacts.' },
  { id: 'compliance', name: 'Compliance Agent', avatar: 'fileText', role: 'Control Mapping', task: 'Audit findings against regulatory frameworks (SOC 2, ISO 27001, GDPR).', tool: 'compliance_mapper', tokens: 'Prompt: 1.6k, Comp: 390', desc: 'Maps detected vulnerabilities to SOC 2 Type II, HIPAA, PCI-DSS, GDPR, and NIST Cyber Security Framework.', backstory: 'A regulatory specialist who bridges the gap between raw shell code and audit frameworks.' },
  { id: 'report', name: 'Report Agent', avatar: 'code', role: 'Executive Reporter', task: 'Compile notes from all specialist nodes into executive Markdown format.', tool: 'markdown_compiler', tokens: 'Prompt: 3.2k, Comp: 850', desc: 'Compiles technical variables and agent notes into a beautifully organized Markdown investigation report.', backstory: 'A technical writer dedicated to translating complex SOC logs into board-ready executive summaries.' },
  { id: 'memory', name: 'Memory Agent', avatar: 'database', role: 'Context & Memory Agent', task: 'Query historical SQLite database for recurring indicators.', tool: 'history_lookup', tokens: 'Prompt: 1.1k, Comp: 180', desc: 'Queries SQLite investigation indexes to identify repeating threat actors or matching historical attacks.', backstory: 'An archivist who links new alerts with past cases to uncover persistent campaigns.' }
];

const AGENT_LOG_SCRIPTS = [
  [
    "[Coordinator Agent] Parsing security target inputs...",
    "[Coordinator Agent] Initializing CrewAI multi-agent environment.",
    "[Coordinator Agent] Splitting core task: mapping recon, audit, and compliance pipelines.",
    "[Coordinator Agent] Dispatching subtask 1/7 to Security Data Extractor."
  ],
  [
    "[Recon Agent] Loading regex indicator filters.",
    "[Recon Agent] Extracted IP: 192.168.1.150",
    "[Recon Agent] Scanning targets for malicious domains and hashes.",
    "[Recon Agent] Extracted IoC hash: 44d88612fea8a8f36de82e1278abb02f",
    "[Recon Agent] Saved indicator metadata context."
  ],
  [
    "[Threat Agent] Launching threat group classification algorithms.",
    "[Threat Agent] Cross-referencing signatures with MITRE ATT&CK patterns.",
    "[Threat Agent] Identified matches with active APT campaigns.",
    "[Threat Agent] Querying intelligence feed databases."
  ],
  [
    "[Log Agent] Accessing logs and checking SSL configuration parameters.",
    "[Log Agent] Querying open ports: found 22/tcp, 443/tcp, 445/tcp active.",
    "[Log Agent] Running security header analysis: Missing X-Frame-Options.",
    "[Log Agent] Audit complete. Structuring server variables..."
  ],
  [
    "[Risk Agent] Scoring CVSS threat matrices.",
    "[Risk Agent] Calculated base CVSS index: 7.8 (High).",
    "[Risk Agent] Outlining business continuity and data exposure impacts.",
    "[Risk Agent] Compiling immediate host mitigation tasks."
  ],
  [
    "[Compliance Agent] Reviewing findings against international standards.",
    "[Compliance Agent] Mapped gap 1: SOC 2 CC6.1 (Logical Access controls).",
    "[Compliance Agent] Mapped gap 2: HIPAA 164.312 (Transmission security constraints).",
    "[Compliance Agent] Drafting compliance audit logs."
  ],
  [
    "[Report Agent] Fetching notes from all specialist nodes.",
    "[Report Agent] Formatting executive report structure.",
    "[Report Agent] Compiling markdown tables and mitigation summaries.",
    "[Report Agent] Finalizing executive summary."
  ],
  [
    "[Memory Agent] Querying SQLite registry index lists.",
    "[Memory Agent] Checking historical logs for matching target indicators.",
    "[Memory Agent] Database matched: 2 repeat attacks verified.",
    "[Memory Agent] Saved report data to persistent local storage."
  ]
];


// ═══════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════

const ToastContext = createContext(null);

function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => dismissToast(id), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '380px' }} aria-live="polite" role="status">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-sm border-slate-800 border  overflow-hidden ${toast.exiting ? 'animate-toast-exit' : 'animate-slide-down'} ${
              toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' :
              toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-300' :
              toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-300' :
              'bg-cyan-950/90 border-cyan-500/30 text-cyan-300'
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="flex-shrink-0 mt-0.5">
                <Icon name={
                  toast.type === 'success' ? 'check' :
                  toast.type === 'error' ? 'alertTriangle' :
                  toast.type === 'warning' ? 'alertTriangle' : 'info'
                } className="w-4 h-4" />
              </div>
              <p className="text-xs font-mono font-medium flex-1 leading-relaxed">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity text-sm font-mono leading-none"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
            {/* Progress bar */}
            <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className={`h-full toast-progress ${
                toast.type === 'success' ? 'bg-emerald-500' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


// ═══════════════════════════════════════════
// ICON COMPONENT (Memoized)
// ═══════════════════════════════════════════

const Icon = React.memo(function Icon({ name, className = "w-5 h-5", ...props }) {
  const icons = {
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    terminal: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    database: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    fileText: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    alertTriangle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    helpCircle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    cpu: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
      </svg>
    ),
    server: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    copy: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    ),
    download: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    arrowRight: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    arrowLeft: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    refreshCw: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
    code: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    menu: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    checkCircle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    zap: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  };
  return icons[name] || (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
});


// ═══════════════════════════════════════════
// SHARED UI COMPONENTS (Reusable)
// ═══════════════════════════════════════════

/** Reusable spinner component */
const Spinner = React.memo(function Spinner({ size = 'md', className = '' }) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <svg className={`animate-spin ${sizeMap[size] || sizeMap.md} text-[#05c280] ${className}`} fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
});

/** Reusable severity badge */
const SeverityBadge = React.memo(function SeverityBadge({ severity }) {
  const styles = {
    Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    High: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Medium: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Low: 'bg-emerald-500/10 text-[#05c280] border-emerald-500/20',
  };
  const badgeClass = styles[severity] || 'bg-[#0b0e14] text-slate-400 border-[#30363d]';
  return (
    <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wide ${badgeClass}`}>
      {severity || "Unknown"}
    </span>
  );
});

/** Skeleton shimmer blocks for loading states */
const SkeletonBlock = React.memo(function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-shimmer ${className}`} aria-hidden="true" />;
});

/** Skeleton card for metric loading */
function SkeletonCard() {
  return (
    <div className="p-4 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d]">
      <SkeletonBlock className="h-3 w-20 mb-4" />
      <SkeletonBlock className="h-6 w-24 mb-2" />
      <SkeletonBlock className="h-2.5 w-16" />
    </div>
  );
}

/** Skeleton table rows for list loading */
function SkeletonTable({ rows = 4 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center" style={{ animationDelay: `${i * 100}ms` }}>
          <SkeletonBlock className="h-4 w-10" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-14" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for report detail loading */
function SkeletonReport() {
  return (
    <div className="space-y-4 p-4">
      <SkeletonBlock className="h-5 w-48 mb-6" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
      <SkeletonBlock className="h-3 w-4/6" />
      <SkeletonBlock className="h-16 w-full mt-4" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-3/4" />
    </div>
  );
}

/** Page transition wrapper */
function PageTransition({ children }) {
  return (
    <div className="">
      {children}
    </div>
  );
}


// ═══════════════════════════════════════════
// APP LOADER (Initial Loading Screen)
// ═══════════════════════════════════════════

function AppLoader({ onFinished }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinished, 300);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0b0e14] flex flex-col items-center justify-center gap-6" style={{ opacity: progress >= 100 ? 0 : 1, transition: 'opacity 0.3s ease' }}>
      {/* Glowing shield */}
      <div className="animate-glow p-4 rounded-sm border-slate-800 border border-emerald-500/20 bg-emerald-950/10">
        <Icon name="shield" className="w-12 h-12 text-[#05c280]" />
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-xl font-bold font-mono text-white tracking-wider">
          CYBERFUSION<span className="text-[#05c280]">AI</span>
        </h1>
        <p className="text-[10px] font-mono text-slate-500 mt-1 tracking-widest uppercase">
          Initializing SOC Systems...
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-[#0d1117] rounded-sm overflow-hidden border border-[#30363d]">
        <div
          className="h-full bg-[#05c280] rounded-sm transition-all duration-200 animate-progress-stripe"
          style={{ width: `${Math.min(progress, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(Math.min(progress, 100))}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      <p className="text-[9px] font-mono text-slate-600">{Math.round(Math.min(progress, 100))}% — Loading modules</p>
    </div>
  );
}


// ═══════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════

/** Auto-scrolling agent console logs */
const AgentConsoleLogs = React.memo(function AgentConsoleLogs({ logs }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef}
      className="p-3 bg-[#080b0f] border border-[#30363d]/50 rounded-sm border-slate-800 font-mono text-[9px] text-[#05c280] max-h-32 overflow-y-auto custom-scrollbar flex flex-col gap-1 shadow-inner relative mt-3"
      role="log"
      aria-label="Agent console output"
    >
      <div className="absolute top-2 right-2 text-[7px] uppercase tracking-wider text-slate-500 bg-[#080b0f] px-1.5 py-0.5 border border-slate-800 rounded pointer-events-none select-none">
        Console Logs
      </div>
      {logs.map((log, lIdx) => (
        <div key={lIdx} className="leading-relaxed flex items-start gap-1 font-mono">
          <span className="text-slate-600 flex-shrink-0">&gt;</span>
          <span className="break-all">{log}</span>
        </div>
      ))}
    </div>
  );
});

/** Sanitized markdown renderer */
const MarkdownRenderer = React.memo(function MarkdownRenderer({ content }) {
  if (!content) return null;
  const htmlContent = DOMPurify.sanitize(marked.parse(content));
  return (
    <div 
      className="prose prose-invert max-w-none 
                 prose-pre:bg-[#0d1117]/60 prose-pre:border prose-pre:border-slate-800/80 prose-pre:rounded-sm border-slate-800 prose-pre:p-4
                 prose-code:text-[#05c280] prose-code:font-mono prose-code:bg-[#0d1117]/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                 prose-a:text-[#05c280] hover:prose-a:text-emerald-400 prose-headings:text-slate-100 hover:prose-headings:text-white"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
});


// ═══════════════════════════════════════════
// REPORT VIEWER
// ═══════════════════════════════════════════

function ReportViewer({ initialReport, invId, activeType = "technical" }) {
  const [reportType, setReportType] = useState(activeType);
  const [content, setContent] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({ technical: initialReport });

  useEffect(() => {
    setContent(initialReport);
    setCache({ technical: initialReport });
    setReportType(activeType);
  }, [initialReport, invId]);

  useEffect(() => {
    if (cache[reportType]) {
      setContent(cache[reportType]);
      return;
    }
    
    if (invId) {
      setLoading(true);
      fetch(`/api/reports/transform/${invId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: reportType })
      })
      .then(r => r.json())
      .then(data => {
        setCache(prev => ({...prev, [reportType]: data.report}));
        setContent(data.report);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [reportType, invId]);

  const addToast = useToast();

  const handleDownloadPdf = useCallback(() => {
    if (!invId) {
      addToast("Cannot download PDF without a saved investigation ID.", "error");
      return;
    }
    window.open(`/api/reports/${invId}/pdf?type=${reportType}`, '_blank');
    addToast("PDF download started", "success");
  }, [invId, reportType, addToast]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#30363d] pb-3 overflow-x-auto" role="tablist" aria-label="Report type tabs">
        {["technical", "executive", "compliance", "risk"].map(type => (
          <button 
            key={type}
            onClick={() => setReportType(type)}
            role="tab"
            aria-selected={reportType === type}
            aria-controls={`report-panel-${type}`}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold font-mono rounded transition-all btn-press whitespace-nowrap ${reportType === type ? 'bg-[#05c280] text-[#0b0e14]  shadow-emerald-500/10' : 'bg-[#0b0e14] border border-[#30363d] text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
          >
            {type}
          </button>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500 uppercase font-bold tracking-wider">Report Format: {reportType}</span>
        <button 
          onClick={handleDownloadPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b0e14] hover:bg-[#05c280] hover:text-[#0b0e14] hover:border-[#05c280] border border-[#30363d] text-slate-300 rounded text-[10px] font-mono font-bold transition-all btn-press"
          aria-label={`Download ${reportType} report as PDF`}
        >
          <Icon name="download" className="w-3.5 h-3.5" /> Download PDF
        </button>
      </div>

      <div className="bg-[#0b0e14]/30 rounded-sm border-slate-800 text-xs font-mono leading-relaxed font-sans overflow-hidden p-4 min-h-[300px]" role="tabpanel" id={`report-panel-${reportType}`}>
        {loading ? (
          <SkeletonReport />
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
// SUCCESS SCREEN (Post-Investigation)
// ═══════════════════════════════════════════

function InvestigationSuccess({ elapsedTime, investigationId }) {
  return (
    <div className=" p-6 rounded-sm border-slate-800 bg-gradient-to-br from-emerald-950/20 to-[#181c25] border border-emerald-500/20 text-center space-y-4">
      {/* Animated Checkmark */}
      <div className="flex justify-center">
        <div className="p-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 animate-glow">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#05c280]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" strokeDasharray="24" className="animate-check-draw" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-lg font-bold font-mono text-emerald-500">Investigation Complete</h3>
        <p className="text-[11px] text-slate-400 mt-1">All 8 specialist agents have finished processing.</p>
      </div>

      {/* Summary Stats */}
      <div className="flex justify-center gap-6 text-[10px] font-mono">
        <div className="text-center">
          <span className="text-slate-500 block uppercase tracking-wider">Total Time</span>
          <span className="text-white font-bold text-sm font-mono">{elapsedTime}s</span>
        </div>
        <div className="text-center">
          <span className="text-slate-500 block uppercase tracking-wider">Agents</span>
          <span className="text-[#05c280] font-bold text-sm font-mono">8/8</span>
        </div>
        <div className="text-center">
          <span className="text-slate-500 block uppercase tracking-wider">Case ID</span>
          <span className="text-white font-bold text-sm font-mono">#{investigationId}</span>
        </div>
      </div>

      {/* Agent flow summary */}
      <div className="flex justify-center items-center gap-1 pt-2">
        {SOC_AGENTS.map((agent, i) => (
          <React.Fragment key={agent.id}>
            <div className="w-6 h-6 rounded-sm bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center " style={{ animationDelay: `${i * 80}ms` }}>
              <Icon name="check" className="w-3 h-3 text-[#05c280]" />
            </div>
            {i < 7 && <div className="w-3 h-px bg-emerald-500/30" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
// MOBILE NAVIGATION DRAWER
// ═══════════════════════════════════════════

function MobileNavDrawer({ currentView, setCurrentView, onClose }) {
  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: 'activity' },
    { view: 'investigation', label: 'Investigate', icon: 'search' },
    { view: 'history', label: 'History', icon: 'database' },
    { view: 'agents', label: 'Agent Monitor', icon: 'cpu' },
    { view: 'architecture', label: 'Architecture', icon: 'server' },
    { view: 'docs', label: 'Documentation', icon: 'fileText' },
    { view: 'about', label: 'About', icon: 'info' },
  ];

  return (
    <>
      <div className="mobile-nav-overlay" onClick={onClose} aria-hidden="true" />
      <nav className="mobile-nav-drawer" role="navigation" aria-label="Mobile navigation">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <span className="font-bold text-white font-mono text-sm font-mono tracking-wider">
            CYBERFUSION<span className="text-[#05c280]">AI</span>
          </span>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white" aria-label="Close menu">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => { setCurrentView(item.view); onClose(); }}
              aria-current={currentView === item.view ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm border-slate-800 text-xs font-mono transition-all ${
                currentView === item.view
                  ? 'text-white bg-[#161b22] border border-[#30363d]'
                  : 'text-slate-400 hover:text-white hover:bg-[#161b22]/50'
              }`}
            >
              <Icon name={item.icon} className={`w-4 h-4 ${currentView === item.view ? 'text-[#05c280]' : 'text-slate-500'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}


// ═══════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════

function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeInvestigationType, setActiveInvestigationType] = useState('website');
  const [apiKey, setApiKey] = useState(window.localStorage.getItem('openai_api_key') || '');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    status: "online",
    security_agents: 8,
    investigations_run: 0,
    mcp_status: "Checking...",
    mcp_tools_online: [],
    detection_engine: "Operational"
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchStatus = useCallback(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setSystemMetrics(data))
      .catch(err => console.error("Error fetching status:", err));
  }, []);

  const fetchRecent = useCallback(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setRecentActivities(data.investigations || []))
      .catch(err => console.error("Error fetching history:", err));
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchRecent();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchRecent]);

  // Close mobile nav on view change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentView]);

  // Secret admin hash routing (e.g. #settings)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'settings') {
        setCurrentView('settings');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAppLoaded = useCallback(() => setAppLoaded(true), []);

  if (!appLoaded) {
    return <AppLoader onFinished={handleAppLoaded} />;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0b0e14] text-[#eceff4] font-sans flex flex-col">
        
        {/* ─── Navigation Bar ─── */}
        <header className="border-b border-[#1e2430] bg-[#0d1117] sticky top-0 z-40 px-4 md:px-8" role="banner">
          <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
            
            {/* Logo & Platform Info */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('dashboard')} role="button" tabIndex="0" aria-label="Go to Dashboard" onKeyDown={(e) => e.key === 'Enter' && setCurrentView('dashboard')}>
              <div className="p-2 rounded-sm border-slate-800 bg-[#0b0e14] border border-[#30363d] group-hover:border-emerald-500/50 group-hover: group-hover:shadow-emerald-500/5 transition-all duration-300">
                <Icon name="shield" className="w-5 h-5 text-[#05c280]" />
              </div>
              <div>
                <span className="font-bold tracking-wider text-white text-base flex items-center gap-1.5 font-mono">
                  CYBERFUSION<span className="text-[#05c280]">AI</span>
                </span>
                <span className="text-[10px] tracking-wider text-[#7c8ba1] block -mt-1 font-mono">SOC Threat Analyst</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-mono text-slate-400" role="navigation" aria-label="Main navigation">
              {[
                { view: 'dashboard', label: 'Dashboard', icon: 'activity' },
                { view: 'investigation', label: 'Investigate', icon: 'search' },
                { view: 'history', label: 'History', icon: 'database' },
                { view: 'agents', label: 'Agent Monitor', icon: 'cpu' },
                { view: 'architecture', label: 'Architecture', icon: 'server' },
                { view: 'docs', label: 'Documentation', icon: 'fileText' },
              ].map(item => (
                <button
                  key={item.view}
                  onClick={() => { setCurrentView(item.view); if (item.view === 'investigation') setActiveInvestigationType('website'); }}
                  aria-current={currentView === item.view ? 'page' : undefined}
                  className={`px-4 py-2 rounded-sm border-slate-800 transition-all hover:text-white flex items-center gap-2 btn-press ${
                    currentView === item.view 
                      ? 'text-white bg-[#161b22] border border-[#30363d] ' 
                      : 'hover:bg-[#161b22]/30'
                  }`}
                >
                  <Icon name={item.icon} className={`w-4 h-4 ${currentView === item.view ? 'text-[#05c280]' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Quick Config & Mobile Menu */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentView('about')}
                className="p-2 rounded-sm border-slate-800 bg-[#0b0e14] border border-[#30363d] text-slate-400 hover:text-white hover:border-slate-600 transition-all btn-press flex items-center gap-1.5"
                aria-label="About CyberFusion AI"
              >
                <Icon name="info" className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline text-xs font-mono">about</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 border border-[#30363d] bg-[#0b0e14] px-3 py-1.5 rounded-sm border-slate-800 text-[10px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500 animate-pulse" aria-hidden="true" />
                SOC OPERATIONAL
              </div>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-sm border-slate-800 bg-[#0b0e14] border border-[#30363d] text-slate-400 hover:text-white transition-colors"
                aria-label="Open navigation menu"
              >
                <Icon name="menu" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <MobileNavDrawer
            currentView={currentView}
            setCurrentView={setCurrentView}
            onClose={() => setMobileNavOpen(false)}
          />
        )}

        {/* ─── Main Container ─── */}
        <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 z-10" role="main">
          
          <PageTransition key={currentView}>
            {currentView === 'dashboard' && (
              <DashboardView
                systemMetrics={systemMetrics}
                recentActivities={recentActivities}
                fetchStatus={fetchStatus}
                fetchRecent={fetchRecent}
                setCurrentView={setCurrentView}
                apiKey={apiKey}
              />
            )}
            {currentView === 'investigation' && (
              <InvestigationView 
                investigationTypes={INVESTIGATION_TYPES} 
                activeType={activeInvestigationType}
                setActiveType={setActiveInvestigationType}
                apiKey={apiKey}
              />
            )}
            {currentView === 'history' && (
              <HistoryView investigationTypes={INVESTIGATION_TYPES} />
            )}
            {currentView === 'agents' && (
              <AgentMonitorView systemMetrics={systemMetrics} />
            )}
            {currentView === 'architecture' && <ArchitectureView />}
            {currentView === 'docs' && <DocumentationView investigationTypes={INVESTIGATION_TYPES} />}
            {currentView === 'about' && <AboutView />}
            {currentView === 'settings' && (
              <SettingsView apiKey={apiKey} setApiKey={setApiKey} fetchStatus={fetchStatus} />
            )}
          </PageTransition>

        </main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-[#1e2430] bg-[#0d1117] py-6 px-4 md:px-8 mt-12 text-[#7c8ba1] text-xs font-mono" role="contentinfo">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span>🛡️ CyberFusion AI v2.0</span>
              <span className="text-slate-800">|</span>
              <span>Minimalist SOC Design Reference</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-sm bg-[#05c280]" aria-hidden="true" />
                Secure Session
              </span>
            </div>
          </div>
        </footer>

      </div>
    </ToastProvider>
  );
}


// ═══════════════════════════════════════════
// VIEW: DASHBOARD
// ═══════════════════════════════════════════

function DashboardView({ systemMetrics, recentActivities, fetchStatus, fetchRecent, setCurrentView, apiKey }) {
  return (
    <div className="space-y-8">
      
      {/* 1. Executive Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2430] pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2">
            SOC Analyst Dashboard
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">Review indicators, monitor specialist threads, and run active investigations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { fetchStatus(); fetchRecent(); }} className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] hover:border-slate-600 hover:bg-[#161b22] text-xs font-mono px-3 py-2 rounded-sm border-slate-800 transition-all text-slate-300 font-mono btn-press">
            <Icon name="refreshCw" className="w-3.5 h-3.5 text-slate-500" /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* Quick Helper Banner */}
      <div className="p-4 rounded-sm border-slate-800 border border-emerald-500/10 bg-[#0d1117] flex items-start gap-4  ">
        <div className="p-1.5 rounded-sm border-slate-800 bg-emerald-500/10 text-[#05c280]">
          <Icon name="shield" className="w-4 h-4" />
        </div>
        <div className="text-xs font-mono">
          <span className="font-bold text-slate-200 block font-mono tracking-wider text-[11px]">EXECUTIVE SUMMARY</span>
          <p className="text-slate-400 mt-1 leading-relaxed">
            System operates at optimal efficiency. 8 AI specialist nodes online. No critical external threats detected in the last 24 hours. API connectivity is stable. MCP modules are loaded and awaiting intelligence requests.
          </p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'System Health', value: 'Operational', sub: '99.9% Uptime', color: 'emerald', dot: true },
          { label: 'API Status', value: apiKey ? 'Connected' : 'Offline', sub: 'OpenAI Latency: ~120ms', color: 'emerald' },
          { label: 'History Stats', value: String(systemMetrics.investigations_run), sub: 'Total Investigations', color: 'slate' },
          { label: 'Memory Stats', value: '8,402', sub: 'SQLite Vector Records', color: 'slate' },
          { label: 'MCP Modules', value: systemMetrics.mcp_tools_online.length > 0 ? systemMetrics.mcp_tools_online.join(", ") : "Static Mode", sub: systemMetrics.mcp_status, color: 'slate', smallValue: true },
        ].map((metric, i) => (
          <div key={i} className={`p-4 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] flex flex-col justify-between card-hover  delay-${(i + 1) * 75}`} style={{ animationDelay: `${i * 75}ms` }}>
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1]">{metric.label}</span>
            <div className="mt-4">
              <h3 className={`${metric.smallValue ? 'text-sm font-mono pt-1' : 'text-lg'} font-bold text-white font-mono truncate`}>{metric.value}</h3>
              <p className={`text-[10px] font-mono mt-1 flex items-center gap-1.5 ${metric.color === 'emerald' ? 'text-[#05c280]' : 'text-slate-500'}`}>
                {metric.dot && <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500 animate-pulse" aria-hidden="true" />}
                {metric.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Intel & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Risk Gauge */}
        <div className="p-5 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] flex flex-col items-center justify-center card-hover">
          <div className="w-full flex justify-between mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1]">Risk Gauge</span>
          </div>
          <div className="relative flex justify-center items-center mt-2">
            <svg width="140" height="90" viewBox="0 0 140 90" aria-hidden="true">
              <path d="M 10,80 A 60,60 0 0,1 130,80" fill="none" stroke="#222938" strokeWidth="12" strokeLinecap="round" />
              <path d="M 10,80 A 60,60 0 0,1 55,22" fill="none" stroke="#05c280" strokeWidth="12" strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center bottom-2 bg-[#0d1117] px-2 rounded-sm">
              <span className="text-3xl font-bold text-white font-mono leading-none">24</span>
            </div>
            <span className="absolute -bottom-3 text-[9px] uppercase text-emerald-500 font-mono font-bold tracking-wider">Low Risk</span>
          </div>
        </div>

        {/* Threat Severity Chart */}
        <div className="p-5 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] card-hover">
          <div className="w-full flex justify-between mb-4">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1]">Threat Severity</span>
          </div>
          <div className="space-y-3 font-mono text-[10px]">
            {[
              { label: 'Critical', count: 2, color: 'bg-red-500', textColor: 'text-red-400', width: '10%' },
              { label: 'High', count: 8, color: 'bg-amber-500', textColor: 'text-amber-400', width: '25%' },
              { label: 'Medium', count: 14, color: 'bg-cyan-500', textColor: 'text-cyan-400', width: '45%' },
              { label: 'Low', count: 36, color: 'bg-[#05c280]', textColor: 'text-[#05c280]', width: '85%' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>{item.label}</span><span className={item.textColor}>{item.count}</span>
                </div>
                <div className="w-full bg-[#0b0e14] h-1.5 rounded overflow-hidden" role="progressbar" aria-valuenow={item.count} aria-label={`${item.label} threats: ${item.count}`}>
                  <div className={`${item.color} h-1.5 rounded transition-all duration-1000`} style={{width: item.width}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MITRE ATT&CK Mapping */}
        <div className="p-5 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] lg:col-span-2 relative overflow-hidden card-hover">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#0b0e14]/50 to-transparent pointer-events-none" />
          <div className="w-full flex justify-between mb-4">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1]">MITRE ATT&CK Mapping</span>
          </div>
          <div className="flex gap-2 text-[10px] font-mono flex-wrap">
            {[
              {t: 'Initial Access', c: 'bg-red-500/10 text-red-400 border-red-500/30'},
              {t: 'Execution', c: 'bg-[#0b0e14] text-slate-500 border-[#30363d]'},
              {t: 'Persistence', c: 'bg-amber-500/10 text-amber-400 border-amber-500/30'},
              {t: 'Privilege Escalation', c: 'bg-[#0b0e14] text-slate-500 border-[#30363d]'},
              {t: 'Defense Evasion', c: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'},
              {t: 'Credential Access', c: 'bg-[#0b0e14] text-slate-500 border-[#30363d]'},
              {t: 'Discovery', c: 'bg-[#05c280]/10 text-[#05c280] border-[#05c280]/30'},
              {t: 'Lateral Movement', c: 'bg-[#0b0e14] text-slate-500 border-[#30363d]'},
              {t: 'Collection', c: 'bg-[#0b0e14] text-slate-500 border-[#30363d]'},
              {t: 'Command and Control', c: 'bg-amber-500/10 text-amber-400 border-amber-500/30'},
              {t: 'Exfiltration', c: 'bg-[#0b0e14] text-slate-500 border-[#30363d]'},
              {t: 'Impact', c: 'bg-[#0b0e14] text-slate-500 border-[#30363d]'},
            ].map((t, i) => (
              <div key={i} className={`border rounded px-2.5 py-1.5 transition-all hover:scale-105 cursor-default ${t.c}`}>
                {t.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline & Threat Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Investigation Timeline */}
        <div className="lg:col-span-2 p-6 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] card-hover">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1]">Investigation Timeline</h4>
              <p className="text-[10px] text-slate-500 mt-1">Threat scans executed per day.</p>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">7 DAYS</span>
          </div>
          
          <div className="h-56 flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#05c280" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#05c280" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#222938" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#222938" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#222938" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#222938" strokeWidth="1" />
              <path d="M 0,180 C 80,160 160,200 240,110 C 320,130 400,70 480,90 C 560,160 640,30 720,120 L 720,224 L 0,224 Z" fill="url(#chart-grad)" />
              <path d="M 0,180 C 80,160 160,200 240,110 C 320,130 400,70 480,90 C 560,160 640,30 720,120" fill="none" stroke="#05c280" strokeWidth="2" strokeLinecap="round" />
              <circle cx="240" cy="110" r="3" fill="#05c280" /><circle cx="480" cy="90" r="3" fill="#05c280" /><circle cx="640" cy="30" r="3" fill="#05c280" />
            </svg>
          </div>
          
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-3 px-1">
            <span>JUNE 26</span><span>JUNE 27</span><span>JUNE 28</span><span>JUNE 29</span><span>JUNE 30</span><span>JULY 01 (TODAY)</span>
          </div>
        </div>

        {/* Latest Threat Feed */}
        <div className="p-6 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] flex flex-col max-h-[340px] card-hover">
          <h4 className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1] mb-5 flex items-center justify-between">
            Latest Threat Feed <span className="w-1.5 h-1.5 rounded-sm bg-red-500 animate-pulse" aria-hidden="true" />
          </h4>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {[
              {time: '10m ago', t: 'APT29 Activity detected in EU endpoints', lvl: 'High'},
              {time: '1h ago', t: 'New Log4j variant exploiting header bypass', lvl: 'Critical'},
              {time: '3h ago', t: 'Suspicious outbound traffic on port 4444', lvl: 'Medium'},
              {time: '5h ago', t: 'Failed SSH brute force from 185.190.x.x', lvl: 'Low'},
              {time: '12h ago', t: 'AWS IAM privilege escalation attempt', lvl: 'High'},
            ].map((f, i) => (
              <div key={i} className="flex gap-3 items-start border-l-2 border-[#30363d] pl-3 py-1 hover:border-l-[#05c280] transition-colors cursor-default">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${f.lvl === 'Critical' ? 'text-red-400' : f.lvl === 'High' ? 'text-amber-400' : f.lvl === 'Medium' ? 'text-cyan-400' : 'text-[#05c280]'}`}>{f.lvl}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{f.time}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 font-sans leading-relaxed">{f.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Investigations, Agent Status, Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Reports / Active Investigations */}
        <div className="lg:col-span-2 p-6 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] flex flex-col justify-between card-hover">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1]">Active & Recent Reports</h4>
                <p className="text-[10px] text-slate-500 mt-1">Past incident reports logged in local cache.</p>
              </div>
              <button onClick={() => setCurrentView('history')} className="text-xs font-mono font-bold text-[#05c280] hover:underline flex items-center gap-1 btn-press">
                Full History &rarr;
              </button>
            </div>

            {recentActivities.length === 0 ? (
              /* Enhanced Empty State */
              <div className="text-center py-12 bg-[#0b0e14]/50 border border-dashed border-[#30363d] rounded-sm border-slate-800 flex flex-col items-center ">
                <div className="p-3 rounded-sm bg-[#0d1117] border border-[#30363d] mb-4">
                  <Icon name="search" className="w-8 h-8 text-slate-600" />
                </div>
                <h4 className="text-sm font-mono font-bold text-slate-300 font-mono">No Investigations Yet</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] leading-relaxed">
                  Launch your first threat analysis to begin building investigation records.
                </p>
                <button 
                  onClick={() => setCurrentView('investigation')}
                  className="mt-4 px-4 py-2 bg-[#05c280] text-[#0b0e14] rounded-sm border-slate-800 text-xs font-mono font-bold font-mono hover:bg-[#04a36b] transition-colors btn-press flex items-center gap-1.5"
                >
                  <Icon name="zap" className="w-3.5 h-3.5" /> Start Investigating
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#30363d] text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">ID</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold hidden sm:table-cell">Summary</th>
                      <th className="pb-3 font-semibold">Severity</th>
                      <th className="pb-3 text-right font-semibold hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a3245]/30 text-slate-300">
                    {recentActivities.slice(0, 5).map(act => {
                      const config = INVESTIGATION_TYPES.find(t => t.id === act.type) || INVESTIGATION_TYPES[3];
                      return (
                        <tr key={act.id} className="hover:bg-[#161b22]/30 cursor-pointer transition-colors group" onClick={() => setCurrentView('history')}>
                          <td className="py-3 text-slate-400 font-bold">#{act.id}</td>
                          <td className="py-3">{config.title.split(" ")[0]}</td>
                          <td className="py-3 max-w-[200px] truncate text-slate-400 hidden sm:table-cell" title={act.input_summary}>
                            {act.input_summary}
                          </td>
                          <td className="py-3"><SeverityBadge severity={act.severity} /></td>
                          <td className="py-3 text-right text-slate-500 text-[10px] whitespace-nowrap hidden sm:table-cell">
                            {new Date(act.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Agent Status */}
        <div className="p-6 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] flex flex-col justify-between card-hover">
          <div>
            <h4 className="text-[10px] font-mono tracking-wider uppercase text-[#7c8ba1]">Agent Status</h4>
            <p className="text-[10px] text-slate-500 mt-1">CPU workload levels per crew process.</p>
          </div>

          <div className="space-y-4 my-6 font-mono text-[10px] text-slate-400">
            {[
              {name: 'Coordinator Core', load: 12, c: 'bg-[#05c280]'},
              {name: 'Recon & Threat', load: 82, c: 'bg-amber-400'},
              {name: 'Log Auditor', load: 45, c: 'bg-cyan-400'},
              {name: 'Compliance', load: 3, c: 'bg-slate-500'}
            ].map((a, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span>{a.name}</span>
                  <span className="text-slate-200">{a.load}%</span>
                </div>
                <div className="w-full bg-[#0b0e14] h-1.5 rounded overflow-hidden border border-[#30363d]/50" role="progressbar" aria-valuenow={a.load} aria-label={`${a.name}: ${a.load}%`}>
                  <div className={`h-full ${a.c} transition-all duration-1000`} style={{ width: `${a.load}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0b0e14] rounded-sm border-slate-800 border border-[#30363d] text-[10px] text-slate-500 text-center font-mono uppercase tracking-wider flex items-center justify-center gap-2">
            <Icon name="cpu" className="w-3.5 h-3.5" />
            TOTAL CPU load: 1.4 cores
          </div>
        </div>

      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
// VIEW: INVESTIGATION (LIVE AI AGENT EXPERIENCE)
// ═══════════════════════════════════════════

function TerminalLogViewer({ loading, error, investigationId }) {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    if (!loading) return;
    
    setLogs(["[SYSTEM] Connection established.", "[SYSTEM] Initializing triage..."]);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const agents = ["Coordinator", "Recon", "Threat", "Log", "Risk", "Compliance", "Report", "Memory"];
      const agent = agents[(step - 1) % agents.length];
      const newLog = `[${new Date().toISOString().split('T')[1].slice(0,8)}] [${agent.toUpperCase()}_AGENT] Processing threat vectors...`;
      setLogs(prev => [...prev, newLog]);
      if (step > 15) clearInterval(interval);
    }, 800);
    
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="flex flex-col flex-1 bg-[#050505] border border-[#30363d] rounded-sm overflow-hidden font-mono text-[11px] shadow-inner min-h-[300px]">
      <div className="bg-[#0d1117] border-b border-[#30363d] px-4 py-2 flex justify-between items-center text-[#8b949e]">
        <span>soc_terminal_root@cyberfusion:~$</span>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
        </div>
      </div>
      <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
        {logs.length === 0 && !loading && (
          <div className="text-slate-500 italic">Waiting for input parameters...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4 hover:bg-[#0d1117] px-1 rounded-sm">
            <span className="text-[#8b949e] select-none opacity-50">{String(i+1).padStart(3, '0')}</span>
            <span className="text-emerald-400">{log}</span>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <span className="text-[#8b949e] select-none opacity-50">...</span>
            <span className="text-[#05c280] animate-pulse">_</span>
          </div>
        )}
        {error && (
          <div className="flex gap-4">
            <span className="text-red-500 select-none opacity-50">ERR</span>
            <span className="text-red-400">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InvestigationView({ investigationTypes, activeType, setActiveType, apiKey }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [investigationId, setInvestigationId] = useState(null);
  const [error, setError] = useState(null);
  const [inputShake, setInputShake] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0.0);
  const [backendHasKey, setBackendHasKey] = useState(null);

  const timerRef = useRef(null);
  const reportRef = useRef(null);
  const addToast = useToast();

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(data => setBackendHasKey(data.has_api_key))
      .catch(() => setBackendHasKey(false));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setInputShake(true);
      setTimeout(() => setInputShake(false), 500);
      return;
    }

    const effectiveKey = apiKey || window.localStorage.getItem('openai_api_key') || '';
    if (!effectiveKey && backendHasKey === false) {
      setError('No OpenAI API key found. Please add your API key in Settings.');
      addToast('API key required. Go to Settings to configure.', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setElapsedTime(0.0);
    setInvestigationId(null);

    let elapsed = 0.0;
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      setElapsedTime(parseFloat(elapsed.toFixed(1)));
    }, 100);

    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investigation_type: activeType, user_input: input, api_key: effectiveKey })
      });

      const startData = await res.json();
      if (!res.ok) throw new Error(startData.detail || 'Investigation pipeline failed');

      const jobId = startData.job_id;

      const pollJob = async () => {
        try {
          const pollRes = await fetch(`/api/jobs/${jobId}`);
          const pollData = await pollRes.json();
          
          if (!pollRes.ok) throw new Error(pollData.detail || 'Job polling failed');
          
          if (pollData.status === 'running') {
            setTimeout(pollJob, 2000);
          } else {
            clearInterval(timerRef.current);
            setInvestigationId(pollData.id);
            setReport(pollData.report);
            setLoading(false);
            addToast('Investigation completed successfully!', 'success');
            setTimeout(() => {
              if (reportRef.current) reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
          }
        } catch (pollErr) {
          clearInterval(timerRef.current);
          setError(pollErr.message);
          setLoading(false);
          addToast(`Investigation failed: ${pollErr.message}`, 'error');
        }
      };

      setTimeout(pollJob, 2000);
    } catch (err) {
      clearInterval(timerRef.current);
      setError(err.message);
      setLoading(false);
      addToast(`Investigation failed: ${err.message}`, 'error');
    }
  }, [input, activeType, apiKey, backendHasKey, addToast]);

  const loadExample = useCallback((text) => setInput(text), []);

  useEffect(() => {
    setInput('');
    setReport(null);
    setInvestigationId(null);
    setError(null);
    setElapsedTime(0.0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeType]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const config = useMemo(() => investigationTypes.find(t => t.id === activeType) || investigationTypes[0], [activeType, investigationTypes]);
  const apiKeyMissing = backendHasKey === false && !apiKey && !window.localStorage.getItem('openai_api_key');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-mono min-h-[calc(100vh-12rem)]">
      
      {/* Left Column (Input & Channels) */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        <div className="border-b border-[#30363d] pb-4">
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            Incident Console
          </h1>
          <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-widest">Target Selection & Analysis</p>
        </div>

        <div className="space-y-2">
          {investigationTypes.map(type => {
            const isActive = type.id === activeType;
            return (
              <div
                key={type.id}
                onClick={() => { if (!loading) setActiveType(type.id); }}
                className={`p-3 rounded-sm border transition-all cursor-pointer text-left btn-press flex items-center gap-3 ${
                  isActive 
                    ? 'bg-[#0d1117] border-[#05c280] text-white' 
                    : `bg-[#0d1117]/30 border-[#30363d] text-slate-400 hover:text-slate-200 hover:border-slate-600 ${loading ? 'opacity-55 cursor-not-allowed' : ''}`
                }`}
              >
                <Icon name={type.icon} className={`w-4 h-4 ${isActive ? 'text-[#05c280]' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">{type.title}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-sm p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Target Parameters
              </label>
              {activeType === 'logs' ? (
                <textarea 
                  className={`w-full bg-[#050505] border border-[#30363d] focus:border-[#05c280] rounded-sm p-3 text-xs text-emerald-400 outline-none min-h-[140px] ${inputShake ? 'animate-shake border-red-500' : ''}`}
                  placeholder={config.placeholder} value={input} onChange={e => setInput(e.target.value)} required disabled={loading}
                />
              ) : (
                <input 
                  type="text"
                  className={`w-full bg-[#050505] border border-[#30363d] focus:border-[#05c280] rounded-sm p-3 text-xs text-emerald-400 outline-none ${inputShake ? 'animate-shake border-red-500' : ''}`}
                  placeholder={config.placeholder} value={input} onChange={e => setInput(e.target.value)} required disabled={loading}
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button 
                type="submit" disabled={loading || !input.trim() || apiKeyMissing}
                className="w-full px-4 py-2 rounded-sm border-slate-800 text-xs font-bold uppercase tracking-wider text-black bg-[#05c280] hover:bg-[#04a36b] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner size="sm" className="text-black" /> Processing...</> : <><Icon name="zap" className="w-3.5 h-3.5" /> Execute</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column (Terminal & Report) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        {!report ? (
          <TerminalLogViewer loading={loading} error={error} investigationId={investigationId} />
        ) : (
          <div ref={reportRef} className="rounded-sm bg-[#0d1117] border border-[#30363d] overflow-hidden flex-1 flex flex-col">
            <div className="px-6 py-3 border-b border-[#30363d] bg-[#161b22] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Icon name="checkCircle" className="w-4 h-4 text-[#05c280]" />
                <div>
                  <h2 className="text-xs font-bold text-white uppercase">Investigation Output</h2>
                  <p className="text-[10px] text-slate-400">Completed in {elapsedTime}s · ID: {investigationId}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard?.writeText(report)} className="px-3 py-1.5 bg-[#050505] border border-[#30363d] text-slate-300 rounded-sm text-[10px] hover:text-white">Copy</button>
                <button onClick={() => setReport(null)} className="px-3 py-1.5 bg-[#050505] border border-[#30363d] text-slate-300 rounded-sm text-[10px] hover:text-white">Reset</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <ReportViewer initialReport={report} invId={investigationId} />
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}



// ═══════════════════════════════════════════
// VIEW: HISTORY AUDIT DATABASE
// ═══════════════════════════════════════════

function HistoryView({ investigationTypes }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  const [selectedInv, setSelectedInv] = useState(null);
  const [detailedReport, setDetailedReport] = useState(null);
  const [detailedLoading, setDetailedLoading] = useState(false);

  const addToast = useToast();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadHistory = useCallback(() => {
    setLoading(true);
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data.investigations || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleRowClick = useCallback((inv) => {
    setSelectedInv(inv);
    setDetailedLoading(true);
    setDetailedReport(null);
    
    fetch(`/api/history/${inv.id}`)
      .then(res => res.json())
      .then(data => {
        setDetailedReport(data.report);
        setDetailedLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDetailedLoading(false);
      });
  }, []);

  useEffect(() => loadHistory(), [loadHistory]);

  const filteredHistory = useMemo(() => {
    return history.filter(inv => {
      const matchesSearch = inv.input_summary.toLowerCase().includes(searchDebounced.toLowerCase()) || inv.id.toLowerCase().includes(searchDebounced.toLowerCase());
      const matchesType = typeFilter === 'all' || inv.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || inv.severity.toLowerCase() === severityFilter.toLowerCase();
      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [history, searchDebounced, typeFilter, severityFilter]);

  const handleCopy = useCallback((text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      addToast("Report copied to clipboard", "success");
    }
  }, [addToast]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#1e2430] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            Incident Database Registry
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">Search, audit, and analyze reports generated across past agent sessions.</p>
        </div>
        <button onClick={loadHistory} className="bg-[#0d1117] border border-[#30363d] hover:border-slate-600 px-3 py-2 rounded-sm border-slate-800 text-xs font-mono flex items-center gap-1.5 btn-press transition-all">
          <Icon name="refreshCw" className="w-3.5 h-3.5 text-slate-500" /> Reload Registry
        </button>
      </div>

      {/* Filtering Console */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 font-mono text-xs font-mono">
        <div>
          <label htmlFor="history-search" className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase">Search Logs</label>
          <input 
            id="history-search"
            type="text"
            placeholder="Search details or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0b0e14] border border-[#30363d] hover:border-slate-600 rounded-sm border-slate-800 p-2 text-xs font-mono text-slate-200 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="history-type-filter" className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase">Pipeline Filter</label>
          <select 
            id="history-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full bg-[#0b0e14] border border-[#30363d] rounded-sm border-slate-800 p-2 text-xs font-mono text-slate-300 outline-none"
          >
            <option value="all">All Channels</option>
            {investigationTypes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase">Severity Filter</label>
          <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="Severity filter">
            {['all', 'critical', 'high', 'medium', 'low'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                role="radio"
                aria-checked={severityFilter === lvl}
                className={`px-2.5 py-1.5 rounded-sm border-slate-800 border uppercase text-[10px] font-bold transition-all btn-press ${
                  severityFilter === lvl 
                    ? 'bg-[#222938] text-white border-[#30363d]' 
                    : 'bg-[#0b0e14]/40 text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Table panel */}
        <div className={`lg:col-span-3 ${selectedInv ? 'hidden lg:block' : ''}`}>
          <div className="bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 overflow-hidden ">
            {loading ? (
              <SkeletonTable rows={5} />
            ) : filteredHistory.length === 0 ? (
              /* Enhanced empty state */
              <div className="text-center py-16 bg-[#0b0e14]/20 rounded-sm border-slate-800 m-4 border border-dashed border-[#30363d] ">
                <div className="p-3 rounded-sm bg-[#0d1117] border border-[#30363d] inline-block mb-4">
                  <Icon name="search" className="w-8 h-8 text-slate-600" />
                </div>
                <h4 className="text-sm font-mono font-bold text-slate-300 font-mono">No Results Found</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Try adjusting your search filters or run a new investigation.
                </p>
                {(search || typeFilter !== 'all' || severityFilter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setTypeFilter('all'); setSeverityFilter('all'); }}
                    className="mt-3 px-3 py-1.5 bg-[#0b0e14] border border-[#30363d] text-slate-400 rounded-sm border-slate-800 text-[10px] font-mono hover:text-white hover:border-slate-600 transition-all btn-press"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#30363d] text-slate-500 uppercase tracking-wider bg-[#0b0e14]/20">
                      <th className="p-4 font-semibold">ID</th>
                      <th className="p-4 font-semibold">Mode</th>
                      <th className="p-4 font-semibold hidden sm:table-cell">Parameters</th>
                      <th className="p-4 font-semibold">Severity</th>
                      <th className="p-4 text-right font-semibold hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a3245]/20 text-slate-300">
                    {filteredHistory.map(inv => {
                      const config = investigationTypes.find(t => t.id === inv.type) || investigationTypes[3];
                      const isSelected = selectedInv && selectedInv.id === inv.id;

                      return (
                        <tr 
                          key={inv.id} 
                          onClick={() => handleRowClick(inv)}
                          className={`hover:bg-[#161b22]/30 transition-all cursor-pointer border-l-2 ${isSelected ? 'border-l-[#05c280] bg-[#161b22]/40' : 'border-l-transparent hover:border-l-[#2a3245]'}`}
                        >
                          <td className="p-4 font-bold text-slate-400">#{inv.id}</td>
                          <td className="p-4">{config.title.split(" ")[0]}</td>
                          <td className="p-4 max-w-[140px] truncate text-slate-400 hidden sm:table-cell" title={inv.input_summary}>
                            {inv.input_summary}
                          </td>
                          <td className="p-4"><SeverityBadge severity={inv.severity} /></td>
                          <td className="p-4 text-right text-slate-500 text-[10px] whitespace-nowrap hidden sm:table-cell">
                            {new Date(inv.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detailed panel drawer */}
        <div className={`lg:col-span-2 ${!selectedInv ? 'hidden lg:block' : ''}`}>
          {selectedInv ? (
            <div className="p-5 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] space-y-4 animate-slide-in-right">
              <div className="flex justify-between items-start border-b border-[#30363d] pb-3">
                <div>
                  <h4 className="text-xs font-mono font-bold text-white font-mono">Incident Findings #{selectedInv.id}</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-mono">{new Date(selectedInv.timestamp).toLocaleString()}</p>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleCopy(detailedReport)}
                    disabled={detailedLoading || !detailedReport}
                    className="p-1.5 rounded bg-[#0b0e14] border border-[#30363d] text-slate-400 hover:text-white transition-colors btn-press disabled:opacity-50"
                    aria-label="Copy report to clipboard"
                  >
                    <Icon name="copy" className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setSelectedInv(null)} className="p-1.5 rounded text-slate-400 hover:text-white transition-colors lg:hidden btn-press" aria-label="Close detail panel">
                    <Icon name="arrowLeft" className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setSelectedInv(null)} className="hidden lg:block p-1.5 rounded text-slate-400 hover:text-white transition-colors btn-press" aria-label="Close detail panel">
                    <Icon name="x" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-2.5 bg-[#0b0e14] rounded border border-[#30363d] text-[10px] font-mono">
                  <span className="text-slate-500 block uppercase text-[8px] font-bold">Indicator target</span>
                  <span className="text-slate-200 block break-all font-bold mt-0.5">{selectedInv.input_summary}</span>
                </div>

                <div className="bg-[#0b0e14]/20 border border-[#30363d]/60 p-4 rounded-sm border-slate-800 overflow-y-auto custom-scrollbar text-xs font-mono leading-relaxed font-sans">
                  {detailedLoading ? (
                    <SkeletonReport />
                  ) : (
                    <ReportViewer initialReport={detailedReport} invId={selectedInv.id} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced empty state for no selection */
            <div className="p-6 rounded-sm border-slate-800 bg-[#0d1117]/30 border border-[#30363d] border-dashed text-center py-20 font-mono text-xs font-mono ">
              <div className="p-3 rounded-sm bg-[#0d1117] border border-[#30363d] inline-block mb-4">
                <Icon name="fileText" className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="font-bold text-slate-400 uppercase text-sm font-mono">No Report Loaded</h4>
              <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto mt-2 leading-relaxed">
                Select an investigation from the table to display detailed findings.
              </p>
              <div className="mt-4 flex justify-center">
                <Icon name="arrowLeft" className="w-4 h-4 text-slate-600 animate-pulse" />
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}


// ═══════════════════════════════════════════
// VIEW: AGENT TELEMETRY
// ═══════════════════════════════════════════

function AgentMonitorView({ systemMetrics }) {
  const [telemetry, setTelemetry] = useState(
    SOC_AGENTS.map(agent => ({
      id: agent.id,
      cpu: Math.floor(Math.random() * 10) + 5,
      mem: Math.floor(Math.random() * 20) + 120,
      status: "Idle"
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev =>
        prev.map(t => {
          const act = Math.random() > 0.8;
          const cpu = act ? Math.floor(Math.random() * 40) + 20 : Math.floor(Math.random() * 8) + 2;
          const memDelta = act ? Math.floor(Math.random() * 8) - 2 : Math.floor(Math.random() * 2) - 1;
          
          return {
            ...t,
            cpu: cpu,
            mem: Math.min(Math.max(t.mem + memDelta, 110), 300),
            status: act ? "Analyzing" : "Idle"
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#1e2430] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          Specialist Crew Pipeline Status
        </h1>
        <p className="text-slate-400 text-xs font-mono mt-1">Review active processor stats and details for the 8 SOC specialists.</p>
      </div>

      {/* MCP details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 flex items-center justify-between card-hover">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0b0e14] border border-[#30363d] rounded-sm border-slate-800 text-[#05c280]">
              <Icon name="globe" className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200 font-mono">Shodan Port Integrator</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {systemMetrics.mcp_tools_online.includes("Shodan") ? "Enabled (resolves host details & CVE links)" : "Disabled (no Shodan key provided)"}
              </p>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-sm ${systemMetrics.mcp_tools_online.includes("Shodan") ? 'bg-[#05c280]' : 'bg-slate-700'}`} aria-hidden="true" />
        </div>

        <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 flex items-center justify-between card-hover">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0b0e14] border border-[#30363d] rounded-sm border-slate-800 text-rose-500">
              <Icon name="shield" className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200 font-mono">VirusTotal reputations</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {systemMetrics.mcp_tools_online.includes("VirusTotal") ? "Enabled (queries threat indicators & malicious scores)" : "Disabled (no API key provided)"}
              </p>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-sm ${systemMetrics.mcp_tools_online.includes("VirusTotal") ? 'bg-[#05c280]' : 'bg-slate-700'}`} aria-hidden="true" />
        </div>

      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SOC_AGENTS.map((agent, i) => {
          const stats = telemetry.find(t => t.id === agent.id) || { cpu: 2, mem: 120, status: "Idle" };
          const isAct = stats.status === "Analyzing";
          
          return (
            <div 
              key={agent.id}
              className="p-4 rounded-sm border-slate-800 bg-[#0d1117] border border-[#30363d] flex flex-col justify-between card-hover "
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 font-mono leading-none">{agent.name}</h4>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 block mt-1.5">{agent.role}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-sm transition-colors ${isAct ? 'bg-[#05c280] animate-pulse' : 'bg-slate-700'}`} aria-label={isAct ? 'Active' : 'Idle'} />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed min-h-[48px] border-b border-[#30363d]/40 pb-3 font-sans">
                  {agent.desc}
                </p>
                
                <p className="text-[10px] text-slate-500 italic mt-3 leading-relaxed">
                  &ldquo;{agent.backstory}&rdquo;
                </p>
              </div>

              {/* Progress bars */}
              <div className="space-y-2 mt-4 pt-3 border-t border-[#30363d]/20 font-mono text-[9px]">
                <div>
                  <div className="flex justify-between text-slate-500 mb-0.5">
                    <span>CPU LOAD</span>
                    <span className="text-slate-300">{stats.cpu}%</span>
                  </div>
                  <div className="w-full bg-[#0b0e14] h-1 rounded overflow-hidden" role="progressbar" aria-valuenow={stats.cpu} aria-label={`${agent.name} CPU load`}>
                    <div className="h-full bg-[#05c280] transition-all duration-1000" style={{ width: `${stats.cpu}%` }} />
                  </div>
                </div>
                
                <div className="flex justify-between text-slate-500">
                  <span>MEMORY ALLOC</span>
                  <span className="text-slate-300">{stats.mem} MB</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════
// VIEW: ARCHITECTURE
// ═══════════════════════════════════════════

function ArchitectureView() {
  return (
    <div className="space-y-6 font-mono text-xs font-mono text-slate-400">
      
      {/* Header */}
      <div className="border-b border-[#1e2430] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Platform Architecture Diagram
        </h1>
        <p className="text-slate-400 text-xs font-mono mt-1">Inspect details regarding data flow routing and agent cooperations.</p>
      </div>

      {/* SVG Diagram - responsive */}
      <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 flex justify-center items-center overflow-x-auto">
        <svg viewBox="0 0 800 360" className="w-full max-w-[800px]" preserveAspectRatio="xMidYMid meet" aria-label="Architecture diagram showing data flow from React UI through FastAPI to CrewAI agents">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a3245" />
            </marker>
          </defs>

          {/* Client */}
          <g transform="translate(30, 140)">
            <rect width="110" height="60" rx="8" fill="#0b0e14" stroke="#2a3245" />
            <text x="55" y="28" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">React UI</text>
            <text x="55" y="42" fill="#5c6a80" fontSize="8" textAnchor="middle">Static CDN App</text>
          </g>

          <line x1="140" y1="170" x2="190" y2="170" stroke="#2a3245" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* FastAPI */}
          <g transform="translate(190, 125)">
            <rect width="120" height="90" rx="8" fill="#0b0e14" stroke="#2a3245" />
            <text x="60" y="28" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">FastAPI Gateway</text>
            <text x="60" y="44" fill="#5c6a80" fontSize="8" textAnchor="middle">Python Backend</text>
            <line x1="10" y1="56" x2="110" y2="56" stroke="#2a3245" strokeWidth="0.5" />
            <text x="60" y="74" fill="#05c280" fontSize="9" textAnchor="middle">/api/investigate</text>
          </g>

          <line x1="310" y1="170" x2="360" y2="170" stroke="#2a3245" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* Coordinator */}
          <g transform="translate(360, 120)">
            <rect width="130" height="100" rx="8" fill="#0b0e14" stroke="#05c280" />
            <text x="65" y="28" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">Crew Coordinator</text>
            <text x="65" y="44" fill="#5c6a80" fontSize="8" textAnchor="middle">Agent Manager</text>
            <line x1="10" y1="56" x2="120" y2="56" stroke="#2a3245" strokeWidth="0.5" />
            <text x="65" y="74" fill="#88c0d0" fontSize="9" textAnchor="middle">Delegates tasks</text>
            <text x="65" y="88" fill="#5c6a80" fontSize="8" textAnchor="middle">GPT-4o-mini</text>
          </g>

          {/* Pathways */}
          <path d="M 490 170 L 530 170 L 530 70 L 550 70" fill="none" stroke="#2a3245" strokeWidth="1.5" markerEnd="url(#arr)" />
          <path d="M 490 170 L 550 170" fill="none" stroke="#2a3245" strokeWidth="1.5" markerEnd="url(#arr)" />
          <path d="M 490 170 L 530 170 L 530 270 L 550 270" fill="none" stroke="#2a3245" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* Specialists */}
          <g transform="translate(550, 40)">
            <rect width="140" height="60" rx="6" fill="#181c25" stroke="#2a3245" />
            <text x="70" y="26" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Recon &amp; Threat Agents</text>
            <text x="70" y="42" fill="#5c6a80" fontSize="8" textAnchor="middle">Shodan &amp; VirusTotal MCPs</text>
          </g>

          <g transform="translate(550, 140)">
            <rect width="140" height="60" rx="6" fill="#181c25" stroke="#2a3245" />
            <text x="70" y="26" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Risk, Log, Compliance</text>
            <text x="70" y="42" fill="#5c6a80" fontSize="8" textAnchor="middle">CVSS &amp; Framework Mapping</text>
          </g>

          <g transform="translate(550, 240)">
            <rect width="140" height="60" rx="6" fill="#181c25" stroke="#2a3245" />
            <text x="70" y="26" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Report &amp; Memory</text>
            <text x="70" y="42" fill="#5c6a80" fontSize="8" textAnchor="middle">SQLite &amp; Markdown Gen</text>
          </g>

        </svg>
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════
// VIEW: ABOUT PROJECT
// ═══════════════════════════════════════════

function AboutView() {
  return (
    <div className="space-y-6 font-mono text-xs font-mono text-slate-400 leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-[#1e2430] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          About CyberFusion AI
        </h1>
        <p className="text-slate-400 text-xs font-mono mt-1">Core details on the CyberFusion AI Capstone Project architecture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-5 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 md:col-span-2 space-y-4 card-hover">
          <h4 className="text-sm font-mono font-bold text-white uppercase font-mono">Platform Specifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
            {[
              { label: 'Core Squad', value: 'CrewAI pipeline' },
              { label: 'API Router', value: 'FastAPI / Uvicorn' },
              { label: 'Persistence Layer', value: 'SQLite (investigations.db)' },
              { label: 'LLM engine', value: 'gpt-4o-mini' },
            ].map((spec, i) => (
              <div key={i} className="p-3 bg-[#0b0e14] rounded border border-[#30363d]">
                <span className="text-slate-500 block uppercase font-bold text-[8px]">{spec.label}</span>
                <span className="text-slate-200 mt-1 block">{spec.value}</span>
              </div>
            ))}
          </div>
          <p>
            CyberFusion AI utilizes decentralized specialists to compile executive summaries, resolve asset variables, index attack models, score risk ratings, and query past histories. Designed to deliver solutions calmly and quickly, ensuring SOC analysts stay focused on key issues.
          </p>
        </div>

        <div className="p-5 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 space-y-3 card-hover">
          <h4 className="text-sm font-mono font-bold text-white uppercase font-mono">Design Objectives</h4>
          <p>
            Inspired by platform interfaces such as TryHackMe, the design prioritizes clean cards, legible margins, signature green accents, and helpful side handbook payloads. It removes noisy flashing animations to offer a calm, solution-focused experience.
          </p>
        </div>

      </div>

    </div>
  );
}


// ═══════════════════════════════════════════
// VIEW: DOCUMENTATION HANDBOOK
// ═══════════════════════════════════════════

function DocumentationView({ investigationTypes }) {
  const addToast = useToast();

  const handleCopyText = useCallback((text) => {
    navigator.clipboard.writeText(text);
    addToast("Payload copied to clipboard", "success");
  }, [addToast]);

  return (
    <div className="space-y-6 font-mono text-xs font-mono text-slate-400 leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-[#1e2430] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          SOC Operator Handbook
        </h1>
        <p className="text-slate-400 text-xs font-mono mt-1">Read manual details, review sample log formats, and inspect test payloads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Texts */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-mono font-bold text-slate-200 font-mono uppercase">1. Squad Work Flow Details</h3>
          <p>
            The crew parses user strings sequentially. When investigations are submitted, the following agent modules activate:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
            <li><strong>Coordinator</strong>: Assesses objectives and assigns specific crew tasks.</li>
            <li><strong>Security Data Extractor</strong>: Extracts variables like IPs, MD5 hashes, ports, or CVE tags.</li>
            <li><strong>Log and Asset Auditor</strong>: Resolves HTTP headers or port connections.</li>
            <li><strong>Threat Intelligence Specialist</strong>: Classifies attack vectors using MITRE ATT&CK maps.</li>
            <li><strong>Cybersecurity Risk Assessor</strong>: Scores threat levels and recommends mitigations.</li>
            <li><strong>Compliance Auditor</strong>: Audits vulnerability tags against NIST, SOC 2, HIPAA.</li>
            <li><strong>Report Architect</strong>: Structures findings into executive Markdown summaries.</li>
            <li><strong>Historical threat Analyst</strong>: Performs memory database checks to flag repeat threats.</li>
          </ul>
        </div>

        {/* Copy payloads */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sample Test Payloads</span>
          
          {[
            { emoji: '🌐', label: 'Website Analysis Target', payload: 'https://google-gruyere.appspot.com', btnText: 'Copy URL' },
            { emoji: '📋', label: 'Syslog auth fail sample', payload: 'Jul 01 14:22:18 core-ssh sshd[2841]: Failed password for root from 203.0.113.88 port 59022', btnText: 'Copy Log' },
            { emoji: '🔍', label: 'Threat IoC file hash', payload: '44d88612fea8a8f36de82e1278abb02f', btnText: 'Copy MD5 Hash' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 space-y-2 card-hover">
              <span className="text-slate-200 font-bold block text-[10px]">{item.emoji} {item.label}</span>
              <div className="bg-[#0b0e14] p-2 rounded text-[10px] text-slate-300 truncate select-all">
                {item.payload}
              </div>
              <button onClick={() => handleCopyText(item.payload)} className="text-[#05c280] hover:underline text-[10px] btn-press">{item.btnText}</button>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}


// ═══════════════════════════════════════════
// VIEW: SETTINGS
// ═══════════════════════════════════════════

function SettingsView({ apiKey, setApiKey, fetchStatus }) {
  const [config, setConfig] = useState({ has_openai: false, has_shodan: false, has_virustotal: false });
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [shodanKey, setShodanKey] = useState(window.localStorage.getItem('shodan_key') || '');
  const [vtKey, setVtKey] = useState(window.localStorage.getItem('virustotal_key') || '');
  const addToast = useToast();

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Error loading config:", err));
  }, []);

  const handleSave = useCallback((e) => {
    e.preventDefault();
    if (!config.has_openai) {
      window.localStorage.setItem('openai_api_key', keyInput);
      setApiKey(keyInput);
    }
    if (!config.has_shodan) {
      window.localStorage.setItem('shodan_key', shodanKey);
    }
    if (!config.has_virustotal) {
      window.localStorage.setItem('virustotal_key', vtKey);
    }
    addToast("Configuration saved successfully", "success");
    fetchStatus();
  }, [keyInput, shodanKey, vtKey, setApiKey, addToast, fetchStatus, config]);

  const handleClearHistory = useCallback(() => {
    addToast("Database wipe must be run from server console", "warning");
  }, [addToast]);

  return (
    <div className="space-y-6 font-mono text-xs font-mono text-slate-400">
      
      {/* Header */}
      <div className="border-b border-[#1e2430] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          System Settings & Credentials
        </h1>
        <p className="text-slate-400 text-xs font-mono mt-1">Manage API integrations and persistence properties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="p-6 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 lg:col-span-2 space-y-4">
          <h4 className="text-sm font-mono font-bold text-white uppercase">API Credentials</h4>
          
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="openai-key" className="block text-[10px] font-bold text-slate-500 uppercase">OpenAI API Key</label>
                {config.has_openai && (
                  <span className="text-[9px] text-[#05c280] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Managed by Server</span>
                )}
              </div>
              <div className="relative">
                <input 
                  id="openai-key"
                  type={showKey ? "text" : "password"}
                  className="w-full bg-[#0b0e14]/50 border border-[#30363d] hover:border-slate-600 focus:border-[#05c280] rounded-sm border-slate-800 p-2.5 text-xs font-mono text-slate-200 outline-none transition-colors pr-12 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={config.has_openai ? "•••••••••••••••• (Server Environment Active)" : "sk-proj-..."}
                  value={config.has_openai ? "" : keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  autoComplete="off"
                  disabled={config.has_openai}
                />
                {!config.has_openai && (
                  <button 
                    type="button" 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="shodan-key" className="block text-[10px] font-bold text-slate-500 uppercase">Shodan API Key</label>
                {config.has_shodan && (
                  <span className="text-[9px] text-[#05c280] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Managed by Server</span>
                )}
              </div>
              <input 
                id="shodan-key"
                type="password"
                className="w-full bg-[#0b0e14]/50 border border-[#30363d] hover:border-slate-600 focus:border-[#05c280] rounded-sm border-slate-800 p-2.5 text-xs font-mono text-slate-200 outline-none transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={config.has_shodan ? "•••••••••••••••• (Server Environment Active)" : "Insert Shodan Key..."}
                value={config.has_shodan ? "" : shodanKey}
                onChange={e => setShodanKey(e.target.value)}
                autoComplete="off"
                disabled={config.has_shodan}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="vt-key" className="block text-[10px] font-bold text-slate-500 uppercase">VirusTotal API Key</label>
                {config.has_virustotal && (
                  <span className="text-[9px] text-[#05c280] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Managed by Server</span>
                )}
              </div>
              <input 
                id="vt-key"
                type="password"
                className="w-full bg-[#0b0e14]/50 border border-[#30363d] hover:border-slate-600 focus:border-[#05c280] rounded-sm border-slate-800 p-2.5 text-xs font-mono text-slate-200 outline-none transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={config.has_virustotal ? "•••••••••••••••• (Server Environment Active)" : "Insert VirusTotal Key..."}
                value={config.has_virustotal ? "" : vtKey}
                onChange={e => setVtKey(e.target.value)}
                autoComplete="off"
                disabled={config.has_virustotal}
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 rounded-sm border-slate-800 font-bold font-mono text-xs font-mono text-[#0b0e14] bg-[#05c280] hover:bg-[#04a36b] hover: hover:shadow-emerald-500/20 transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={config.has_openai && config.has_shodan && config.has_virustotal}
            >
              Commit Configuration
            </button>

          </form>
        </div>

        {/* Clear db */}
        <div className="p-6 bg-[#0d1117] border border-[#30363d] rounded-sm border-slate-800 space-y-3">
          <h4 className="text-sm font-mono font-bold text-white uppercase">Destruct Actions</h4>
          <p className="text-[11px] leading-relaxed">
            Wiping history logs will delete threat audit lists stored inside SQLite3.
          </p>
          <button 
            onClick={handleClearHistory}
            className="w-full py-2 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-red-400 rounded-sm border-slate-800 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 btn-press"
          >
            <Icon name="trash" className="w-3.5 h-3.5" />
            Wipe SQLite Registry
          </button>
        </div>

      </div>

    </div>
  );
}


// ═══════════════════════════════════════════
// REACT BOOTSTRAP RENDER
// ═══════════════════════════════════════════

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
