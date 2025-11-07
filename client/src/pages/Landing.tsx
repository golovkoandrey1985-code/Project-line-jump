import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import AnimatedCharacter from "@/components/AnimatedCharacter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col justify-between overflow-hidden"
         style={{ 
           padding: 'clamp(0.5rem, 2vw, 1rem)',
           minHeight: '100dvh' // dvh учитывает мобильные панели браузера
         }}>
      {/* Top Section - Logo & Character */}
      <div className="flex-shrink-0 space-y-2"
           style={{ paddingTop: 'clamp(0.25rem, 1vh, 0.5rem)' }}>
        <h1 className="font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent text-center"
            style={{ fontSize: 'clamp(2rem, 8vw, 4.5rem)' }}>
          Line Jump
        </h1>
        <p className="text-gray-300 text-center"
           style={{ fontSize: 'clamp(0.75rem, 3vw, 1.25rem)' }}>
          Гиперказуальная игра - бесконечный раннер
        </p>
        
        {/* Animated Character */}
        <div style={{ padding: 'clamp(0.25rem, 1vh, 0.5rem) 0' }}>
          <AnimatedCharacter />
        </div>
      </div>

      {/* Middle Section - Features */}
      <div className="flex-shrink-0 flex flex-col justify-center"
           style={{ 
             gap: 'clamp(0.25rem, 1vh, 0.5rem)',
             marginBottom: 'clamp(0.25rem, 1vh, 0.5rem)'
           }}>
        {/* Features Grid */}
        <div className="grid grid-cols-3 max-w-3xl mx-auto w-full"
             style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg border border-cyan-500/30"
               style={{ padding: 'clamp(0.25rem, 1.5vw, 0.5rem)' }}>
            <div style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)', marginBottom: '0.125rem' }}>🎯</div>
            <h3 className="font-bold text-cyan-400"
                style={{ fontSize: 'clamp(0.625rem, 2.5vw, 0.875rem)' }}>3 Уровня</h3>
            <p className="text-gray-300"
               style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)' }}>500, 1300, 2300</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg border border-purple-500/30"
               style={{ padding: 'clamp(0.25rem, 1.5vw, 0.5rem)' }}>
            <div style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)', marginBottom: '0.125rem' }}>⚡</div>
            <h3 className="font-bold text-purple-400"
                style={{ fontSize: 'clamp(0.625rem, 2.5vw, 0.875rem)' }}>Способности</h3>
            <p className="text-gray-300"
               style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)' }}>Прыжок, магнит, щит</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg border border-green-500/30"
               style={{ padding: 'clamp(0.25rem, 1.5vw, 0.5rem)' }}>
            <div style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)', marginBottom: '0.125rem' }}>🎨</div>
            <h3 className="font-bold text-green-400"
                style={{ fontSize: 'clamp(0.625rem, 2.5vw, 0.875rem)' }}>Живой Мир</h3>
            <p className="text-gray-300"
               style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)' }}>Птицы, самолеты</p>
          </div>
        </div>

        {/* Abilities */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/20 max-w-3xl mx-auto w-full"
             style={{ padding: 'clamp(0.25rem, 1.5vw, 0.5rem)' }}>
          <div className="grid grid-cols-3 text-sm"
               style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
            <div className="text-center">
              <span className="block"
                    style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', marginBottom: '0.125rem' }}>🚀</span>
              <span className="font-bold text-cyan-400 block"
                    style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)' }}>Тройной Прыжок</span>
              <span className="text-gray-400"
                    style={{ fontSize: 'clamp(0.45rem, 1.8vw, 0.5625rem)' }}>500 очков</span>
            </div>
            <div className="text-center">
              <span className="block"
                    style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', marginBottom: '0.125rem' }}>⭐</span>
              <span className="font-bold text-yellow-400 block"
                    style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)' }}>Магнит</span>
              <span className="text-gray-400"
                    style={{ fontSize: 'clamp(0.45rem, 1.8vw, 0.5625rem)' }}>400 очков</span>
            </div>
            <div className="text-center">
              <span className="block"
                    style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', marginBottom: '0.125rem' }}>🛡️</span>
              <span className="font-bold text-green-400 block"
                    style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)' }}>Щит</span>
              <span className="text-gray-400"
                    style={{ fontSize: 'clamp(0.45rem, 1.8vw, 0.5625rem)' }}>3 звездочки</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Play Button */}
      <div 
        className="flex-shrink-0"
        style={{ 
          paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.5rem, 2vh, 0.75rem)'
        }}
      >
        <div className="text-center">
          <Button
            onClick={() => setLocation("/game")}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-full shadow-2xl shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
            style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              padding: 'clamp(0.75rem, 3vw, 1.5rem) clamp(2rem, 8vw, 3rem)'
            }}
          >
            🎮 Играть
          </Button>
        </div>

        {/* Platform Support */}
        <div className="flex items-center justify-center gap-3 text-gray-400"
             style={{ 
               fontSize: 'clamp(0.625rem, 2.5vw, 0.75rem)',
               marginBottom: 'clamp(0.5rem, 2vh, 1rem)'
             }}>
          <span>💻 Десктоп</span>
          <span>•</span>
          <span>📱 Мобильные</span>
        </div>
      </div>
    </div>
  );
}
