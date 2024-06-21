import React from "react";
import ShapeFighterGame from "./components/ShaperFighterGame";

const App: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ShapeFighterGame />
    </div>
  );
};

export default App;
