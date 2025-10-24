# 🎮 Brisbane Bus Pac-Man Game

A fun Pac-Man style game where you travel along real Brisbane bus routes eating buses!

## How to Play

1. **Start the Game**: Click the golden 🎮 game button in the top-right corner
2. **Move**: Use arrow keys (← →) or A/D keys to change direction along the route
3. **Jump Routes**: Press SPACE to teleport to a random new route
4. **Eat Buses**: Get close to buses to eat them and score points!
5. **Build Combos**: Eat multiple buses within 3 seconds for combo multipliers
6. **Power-Ups**: Random 10% chance to get power-up mode with double points

## Game Features

### Scoring System
- **Base Points**: 100 points per bus
- **Powered Mode**: 200 points per bus (during power-up)
- **Combo Multiplier**: 1.5x per combo level
  - Example: 2-bus combo = 150 points, 3-bus combo = 225 points
- **High Score**: Automatically saved to localStorage

### Visual Effects
- 🎨 Pulsing yellow Pac-Man character
- 💥 Particle explosions when eating buses
- ⚡ Cyan glow when powered up
- 🔥 Combo counter with fire emoji
- 🏆 Achievement notifications
- 👻 Eaten buses disappear for 30 seconds before respawning

### Audio Feedback
- 🎵 Chirp sound when eating buses
- 🎶 Escalating pitch for combo chains
- 🎺 Power-up activation sound
- 🎉 Celebration chord every 10 buses

### Game Mechanics
- **Camera Tracking**: Smooth follow camera keeps player centered
- **Route Navigation**: Travel along real GTFS bus routes
- **Route Jumping**: Switch routes instantly with SPACE key
- **Direction Control**: Reverse direction anytime
- **Bus Respawning**: Eaten buses return after 30 seconds
- **Lives System**: Start with 3 lives (currently cosmetic, can be extended)

## Technical Details

### Files Modified
- `index.html` - Added game UI elements and toggle button
- `js/game.js` - NEW file with all game logic
- `js/main.js` - Integrated game loop and controls
- `styles/styles.css` - Added game styling and animations

### Key Technologies
- **Web Audio API**: Real-time sound synthesis
- **MapLibre GL**: Map rendering and camera control
- **GTFS Data**: Real bus routes and vehicle positions
- **localStorage**: High score persistence
- **requestAnimationFrame**: Smooth 60fps game loop
- **CSS Animations**: Particle effects and UI animations

## Game Balance

### Constants (in game.js)
```javascript
GAME_SPEED = 0.00015          // Movement speed along routes
EAT_DISTANCE = 80             // Collision detection radius (meters)
POWER_UP_DURATION = 10000     // Power-up lasts 10 seconds
COMBO_TIMEOUT = 3000          // 3 seconds to maintain combo
BUS_RESPAWN_TIME = 30000      // Buses respawn after 30 seconds
```

These can be tuned to adjust difficulty and pacing!

## Future Enhancement Ideas

- 🏁 Game over conditions (lose lives when hitting obstacles?)
- 🎯 Bonus collectibles on the map
- 📊 Leaderboard system
- 🎭 Different character skins
- 🌈 Route power-ups (speed boost, invincibility)
- 🏆 Achievement system
- 📱 Touch controls for mobile
- 🎪 Multiple game modes (time attack, survival, etc.)

## Credits

Built on top of the Brisbane Bus Tracking SPA using:
- Real-time GTFS data from Translink Queensland
- MapLibre GL for mapping
- Vanilla JavaScript (no frameworks!)

---

**Have fun playing! Try to beat your high score! 🚌💨**
