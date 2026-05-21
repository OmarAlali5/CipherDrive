import { motion } from 'framer-motion'
import { Laptop, FileText, Lock, Cloud } from 'lucide-react'

export const HeroAnimation = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto h-40 flex items-center justify-between px-8 bg-slate-900/50 rounded-2xl border border-slate-800/60 backdrop-blur-sm shadow-2xl overflow-hidden mt-8">
      {/* Background tracking line */}
      <div className="absolute top-1/2 left-16 right-16 h-[2px] -translate-y-1/2 bg-slate-800/80 rounded-full" />
      <div className="absolute top-1/2 left-16 right-16 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />

      {/* Static Icons */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 border border-slate-800">
          <Laptop strokeWidth={1.5} className="w-8 h-8 text-slate-400" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Local</span>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 border border-slate-800"
          animate={{ 
            scale: [1, 1, 1, 1.15, 1, 1],
            borderColor: ["#1e293b", "#1e293b", "#1e293b", "#10b981", "#1e293b", "#1e293b"],
            boxShadow: [
              "0 0 0px rgba(16,185,129,0)",
              "0 0 0px rgba(16,185,129,0)",
              "0 0 0px rgba(16,185,129,0)",
              "0 0 30px rgba(16,185,129,0.4)",
              "0 0 0px rgba(16,185,129,0)",
              "0 0 0px rgba(16,185,129,0)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.35, 0.5, 0.75, 0.85] }}
        >
          <motion.div
            animate={{
              color: ["#64748b", "#64748b", "#64748b", "#10b981", "#64748b", "#64748b"]
            }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.35, 0.5, 0.75, 0.85] }}
          >
            <Lock strokeWidth={1.5} className="w-8 h-8" />
          </motion.div>
        </motion.div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">AES-256</span>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <Cloud strokeWidth={1.5} className="w-9 h-9 text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Drive</span>
      </div>

      {/* Moving File */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-12 z-20 flex items-center justify-center bg-slate-900 border border-slate-700 p-2 rounded-lg"
        animate={{
          left: ["2.5rem", "2.5rem", "50%", "50%", "calc(100% - 4.5rem)", "calc(100% - 4.5rem)"],
          x: ["0%", "0%", "-50%", "-50%", "0%", "0%"],
          opacity: [0, 1, 1, 1, 0.8, 0],
          scale: [0.5, 1, 1, 1.1, 0.8, 0.5],
          borderColor: ["#334155", "#334155", "#334155", "#10b981", "#10b981", "#334155"],
          color: ["#94a3b8", "#94a3b8", "#94a3b8", "#10b981", "#10b981", "#94a3b8"],
          boxShadow: [
            "0 0 0px rgba(16,185,129,0)",
            "0 0 0px rgba(16,185,129,0)",
            "0 0 0px rgba(16,185,129,0)",
            "0 0 20px rgba(16,185,129,0.5)",
            "0 0 20px rgba(16,185,129,0.5)",
            "0 0 0px rgba(16,185,129,0)"
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          times: [0, 0.1, 0.35, 0.5, 0.75, 0.85],
          ease: "easeInOut"
        }}
      >
        <FileText strokeWidth={1.5} className="w-6 h-6" />
      </motion.div>
    </div>
  )
}
