import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { SocketManager } from "./components/conection/SocketManager";
import { KeyboardControls } from "@react-three/drei";
import UI from "./components/UI";
// ...existing code...

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
  { name: "jump", keys: ["Space"],  },
];

export default function App() {
  const [gameState, setGameState] = useState("start");

  return (
    <>
      <div id="bodydiv" className="w-full h-screen">
        <div id="marco" className="w-full h-full relative">
          {/* ---------- PANTALLA DE INICIO ---------- */}
          {gameState === "start" && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
              <h1 className="text-4xl font-bold mb-6">🚗 Pudu Racing</h1>
              <button
                onClick={() => setGameState("playing")}
                className="px-6 py-3 bg-green-500 rounded-lg hover:bg-green-700 transition"
              >
                Start Game
              </button>
            </div>
          )}

          {/* ---------- PANTALLA DE JUEGO ---------- */}
          {gameState === "playing" && (
            <>
              {/* Botón de salir */}
              <button
                onClick={() => setGameState("start")}
                className="fixed top-4 left-4 z-[1000] rounded-full bg-teal-500 border-none shadow-md
                           w-14 h-9 text-xs md:w-18 md:h-11 md:text-base font-bold text-white cursor-pointer"
              >
                Exit game
              </button>
              <UI />
              <KeyboardControls map={keyboardMap}>
                <SocketManager />
                <Canvas shadows camera={{ position: [8, 8, 8], fov: 30 }} style={{ touchAction: "none" }}>
                <Suspense fallback={null}>
                  <Experience />
                </Suspense >
                </Canvas>
              </KeyboardControls>
            </>
          )}
        </div>
      </div>
    </>
  );
}