// Configuraciones del juego Snake
const GameConfig = {
    // Configuraciones de rendering
    canvas: {
        width: 400,
        height: 400,
        gridSize: 20
    },
    
    // Configuraciones de gameplay
    gameplay: {
        initialSpeed: 150,        // Velocidad inicial en ms
        minSpeed: 80,            // Velocidad máxima (menor número = más rápido)
        speedIncrease: 2,        // Cuánto aumenta la velocidad por comida
        pointsPerFood: 10        // Puntos por cada comida
    },
    
    // Configuraciones visuales
    colors: {
        // Serpiente
        snakeHead: '#00ff41',
        snakeBody: '#00cc33',
        snakeBodyGradient: '#00aa2a',
        
        // Comida
        foodPrimary: '#ffaa00',
        foodSecondary: '#ff6600',
        foodAccent: '#cc4400',
        
        // UI
        background: 'linear-gradient(135deg, #0f3460 0%, #16537e 100%)',
        gameArea: '#000',
        grid: '#333',
        border: '#00ff41',
        text: '#00ff41',
        score: '#ffaa00',
        
        // Efectos
        glow: '#00ff41',
        shadow: 'rgba(0, 255, 65, 0.5)'
    },
    
    // Configuraciones de audio
    audio: {
        volume: 0.3,
        enabled: true
    },
    
    // Configuraciones de input
    controls: {
        pauseKey: ' ',
        startKey: ' ',
        upKey: 'ArrowUp',
        downKey: 'ArrowDown',
        leftKey: 'ArrowLeft',
        rightKey: 'ArrowRight'
    },
    
    // Configuraciones de storage
    storage: {
        highScoreKey: 'snakeHighScore',
        settingsKey: 'snakeSettings'
    },
    
    // Easter eggs
    konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
    
    // Configuraciones responsivas
    responsive: {
        mobileBreakpoint: 600,
        smallMobileBreakpoint: 400,
        mobileCanvasSize: 350,
        smallMobileCanvasSize: 300
    }
};

// Configuraciones específicas por dificultad
const DifficultySettings = {
    easy: {
        initialSpeed: 200,
        minSpeed: 120,
        speedIncrease: 1
    },
    normal: {
        initialSpeed: 150,
        minSpeed: 80,
        speedIncrease: 2
    },
    hard: {
        initialSpeed: 100,
        minSpeed: 60,
        speedIncrease: 3
    },
    insane: {
        initialSpeed: 80,
        minSpeed: 40,
        speedIncrease: 4
    }
};

// Temas de color alternativos
const ColorThemes = {
    classic: {
        name: 'Clásico',
        snake: '#00ff41',
        food: '#ffaa00',
        background: 'linear-gradient(135deg, #0f3460 0%, #16537e 100%)'
    },
    ocean: {
        name: 'Océano',
        snake: '#00d4ff',
        food: '#ff6b35',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    },
    sunset: {
        name: 'Atardecer',
        snake: '#ff6b35',
        food: '#f7931e',
        background: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)'
    },
    forest: {
        name: 'Bosque',
        snake: '#32cd32',
        food: '#ff4500',
        background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
    }
};

// Exportar configuraciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameConfig, DifficultySettings, ColorThemes };
} else {
    window.GameConfig = GameConfig;
    window.DifficultySettings = DifficultySettings;
    window.ColorThemes = ColorThemes;
}
