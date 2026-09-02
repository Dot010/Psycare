import { mockUser } from "@/data/mockData";

const HomePage = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Cabeçalho com nome dinâmico do mock */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bem-vindo, <span className="text-emerald-600">{mockUser.name}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Seu espaço seguro para cuidar da mente e acompanhar sua evolução.
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Próxima Sessão */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sua próxima sessão
          </span>
          <p className="text-lg font-bold text-emerald-600">
            {mockUser.nextSession.date}, às {mockUser.nextSession.time}
          </p>
          <p className="text-xs text-slate-500">
            Com {mockUser.nextSession.doctor}
          </p>
        </div>

        {/* Card 2: Resumo de Hábitos */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Resumo de Hábitos
          </span>
          <p className="text-lg font-bold text-slate-700">
            {mockUser.habitsSummary}
          </p>
          <p className="text-xs text-emerald-600 font-medium">
            Mantenha a sequência diária!
          </p>
        </div>

        {/* Card 3: Atalho Diário */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Diário Emocional
            </span>
            <p className="text-sm font-medium text-slate-700 mt-1">
              Como você está se sentindo hoje?
            </p>
          </div>
          <button className="mt-4 w-full py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition">
            Novo Registro
          </button>
        </div>

      </div>
    </div>
  );
};

export default HomePage;