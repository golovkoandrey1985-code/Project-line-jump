import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Logo & Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Line Jump
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Гиперказуальная игра - бесконечный раннер
          </p>
        </div>

        {/* Description */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
          <p className="text-lg text-gray-200 leading-relaxed">
            Прыгай через препятствия, собирай звездочки и активируй мощные способности! 
            Преодолей три уровня возрастающей сложности и побей свой рекорд!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-cyan-400 mb-2">3 Уровня</h3>
            <p className="text-gray-300 text-sm">
              Проходи уровни на 500, 1300 и 2300 очков
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">Супер Способности</h3>
            <p className="text-gray-300 text-sm">
              Тройной прыжок, магнит и защитный щит
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Живой Мир</h3>
            <p className="text-gray-300 text-sm">
              Птицы, самолеты, деревья и динамичная погода
            </p>
          </div>
        </div>

        {/* Abilities Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-4">Бонусные Способности</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span className="font-bold text-cyan-400">Тройной Прыжок</span>
              </div>
              <p className="text-sm text-gray-300">
                Каждые 500 очков на 15 секунд
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-yellow-400">Магнит</span>
              </div>
              <p className="text-sm text-gray-300">
                Каждые 400 очков на 10 секунд
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <span className="font-bold text-green-400">Щит</span>
              </div>
              <p className="text-sm text-gray-300">
                При сборе 3 звездочек подряд
              </p>
            </div>
          </div>
        </div>

        {/* Play Button */}
        <div className="pt-8">
          <Button
            onClick={() => setLocation("/game")}
            size="lg"
            className="text-2xl px-12 py-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-full shadow-2xl shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
          >
            🎮 Играть
          </Button>
        </div>

        {/* Platform Support */}
        <div className="flex items-center justify-center gap-6 text-gray-400 text-sm pt-4">
          <div className="flex items-center gap-2">
            <span>💻</span>
            <span>Десктоп</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-2">
            <span>📱</span>
            <span>Мобильные</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Тап или Пробел</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-gray-500 text-sm">
        <p>Создано с ❤️ для любителей казуальных игр</p>
      </div>
    </div>
  );
}
