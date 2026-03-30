import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";


const SocialButtons = () => {
  return (
    <div className="w-full flex-col gap-4 mt-6">
      <div className="flex justify-center gap-4">
        <button type="button" className="p-3 border rounded-xl hover:bg-slate-50">
          <FcGoogle size={24} />
        </button>
        <button type="button" className="p-3 border rounded-xl hover:bg-slate-50">
          <FaApple size={24} />
        </button>
        <button type="button" className="p-3 border rounded-xl hover:bg-slate-50">
          <FaFacebook size={24} color="#1877F2" />
        </button>
      </div>

      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider"> ou continue com email </span> 
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

    </div>
  )
}

export default SocialButtons