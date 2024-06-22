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

## Multiplayer Setup

To enable multiplayer functionality, follow these steps:

1. Set up the WebSocket server:

   - Create a new directory for the server: `mkdir server && cd server`
   - Initialize a new Node.js project: `npm init -y`
   - Install required dependencies: `npm install ws`
   - Create a new file `server.js` with the following content:

     ```javascript
     const WebSocket = require("ws");
     const wss = new WebSocket.Server({ port: 3001 });

     wss.on("connection", (ws) => {
       console.log("New client connected");

       ws.on("message", (message) => {
         console.log("Received:", message);
         wss.clients.forEach((client) => {
           if (client !== ws && client.readyState === WebSocket.OPEN) {
             client.send(message);
           }
         });
       });

       ws.on("close", () => {
         console.log("Client disconnected");
       });
     });

     console.log("WebSocket server started on port 3001");
     ```

2. Start the WebSocket server:

   - In the `server` directory, run: `node server.js`

3. Update the client-side code:

   - In `src/ShapeFighter.tsx`, ensure the WebSocket connection is established:

     ```typescript
     const newEngine = new Engine(canvas, "ws://localhost:3001");
     ```

4. Run the game:
   - Start the development server: `npm start`
   - Open multiple browser windows to `http://localhost:3000` to test multiplayer functionality

## Troubleshooting

If you encounter any issues with multiplayer functionality, check the following:

1. Ensure the WebSocket server is running on port 3001.
2. Check the browser console for any connection errors.
3. Verify that your firewall is not blocking WebSocket connections.

For more advanced multiplayer features and optimizations, refer to the `NetworkSystem` and `NetworkManager` classes in the source code.

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

## Project Status and Next Steps

As of the last update, the Shape Fighter game has a basic structure in place, including:

1. A main game loop and scene management system
2. Player movement and basic combat mechanics
3. A simple multiplayer setup using WebSockets
4. Rendering system for the game arena and players

Next steps to focus on:

1. Implement more robust networking code, including lag compensation and prediction
2. Enhance the combat system with more varied attacks and special moves
3. Add visual effects for attacks, blocks, and player interactions
4. Implement a proper lobby system for matchmaking
5. Create more diverse arenas with obstacles or interactive elements
6. Add sound effects and background music
7. Implement a scoring system and end-game conditions
8. Create a user interface for game settings, player customization, and match results
9. Optimize performance, especially for multiplayer synchronization
10. Add unit tests and integration tests for core game logic

Remember to regularly test the multiplayer functionality as you develop new features. Keep the README updated with any new setup instructions or dependencies as the project evolves.
