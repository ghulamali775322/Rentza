export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
      <div className="relative">
         {/* Spinning Energy Aura */}
        <div className="absolute -inset-3 border-y-4 border-[#1877f2] rounded-full animate-spin opacity-40" style={{ animationDuration: '2s' }}></div>
        
        {/* Core Logo Block */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#002f34] to-[#001a1d] rounded-xl flex items-center justify-center shadow-lg transform rotate-45 animate-pulse">
          <span className="text-white font-black text-2xl -rotate-45 drop-shadow-md">R</span>
        </div>
      </div>
      
      {/* Changed the text specifically for the Admin side! */}
      <p className="mt-10 text-gray-500 font-bold tracking-[0.3em] text-[10px] uppercase">
        Loading Admin Portal...
      </p>
    </div>
  );
}