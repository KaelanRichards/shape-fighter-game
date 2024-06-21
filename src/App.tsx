import React from "react";
import ShapeFighterGame from "./components/ShaperFighterGame";
import ShapeFighter from "./ShapeFighter";

const App: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ShapeFighter />
    </div>
  );
};

export default App;
