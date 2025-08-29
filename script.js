class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score-value');
        this.highScoreElement = document.getElementById('high-score-value');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameOverScreen = document.getElementById('game-over');
        this.startScreen = document.getElementById('start-screen');
        this.restartBtn = document.getElementById('restart-btn');
        
        // Sistema de audio
        this.audioSystem = new AudioSystem();
        
        // Configuración del juego
        this.gridSize = 20;
        this.gridWidth = this.canvas.width / this.gridSize;
        this.gridHeight = this.canvas.height / this.gridSize;
        
        // Estado del juego
        this.gameRunning = false;
        this.gameStarted = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        
        // Serpiente
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Comida
        this.food = {};
        
        // Configuración de velocidad
        this.gameSpeed = 150;
        this.lastRenderTime = 0;
        
        this.init();
    }
    
    init() {
        this.highScoreElement.textContent = this.highScore;
        this.setupEventListeners();
        this.showStartScreen();

        // Mostrar controles móviles si es touch
        this.mobileControls = document.getElementById('mobile-controls');
        if (this.isTouchDevice()) {
            this.mobileControls.classList.remove('hidden');
            this.setupMobileControls();
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // Prevenir scroll con flechas
        window.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    setupMobileControls() {
        document.getElementById('btn-up').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileDirection('up');
        });
        document.getElementById('btn-down').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileDirection('down');
        });
        document.getElementById('btn-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileDirection('left');
        });
        document.getElementById('btn-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileDirection('right');
        });
        document.getElementById('btn-pause').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameStarted) {
                this.startGame();
            } else {
                this.togglePause();
            }
        });
    }

    handleMobileDirection(dir) {
        if (!this.gameRunning) return;
        switch(dir) {
            case 'up':
                if (this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'down':
                if (this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'left':
                if (this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'right':
                if (this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    handleKeyPress(e) {
        if (!this.gameStarted && e.key === ' ') {
            this.startGame();
            return;
        }
        
        if (!this.gameRunning) return;
        
        if (e.key === ' ') {
            this.togglePause();
            return;
        }
        
        // Controles de dirección
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        
        // Reproducir sonido de inicio
        this.audioSystem.play('start');
        
        // Inicializar serpiente
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        this.generateFood();
        this.hideAllScreens();
        this.gameLoop();
    }
    
    restartGame() {
        this.gameStarted = false;
        this.gameRunning = false;
        this.gamePaused = false;
        this.hideAllScreens();
        this.showStartScreen();
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    gameLoop(currentTime = 0) {
        if (!this.gameRunning || this.gamePaused) return;
        
        if (currentTime - this.lastRenderTime >= this.gameSpeed) {
            this.update();
            this.render();
            this.lastRenderTime = currentTime;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Actualizar dirección
        this.direction = { ...this.nextDirection };
        
        // Mover serpiente
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Verificar colisiones con paredes
        if (head.x < 0 || head.x >= this.gridWidth || 
            head.y < 0 || head.y >= this.gridHeight) {
            this.gameOver();
            return;
        }
        
        // Verificar colisión con cuerpo
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Verificar si come comida
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.generateFood();
            
            // Reproducir sonido de comer
            this.audioSystem.play('eat');
            
            // Aumentar velocidad gradualmente
            if (this.gameSpeed > 80) {
                this.gameSpeed -= 2;
            }
        } else {
            this.snake.pop();
        }
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y
        ));
    }
    
    render() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar grid sutil
        this.drawGrid();
        
        // Dibujar serpiente
        this.drawSnake();
        
        // Dibujar comida
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Cabeza de la serpiente
                this.ctx.fillStyle = '#00ff41';
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
                
                // Efectos de brillo en la cabeza
                this.ctx.shadowColor = '#00ff41';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
                this.ctx.shadowBlur = 0;
                
                // Ojos
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(x + 4, y + 4, 3, 3);
                this.ctx.fillRect(x + 13, y + 4, 3, 3);
            } else {
                // Cuerpo de la serpiente
                const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                gradient.addColorStop(0, '#00cc33');
                gradient.addColorStop(1, '#00aa2a');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Borde del cuerpo
                this.ctx.strokeStyle = '#00ff41';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        });
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Comida con efecto de brillo
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize / 2, y + this.gridSize / 2, 2,
            x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2
        );
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(0.7, '#ff6600');
        gradient.addColorStop(1, '#cc4400');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        
        // Efecto de brillo
        this.ctx.shadowColor = '#ffaa00';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(x + 4, y + 4, this.gridSize - 8, this.gridSize - 8);
        this.ctx.shadowBlur = 0;
        
        // Pequeño punto brillante
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 6, y + 6, 2, 2);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gameStarted = false;
        
        // Reproducir sonido de game over
        this.audioSystem.play('gameOver');
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
        
        this.finalScoreElement.textContent = this.score;
        this.showGameOverScreen();
    }
    
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
    }
    
    showGameOverScreen() {
        this.gameOverScreen.classList.remove('hidden');
    }
    
    hideAllScreens() {
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }
}

