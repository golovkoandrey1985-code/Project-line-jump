import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import AnimatedCharacter from "@/components/AnimatedCharacter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col justify-between p-4 overflow-hidden">
      {/* Top Section - Logo & Character */}
      <div className="flex-shrink-0 space-y-2 pt-2">
        <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent text-center">
          Line Jump
        </h1>
        <p className="text-sm md:text-xl text-gray-300 text-center">
          Гиперказуальная игра - бесконечный раннер
        </p>
        
        {/* Animated Character */}
        <div className="py-2">
          <AnimatedCharacter />
        </div>
      </div>

      {/* Middle Section - Features */}
      <div className="flex-shrink-0 flex flex-col justify-center space-y-2 mb-2">
        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-2 max-w-3xl mx-auto w-full">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-2 border border-cyan-500/30">
            <div className="text-2xl mb-0.5">🎯</div>
            <h3 className="text-xs font-bold text-cyan-400">3 Уровня</h3>
            <p className="text-gray-300 text-[10px]">500, 1300, 2300</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-2 border border-purple-500/30">
            <div className="text-2xl mb-0.5">⚡</div>
            <h3 className="text-xs font-bold text-purple-400">Способности</h3>
            <p className="text-gray-300 text-[10px]">Прыжок, магнит, щит</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-2 border border-green-500/30">
            <div className="text-2xl mb-0.5">🎨</div>
            <h3 className="text-xs font-bold text-green-400">Живой Мир</h3>
            <p className="text-gray-300 text-[10px]">Птицы, самолеты</p>
          </div>
        </div>

        {/* Abilities */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-purple-500/20 max-w-3xl mx-auto w-full">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <span className="text-xl block mb-0.5">🚀</span>
              <span className="font-bold text-cyan-400 text-[10px] block">Тройной Прыжок</span>
              <span className="text-[9px] text-gray-400">500 очков</span>
            </div>
            <div className="text-center">
              <span className="text-xl block mb-0.5">⭐</span>
              <span className="font-bold text-yellow-400 text-[10px] block">Магнит</span>
              <span className="text-[9px] text-gray-400">400 очков</span>
            </div>
            <div className="text-center">
              <span className="text-xl block mb-0.5">🛡️</span>
              <span className="font-bold text-green-400 text-[10px] block">Щит</span>
              <span className="text-[9px] text-gray-400">3 звездочки</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Play Button */}
      <div className="flex-shrink-0 space-y-3 pb-8 md:pb-4">
        <div className="text-center">
          <Button
            onClick={() => setLocation("/game")}
            size="lg"
            className="text-xl px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-full shadow-2xl shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
          >
            🎮 Играть
          </Button>
        </div>

        {/* Platform Support */}
        <div className="flex items-center justify-center gap-3 text-gray-400 text-xs mb-4">
          <span>💻 Десктоп</span>
          <span>•</span>
          <span>📱 Мобильные</span>
        </div>
      </div>
    </div>
  );
}
