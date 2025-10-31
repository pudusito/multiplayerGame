import React from "react";

export default function UI({ health = 100, stamina = 100 }) {
  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-md z-50 w-64 space-y-3 font-sans">
      <h2 className="text-lg font-bold">Mini HUD</h2>
      
      <p className="text-sm">Keyboard  <br/>  MLB para mover <br/> SPACE para saltar</p>

      {/* Barra de vida */}
      <div>
        <span className="text-xs">Health</span>
        <div className="w-full bg-gray-700 h-3 rounded-full mt-1">
          <div
            className="bg-red-500 h-3 rounded-full"
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

      {/* Barra de energía / stamina */}
      <div>
        <span className="text-xs">Stamina</span>
        <div className="w-full bg-gray-700 h-3 rounded-full mt-1">
          <div
            className="bg-yellow-400 h-3 rounded-full"
            style={{ width: `${stamina}%` }}
          />
        </div>
      </div>
    </div>
  );
}
