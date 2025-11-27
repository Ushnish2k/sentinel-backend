"use client";

import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { 
  Activity, Zap, TrendingUp, Search, Terminal, Download, Play, 
  Server, Cpu, Database, Lock, Globe, BarChart3, RefreshCw,
  Linkedin, Instagram, Mail, User, MessageSquare, Send, Github
} from "lucide-react";

// --- CONFIGURATION ---

// SET THIS TO FALSE FOR PRODUCTION
// Access env var directly. Next.js replaces this at build time.
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === 'false' ? false : true;

// REPLACE WITH YOUR RENDER BACKEND URL
// Default to localhost if env var is missing
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const COLORS = {
  POSITIVE: "#34d399", // Emerald-400
  NEGATIVE: "#f87171", // Red-400
  NEUTRAL: "#94a3b8",  // Slate-400
};

const BAR_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

// --- TYPES ---
interface SentimentLog {
  id: number;
  text: string;
  sentiment: string;
  score: number;
  source: string;
}

interface StatData {
  name: string;
  value: number;
  [key: string]: any; // Fix for Recharts type error
}

export default function SentinelEnterprise() {
  // --- STATE ---
  const [logs, setLogs] = useState<SentimentLog[]>([]);
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [latency, setLatency] = useState(42);

  // --- MOCK DATA GENERATOR (Fallback) ---
  const generateInitialData = (count: number) => {
    const sources = ["SysMon", "Analytics", "Cron", "Auth", "Gateway", "UserFeed"];
    const templates = [
      { text: "Latency spike detected in region us-east-1", type: "NEGATIVE" },
      { text: "User login successful via OAuth", type: "POSITIVE" },
      { text: "Database connection pool at 80% capacity", type: "NEUTRAL" },
      { text: "Critical security patch applied successfully", type: "POSITIVE" },
      { text: "API rate limit exceeded for IP block 192.168.x.x", type: "NEGATIVE" },
      { text: "Daily backup routine started", type: "NEUTRAL" },
      { text: "Payment gateway timeout warning", type: "NEGATIVE" },
      { text: "New user registration flow completed", type: "POSITIVE" },
      { text: "Server CPU load nominal at 15%", type: "POSITIVE" },
      { text: "Unknown request signature detected", type: "NEGATIVE" },
    ];

    return Array.from({ length: count }).map((_, i) => {
      const template = templates[Math.floor(Math.random() * templates.length)];
      return {
        id: 1000 + i,
        text: `${template.text} [Trace: ${Math.random().toString(36).substring(7)}]`,
        sentiment: template.type,
        score: 0.7 + Math.random() * 0.29,
        source: sources[Math.floor(Math.random() * sources.length)]
      };
    }).reverse();
  };

  const generateMockStats = (currentLogs: SentimentLog[]) => {
    const counts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
    currentLogs.forEach(log => {
      if (log.sentiment in counts) counts[log.sentiment as keyof typeof counts]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key as keyof typeof counts] }));
  };

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    
    if (USE_MOCK_DATA) {
        await new Promise(r => setTimeout(r, 800)); 
        if (logs.length === 0) {
            const mockLogs = generateInitialData(50);
            setLogs(mockLogs);
            setStats(generateMockStats(mockLogs));
        } else {
            setStats(generateMockStats(logs));
        }
        setLoading(false);
        return;
    }

    try {
      const [histRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/history`),
        fetch(`${API_URL}/stats`)
      ]);
      const logsData = await histRes.json();
      const statsData = await statsRes.json();
      setLogs(logsData);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error("Connection Error:", error);
      // Fallback to mock data on error so the UI doesn't break for the user
      if (logs.length === 0) {
          const mockLogs = generateInitialData(50);
          setLogs(mockLogs);
          setStats(generateMockStats(mockLogs));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
        setLatency(prev => Math.max(20, Math.min(100, prev + (Math.random() * 10 - 5))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);

    if (USE_MOCK_DATA) {
        await new Promise(r => setTimeout(r, 600));
        const lower = inputText.toLowerCase();
        let sentiment = "NEUTRAL";
        if (lower.match(/good|great|awesome|success|online/)) sentiment = "POSITIVE";
        if (lower.match(/bad|fail|error|critical|offline/)) sentiment = "NEGATIVE";
        
        const newLog: SentimentLog = {
            id: Date.now(),
            text: inputText,
            sentiment,
            score: 0.85 + Math.random() * 0.14,
            source: "Manual Console"
        };
        const newLogs = [newLog, ...logs];
        setLogs(newLogs);
        setStats(generateMockStats(newLogs));
        setInputText("");
        setIsAnalyzing(false);
        return;
    }
    
    try {
      await fetch(`${API_URL}/analyze?text=${encodeURIComponent(inputText)}`, { method: "POST" });
      setInputText("");
      fetchData();
    } catch (error) { console.error(error); } 
    finally { setIsAnalyzing(false); }
  };

  const handleSimulation = async () => {
    setIsSimulating(true);
    if (USE_MOCK_DATA) {
        await new Promise(r => setTimeout(r, 800));
        const newItems = generateInitialData(5);
        const newLogs = [...newItems, ...logs];
        setLogs(newLogs);
        setStats(generateMockStats(newLogs));
        setIsSimulating(false);
        return;
    }
    
    try {
      await fetch(`${API_URL}/generate-data?count=5`, { method: "POST" });
      fetchData();
    } catch (error) { console.error(error); }
    finally { setIsSimulating(false); }
  };

  const handleExport = () => {
    const headers = ["ID,Text,Sentiment,Source\n"];
    const csvContent = headers.concat(
      logs.map(log => `${log.id},"${log.text.replace(/"/g, '""')}",${log.sentiment},${log.source}`)
    ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sentinel_report.csv";
    link.click();
  };

  // --- METRICS ---
  const totalScans = logs.length;
  const positiveCount = stats.find(s => s.name === "POSITIVE")?.value || 0;
  const positiveRate = totalScans > 0 ? Math.round((positiveCount / totalScans) * 100) : 0;
  
  const sourceData = logs.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.source);
    if (existing) { existing.value += 1; } 
    else { acc.push({ name: curr.source, value: 1 }); }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.15]" 
            style={{ 
              backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, 
              backgroundSize: '40px 40px' 
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#00000000,#050505)]" />
          
          <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen" />
          <div className="fixed top-[40%] left-[20%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen opacity-50" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/30">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">SENTINEL <span className="text-indigo-400">v1.0.3</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
             <button 
                onClick={handleSimulation}
                disabled={isSimulating}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-xs text-slate-300 hover:text-white group"
              >
                <Play size={12} className={`text-indigo-400 group-hover:text-indigo-300 ${isSimulating ? "animate-spin" : ""}`} />
                {isSimulating ? "SIMULATING..." : "SIMULATE TRAFFIC"}
            </button>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wide">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-6 space-y-24">
        
        {/* --- SECTION 1: COMMAND CENTER --- */}
        <section className="space-y-8 animate-fade-in-up">
          <div className="border-b border-white/10 pb-8">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">Command Center</h1>
            <p className="text-slate-400 text-lg">Real-time sentiment ingestion and reputation monitoring.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
               title="Total Processed" 
               value={totalScans.toString()} 
               icon={<Search className="text-blue-200" size={24} />}
               color="blue"
            />
            <StatCard 
               title="Positive Sentiment" 
               value={`${positiveRate}%`} 
               sub="Global Average"
               icon={<TrendingUp className="text-emerald-200" size={24} />} 
               color="emerald"
            />
            <StatCard 
               title="API Latency" 
               value={`${Math.round(latency)}ms`}
               sub="Optimized"
               icon={<Zap className="text-amber-200" size={24} />} 
               color="amber"
            />
          </div>

          <div className="bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 rounded-2xl p-1 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] backdrop-blur-xl">
            <div className="bg-[#050505]/80 rounded-xl p-6 relative backdrop-blur-md">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAnalyze())}
                placeholder="> Enter raw text payload for immediate analysis..."
                className="w-full h-32 bg-transparent text-xl text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none font-mono"
              />
              <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                <div className="flex gap-4 text-xs text-slate-500 font-mono uppercase tracking-wider">
                  <span>Model: SENTINEL-V1</span>
                  <span>Mode: INFERENCE</span>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={loading || !inputText || isAnalyzing}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-400/30"
                >
                  {isAnalyzing ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  ANALYZE DATA
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: ANALYTICS ENGINE --- */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
            <h2 className="text-3xl font-bold text-white">Analytics Engine</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
               {/* Subtle gradient blob inside card */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
               
              <h3 className="text-slate-400 text-xs font-bold mb-6 uppercase tracking-widest flex items-center gap-2 relative z-10">
                <BarChart3 size={16} className="text-indigo-400"/> Sentiment Distribution
              </h3>
              <div className="h-64 w-full relative z-10">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-600 animate-pulse">Loading Visualization...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={stats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        >
                        {stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.NEUTRAL} />
                        ))}
                        <Label 
                            value={`${positiveRate}%`} 
                            position="center" 
                            className="fill-white text-3xl font-bold" 
                            dy={-5}
                        />
                        <Label 
                            value="POSITIVE" 
                            position="center" 
                            className="fill-slate-500 text-[10px] font-bold tracking-widest" 
                            dy={20}
                        />
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(10px)" }}
                            itemStyle={{ color: "#fff" }}
                        />
                        <Legend verticalAlign="bottom" iconType="circle" iconSize={8}/>
                    </PieChart>
                    </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <h3 className="text-slate-400 text-xs font-bold mb-6 uppercase tracking-widest flex items-center gap-2 relative z-10">
                <Globe size={16} className="text-emerald-400"/> Source Origin
              </h3>
              <div className="h-64 w-full relative z-10">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-600 animate-pulse">Loading Visualization...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={{ stroke: '#334155' }}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                          contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(10px)", borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                          ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: SYSTEM HEALTH --- */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <h2 className="text-3xl font-bold text-white">System Diagnostics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <TechCard icon={<Server className="w-6 h-6"/>} title="Server Status" value="ONLINE" color="emerald" />
             <TechCard icon={<Cpu className="w-6 h-6"/>} title="CPU Load" value="12% / 3.4GHz" color="indigo" />
             <TechCard icon={<Database className="w-6 h-6"/>} title="DB Connections" value="8 Active" color="amber" />
             <TechCard icon={<Lock className="w-6 h-6"/>} title="Security" value="ENCRYPTED" color="rose" />
          </div>
        </section>

        {/* --- SECTION 4: MASTER LEDGER --- */}
        <section className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-slate-500 rounded-full"></div>
              <div>
                <h2 className="text-3xl font-bold text-white">Master Ledger</h2>
                <p className="text-slate-400 text-sm mt-1">Full immutable record of all analyzed tokens.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
                <button onClick={fetchData} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2 border border-white/5 backdrop-blur-md">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button onClick={handleExport} className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm transition-colors flex items-center gap-2 backdrop-blur-md">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#050505]/90 backdrop-blur-lg z-10 shadow-sm">
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Content Payload</th>
                    <th className="px-6 py-4 font-semibold">Sentiment</th>
                    <th className="px-6 py-4 font-semibold">Confidence</th>
                    <th className="px-6 py-4 font-semibold">Origin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                  {logs.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">#{item.id}</td>
                      <td className="px-6 py-4 truncate max-w-xs text-slate-300 font-medium">{item.text}</td>
                      <td className="px-6 py-4">
                        <Badge sentiment={item.sentiment} />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div className={`h-full ${item.score > 0.8 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{width: `${item.score * 100}%`}}></div>
                            </div>
                            {(item.score * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs uppercase tracking-wider">
                        {item.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: KNOW YOUR ADMIN --- */}
        <section className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                <h2 className="text-3xl font-bold text-white">Know Your Admin</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Admin Profile Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-[50px] pointer-events-none" />
                    
                    {/* Profile Image */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                             {/* ENSURE FILE IS NAMED: admin-profile.jpg in public folder */}
                            <img 
                                src="/admin-profile.jpg" 
                                alt="Ushnish Basu Roy" 
                                className="w-full h-full rounded-full object-cover border-4 border-[#050505]"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Ushnish+Basu+Roy&background=6366f1&color=fff&size=128";
                                }}
                            />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#050505] shadow-lg" title="Online" />
                    </div>

                    {/* Info */}
                    <h3 className="text-2xl font-bold text-white mb-1">Ushnish Basu Roy</h3>
                    <p className="text-indigo-400 font-medium text-sm mb-4">Full Stack Developer | Cloud Digital Leader</p>
                    
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
                        Full-stack developer with experience in building real-time analytics dashboards, API-driven applications, and scalable backend systems. 
                        Certified Google Cloud Digital Leader & Oracle AI Associate.
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        <a href="https://github.com/Ushnish2k" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-slate-800 hover:text-white transition-all text-slate-400 group/icon">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://www.linkedin.com/in/ushnishbasuroy/" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-[#0077b5] hover:text-white transition-all text-slate-400 group/icon">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="https://www.instagram.com/__usion" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-gradient-to-br hover:from-purple-500 hover:to-orange-500 hover:text-white transition-all text-slate-400 group/icon">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="mailto:ushnishfcb@gmail.com" className="p-3 bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all text-slate-400 group/icon">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Feedback Form */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" /> Send Feedback
                    </h3>
                    
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Identity</label>
                            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg focus-within:border-indigo-500/50 transition-colors">
                                <User className="w-5 h-5 text-slate-500 ml-3" />
                                <input type="text" placeholder="Name or ID" className="bg-transparent w-full p-3 text-sm text-slate-200 focus:outline-none placeholder:text-slate-600" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Message Payload</label>
                            <textarea placeholder="Report a bug or suggest a feature..." className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none placeholder:text-slate-600" />
                        </div>

                        <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" /> Transmit Data
                        </button>
                    </form>
                </div>
            </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-[#050505] text-center relative z-10">
        <p className="text-slate-600 text-sm font-mono">
          SENTINEL ENTERPRISE &copy; 2024. SECURED BY AI.
        </p>
      </footer>
    </div>
  );
}

// --- SUB COMPONENTS (Restored Glass Styles) ---

function StatCard({ title, value, sub, icon, color }: { title: string, value: string, sub?: string, icon: any, color: string }) {
  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all shadow-xl backdrop-blur-xl">
      {/* THE BLUE SHADE FROM THE SIDES - RESTORED */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/20 rounded-full blur-[50px] -mr-16 -mt-16 transition-all group-hover:bg-${color}-500/30`} />
      <div className={`absolute bottom-0 left-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-[40px] -ml-12 -mb-12 transition-all`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 bg-gradient-to-br from-white/10 to-transparent rounded-xl text-white border border-white/10 group-hover:border-${color}-500/50 transition-colors shadow-lg backdrop-blur-md`}>
            {icon}
          </div>
        </div>
        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
        <div className="flex items-end gap-3">
          <p className="text-4xl font-bold text-white tracking-tight drop-shadow-sm">{value}</p>
          {sub && <span className="text-[10px] text-slate-400 font-mono mb-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

function TechCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
    return (
       <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/[0.06] transition-all backdrop-blur-md group hover:border-white/20 cursor-default">
          <div className={`p-3 bg-white/5 rounded-lg text-${color}-400 group-hover:text-${color}-300 group-hover:bg-${color}-500/10 transition-colors`}>
            {icon}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider group-hover:text-slate-400 transition-colors">{title}</div>
            <div className={`text-${color}-400 font-mono font-medium text-sm group-hover:text-${color}-300 drop-shadow-sm`}>{value}</div>
          </div>
       </div>
    );
}

function Badge({ sentiment }: { sentiment: string }) {
  const styles = 
    sentiment === 'POSITIVE' ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
    sentiment === 'NEGATIVE' ? 'text-rose-300 bg-rose-500/20 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
    'text-slate-300 bg-slate-500/20 border-slate-500/30';

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded border tracking-wider backdrop-blur-sm ${styles}`}>
      {sentiment}
    </span>
  );
}