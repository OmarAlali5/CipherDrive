import React from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

export function LegalLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing orbs for aesthetics */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="max-w-3xl w-full z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8 group cursor-pointer"
        >
          <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        
        <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/50 rounded-2xl p-8 md:p-12 shadow-2xl">
          <h1 className="font-['Chakra_Petch'] text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-10">
            {title}
          </h1>
          <div className="text-slate-300 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
