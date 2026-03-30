"use client";

import { useState } from 'react';
import { FaHome } from "react-icons/fa";
import {
  BsJournalText, BsCalendarCheck, BsGrid, BsBoxArrowRight, BsCheck2Square,
  BsChatDots, BsCapsule, BsCreditCard,
  BsGrid3X3GapFill,
  BsQuestionCircle,
  BsGear
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

const NavMobile = () => {

  const [menuOpen, setMenuOpen] = useState(false);

  const QuickActions = [
   { title: "Início", icon: <FaHome /> },
    { title: "Diário", icon: <BsJournalText /> },
    { title: "Hábitos", icon: <BsCheck2Square /> },
    { title: "Agenda", icon: <BsCalendarCheck />, },
  ];

    const MoreMenus= [
    {title: "Saúde", icon: <BsCapsule />, },
    { title: "Chat", icon: <BsChatDots /> },
    { title: "Meus Pagamentos", icon: <BsCreditCard />, gap: true },
    { title: "Ajuda" , icon: <BsQuestionCircle />, path: "/help"  },
       { title: "Configurações", icon: <BsGear/>, path: "/settings" },
      { title: "Sair", icon: <BsBoxArrowRight />, logout: true },
  ];
  
  return (
    <div className='md:hidden'>
      <nav className='fixed bottom-0 left-0 right-0 bg-white border-t
             border-slate-200 h-20 px-4 flex justify-around items-center z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]'>
        {QuickActions.map((item, index) => (
          <button key={index}
            className='flex flex-col items-center gap-1 text-slate-400
           active:text-emerald-600 transition-all'>
            <span className='text-xl'>{item.icon}</span>
            <span className='text-[10px] font-bold uppercase tracking-tight'>{item.title}</span>

          </button>
        ))}

   
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center gap-1 transition-all ${menuOpen ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${menuOpen ? 'bg-emerald-50' : ''}`}>
            <BsGrid3X3GapFill className="text-xl" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight">Mais</span>
        </button>
      </nav>
      {/* DRAWER (MENU QUE SOBE) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />
            
            {/* Modal de Opções */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 pb-28 z-50 shadow-2xl"
            >
              {/* Alça do Drawer */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
              
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[2px] mb-6 text-center">Gestão & Outros</h3>

              <div className="grid grid-cols-4 gap-y-8">
                {MoreMenus.map((item, i) => (
                  <button key={i} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm
                      ${item.logout ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-600 active:bg-emerald-600 active:text-white'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-[11px] font-bold ${item.logout ? 'text-red-400' : 'text-slate-500'}`}>
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </div>
  )
}

export default NavMobile