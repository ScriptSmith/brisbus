// PACMAN GAME MODE
// A fun game where the player travels along bus routes and "eats" buses!

// Game Constants
const GAME_SPEED = 0.00015; // Movement speed along routes (increased for faster pace)
const PLAYER_SIZE = 20; // Pacman size
const EAT_DISTANCE = 80; // Distance threshold for eating a bus (meters) - increased for easier gameplay
const POWER_UP_DURATION = 10000; // 10 seconds
const LIVES_START = 3;
const POINTS_PER_BUS = 100;
const POINTS_PER_POWERED_BUS = 200;
const COMBO_MULTIPLIER = 1.5;
const COMBO_TIMEOUT = 3000; // 3 seconds to maintain combo
const BUS_RESPAWN_TIME = 30000; // 30 seconds before eaten bus respawns

// Game State
let gameActive = false;
let gameScore = 0;
let gameLives = LIVES_START;
let playerPosition = null; // {lat, lon}
let playerRouteId = null;
let playerRouteProgress = 0; // 0 to 1 along current route
let playerDirection = 1; // 1 for forward, -1 for backward
let isPoweredUp = false;
let powerUpEndTime = 0;
let eatenBuses = new Map(); // Map of vehicleId -> timestamp when eaten
let comboCount = 0;
let lastEatTime = 0;
let currentRouteCoords = [];
let mouthOpen = true;
let mouthAnimationFrame = 0;
let totalBusesEaten = 0;
let gameOverShown = false;

// Sound effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playEatSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 400;
  oscillator.type = 'square';
  
  // Quick chirp sound
  oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playComboSound(comboLevel) {
  // Higher pitch for higher combos
  const baseFreq = 400 + (comboLevel * 100);
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = baseFreq;
  oscillator.type = 'sine';
  
  oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioContext.currentTime + 0.15);
  
  gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
}

function playPowerUpSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 200;
  oscillator.type = 'sine';
  
  // Sweep up
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

function playGameOverSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 400;
  oscillator.type = 'sawtooth';
  
  // Sweep down
  oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function playCelebrationSound() {
  // Play a celebratory chord
  const frequencies = [523.25, 659.25, 783.99]; // C, E, G
  
  frequencies.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.05 + 0.5);
    
    oscillator.start(audioContext.currentTime + i * 0.05);
    oscillator.stop(audioContext.currentTime + i * 0.05 + 0.5);
  });
}

// Initialize game
function startGame(shapes, routes) {
  gameActive = true;
  gameScore = 0;
  gameLives = LIVES_START;
  eatenBuses.clear();
  comboCount = 0;
  lastEatTime = 0;
  isPoweredUp = false;
  totalBusesEaten = 0;
  gameOverShown = false;
  
  // Pick a random route to start on
  const routeIds = Object.keys(shapes);
  if (routeIds.length === 0) return false;
  
  const randomRouteId = routeIds[Math.floor(Math.random() * routeIds.length)];
  playerRouteId = randomRouteId;
  currentRouteCoords = shapes[randomRouteId] || [];
  
  // Start at the beginning of the route
  playerRouteProgress = 0;
  playerDirection = 1;
  
  if (currentRouteCoords.length > 0) {
    playerPosition = {
      lat: currentRouteCoords[0][1],
      lon: currentRouteCoords[0][0]
    };
  }
  
  updateGameUI();
  showNotification('🎮 PAC-MAN MODE ACTIVATED! Eat all the buses! 🚌');
  return true;
}

function stopGame() {
  gameActive = false;
  gameOverShown = false;
  updateGameUI();
}

