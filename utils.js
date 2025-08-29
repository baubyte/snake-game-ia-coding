// Utilidades para el juego Snake
class GameUtils {
    // Generar posición aleatoria en la grid
    static getRandomPosition(gridWidth, gridHeight) {
        return {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
    }
    
    // Verificar si dos posiciones son iguales
    static positionsEqual(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    
    // Verificar si una posición está dentro de un array de posiciones
    static positionInArray(position, array) {
        return array.some(item => this.positionsEqual(position, item));
    }
    
    // Calcular distancia entre dos puntos
    static distance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Interpolar entre dos valores
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Clamp un valor entre min y max
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Convertir HSL a RGB
    static hslToRgb(h, s, l) {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Generar color arcoiris basado en el tiempo
    static getRainbowColor(time) {
        const hue = (time * 0.1) % 360;
        return this.hslToRgb(hue, 1, 0.5);
    }
    
    // Formatear puntuación con ceros a la izquierda
    static formatScore(score, digits = 6) {
        return score.toString().padStart(digits, '0');
    }
    
    // Detectar si es dispositivo móvil
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Detectar si es pantalla táctil
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // Crear vibración en dispositivos móviles
    static vibrate(duration = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Guardar datos en localStorage con manejo de errores
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Error al guardar en localStorage:', error);
            return false;
        }
    }
    
    // Cargar datos de localStorage con manejo de errores
    static loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error al cargar de localStorage:', error);
            return defaultValue;
        }
    }
    
    // Generar ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Debounce para optimizar eventos
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle para optimizar eventos
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Calcular FPS
    static createFPSCounter() {
        let frames = 0;
        let lastTime = performance.now();
        let fps = 0;
        
        return function() {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
            }
            
            return fps;
        };
    }
}

// Clase para manejar animaciones suaves
class AnimationManager {
    constructor() {
        this.animations = new Map();
    }
    
    // Crear una nueva animación
    animate(id, from, to, duration, easing = 'easeInOut', callback = null) {
        const animation = {
            id,
            startTime: performance.now(),
            duration,
            from,
            to,
            easing,
            callback
        };
        
        this.animations.set(id, animation);
    }
    
    // Actualizar todas las animaciones
    update(currentTime) {
        for (const [id, animation] of this.animations) {
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            // Aplicar easing
            const easedProgress = this.applyEasing(progress, animation.easing);
            
            // Calcular valor actual
            const currentValue = GameUtils.lerp(animation.from, animation.to, easedProgress);
            
            // Ejecutar callback
            if (animation.callback) {
                animation.callback(currentValue, progress);
            }
            
            // Remover animación si está completa
            if (progress >= 1) {
                this.animations.delete(id);
            }
        }
    }
    
    // Aplicar diferentes tipos de easing
    applyEasing(t, type) {
        switch (type) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'bounce':
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) {
                    return n1 * t * t;
                } else if (t < 2 / d1) {
                    return n1 * (t -= 1.5 / d1) * t + 0.75;
                } else if (t < 2.5 / d1) {
                    return n1 * (t -= 2.25 / d1) * t + 0.9375;
                } else {
                    return n1 * (t -= 2.625 / d1) * t + 0.984375;
                }
            default:
                return t;
        }
    }
    
    // Detener una animación
    stop(id) {
        this.animations.delete(id);
    }
    
    // Detener todas las animaciones
    stopAll() {
        this.animations.clear();
    }
}

// Exportar utilidades
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameUtils, AnimationManager };
} else {
    window.GameUtils = GameUtils;
    window.AnimationManager = AnimationManager;
}
