import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-5xl w-full text-center space-y-6">
        {/* Logo & Title */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Line Jump
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Гиперказуальная игра - бесконечный раннер
          </p>
        </div>

        {/* Features Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30">
            <div className="text-3xl mb-1">🎯</div>
            <h3 className="text-lg font-bold text-cyan-400">3 Уровня</h3>
            <p className="text-gray-300 text-xs">500, 1300, 2300 очков</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="text-3xl mb-1">⚡</div>
            <h3 className="text-lg font-bold text-purple-400">Способности</h3>
            <p className="text-gray-300 text-xs">Прыжок, магнит, щит</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
            <div className="text-3xl mb-1">🎨</div>
            <h3 className="text-lg font-bold text-green-400">Живой Мир</h3>
            <p className="text-gray-300 text-xs">Птицы, самолеты, деревья</p>
          </div>
        </div>

        {/* Abilities - Horizontal Compact */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <div className="text-left">
                <span className="font-bold text-cyan-400 block">Тройной Прыжок</span>
                <span className="text-xs text-gray-400">Каждые 500 очков</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <div className="text-left">
                <span className="font-bold text-yellow-400 block">Магнит</span>
                <span className="text-xs text-gray-400">Каждые 400 очков</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div className="text-left">
                <span className="font-bold text-green-400 block">Щит</span>
                <span className="text-xs text-gray-400">3 звездочки подряд</span>
              </div>
            </div>
          </div>
        </div>

        {/* Play Button */}
        <div className="pt-4">
          <Button
            onClick={() => setLocation("/game")}
            size="lg"
            className="text-xl px-10 py-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-full shadow-2xl shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
          >
            🎮 Играть
          </Button>
        </div>

        {/* Platform Support - Compact */}
        <div className="flex items-center justify-center gap-4 text-gray-400 text-xs">
          <span>💻 Десктоп</span>
          <span>•</span>
          <span>📱 Мобильные</span>
          <span>•</span>
          <span>🎯 Тап / Пробел</span>
        </div>
      </div>
    </div>
  );
}