// Update player position
function updatePlayerPosition(deltaTime) {
  if (!gameActive || currentRouteCoords.length === 0) return;
  
  // Move along the route
  const speed = GAME_SPEED * deltaTime;
  playerRouteProgress += speed * playerDirection;
  
  // Reverse direction at route ends
  if (playerRouteProgress >= 1) {
    playerRouteProgress = 1;
    playerDirection = -1;
  } else if (playerRouteProgress <= 0) {
    playerRouteProgress = 0;
    playerDirection = 1;
  }
  
  // Interpolate position along route
  const segmentIndex = Math.floor(playerRouteProgress * (currentRouteCoords.length - 1));
  const segmentProgress = (playerRouteProgress * (currentRouteCoords.length - 1)) - segmentIndex;
  
  if (segmentIndex < currentRouteCoords.length - 1) {
    const coord1 = currentRouteCoords[segmentIndex];
    const coord2 = currentRouteCoords[segmentIndex + 1];
    
    playerPosition = {
      lon: coord1[0] + (coord2[0] - coord1[0]) * segmentProgress,
      lat: coord1[1] + (coord2[1] - coord1[1]) * segmentProgress
    };
  }
  
  // Animate mouth
  mouthAnimationFrame = (mouthAnimationFrame + 1) % 20;
  mouthOpen = mouthAnimationFrame < 10;
  
  // Check power-up expiration
  if (isPoweredUp && Date.now() > powerUpEndTime) {
    isPoweredUp = false;
  }
  
  // Check combo timeout
  if (comboCount > 0 && Date.now() - lastEatTime > COMBO_TIMEOUT) {
    comboCount = 0;
  }
}

// Check collisions with buses
function checkCollisions(vehicleFeatures) {
  if (!gameActive || !playerPosition) return;
  
  const now = Date.now();
  
  // Clean up respawned buses
  for (const [vehicleId, timestamp] of eatenBuses.entries()) {
    if (now - timestamp > BUS_RESPAWN_TIME) {
      eatenBuses.delete(vehicleId);
    }
  }
  
  for (const vehicle of vehicleFeatures) {
    const vehicleId = vehicle.properties.id;
    
    // Skip already eaten buses that haven't respawned yet
    if (eatenBuses.has(vehicleId)) continue;
    
    const [vLon, vLat] = vehicle.geometry.coordinates;
    const distance = haversineDistance(playerPosition.lat, playerPosition.lon, vLat, vLon);
    
    if (distance < EAT_DISTANCE) {
      eatBus(vehicleId, vehicle.properties);
    }
  }
}

// Eat a bus
function eatBus(vehicleId, vehicleProps) {
  eatenBuses.set(vehicleId, Date.now());
  totalBusesEaten++;
  
  // Update combo
  const now = Date.now();
  if (now - lastEatTime < COMBO_TIMEOUT) {
    comboCount++;
  } else {
    comboCount = 1;
  }
  lastEatTime = now;
  
  // Calculate points
  let points = isPoweredUp ? POINTS_PER_POWERED_BUS : POINTS_PER_BUS;
  if (comboCount > 1) {
    points = Math.floor(points * Math.pow(COMBO_MULTIPLIER, comboCount - 1));
  }
  
  gameScore += points;
  
  // Play sound
  if (comboCount > 1) {
    playComboSound(comboCount);
  } else {
    playEatSound();
  }
  
  // Show eating animation
  showEatingAnimation(vehicleProps.label, points);
  
  // Random chance for power-up (10%)
  if (Math.random() < 0.1 && !isPoweredUp) {
    activatePowerUp();
  }
  
  // Milestone celebrations
  if (totalBusesEaten % 10 === 0) {
    playCelebrationSound();
    showNotification(`🎉 ${totalBusesEaten} BUSES EATEN! You're on fire! 🔥`);
  }
  
  updateGameUI();
}

function activatePowerUp() {
  isPoweredUp = true;
  powerUpEndTime = Date.now() + POWER_UP_DURATION;
  playPowerUpSound();
  showNotification('POWER UP! 🌟 Double points!');
}

function showEatingAnimation(label, points) {
  // Create a floating text element
  const notification = document.createElement('div');
  notification.className = 'game-eat-notification';
  notification.textContent = `+${points} ${label}`;
  if (comboCount > 1) {
    notification.textContent += ` 🔥x${comboCount}`;
  }
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 1500);
  
  // Create particle effects
  createParticles();
}

