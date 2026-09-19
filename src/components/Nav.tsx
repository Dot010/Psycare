"use client";

import { useState } from 'react';
import { 
  BsArrowLeftShort, 
  BsJournalText, 
  BsCalendarCheck, 
  BsCheck2Square, 
  BsCapsule, 
  BsChatDots, 
  BsCreditCard, 
  BsBoxArrowRight,
  BsGear,
  BsQuestionCircle
} from 'react-icons/bs';
import { FaHome } from "react-icons/fa";
import { MdPsychology } from 'react-icons/md';
import Link from 'next/link';

const Nav = () => {
  const [open, setOpen] = useState(true);

  const Menus = [
    { title: "Início", icon: <FaHome />, path: "/dashboard/home" },
    { title: "Meu Diário", icon: <BsJournalText />, path: "/dashboard/diary" },
    { title: "Meus Hábitos", icon: <BsCheck2Square />, path: "/dashboard/habits" },
    { title: "Agendar Consulta", icon: <BsCalendarCheck />, path: "/dashboard/appointments", gap: true },
    { title: "Gestão de Saúde", icon: <BsCapsule />, path: "/dashboard/health" }, 
    { title: "Mensagens", icon: <BsChatDots />, path: "/dashboard/messages" },
    { title: "Meus Pagamentos", icon: <BsCreditCard />, path: "/dashboard/payments", gap: true },
    { title: "Ajuda", icon: <BsQuestionCircle />, path: "/dashboard/help" },
    { title: "Configurações", icon: <BsGear />, path: "/dashboard/settings" },
    { title: "Sair", icon: <BsBoxArrowRight />, logout: true, path: "/auth/login" },
  ];

  return (
    <aside className='hidden md:flex h-screen sticky top-0'>
      {/* Sidebar Container */}
      <div className={`bg-emerald-600 h-screen p-5 pt-8 ${open ? "w-72" : "w-20"} duration-300 relative shadow-xl transition-all`}>
        
        {/* Botão Toggle */}
        <BsArrowLeftShort
          className={`bg-white text-emerald-600 text-3xl rounded-full absolute -right-3 top-9 border-2 border-emerald-600 cursor-pointer transition-all duration-500 ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />

        {/* Logo */}
        <div className={`flex items-center transition-all duration-300 ${!open ? "justify-center" : "ml-1"}`}>
          <div className={`bg-white p-2 rounded-lg duration-500 shadow-md ${!open && "rotate-[360deg]"}`}>
            <MdPsychology className='text-emerald-600 text-3xl block' />
          </div>
          
          <h1 className={`text-white origin-left font-bold text-2xl ml-4 duration-300 ${!open ? "scale-0 w-0 overflow-hidden" : "scale-100"}`}>
            Psy Care
          </h1>
        </div>

        {/* Lista de Menus */}
        <ul className='pt-10 space-y-2'>
          {Menus.map((menu, index) => (
            <div key={index} className={menu.gap ? "mt-8" : "mt-2"}>
              <li
                className={`flex items-center gap-x-4 cursor-pointer p-3 hover:bg-white/20 rounded-xl transition-all duration-200
                  ${menu.logout ? "text-red-200 hover:bg-red-500/20" : "text-white"}`}
              >
                <Link href={menu.path || "#"} className="flex items-center gap-x-4 w-full">
                  <span className={`text-2xl block float-left duration-300 ${!open && "mx-auto"}`}>
                    {menu.icon}
                  </span>
                  <span className={`text-base font-medium flex-1 duration-200 ${!open && "hidden"}`}>
                    {menu.title}
                  </span>
                </Link>
              </li>
            </div>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Nav;