import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";

const SocialButtons = () => {
  return (
    <div className="w-full flex flex-col gap-4 mt-6">
      <div className="flex justify-center gap-4">
        <button
          type="button"
          className="p-3 border rounded-xl hover:bg-slate-50 transition-colors"
          aria-label="Continue com Google"
        >
          <FcGoogle size={24} />
        </button>
        <button
          type="button"
          className="p-3 border rounded-xl hover:bg-slate-50 transition-colors"
          aria-label="Continue com Apple"
        >
          <FaApple size={24} />
        </button>
        <button
          type="button"
          className="p-3 border rounded-xl hover:bg-slate-50 transition-colors"
          aria-label="Continue com Facebook"
        >
          <FaFacebook size={24} color="#1877F2" />
        </button>
      </div>

      <div className="relative flex py-3 items-center">
        <div className="grow border-t border-slate-200" />
        <span className="shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
          ou continue com email
        </span>
        <div className="grow border-t border-slate-200" />
      </div>
    </div>
  );
};

export default SocialButtons;