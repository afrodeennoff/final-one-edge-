
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const mockData = [
    { name: 'S1', eqs: 82, discipline: 90, pnl: 400 },
    { name: 'S2', eqs: 95, discipline: 98, pnl: -210 },
    { name: 'S3', eqs: 42, discipline: 30, pnl: 1400 },
    { name: 'S4', eqs: 88, discipline: 85, pnl: -150 },
    { name: 'S5', eqs: 92, discipline: 95, pnl: 650 },
    { name: 'S6', eqs: 96, discipline: 94, pnl: 800 },
];

const logs = [
    { time: "10:42:01", level: "INFO", msg: "Initializing neural handshake with Broker API..." },
    { time: "10:42:03", level: "INFO", msg: "Parsing last 50 execution ticks..." },
    { time: "10:42:08", level: "WARN", msg: "Analysis: Entry slippage > 2.5s detected on Trade #491." },
    { time: "10:42:15", level: "CRIT", msg: "Pattern Match: 'Revenge Tilt' detected (Confidence: 94%)." },
    { time: "10:42:16", level: "WARN", msg: "Position size deviation +150% from baseline." },
    { time: "10:42:18", level: "ACTN", msg: "Intervention: Locking terminal for 15m cooling period..." },
    { time: "10:42:25", level: "SYST", msg: "Optimizing: Risk parameters adjusted for next session." }
];

const AnalysisDemo: React.FC = () => {
    const [logIndex, setLogIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLogIndex((prev) => (prev < logs.length - 1 ? prev + 1 : 0));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="performance-visualization" className="py-32 px-6 relative bg-[#050505] border-t border-white/5">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-20"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                            </span>
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-teal-500 font-mono">Live Interceptor</h2>
                        </div>
                        <h3 className="text-fluid-2xl md:text-fluid-4xl font-bold tracking-tight text-white leading-tight">
                            Predictive <span className="text-zinc-600">Intervention.</span>
                        </h3>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-zinc-500 text-sm max-w-sm leading-relaxed border-l-2 border-zinc-800 pl-6"
                    >
                        Our AI models don't just record your trades. They <strong className="text-white">predict failure points</strong> before they happen and intervene in real-time.
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="grid lg:grid-cols-3 bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 p-8 md:p-10 relative bg-gradient-to-b from-[#0a0a0a] to-[#080808]">
                        {/* Scanning Line Effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="w-[1px] h-full bg-teal-500/10 absolute top-0 left-0 animate-[scan_4s_linear_infinite] shadow-[0_0_30px_rgba(45,212,191,0.1)]"></div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 relative z-10">
                            <div className="space-y-1">
                                <h4 className="font-mono text-[10px] uppercase text-zinc-500 tracking-[0.2em]">Neural Confidence</h4>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold tracking-tighter text-white">94.2%</span>
                                    <span className="text-xs text-teal-500 font-mono bg-teal-500/10 px-2 py-0.5 rounded">HIGH_FIDELITY</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockData}>
                                    <defs>
                                        <linearGradient id="eqsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f22" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#52525b' }} />
                                    <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#52525b' }} />
                                    <Tooltip
                                        cursor={{ stroke: '#2dd4bf', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '11px', borderRadius: '6px', color: '#f4f4f5', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                    />
                                    <Area type="monotone" dataKey="eqs" stroke="#2dd4bf" strokeWidth={2} fill="url(#eqsGradient)" animationDuration={2000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Terminal Sidebar */}
                    <div className="bg-[#050505] p-0 flex flex-col border-t lg:border-t-0 lg:border-l border-white/5 font-mono text-xs relative">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]">
                            <h4 className="text-[10px] uppercase text-zinc-400 tracking-widest font-bold">Terminal Output</h4>
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-red-500/20 rounded-full border border-red-500/50"></span>
                                <span className="w-2 h-2 bg-yellow-500/20 rounded-full border border-yellow-500/50"></span>
                                <span className="w-2 h-2 bg-green-500/20 rounded-full border border-green-500/50"></span>
                            </div>
                        </div>

                        <div className="flex-grow p-6 overflow-hidden relative">
                            <div className="flex flex-col justify-end h-full gap-3">
                                <AnimatePresence mode="popLayout">
                                    {logs.slice(0, logIndex + 1).slice(-6).map((log, i) => (
                                        <motion.div
                                            key={`${logIndex}-${i}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-3 text-[10px] md:text-[11px] leading-relaxed font-mono"
                                        >
                                            <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                                            <span className={`font-bold w-8 flex-shrink-0 ${log.level === 'INFO' ? 'text-blue-400' :
                                                log.level === 'WARN' ? 'text-yellow-400' :
                                                    log.level === 'CRIT' ? 'text-red-500' :
                                                        log.level === 'ACTN' ? 'text-teal-400' :
                                                            'text-zinc-400'
                                                }`}>{log.level}</span>
                                            <span className="text-zinc-300">{log.msg}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <motion.div
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="w-2 h-4 bg-teal-500/50 mt-1"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#080808]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] uppercase text-zinc-500 tracking-widest">Anomaly Probability</span>
                                <span className="text-xs font-bold text-red-400">Critical (89%)</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '89%' }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                    className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AnalysisDemo;