function createParticles() {
  const colors = ['#FFD700', '#FFA500', '#FF6347', '#00ffff', '#00ff00'];
  const particleCount = 8;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'game-particle';
    particle.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(particle);
    
    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = 100 + Math.random() * 50;
    const duration = 800 + Math.random() * 400;
    
    particle.animate([
      {
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
      },
      {
        transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`,
        opacity: 0
      }
    ], {
      duration: duration,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'game-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 2000);
}

function updateGameUI() {
  const gameUI = document.getElementById('gameUI');
  if (!gameUI) return;
  
  if (!gameActive) {
    gameUI.style.display = 'none';
    return;
  }
  
  gameUI.style.display = 'block';
  
  // Update score
  const scoreEl = document.getElementById('gameScore');
  if (scoreEl) scoreEl.textContent = gameScore.toLocaleString();
  
  // Update lives
  const livesEl = document.getElementById('gameLives');
  if (livesEl) livesEl.textContent = '❤️'.repeat(gameLives);
  
  // Update combo
  const comboEl = document.getElementById('gameCombo');
  if (comboEl) {
    if (comboCount > 1) {
      comboEl.textContent = `🔥 COMBO x${comboCount}!`;
      comboEl.style.display = 'block';
    } else {
      comboEl.style.display = 'none';
    }
  }
  
  // Update power-up indicator
  const powerUpEl = document.getElementById('gamePowerUp');
  if (powerUpEl) {
    if (isPoweredUp) {
      const timeLeft = Math.ceil((powerUpEndTime - Date.now()) / 1000);
      powerUpEl.textContent = `⚡ POWER UP ${timeLeft}s`;
      powerUpEl.style.display = 'block';
    } else {
      powerUpEl.style.display = 'none';
    }
  }
  
  // Update buses eaten count in instructions
  const instructionsEl = document.querySelector('.game-instructions');
  if (instructionsEl && totalBusesEaten > 0) {
    instructionsEl.innerHTML = `
      <div>🚌 Buses Eaten: ${totalBusesEaten}</div>
      <div>Use ← → or A/D keys to change direction</div>
    `;
  }
}

function getPlayerMarkerGeoJSON() {
  if (!gameActive || !playerPosition) return null;
  
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [playerPosition.lon, playerPosition.lat]
    },
    properties: {
      mouthOpen: mouthAnimationFrame,  // Pass frame count for animation
      direction: playerDirection,
      isPoweredUp: isPoweredUp
    }
  };
}

function changePlayerRoute(newRouteId, shapes) {
  if (!shapes[newRouteId]) return;
  
  playerRouteId = newRouteId;
  currentRouteCoords = shapes[newRouteId];
  playerRouteProgress = 0;
  playerDirection = 1;
  
  if (currentRouteCoords.length > 0) {
    playerPosition = {
      lat: currentRouteCoords[0][1],
      lon: currentRouteCoords[0][0]
    };
  }
}

// Keyboard controls
function handleKeyPress(event) {
  if (!gameActive) return;
  
  // Arrow keys or WASD to control direction
  if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
    playerDirection = -1;
  } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
    playerDirection = 1;
  } else if (event.key === ' ' || event.key === 'Spacebar') {
    // Space to jump/teleport to a random nearby route
    event.preventDefault(); // Prevent page scroll
    jumpToRandomRoute();
  }
}

// Jump to a random route (adds variety to gameplay)
function jumpToRandomRoute() {
  if (!gameActive || !window.gameShapesGlobal) return;
  
  const routeIds = Object.keys(window.gameShapesGlobal);
  if (routeIds.length === 0) return;
  
  // Pick a random route different from current
  const otherRoutes = routeIds.filter(id => id !== playerRouteId);
  if (otherRoutes.length === 0) return;
  
  const newRouteId = otherRoutes[Math.floor(Math.random() * otherRoutes.length)];
  changePlayerRoute(newRouteId, window.gameShapesGlobal);
  
  showNotification('🌟 Jumped to new route!');
  playPowerUpSound(); // Reuse power-up sound for jump
}

// Haversine distance (meters) - utility function
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Filter eaten buses from vehicle display
function filterEatenBuses(vehicleFeatures) {
  if (!gameActive || eatenBuses.size === 0) return vehicleFeatures;
  
  return vehicleFeatures.filter(vehicle => {
    const vehicleId = vehicle.properties.id;
    return !eatenBuses.has(vehicleId);
  });
}

// Export game functions
window.BusPacman = {
  startGame,
  stopGame,
  updatePlayerPosition,
  checkCollisions,
  getPlayerMarkerGeoJSON,
  changePlayerRoute,
  handleKeyPress,
  filterEatenBuses,
  isActive: () => gameActive,
  getScore: () => gameScore,
  getLives: () => gameLives,
  isPoweredUp: () => isPoweredUp,
  getBusesEaten: () => totalBusesEaten
};
