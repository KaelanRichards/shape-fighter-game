# Shape Fighter Game

Shape Fighter is a multiplayer browser-based fighting game where players control geometric shapes and battle against each other in a dynamic arena.

## Features

- Real-time multiplayer gameplay
- Multiple game scenes: Main Menu, Lobby, and Game
- Responsive canvas rendering
- Physics-based movement and collisions
- Attack and block mechanics
- Combo system
- Sound effects and background music
- Screen shake effects for impactful hits

## Technologies Used

- React
- TypeScript
- HTML5 Canvas
- WebSocket for real-time communication

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/shape-fighter-game.git
   cd shape-fighter-game
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` to play the game.

## How to Play

- Use WASD keys to move your shape
- Press Space to attack
- Press F to block
- Combine movements and attacks to create combos and defeat your opponents

## Project Structure

- `src/`: Source code for the game
  - `components/`: React components
  - `engine/`: Game engine core classes
  - `systems/`: Game systems (e.g., Physics, Rendering, Input)
  - `scenes/`: Game scenes (Main Menu, Lobby, Game)
  - `networking/`: Networking and multiplayer functionality
  - `utils/`: Utility functions and constants

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the React and TypeScript communities for their excellent documentation and tools.
- Inspired by classic fighting games and modern multiplayer experiences.