// Efectos de partículas para mayor ambiente retro
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
    }
    
    createExplosion(x, y, color = '#ffaa00') {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                maxLife: 30,
                color: color
            });
        }
    }
    
    update() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    render() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 2, 2);
            this.ctx.restore();
        });
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // Easter egg: código Konami mejorado
    let konamiCode = [];
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    let easterEggActive = false;
    
    // Crear elemento de feedback visual para el easter egg
    const createKonamiIndicator = () => {
        const indicator = document.createElement('div');
        indicator.id = 'konami-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 255, 65, 0.9);
            color: #000;
            padding: 5px 10px;
            border-radius: 5px;
            font-family: 'Press Start 2P', cursive;
            font-size: 8px;
            z-index: 1000;
            display: none;
            box-shadow: 0 0 10px #00ff41;
        `;
        indicator.textContent = 'CÓDIGO KONAMI DETECTADO!';
        document.body.appendChild(indicator);
        return indicator;
    };
    
    const konamiIndicator = createKonamiIndicator();
    
    // Función para mostrar efectos especiales del easter egg
    const activateKonamiEffects = () => {
        if (easterEggActive) return; // Evitar múltiples activaciones
        
        easterEggActive = true;
        console.log('🎉 ¡CÓDIGO KONAMI ACTIVADO! 🎉');
        
        // Mostrar indicador
        konamiIndicator.style.display = 'block';
        
        // Cambiar fondo con animación
        document.body.style.transition = 'background 1s ease';
        document.body.style.background = 'linear-gradient(45deg, #ff6b35, #f7931e, #ffaa00, #32cd32, #00d4ff)';
        document.body.style.backgroundSize = '300% 300%';
        document.body.style.animation = 'konamiGradient 2s ease infinite';
        
        // Hacer que el título parpadee más rápido
        const title = document.querySelector('.game-title');
        if (title) {
            title.style.animation = 'glow 0.5s ease-in-out infinite';
        }
        
        // Cambiar colores del juego temporalmente
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.borderColor = '#ff6b35';
            gameContainer.style.boxShadow = '0 0 20px #ff6b35, inset 0 0 20px rgba(255, 107, 53, 0.1)';
        }
        
        // Reproducir sonido especial si el sistema de audio está disponible
        if (game.audioSystem && game.audioSystem.audioContext) {
            game.audioSystem.play('start');
            setTimeout(() => game.audioSystem.play('eat'), 200);
            setTimeout(() => game.audioSystem.play('start'), 400);
        }
        
        // Vibración en dispositivos móviles
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
        
        // Restaurar después de 5 segundos
        setTimeout(() => {
            // Ocultar indicador
            konamiIndicator.style.display = 'none';
            
            // Restaurar fondo original
            document.body.style.transition = 'background 1s ease';
            document.body.style.background = 'linear-gradient(135deg, #0f3460 0%, #16537e 100%)';
            document.body.style.backgroundSize = 'initial';
            document.body.style.animation = 'none';
            
            // Restaurar animación del título
            if (title) {
                title.style.animation = 'glow 2s ease-in-out infinite';
            }
            
            // Restaurar colores del contenedor
            if (gameContainer) {
                gameContainer.style.borderColor = '#00ff41';
                gameContainer.style.boxShadow = '0 0 20px #00ff41, inset 0 0 20px rgba(0, 255, 65, 0.1)';
            }
            
            easterEggActive = false;
            console.log('✨ Efectos del código Konami restaurados');
        }, 5000);
    };
    
    // Event listener para el código Konami
    document.addEventListener('keydown', (e) => {
        // Solo capturar el código Konami cuando no estemos jugando activamente
        if (!game.gameRunning || game.gamePaused) {
            konamiCode.push(e.key);
            
            // Mantener solo las últimas 8 teclas
            if (konamiCode.length > konami.length) {
                konamiCode.shift();
            }
            
            // Debug para ayudar al usuario
            console.log(`Tecla presionada: ${e.key}, Secuencia actual: [${konamiCode.join(', ')}]`);
            console.log(`Código objetivo: [${konami.join(', ')}]`);
            
            // Verificar si coincide con el código Konami
            if (konamiCode.length === konami.length && 
                konamiCode.every((key, index) => key === konami[index])) {
                activateKonamiEffects();
                konamiCode = []; // Resetear
            }
        }
    });
    
    // Agregar CSS para la animación del gradiente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes konamiGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
    document.head.appendChild(style);
});
