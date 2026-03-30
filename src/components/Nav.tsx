"use client";

import { title } from 'process';
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
  BsChevronDown,
  BsGear,
  BsQuestionCircle
} from 'react-icons/bs';
import { FaHome } from "react-icons/fa";
import { MdPsychology } from 'react-icons/md';

const Nav = () => {
  const [open, setOpen] = useState(true);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  // Lista de Menus baseada no que você descreveu
  const Menus = [
    { title: "Início", icon: <FaHome /> },
    { title: "Meu Diário", icon: <BsJournalText /> },
    { title: "Meus Hábitos", icon: <BsCheck2Square /> },
    { title: "Agendar Consulta", icon: <BsCalendarCheck />, gap: true },
    {
      title: "Gestão de Saúde", icon: <BsCapsule />,
      submenu: true,
      submenuItems: [
        { title: "Meus Remédios" },
        { title: "Meus Exames" },
        { title: "Meus Sintomas" },
      ],
     },
    { title: "Mensagens", icon: <BsChatDots /> },
    { title: "Meus Pagamentos", icon: <BsCreditCard />, gap: true },
    { title: "Ajuda" , icon: <BsQuestionCircle />, path: "/help"  },
    { title: "Configurações", icon: <BsGear/>, path: "/settings" },
    { title: "Sair", icon: <BsBoxArrowRight />, logout: true },
  ];

  return (
    <div className='flex hidden md:flex'>
      {/* Sidebar - Emerald-600 para um visual profissional e calmo */}
      <div className={`bg-emerald-600 h-screen p-5 pt-8 ${open ? "w-72" : "w-20"} duration-300 relative shadow-xl transition-all`}>
        
        {/* Botão de Toggle - O '-right-3' joga ele para fora da borda, evitando bater na logo */}
        <BsArrowLeftShort
          className={`bg-white text-emerald-600 text-3xl rounded-full absolute -right-3 top-9 border-2 border-emerald-600 cursor-pointer transition-all duration-500
          ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />

        {/* Logo Section - Centralização Inteligente */}
        <div className={`flex items-center transition-all duration-300 ${!open ? "justify-center" : "ml-1"}`}>
          <div className={`bg-white p-2 rounded-lg duration-500 shadow-md ${!open && "rotate-[360deg]"}`}>
            <MdPsychology className='text-emerald-600 text-3xl block' />
          </div>
          
          <h1 className={`text-white origin-left font-bold text-2xl ml-4 duration-300 
            ${!open ? "scale-0 w-0 overflow-hidden" : "scale-100"}`}>
            Psy Care
          </h1>
        </div>

        {/* Links de Navegação */}
        <ul className='pt-10'>
          {Menus.map((menu, index) => (
            <div key={index}>

              <li
                className={`flex items-center gap-x-4 cursor-pointer p-3 hover:bg-white/20 rounded-xl transition-all duration-200
              ${menu.gap ? "mt-8" : "mt-2"} 
              ${menu.logout ? "text-red-200 hover:bg-red-500/20" : "text-white"}`}
                onClick={() => { if (menu.submenu) setSubmenuOpen(!submenuOpen) }}
              >
              <span className={`text-2xl block float-left duration-300 ${!open && "mx-auto"}`}>
                {menu.icon}
              </span>
              <span className={`text-base font-medium flex-1 duration-200 ${!open && "hidden"}`}>
                {menu.title}
                </span>
                {menu.submenu && open && (
                  <BsChevronDown
                  className={`duration-300 ${submenuOpen ? "rotate-180" : ""}`}
                  />
                )}
            </li>
              {/* Submenu - Apenas renderiza se o menu tiver submenu e estiver aberto */}
              {menu.submenu && submenuOpen && open && (
                <ul className='mt-2 transition-all duration-500'>
                  {menu.submenuItems.map((subItem, index) => (
                    <li
                      key={index}
                      className='text-white text-sm flex items-center gap-x-4 cursor-pointer'>
                      {subItem.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ul>
      </div>

      {/* Conteúdo Principal (Onde as páginas aparecem) */}
      <div className='flex-1 p-10 bg-slate-50 min-h-screen'>
        <div className='max-w-4xl'>
          <h1 className='text-3xl font-bold text-slate-800'>Bem-vindo, [Nome]</h1>
          <p className='text-slate-500 mt-2 text-lg'>
            Seu espaço seguro para cuidar da mente e acompanhar sua evolução.
          </p>
          
          {/* Exemplo de Card de Conteúdo */}
          <div className='mt-10 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm'>
            <h2 className='text-xl font-semibold text-slate-700'>Sua próxima sessão</h2>
            <p className='text-emerald-600 font-medium mt-1'>Terça-feira, às 15:30h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;