
import React from 'react';
import { motion } from 'framer-motion';

const ProblemStatement: React.FC = () => {
    return (
        <section id="problem" className="py-fluid-xl bg-[#040404] border-t border-white/5 relative overflow-hidden">
            <div className="container-fluid">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-fluid-xl items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:sticky lg:top-32"
                    >
                        <div className="inline-flex items-center gap-fluid-xs px-3 py-1 rounded border border-red-500/20 bg-red-500/5 mb-fluid-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">System Failure Detected</span>
                        </div>
                        <h2 className="text-fluid-4xl md:text-fluid-5xl lg:text-fluid-6xl font-bold mb-fluid-sm tracking-tighter leading-[0.95] text-white">
                            PnL is a <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-200">Lagging Indicator.</span>
                        </h2>
                        <div className="space-y-fluid-sm text-zinc-400 text-fluid-base leading-relaxed max-w-lg font-light">
                            <p>
                                Your bank account tells you <em>what</em> happened. It doesn't tell you <em>why</em>.
                                Legacy journals are static graveyards of data that fail to capture the most critical variable in trading: <strong className="text-white font-medium">State of Mind.</strong>
                            </p>
                            <p>
                                Profit masks incompetence. You can violate every rule in your system, get lucky, and book a win. This reinforcement loop is the silent killer of careers.
                            </p>
                            <div className="pt-fluid-md border-t border-white/5 mt-fluid-lg">
                                <p className="text-teal-500 font-bold uppercase tracking-widest text-xs mono mb-fluid-3xs">The Paradigm Shift</p>
                                <p className="text-white font-medium text-fluid-xl md:text-fluid-2xl tracking-tight">
                                    Stop auditing the money. Audit the execution.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-fluid gap-fluid-md">
                        {[
                            {
                                title: "Dopamine Addiction",
                                desc: "The market is a random reinforcement machine. It rewards bad behavior just often enough to keep you hooked. We break the neural link between 'bad trade' and 'made money'.",
                                code: "ERR_REWARD_MISMATCH"
                            },
                            {
                                title: "Tilt Cascades",
                                desc: "90% of account blowups happen in 10% of sessions. We identify the micro-fractures in your discipline—heavy breathing, revenge entries—before the dam breaks.",
                                code: "ERR_EMOTIONAL_DRIFT"
                            },
                            {
                                title: "Recency Bias",
                                desc: "You trade based on your last 3 outcomes, not your 3-year edge. We force you to zoom out via hard data constraints, effectively acting as an algorithmic risk manager.",
                                code: "ERR_SAMPLE_SIZE_LOW"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative p-[1px] rounded-xl bg-gradient-to-b from-white/10 to-transparent hover:from-teal-500/40 transition-all duration-500 touch-optimized"
                            >
                                <div className="bg-[#080808] p-fluid-md md:p-fluid-lg rounded-xl h-full border border-white/5 relative overflow-hidden group-hover:border-teal-500/20 transition-colors">
                                    <div className="absolute top-4 right-4 text-[9px] font-mono text-zinc-700 group-hover:text-red-400 transition-colors">
                                        {item.code}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start gap-fluid-sm">
                                        <div className="text-zinc-800 font-mono text-2xl font-bold group-hover:text-teal-500 transition-colors">0{i + 1}</div>
                                        <div>
                                            <h3 className="text-fluid-lg font-bold mb-fluid-3xs tracking-tight text-zinc-200 group-hover:text-white transition-colors">{item.title}</h3>
                                            <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProblemStatement;
