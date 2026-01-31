
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/Store';

interface LoginProps {
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'identify' | 'verify'>('identify');
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step === 'identify' && email) {
      if (!email.includes('@')) {
        setError('Invalid email format');
        return;
      }
      setStep('verify');
    } else if (step === 'verify' && password) {
      setIsSimulating(true);
      try {
        await login(email, password);
        // App.tsx effect will handle navigation on user change
      } catch (err) {
        setError('Access Denied: Invalid Credentials');
        setIsSimulating(false);
      }
    }
  };

  const handleSocialLogin = () => {
    // Mock social login
    setIsSimulating(true);
    setTimeout(() => {
      login('social@deltalytix.app', 'social');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex font-sans overflow-hidden relative selection:bg-teal-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none"></div>
      
      {/* Left Panel - Visuals */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative z-10"
      >
        <div onClick={onBack} className="cursor-pointer flex items-center gap-3 text-white/50 hover:text-white transition-colors w-fit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span className="text-xs font-bold uppercase tracking-widest">Return to Base</span>
        </div>

        <div>
          <h1 className="text-6xl font-bold tracking-tighter text-white mb-6 leading-none">
            Welcome to <br/>
            <span className="text-teal-500">Deltalytix.</span>
          </h1>
          <p className="text-zinc-500 max-w-md text-lg leading-relaxed">
            Professional trading analytics. This terminal is monitored by behavioral algorithms. 
            All execution logs are immutable.
          </p>
        </div>

        <div className="flex gap-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
             <span>System: <span className="text-teal-500/80">Online</span></span>
           </div>
           <div>Latency: <span className="text-teal-500/80">12ms</span></div>
           <div>Encryption: <span className="text-teal-500/80">AES-256</span></div>
        </div>
      </motion.div>

      {/* Right Panel - Interaction */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md bg-[#080808] border border-white/5 p-12 rounded-3xl relative shadow-2xl overflow-hidden"
         >
            {/* Top scanning line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent animate-[scan_3s_linear_infinite]"></div>

            {isSimulating ? (
              <div className="h-[420px] flex flex-col items-center justify-center text-center space-y-6">
                 <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                    <div className="absolute inset-0 border-t-4 border-teal-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-zinc-800 rounded-full"></div>
                    <div className="absolute inset-4 border-b-4 border-white rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-lg mb-1">Authenticating</h3>
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Establishing secure uplink...</p>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleNext} className="min-h-[420px] flex flex-col justify-center">
                 <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                       <svg className="text-teal-500 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                       <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Secure Access</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Identify Yourself</h2>
                    <p className="text-zinc-500 text-sm">Enter your credentials to access the ledger.</p>
                 </div>

                 <div className="space-y-6">
                    <AnimatePresence mode="wait">
                       {step === 'identify' ? (
                          <motion.div 
                            key="email-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                             <div className="space-y-6 mb-6">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 group-focus-within:text-teal-500 transition-colors tracking-widest">Email</label>
                                    <input 
                                    autoFocus
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900/30 border-b border-zinc-700 text-white py-3 focus:border-teal-500 focus:bg-zinc-900/50 transition-all outline-none text-lg font-mono placeholder:text-zinc-800"
                                    placeholder="trader@deltalytix.app"
                                    />
                                </div>
                                {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
                                <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group rounded-sm">
                                    <span>Continue</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                             </div>
                             
                             {/* Social Login Divider */}
                             <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                    <span className="px-2 bg-[#080808] text-zinc-600">Or continue with</span>
                                </div>
                             </div>

                             {/* Social Buttons */}
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                    type="button" 
                                    onClick={handleSocialLogin}
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-800 rounded-sm hover:bg-zinc-900 transition-colors group"
                                >
                                    <svg className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.08 2.72-5.013 2.72-7.427 0-.733-.053-1.48-.16-2.08H12.48z" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 group-hover:text-white transition-colors">Google</span>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleSocialLogin}
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-800 rounded-sm hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 transition-colors group"
                                >
                                    <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 group-hover:text-white transition-colors">Discord</span>
                                </button>
                             </div>
                          </motion.div>
                       ) : (
                          <motion.div 
                            key="pass-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                             <div className="space-y-2 group">
                                <div className="flex justify-between items-center">
                                   <label className="text-[10px] uppercase font-bold text-zinc-500 group-focus-within:text-teal-500 transition-colors tracking-widest">Password</label>
                                   <button type="button" onClick={() => setStep('identify')} className="text-[10px] text-zinc-500 hover:text-white transition-colors">Change ID</button>
                                </div>
                                <input 
                                  autoFocus
                                  type="password" 
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="w-full bg-zinc-900/30 border-b border-zinc-700 text-white py-3 focus:border-teal-500 focus:bg-zinc-900/50 transition-all outline-none text-lg font-mono placeholder:text-zinc-800"
                                  placeholder="••••••••••••"
                                />
                             </div>
                             {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
                             <button type="submit" className="w-full bg-teal-500 text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-teal-400 transition-colors shadow-[0_0_20px_-5px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_-5px_rgba(45,212,191,0.5)] rounded-sm">
                                Initiate Session
                             </button>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </form>
            )}
         </motion.div>
      </div>
    </div>
  );
};

export default Login;