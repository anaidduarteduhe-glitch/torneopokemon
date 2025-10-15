// SISTEMA DE NOTIFICACIONES INTEGRADO - VERSIÓN MEJORADA
class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
        this.injectStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }

    injectStyles() {
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification {
                    animation: slideInRight 0.3s ease;
                    transition: all 0.3s ease;
                }
                .notification.hiding {
                    animation: slideOutRight 0.3s ease;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                }
                .notification-icon {
                    font-size: 1.2em;
                    flex-shrink: 0;
                }
                .notification-message {
                    flex: 1;
                    font-size: 0.9em;
                    word-wrap: break-word;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.2em;
                    padding: 0;
                    margin-left: 10px;
                    flex-shrink: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(message, type = 'info', duration = 4000) {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        const notification = this.createNotification(message, type, theme);
        this.container.appendChild(notification);

        const timer = setTimeout(() => {
            this.hide(notification);
        }, duration);

        notification.dataset.timer = timer;
        return notification;
    }

    createNotification(message, type, theme) {
        const typeConfig = {
            success: { background: '#10b981', icon: '✅' },
            error: { background: '#ef4444', icon: '❌' },
            warning: { background: '#f59e0b', icon: '⚠️' },
            info: { background: theme.primaryColor, icon: '💡' }
        };
        
        const config = typeConfig[type] || typeConfig.info;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            background: ${config.background};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${config.icon}</span>
                <span class="notification-message">${this.escapeHtml(message)}</span>
                <button class="notification-close" onclick="NotificationSystem.hide(this.parentElement.parentElement)">
                    ×
                </button>
            </div>
        `;

        return notification;
    }

    hide(notification) {
        if (!notification || !notification.parentElement) return;

        if (notification.dataset.timer) {
            clearTimeout(notification.dataset.timer);
        }

        notification.classList.add('hiding');
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static show(message, type = 'info', duration = 4000) {
        if (!window._notificationManager) {
            window._notificationManager = new NotificationManager();
        }
        return window._notificationManager.show(message, type, duration);
    }

    static hide(notification) {
        if (window._notificationManager) {
            window._notificationManager.hide(notification);
        }
    }
}

// Reemplazar el sistema original
const NotificationSystem = NotificationManager;

// SISTEMA DE CONFIRMACIÓN INTEGRADO - VERSIÓN MEJORADA
class ConfirmationManager {
    constructor() {
        this.modal = null;
    }

    show(message, onConfirm, onCancel = null, options = {}) {
        this.closeExisting();

        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        const {
            title = 'Confirmar acción',
            confirmText = 'Aceptar',
            cancelText = 'Cancelar',
            type = 'warning'
        } = options;

        this.modal = document.createElement('div');
        this.modal.innerHTML = this.getModalTemplate(message, theme, title, confirmText, cancelText, type);
        document.body.appendChild(this.modal);

        this.setupEventListeners(onConfirm, onCancel);
        this.setupEscapeListener(onCancel);
    }

    getModalTemplate(message, theme, title, confirmText, cancelText, type) {
        const icons = {
            warning: '⚠️',
            danger: '❌',
            info: '💡',
            success: '✅'
        };

        return `
            <div class="confirmation-overlay" style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0,0,0,0.7); 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                z-index: 2000;
            ">
                <div class="confirmation-modal" style="
                    background: ${theme.cardBackground}; 
                    padding: 25px; 
                    border-radius: 16px; 
                    width: 90%; 
                    max-width: 400px; 
                    border: 1px solid ${theme.borderColor}; 
                    backdrop-filter: blur(10px); 
                    text-align: center;
                ">
                    <div class="confirmation-icon" style="font-size: 2em; margin-bottom: 15px;">
                        ${icons[type] || icons.warning}
                    </div>
                    <h3 class="confirmation-title" style="color: ${theme.textColor}; margin-bottom: 15px; font-size: 1.2em;">
                        ${title}
                    </h3>
                    <p class="confirmation-message" style="color: ${theme.secondaryColor}; margin-bottom: 25px; line-height: 1.5;">
                        ${message}
                    </p>
                    <div class="confirmation-actions" style="display: flex; gap: 10px; justify-content: center;">
                        <button class="confirmation-cancel" style="
                            padding: 10px 20px; 
                            background: ${theme.secondaryColor}; 
                            color: white; 
                            border: none; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: 500; 
                            flex: 1;
                        ">${cancelText}</button>
                        <button class="confirmation-confirm" style="
                            padding: 10px 20px; 
                            background: ${type === 'danger' ? '#ef4444' : '#10b981'}; 
                            color: white; 
                            border: none; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: 500; 
                            flex: 1;
                        ">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners(onConfirm, onCancel) {
        const confirmBtn = this.modal.querySelector('.confirmation-confirm');
        const cancelBtn = this.modal.querySelector('.confirmation-cancel');
        const overlay = this.modal.querySelector('.confirmation-overlay');

        const closeModal = () => {
            if (this.modal && this.modal.parentElement) {
                this.modal.remove();
                this.modal = null;
            }
        };

        confirmBtn.addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                if (onCancel) onCancel();
            }
        });
    }

    setupEscapeListener(onCancel) {
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                if (this.modal && this.modal.parentElement) {
                    this.modal.remove();
                    this.modal = null;
                    if (onCancel) onCancel();
                }
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    closeExisting() {
        const existingModal = document.querySelector('.confirmation-overlay');
        if (existingModal) {
            existingModal.remove();
        }
    }

    static show(message, onConfirm, onCancel = null, options = {}) {
        if (!window._confirmationManager) {
            window._confirmationManager = new ConfirmationManager();
        }
        window._confirmationManager.show(message, onConfirm, onCancel, options);
    }
}

// Reemplazar el sistema original
const ConfirmationSystem = ConfirmationManager;

// SISTEMA DE INPUT INTEGRADO - VERSIÓN MEJORADA
class InputManager {
    constructor() {
        this.modal = null;
    }

    show(title, placeholder = '', type = 'text', onConfirm, onCancel = null, options = {}) {
        this.closeExisting();

        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        const {
            defaultValue = '',
            required = false,
            validation = null
        } = options;

        this.modal = document.createElement('div');
        this.modal.innerHTML = this.getModalTemplate(title, placeholder, type, theme, defaultValue);
        document.body.appendChild(this.modal);

        this.setupEventListeners(onConfirm, onCancel, validation, required);
        this.setupEscapeListener(onCancel);
        this.focusInput();
    }

    getModalTemplate(title, placeholder, type, theme, defaultValue) {
        return `
            <div class="input-overlay" style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0,0,0,0.7); 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                z-index: 2000;
            ">
                <div class="input-modal" style="
                    background: ${theme.cardBackground}; 
                    padding: 25px; 
                    border-radius: 16px; 
                    width: 90%; 
                    max-width: 400px; 
                    border: 1px solid ${theme.borderColor}; 
                    backdrop-filter: blur(10px);
                ">
                    <h3 class="input-title" style="color: ${theme.textColor}; margin-bottom: 15px; font-size: 1.2em; text-align: center;">
                        ${title}
                    </h3>
                    <input type="${type}" 
                           class="input-field" 
                           placeholder="${placeholder}"
                           value="${defaultValue}"
                           style="
                               width: 100%; 
                               padding: 12px; 
                               background: rgba(15, 23, 42, 0.6); 
                               border: 1px solid ${theme.borderColor}; 
                               border-radius: 8px; 
                               color: ${theme.textColor}; 
                               margin-bottom: 20px; 
                               font-size: 1em;
                               box-sizing: border-box;
                           ">
                    <div class="input-actions" style="display: flex; gap: 10px;">
                        <button class="input-cancel" style="
                            padding: 10px 20px; 
                            background: ${theme.secondaryColor}; 
                            color: white; 
                            border: none; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: 500; 
                            flex: 1;
                        ">Cancelar</button>
                        <button class="input-confirm" style="
                            padding: 10px 20px; 
                            background: ${theme.primaryColor}; 
                            color: white; 
                            border: none; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: 500; 
                            flex: 1;
                        ">Aceptar</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners(onConfirm, onCancel, validation, required) {
        const confirmBtn = this.modal.querySelector('.input-confirm');
        const cancelBtn = this.modal.querySelector('.input-cancel');
        const inputField = this.modal.querySelector('.input-field');
        const overlay = this.modal.querySelector('.input-overlay');

        const closeModal = () => {
            if (this.modal && this.modal.parentElement) {
                this.modal.remove();
                this.modal = null;
            }
        };

        const handleConfirm = () => {
            const value = inputField.value.trim();
            
            if (required && !value) {
                NotificationSystem.show('Este campo es requerido', 'error');
                return;
            }

            if (validation && !validation(value)) {
                return;
            }

            closeModal();
            if (onConfirm) onConfirm(value);
        };

        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            }
        });

        confirmBtn.addEventListener('click', handleConfirm);

        cancelBtn.addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                if (onCancel) onCancel();
            }
        });
    }

    setupEscapeListener(onCancel) {
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                if (this.modal && this.modal.parentElement) {
                    this.modal.remove();
                    this.modal = null;
                    if (onCancel) onCancel();
                }
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    focusInput() {
        setTimeout(() => {
            const input = this.modal.querySelector('.input-field');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }

    closeExisting() {
        const existingModal = document.querySelector('.input-overlay');
        if (existingModal) {
            existingModal.remove();
        }
    }

    static show(title, placeholder = '', type = 'text', onConfirm, onCancel = null, options = {}) {
        if (!window._inputManager) {
            window._inputManager = new InputManager();
        }
        window._inputManager.show(title, placeholder, type, onConfirm, onCancel, options);
    }
}

// Reemplazar el sistema original
const InputSystem = InputManager;

// SISTEMA DE TEMAS MEJORADO CON SWITCH
const ThemeSystem = {
    themes: {
        'azul-oscuro': {
            name: 'Noche Pokémon',
            icon: '🌙',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            cardBackground: 'rgba(30, 41, 59, 0.8)',
            textColor: '#f1f5f9',
            primaryColor: '#60a5fa',
            secondaryColor: '#94a3b8',
            borderColor: 'rgba(148, 163, 184, 0.3)',
            buttonText: 'Modo Claro',
            switchBackground: 'linear-gradient(135deg, #1e293b, #334155)',
            switchHandle: '#60a5fa',
            menuBackground: 'rgba(30, 41, 59, 0.95)',
            menuHover: 'rgba(51, 65, 85, 0.6)'
        },
        'azul-claro': {
            name: 'Día Pokémon',
            icon: '☀️',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            cardBackground: 'rgba(255, 255, 255, 0.9)',
            textColor: '#0f172a',
            primaryColor: '#0369a1',
            secondaryColor: '#475569',
            borderColor: 'rgba(148, 163, 184, 0.4)',
            buttonText: 'Modo Oscuro',
            switchBackground: 'linear-gradient(135deg, #bae6fd, #7dd3fc)',
            switchHandle: '#0369a1',
            menuBackground: 'rgba(255, 255, 255, 0.95)',
            menuHover: 'rgba(226, 232, 240, 0.8)'
        },
        'pokemon-rojo': {
            name: 'Pokémon Rojo',
            icon: '🔴',
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
            cardBackground: 'rgba(255, 255, 255, 0.9)',
            textColor: '#1f2937',
            primaryColor: '#dc2626',
            secondaryColor: '#7f1d1d',
            borderColor: 'rgba(220, 38, 38, 0.3)',
            buttonText: 'Cambiar Tema',
            switchBackground: 'linear-gradient(135deg, #ef4444, #f87171)',
            switchHandle: '#dc2626',
            menuBackground: 'rgba(255, 255, 255, 0.95)',
            menuHover: 'rgba(254, 226, 226, 0.8)'
        },
        'pokemon-azul': {
            name: 'Pokémon Azul',
            icon: '🔵',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
            cardBackground: 'rgba(255, 255, 255, 0.9)',
            textColor: '#1f2937',
            primaryColor: '#1d4ed8',
            secondaryColor: '#1e3a8a',
            borderColor: 'rgba(29, 78, 216, 0.3)',
            buttonText: 'Cambiar Tema',
            switchBackground: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            switchHandle: '#1d4ed8',
            menuBackground: 'rgba(255, 255, 255, 0.95)',
            menuHover: 'rgba(219, 234, 254, 0.8)'
        }
    },

    get currentTheme() {
        return localStorage.getItem('pokemonTheme') || 'azul-oscuro';
    },

    set currentTheme(value) {
        localStorage.setItem('pokemonTheme', value);
    },

    applyTheme() {
        const theme = this.themes[this.currentTheme];
        const { background, textColor } = theme;
        
        Object.assign(document.body.style, {
            background,
            color: textColor,
            minHeight: '100vh',
            margin: '0',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            transition: 'all 0.4s ease-in-out'
        });
    },

    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.currentTheme = themes[nextIndex];
        this.applyTheme();
        this.reloadCurrentPage();
    },

    getThemeSwitch() {
        const theme = this.themes[this.currentTheme];
        const currentIndex = Object.keys(this.themes).indexOf(this.currentTheme);
        const totalThemes = Object.keys(this.themes).length;
        
        return `
            <div onclick="ThemeSystem.toggleTheme()" 
                 style="display: flex; align-items: center; gap: 12px; background: ${theme.cardBackground}; padding: 8px 16px; border-radius: 25px; border: 1px solid ${theme.borderColor}; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <span style="font-size: 1.1em;">${theme.icon}</span>
                
                <div style="position: relative; width: 50px; height: 26px; background: ${theme.switchBackground}; border-radius: 25px; border: 2px solid ${theme.borderColor};">
                    <div style="position: absolute; top: 2px; left: ${(currentIndex / (totalThemes - 1)) * 28 + 2}px; width: 18px; height: 18px; background: ${theme.switchHandle}; border-radius: 50%; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                    </div>
                </div>
                
                <span style="font-size: 0.9em; color: ${theme.textColor}; font-weight: 500; min-width: 80px;">${theme.buttonText}</span>
            </div>
        `;
    },

    reloadCurrentPage() {
        if (currentUser && window.showTorneosPage) showTorneosPage();
        else if (torneoActual && window.showCalendarPage) showCalendarPage();
        else if (torneoActual && window.showResultadosPage) showResultadosPage();
        else if (torneoActual && window.showPlayoffsPage) showPlayoffsPage();
        else showMainPage();
    }
};

// SISTEMA DE CALENDARIO MEJORADO - ALINEADO CON EXCEL
const CalendarSystem = {
    generarCalendarioDesdeExcel(torneo) {
        const jornadas = [];
        
        // Jornada 1
        jornadas.push({
            numero: "Jornada 1",
            partidos: [
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                
            ]
        });

        // Jornada 2
        jornadas.push({
            numero: "Jornada 2",
            partidos: [

                 this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
            ]
        });

        // Jornada 3
        jornadas.push({
            numero: "Jornada 3",
            partidos: [
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
            ]
        });

        // Jornada 4
        jornadas.push({
            numero: "Jornada 4",
            partidos: [

                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
            ]
        });

        // Jornada 5
        jornadas.push({
            numero: "Jornada 5",
            partidos: [
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),
                this.crearPartidoDesdeExcel("?", "?"),

            ]
        });

        return jornadas;
    },

    crearPartidoDesdeExcel(local, visitante) {
        return {
            id: Date.now() + Math.random(),
            local: this.normalizarNombre(local),
            marcadorLocal: 0,
            visitante: this.normalizarNombre(visitante),
            marcadorVisitante: 0,
            ganador: "Por jugar"
        };
    },

    }

// SISTEMA DE RESULTADOS MEJORADO - SIN DECIMALES EN PUNTOS
const ResultSystem = {
    procesarResultadosDesdeExcel(torneo) {
        const resultados = {};
        
        // Inicializar estadísticas para todos los jugadores
        Object.keys(UserSystem.users).forEach(jugador => {
            resultados[jugador] = this.getEstadisticasIniciales();
        });

        // Procesar partidos existentes en el torneo
        torneo.jornadas.forEach(jornada => {
            jornada.partidos.forEach(partido => {
                this.aplicarLogicaExcel(partido, resultados);
            });
        });

        return resultados;
    },

    aplicarLogicaExcel(partido, resultados) {
        const { local, visitante, marcadorLocal, marcadorVisitante } = partido;
        
        // Lógica especial para 0.1 - EN ESTADÍSTICAS SE TOMA COMO 1 EN AMBAS COLUMNAS
        if (marcadorLocal === 0.1) {
            // Local pierde (0.1), Visitante gana
            resultados[local].partidosJugados++;
            resultados[local].partidosPerdidos++;
            resultados[local].puntosFavor += 1; // 0.1 se convierte en 1
            resultados[local].puntosContra += 1; // También 1 en contra
            resultados[local].diferenciaPuntos -= 1; // -1 para el perdedor

            resultados[visitante].partidosJugados++;
            resultados[visitante].partidosGanados++;
            resultados[visitante].puntosFavor += 1; // 1 a favor
            resultados[visitante].puntosContra += 1; // 0.1 se convierte en 1
            resultados[visitante].diferenciaPuntos += 1; // +1 para el ganador
        } 
        else if (marcadorVisitante === 0.1) {
            // Visitante pierde (0.1), Local gana
            resultados[local].partidosJugados++;
            resultados[local].partidosGanados++;
            resultados[local].puntosFavor += 1; // 1 a favor
            resultados[local].puntosContra += 1; // 0.1 se convierte en 1
            resultados[local].diferenciaPuntos += 1; // +1 para el ganador

            resultados[visitante].partidosJugados++;
            resultados[visitante].partidosPerdidos++;
            resultados[visitante].puntosFavor += 1; // 0.1 se convierte en 1
            resultados[visitante].puntosContra += 1; // También 1 en contra
            resultados[visitante].diferenciaPuntos -= 1; // -1 para el perdedor
        }
        // Lógica normal para partidos jugados
        else if (marcadorLocal > 0 || marcadorVisitante > 0) {
            resultados[local].partidosJugados++;
            resultados[visitante].partidosJugados++;

            // Para partidos normales, usar los valores reales (sin decimales)
            resultados[local].puntosFavor += Math.round(marcadorLocal);
            resultados[local].puntosContra += Math.round(marcadorVisitante);
            
            resultados[visitante].puntosFavor += Math.round(marcadorVisitante);
            resultados[visitante].puntosContra += Math.round(marcadorLocal);

            if (marcadorLocal > marcadorVisitante) {
                resultados[local].partidosGanados++;
                resultados[visitante].partidosPerdidos++;
                resultados[local].diferenciaPuntos += 1;
                resultados[visitante].diferenciaPuntos -= 1;
            } else if (marcadorVisitante > marcadorLocal) {
                resultados[visitante].partidosGanados++;
                resultados[local].partidosPerdidos++;
                resultados[visitante].diferenciaPuntos += 1;
                resultados[local].diferenciaPuntos -= 1;
            } else {
                resultados[local].partidosEmpatados++;
                resultados[visitante].partidosEmpatados++;
                // En empates normales, no se modifica la diferencia
            }
        }
    },

    getEstadisticasIniciales() {
        return {
            partidosJugados: 0,
            partidosGanados: 0,
            partidosPerdidos: 0,
            partidosEmpatados: 0,
            puntosFavor: 0,
            puntosContra: 0,
            diferenciaPuntos: 0
        };
    },

    // NUEVO MÉTODO: Validar y procesar marcadores especiales
    procesarMarcadorEspecial(marcador) {
        if (marcador === 0.1 || marcador === '0.1') {
            return {
                valorVisual: '0.1',
                valorEstadisticas: 1,
                esDerrotaIncomparecencia: true
            };
        }
        return {
            valorVisual: marcador,
            valorEstadisticas: Math.round(parseFloat(marcador) || 0), // SIN DECIMALES
            esDerrotaIncomparecencia: false
        };
    },

    // NUEVO MÉTODO: Calcular estadísticas avanzadas
    calcularEstadisticasAvanzadas(resultados) {
        Object.keys(resultados).forEach(jugador => {
            const stats = resultados[jugador];
            
            // Asegurar que los puntos sean números enteros
            stats.puntosFavor = Math.round(stats.puntosFavor);
            stats.puntosContra = Math.round(stats.puntosContra);
            
            // Calcular porcentaje de victorias
            stats.porcentajeVictorias = stats.partidosJugados > 0 
                ? ((stats.partidosGanados / stats.partidosJugados) * 100).toFixed(1)
                : 0;
            
            // Calcular promedio de puntos por partido (estos SÍ pueden tener decimales)
            stats.promedioFavor = stats.partidosJugados > 0 
                ? (stats.puntosFavor / stats.partidosJugados).toFixed(1)
                : 0;
                
            stats.promedioContra = stats.partidosJugados > 0 
                ? (stats.puntosContra / stats.partidosJugados).toFixed(1)
                : 0;
        });
        
        return resultados;
    }
};

// SISTEMA DE FONDOS PERSONALIZADOS PARA TORNEOS
const TournamentBackgrounds = {
    backgrounds: JSON.parse(localStorage.getItem('pokemonCustomBackgrounds')) || {
        'default': {
            name: 'Fondo Predeterminado',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
            thumbnail: '🎨',
            type: 'default'
        },
        'fire': {
            name: 'Fuego Pokémon',
            background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)',
            thumbnail: '🔥',
            type: 'default'
        },
        'water': {
            name: 'Agua Pokémon',
            background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #22d3ee 100%)',
            thumbnail: '💧',
            type: 'default'
        }
    },

    getTorneoBackground(torneoId) {
        const savedBackgrounds = JSON.parse(localStorage.getItem('pokemonTorneoBackgrounds')) || {};
        return savedBackgrounds[torneoId] || this.backgrounds.default.background;
    },

    setTorneoBackground(torneoId, backgroundKey) {
        const savedBackgrounds = JSON.parse(localStorage.getItem('pokemonTorneoBackgrounds')) || {};
        savedBackgrounds[torneoId] = this.backgrounds[backgroundKey].background;
        localStorage.setItem('pokemonTorneoBackgrounds', JSON.stringify(savedBackgrounds));
    },

    addCustomBackground(name, imageData) {
        const backgroundId = 'custom_' + Date.now();
        this.backgrounds[backgroundId] = {
            name: name,
            background: `url('${imageData}') center/cover`,
            thumbnail: '🖼️',
            type: 'custom'
        };
        localStorage.setItem('pokemonCustomBackgrounds', JSON.stringify(this.backgrounds));
        return backgroundId;
    },

    removeCustomBackground(backgroundId) {
        if (this.backgrounds[backgroundId] && this.backgrounds[backgroundId].type === 'custom') {
            delete this.backgrounds[backgroundId];
            localStorage.setItem('pokemonCustomBackgrounds', JSON.stringify(this.backgrounds));
            return true;
        }
        return false;
    },

    getBackgroundSelectorHTML(torneoId = null) {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        const defaultBackgrounds = Object.entries(this.backgrounds).filter(([key, bg]) => bg.type === 'default');
        const customBackgrounds = Object.entries(this.backgrounds).filter(([key, bg]) => bg.type === 'custom');
        
        return `
            <div style="margin-top: 15px;">
                <h4 style="color: ${theme.primaryColor}; margin-bottom: 12px; font-size: 1em;">Seleccionar Fondo del Torneo</h4>
                
                ${UserSystem.isAdmin || UserSystem.isMaestro ? `
                    <!-- SUBIR FONDO PERSONALIZADO -->
                    <div style="margin-bottom: 15px; padding: 12px; background: rgba(100, 116, 139, 0.1); border-radius: 8px; border: 1px dashed ${theme.borderColor};">
                        <h5 style="color: ${theme.textColor}; margin-bottom: 8px; font-size: 0.9em;"> Subir Fondo Personalizado</h5>
                        <input type="file" id="customBackgroundInput" accept="image/*" 
                               style="margin-bottom: 8px; color: ${theme.textColor}; font-size: 0.8em; width: 100%;">
                        <input type="text" id="customBackgroundName" placeholder="Nombre del fondo" 
                               style="width: 100%; padding: 6px; background: rgba(15, 23, 42, 0.6); border: 1px solid ${theme.borderColor}; border-radius: 6px; color: ${theme.textColor}; font-size: 0.8em; margin-bottom: 8px;">
                        <button onclick="uploadCustomBackground()" 
                                style="padding: 6px 12px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8em; font-weight: 500; transition: all 0.3s ease;">
                            📤 Subir Fondo
                        </button>
                    </div>
                ` : ''}

                <!-- FONDOS PREDETERMINADOS -->
                <div style="margin-bottom: 12px;">
                    <h5 style="color: ${theme.secondaryColor}; margin-bottom: 8px; font-size: 0.85em;">Fondos Predeterminados</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
                        ${defaultBackgrounds.map(([key, bg]) => `
                            <div onclick="selectTournamentBackground('${key}', ${torneoId ? `'${torneoId}'` : 'null'})" 
                                 class="background-option"
                                 style="padding: 8px; background: ${bg.background}; border: 2px solid ${theme.borderColor}; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.3s ease; aspect-ratio: 1; min-height: 60px;">
                                <div style="font-size: 1.2em; margin-bottom: 4px;">${bg.thumbnail}</div>
                                <div style="font-size: 0.6em; color: white; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); line-height: 1.2;">${bg.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- FONDOS PERSONALIZADOS -->
                ${customBackgrounds.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                        <h5 style="color: ${theme.secondaryColor}; margin-bottom: 8px; font-size: 0.85em;">🖼️ Fondos Personalizados</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
                            ${customBackgrounds.map(([key, bg]) => `
                                <div style="position: relative;">
                                    <div onclick="selectTournamentBackground('${key}', ${torneoId ? `'${torneoId}'` : 'null'})" 
                                         class="background-option"
                                         style="padding: 8px; background: ${bg.background}; border: 2px solid ${theme.borderColor}; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.3s ease; aspect-ratio: 1; min-height: 60px;">
                                        <div style="font-size: 1.2em; margin-bottom: 4px;">${bg.thumbnail}</div>
                                        <div style="font-size: 0.6em; color: white; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); line-height: 1.2;">${bg.name}</div>
                                    </div>
                                    ${UserSystem.isAdmin || UserSystem.isMaestro ? `
                                        <button onclick="event.stopPropagation(); removeCustomBackground('${key}')" 
                                                style="position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; background: #ef4444; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 0.6em; display: flex; align-items: center; justify-content: center;">
                                            ×
                                        </button>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
};

// SISTEMA DE GESTIÓN DE PERFILES Y USUARIOS
const ProfileSystem = {
    profileImages: JSON.parse(localStorage.getItem('pokemonProfileImages')) || {},
    userSettings: JSON.parse(localStorage.getItem('pokemonUserSettings')) || {},
    
    saveSettings() {
        localStorage.setItem('pokemonProfileImages', JSON.stringify(this.profileImages));
        localStorage.setItem('pokemonUserSettings', JSON.stringify(this.userSettings));
    },
    
    getProfileImage(username) {
        return this.profileImages[username] || this.generateDefaultAvatar(username);
    },
    
    generateDefaultAvatar(username) {
        const firstLetter = username.charAt(0).toUpperCase();
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
        const color = colors[username.length % colors.length];
        
        return {
            type: 'default',
            letter: firstLetter,
            color: color,
            url: null
        };
    },
    
    changeProfileImage(username, imageData) {
        this.profileImages[username] = {
            type: 'custom',
            url: imageData,
            updatedAt: new Date().toISOString()
        };
        this.saveSettings();
    },
    
    canEditProfile(editor, targetUser) {
        if (editor === targetUser) return true;
        if (UserSystem.isAdmin || UserSystem.isMaestro) return true;
        return false;
    },
    
    getAvatarHTML(username, size = 'medium') {
        const profile = this.getProfileImage(username);
        const sizes = {
            small: '40px',
            medium: '60px',
            large: '80px'
        };
        
        if (profile.type === 'custom' && profile.url) {
            return `
                <img src="${profile.url}" 
                     alt="${username}"
                     style="width: ${sizes[size]}; height: ${sizes[size]}; border-radius: 50%; object-fit: cover; border: 2px solid ${ThemeSystem.themes[ThemeSystem.currentTheme].primaryColor};">
            `;
        } else {
            return `
                <div style="width: ${sizes[size]}; height: ${sizes[size]}; border-radius: 50%; background: ${profile.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${size === 'small' ? '1em' : '1.5em'}; border: 2px solid ${ThemeSystem.themes[ThemeSystem.currentTheme].primaryColor};">
                    ${profile.letter}
                </div>
            `;
        }
    }
};

// SISTEMA DE GESTIÓN DE USUARIOS (PARA ADMINS Y MAESTROS)
const UserManagementSystem = {
    addUser(username, role = 'ENTRENADOR', password = null) {
        if (UserSystem.users[username]) {
            NotificationSystem.show('❌ El usuario ya existe', 'error');
            return false;
        }
        
        let userData = { role: role };
        
        if (role === 'ADMIN') {
            userData.password = password || 'admin123';
        } else if (role === 'MAESTRO') {
            userData.password = password || 'maestro123';
        }
        // Para ENTRENADOR no se agrega password
        
        UserSystem.users[username] = userData;
        localStorage.setItem('pokemonUsers', JSON.stringify(UserSystem.users));
        
        NotificationSystem.show(`✅ Usuario "${username}" agregado como ${role}`, 'success');
        return true;
    },
    
    removeUser(username, currentUser) {
        if (!UserSystem.isAdmin && !UserSystem.isMaestro) {
            NotificationSystem.show('❌ Solo administradores y maestros pueden eliminar usuarios', 'error');
            return false;
        }
        
        if (username === currentUser) {
            NotificationSystem.show('❌ No puedes eliminarte a ti mismo', 'error');
            return false;
        }
        
        const targetUser = UserSystem.users[username];
        
        // Los maestros no pueden eliminar administradores
        if (UserSystem.isMaestro && !UserSystem.isAdmin && targetUser.role === 'ADMIN') {
            NotificationSystem.show('❌ Los maestros no pueden eliminar administradores', 'error');
            return false;
        }
        
        ConfirmationSystem.show(
            `¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`,
            () => {
                delete UserSystem.users[username];
                localStorage.setItem('pokemonUsers', JSON.stringify(UserSystem.users));
                document.getElementById('userList').innerHTML = this.getUserListHTML();
                NotificationSystem.show(`✅ Usuario "${username}" eliminado`, 'success');
            }
        );
    },
    
    getUserListHTML() {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        const users = Object.keys(UserSystem.users).sort();
        
        return users.map(username => {
            const user = UserSystem.users[username];
            const isCurrentUser = username === UserSystem.currentUser;
            const roleDisplay = user.role === 'ADMIN' ? '🛡️ Administrador' : 
                              user.role === 'MAESTRO' ? '👨‍🏫 Maestro' : '🎮 Entrenador';
            
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(100, 116, 139, 0.1); border-radius: 8px; margin-bottom: 8px; border: 1px solid ${theme.borderColor};">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${ProfileSystem.getAvatarHTML(username, 'small')}
                        <div>
                            <div style="font-weight: bold; color: ${theme.textColor}; font-size: 0.9em;">
                                ${username} 
                                ${isCurrentUser ? '<span style="color: #60a5fa;">(TÚ)</span>' : ''}
                            </div>
                            <div style="color: ${theme.secondaryColor}; font-size: 0.8em;">
                                ${roleDisplay}
                            </div>
                        </div>
                    </div>
                    
                    ${(UserSystem.isAdmin || (UserSystem.isMaestro && user.role !== 'ADMIN')) && !isCurrentUser ? `
                        <button onclick="UserManagementSystem.removeUser('${username}', '${UserSystem.currentUser}')" 
                                style="padding: 6px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75em; transition: all 0.3s ease;">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
};

// SISTEMA DE USUARIOS - MODIFICADO CON NUEVA ESTRUCTURA
const UserSystem = {
    users: {
        'DEMO': { 
            password: 'demo123', 
            role: 'ADMIN' 
        }
        // Solo el usuario DEMO existe inicialmente
    },

    get currentUser() {
        return window.currentUser;
    },

    set currentUser(value) {
        window.currentUser = value;
    },

    // Verificar si el usuario actual es administrador
    get isAdmin() {
        return this.users[this.currentUser]?.role === 'ADMIN';
    },

    // Verificar si el usuario actual es maestro
    get isMaestro() {
        return this.users[this.currentUser]?.role === 'MAESTRO';
    },

    // Verificar si el usuario actual es entrenador
    get isEntrenador() {
        return this.users[this.currentUser]?.role === 'ENTRENADOR';
    },

    // Verificar permisos para gestión de usuarios
    get canManageUsers() {
        return this.isAdmin || this.isMaestro;
    },

    // Verificar permisos para gestión de torneos
    get canManageTorneos() {
        return this.isAdmin || this.isMaestro;
    },

    login(trainerName) {
        const user = this.users[trainerName];
        if (!user) {
            NotificationSystem.show('Usuario no encontrado', 'error');
            return false;
        }

        // Si el usuario tiene contraseña, solicitar autenticación
        if (user.password) {
            InputSystem.show(
                '🔐 Contraseña requerida', 
                'Ingresa la contraseña...', 
                'password',
                (password) => {
                    if (password === user.password) {
                        this.currentUser = trainerName;
                        const roleDisplay = user.role === 'ADMIN' ? 'ADMINISTRADOR' : 
                                          user.role === 'MAESTRO' ? 'MAESTRO' : 'ENTRENADOR';
                        NotificationSystem.show(`¡Bienvenido ${roleDisplay} ${trainerName}!`, 'success');
                        showTorneosPage();
                    } else {
                        NotificationSystem.show('❌ Contraseña incorrecta', 'error');
                    }
                },
                () => {
                    NotificationSystem.show('Login cancelado', 'warning');
                },
                {
                    required: true,
                    validation: (value) => {
                        if (value.length < 4) {
                            NotificationSystem.show('La contraseña debe tener al menos 4 caracteres', 'error');
                            return false;
                        }
                        return true;
                    }
                }
            );
            return false;
        }

        // Usuarios sin contraseña (entrenadores - acceso directo)
        this.currentUser = trainerName;
        NotificationSystem.show(`¡Bienvenido ENTRENADOR ${trainerName}!`, 'success');
        return true;
    },

    getUserBadge() {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        const user = this.users[this.currentUser];
        const roleDisplay = user.role === 'ADMIN' ? '🛡️ ADMIN' : 
                          user.role === 'MAESTRO' ? '👨‍🏫 MAESTRO' : '🎮 ENTRENADOR';
        
        return `
            <div style="display: flex; align-items: center; gap: 10px; background: rgba(96, 165, 250, 0.2); padding: 6px 12px; border-radius: 12px; border: 1px solid ${theme.primaryColor};">
                ${ProfileSystem.getAvatarHTML(this.currentUser, 'small')}
                <div>
                    <div style="color: #0a0004; font-weight: 500; font-size: 0.85em;">${this.currentUser}</div>
                    <div style="color: #0a0004; font-size: 0.75em;">${roleDisplay}</div>
                </div>
            </div>
        `;
    }
};

// SISTEMA DE NAVEGACIÓN MEJORADO
const NavigationSystem = {
    currentPage: 'torneos',
    currentTorneo: null,
    menuOpen: false,

    getMenuHTML() {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        const hasTorneoSelected = this.currentTorneo !== null;
        
        return `
            <nav style="background: ${theme.cardBackground}; padding: 0; border-radius: 10px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                <ul style="display: flex; align-items: center; margin: 0; padding: 0; list-style: none; gap: 1px;">
                    <!-- INICIO -->
                    <li style="margin: 0;">
                        <a onclick="NavigationSystem.selectPage('inicio')" 
                           style="display: block; padding: 12px 20px; color: ${this.currentPage === 'inicio' ? theme.primaryColor : theme.textColor}; text-decoration: none; font-weight: ${this.currentPage === 'inicio' ? '600' : '500'}; border-bottom: 3px solid ${this.currentPage === 'inicio' ? theme.primaryColor : 'transparent'}; transition: all 0.3s ease; cursor: pointer; white-space: nowrap; font-size: 0.9em;">
                            🏠 Inicio
                        </a>
                    </li>
                    
                    <!-- PERFIL -->
                    <li style="margin: 0;">
                        <a onclick="showProfilePage()" 
                           style="display: block; padding: 12px 20px; color: ${this.currentPage === 'perfil' ? theme.primaryColor : theme.textColor}; text-decoration: none; font-weight: ${this.currentPage === 'perfil' ? '600' : '500'}; border-bottom: 3px solid ${this.currentPage === 'perfil' ? theme.primaryColor : 'transparent'}; transition: all 0.3s ease; cursor: pointer; white-space: nowrap; font-size: 0.9em;">
                            Mi Perfil
                        </a>
                    </li>
                    
                    ${UserSystem.canManageUsers ? `
                        <!-- GESTIÓN DE USUARIOS (SOLO ADMINS Y MAESTROS) -->
                        <li style="margin: 0;">
                            <a onclick="showUserManagementPage()" 
                               style="display: block; padding: 12px 20px; color: ${this.currentPage === 'usuarios' ? theme.primaryColor : theme.textColor}; text-decoration: none; font-weight: ${this.currentPage === 'usuarios' ? '600' : '500'}; border-bottom: 3px solid ${this.currentPage === 'usuarios' ? theme.primaryColor : 'transparent'}; transition: all 0.3s ease; cursor: pointer; white-space: nowrap; font-size: 0.9em;">
                                Usuarios
                            </a>
                        </li>
                    ` : ''}
                    
                    <!-- TORNEOS -->
                    <li style="margin: 0; position: relative;">
                        <a onclick="NavigationSystem.toggleTorneosSubmenu()" 
                           style="display: flex; align-items: center; padding: 12px 20px; color: ${this.currentPage === 'torneos' || this.currentPage === 'calendario' || this.currentPage === 'resultados' || this.currentPage === 'playoffs' ? theme.primaryColor : theme.textColor}; text-decoration: none; font-weight: ${this.currentPage === 'torneos' ? '600' : '500'}; border-bottom: 3px solid ${this.currentPage === 'torneos' || this.currentPage === 'calendario' || this.currentPage === 'resultados' || this.currentPage === 'playoffs' ? theme.primaryColor : 'transparent'}; transition: all 0.3s ease; cursor: pointer; white-space: nowrap; gap: 6px; font-size: 0.9em;">
                            Torneos
                            <span style="font-size: 0.7em; transition: transform 0.3s ease; transform: ${this.menuOpen ? 'rotate(180deg)' : 'rotate(0deg)'};">▼</span>
                        </a>
                        
                        <!-- SUBMENÚ TORNEOS -->
                        <div id="torneosSubmenu" 
                             style="position: absolute; top: 100%; left: 0; background: ${theme.menuBackground}; backdrop-filter: blur(15px); border: 1px solid ${theme.borderColor}; border-radius: 8px; padding: 6px; min-width: 180px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 1000; display: ${this.menuOpen ? 'block' : 'none'}; margin-top: 1px;">
                            
                            <!-- CALENDARIO -->
                            <a onclick="if(NavigationSystem.currentTorneo) NavigationSystem.selectPage('calendario')" 
                               style="display: flex; align-items: center; padding: 10px 14px; border-radius: 6px; cursor: ${hasTorneoSelected ? 'pointer' : 'not-allowed'}; color: ${hasTorneoSelected ? (this.currentPage === 'calendario' ? theme.primaryColor : theme.textColor) : theme.secondaryColor}; text-decoration: none; font-weight: ${this.currentPage === 'calendario' ? '600' : '500'}; background: ${this.currentPage === 'calendario' ? theme.menuHover : 'transparent'}; transition: all 0.2s ease; gap: 8px; font-size: 0.85em;">
                                Calendario
                                ${!hasTorneoSelected ? '<span style="font-size: 0.6em; margin-left: auto; opacity: 0.7;"></span>' : ''}
                            </a>
                            
                            <!-- RESULTADOS -->
                            <a onclick="if(NavigationSystem.currentTorneo) NavigationSystem.selectPage('resultados')" 
                               style="display: flex; align-items: center; padding: 10px 14px; border-radius: 6px; cursor: ${hasTorneoSelected ? 'pointer' : 'not-allowed'}; color: ${hasTorneoSelected ? (this.currentPage === 'resultados' ? theme.primaryColor : theme.textColor) : theme.secondaryColor}; text-decoration: none; font-weight: ${this.currentPage === 'resultados' ? '600' : '500'}; background: ${this.currentPage === 'resultados' ? theme.menuHover : 'transparent'}; transition: all 0.2s ease; gap: 8px; font-size: 0.85em;">
                                Resultados
                                ${!hasTorneoSelected ? '<span style="font-size: 0.6em; margin-left: auto; opacity: 0.7;"></span>' : ''}
                            </a>

                            <!-- PLAYOFFS -->
                            <a onclick="if(NavigationSystem.currentTorneo) showPlayoffsPage(NavigationSystem.currentTorneo.id)" 
                               style="display: flex; align-items: center; padding: 10px 14px; border-radius: 6px; cursor: ${hasTorneoSelected ? 'pointer' : 'not-allowed'}; color: ${hasTorneoSelected ? (this.currentPage === 'playoffs' ? theme.primaryColor : theme.textColor) : theme.secondaryColor}; text-decoration: none; font-weight: ${this.currentPage === 'playoffs' ? '600' : '500'}; background: ${this.currentPage === 'playoffs' ? theme.menuHover : 'transparent'}; transition: all 0.2s ease; gap: 8px; font-size: 0.85em;">
                                🏆 Playoffs
                                ${!hasTorneoSelected ? '<span style="font-size: 0.6em; margin-left: auto; opacity: 0.7;"></span>' : ''}
                            </a>
                        </div>
                    </li>
                </ul>
            </nav>
        `;
    },

    toggleTorneosSubmenu() {
        this.menuOpen = !this.menuOpen;
        this.updateSubmenuDisplay();
    },

    updateSubmenuDisplay() {
        const submenuElement = document.getElementById('torneosSubmenu');
        if (submenuElement) {
            submenuElement.style.display = this.menuOpen ? 'block' : 'none';
        }
    },

    selectPage(page) {
        this.currentPage = page;
        this.menuOpen = false;
        
        switch(page) {
            case 'inicio':
                showMainPage();
                break;
            case 'perfil':
                showProfilePage();
                break;
            case 'usuarios':
                if (UserSystem.canManageUsers) {
                    showUserManagementPage();
                } else {
                    NotificationSystem.show('❌ Solo administradores y maestros pueden acceder a esta página', 'error');
                }
                break;
            case 'torneos':
                showTorneosPage();
                break;
            case 'calendario':
                if (this.currentTorneo) {
                    torneoActual = this.currentTorneo;
                    showCalendarPage();
                } else {
                    NotificationSystem.show('⚠️ Primero selecciona un torneo desde la página de Torneos', 'warning');
                }
                break;
            case 'resultados':
                if (this.currentTorneo) {
                    torneoActual = this.currentTorneo;
                    showResultadosPage();
                } else {
                    NotificationSystem.show('⚠️ Primero selecciona un torneo desde la página de Torneos', 'warning');
                }
                break;
            case 'playoffs':
                if (this.currentTorneo) {
                    torneoActual = this.currentTorneo;
                    showPlayoffsPage();
                } else {
                    NotificationSystem.show('⚠️ Primero selecciona un torneo desde la página de Torneos', 'warning');
                }
                break;
        }
    },

    setCurrentTorneo(torneo) {
        this.currentTorneo = torneo;
        this.updateSubmenuDisplay();
    },

    closeAllMenus() {
        this.menuOpen = false;
        this.updateSubmenuDisplay();
    }
};

// SISTEMA DE TORNEOS - MODIFICADO
const TournamentSystem = {
    get torneos() {
        return window.torneos;
    },

    set torneos(value) {
        window.torneos = value;
    },

    get torneoActual() {
        return window.torneoActual;
    },

    set torneoActual(value) {
        window.torneoActual = value;
    },

    get partidoEditando() {
        return window.partidoEditando;
    },

    set partidoEditando(value) {
        window.partidoEditando = value;
    },

    saveTorneos() {
        localStorage.setItem('pokemonTorneos', JSON.stringify(this.torneos));
    },

    crearTorneo(nombre, background = 'default') {
        if (!nombre?.trim()) {
            NotificationSystem.show('❌ Ingresa un nombre para el torneo', 'error');
            return false;
        }

        const nuevoTorneo = {
            id: Date.now().toString(),
            nombre: nombre.trim(),
            fechaCreacion: new Date().toLocaleDateString(),
            creadoPor: UserSystem.currentUser,
            jornadaGenerada: false,
            jornadas: [],
            background: background
        };

        this.torneos.push(nuevoTorneo);
        this.saveTorneos();
        
        TournamentBackgrounds.setTorneoBackground(nuevoTorneo.id, background);
        
        NotificationSystem.show(`✅ Torneo "${nombre.trim()}" creado exitosamente`, 'success');
        return true;
    },

    eliminarTorneo(index) {
        const torneoNombre = this.torneos[index].nombre;
        ConfirmationSystem.show(
            `¿Eliminar el torneo "${torneoNombre}"? Esta acción no se puede deshacer.`,
            () => {
                this.torneos.splice(index, 1);
                this.saveTorneos();
                NotificationSystem.show(`✅ Torneo "${torneoNombre}" eliminado`, 'success');
                showTorneosPage();
            },
            null,
            {
                title: 'Eliminar Torneo',
                confirmText: 'Eliminar',
                cancelText: 'Cancelar',
                type: 'danger'
            }
        );
    },

    generarJornadas() {
        return CalendarSystem.generarCalendarioDesdeExcel(this);
    },

    generarJornadaTorneo(torneoIndex) {
        const torneo = this.torneos[torneoIndex];
        
        if (torneo.jornadaGenerada) {
            NotificationSystem.show('❌ ¡ESTE TORNEO YA TIENE UNA JORNADA GENERADA!', 'error');
            return false;
        }

        const todosLosJugadores = Object.keys(UserSystem.users);
        const mensaje = this.getConfirmacionJornada(torneo, todosLosJugadores);

        ConfirmationSystem.show(mensaje, () => {
            torneo.jornadaGenerada = true;
            torneo.jornadas = this.generarJornadas();
            this.saveTorneos();
            
            const totalPartidos = torneo.jornadas.reduce((total, j) => total + j.partidos.length, 0);
            NotificationSystem.show(
                `✅ ¡5 jornadas generadas desde Excel!<br>• Jornadas 1-4: 12 partidos<br>• Jornada 5: 7 partidos<br>• Total: ${totalPartidos} partidos`, 
                'success'
            );
            showTorneosPage();
        });
    },

    getConfirmacionJornada(torneo, jugadores) {
        return `¿Generar 5 jornadas para "${torneo.nombre}"?\n\n` +
               `• Jugadores totales: ${jugadores.length}\n` +
               `• Jornadas 1-4: 12 partidos cada una\n` +
               `• Jornada 5: 7 partidos\n` +
               `• Total: 55 partidos\n\n` +
               `⚠️ Esta acción no se puede deshacer.`;
    },

    puedeEditarPartido(partido) {
        return UserSystem.canManageTorneos || 
               UserSystem.currentUser === partido.local || 
               UserSystem.currentUser === partido.visitante;
    },

    obtenerValorNumerico(marcador) {
        if (!marcador || marcador === '.' || marcador === ' ' || marcador === 0) return 0;
        
        // CASO ESPECIAL: 0.1 (como en el Excel) - se muestra como 0.1 pero en estadísticas es 1
        if (marcador === 0.1 || marcador === '0.1') return 0.1;
        
        if (typeof marcador === 'string' && marcador.includes('.')) {
            return parseFloat(marcador.replace(/\./g, '')) || 0;
        }
        return parseFloat(marcador) || 0;
    }
};

// SISTEMA DE ESTADÍSTICAS MEJORADO - SIN DECIMALES EN PUNTOS
const StatisticsSystem = {
    calcularEstadisticas(torneo) {
        const resultados = ResultSystem.procesarResultadosDesdeExcel(torneo);
        return ResultSystem.calcularEstadisticasAvanzadas(resultados);
    },

    generarTablaEstadistica(torneo) {
        const estadisticas = this.calcularEstadisticas(torneo);
        const tabla = Object.keys(UserSystem.users).map(jugador => ({
            jugador,
            ...estadisticas[jugador],
            rol: UserSystem.users[jugador].role
        }));

        return tabla.sort((a, b) => {
            if (b.diferenciaPuntos !== a.diferenciaPuntos) return b.diferenciaPuntos - a.diferenciaPuntos;
            return b.partidosGanados - a.partidosGanados;
        });
    },

    generarTablaGeneral(torneo) {
        const estadisticas = this.calcularEstadisticas(torneo);
        const tabla = Object.keys(UserSystem.users).map(jugador => ({
            jugador,
            partidosJugados: estadisticas[jugador].partidosJugados,
            partidosGanados: estadisticas[jugador].partidosGanados,
            puntosFavor: Math.round(estadisticas[jugador].puntosFavor), // SIN DECIMALES
            puntosContra: Math.round(estadisticas[jugador].puntosContra), // SIN DECIMALES
            diferenciaPuntos: estadisticas[jugador].diferenciaPuntos,
            porcentajeVictorias: estadisticas[jugador].porcentajeVictorias,
            rol: UserSystem.users[jugador].role
        }));

        return tabla.sort((a, b) => {
            if (b.partidosGanados !== a.partidosGanados) return b.partidosGanados - a.partidosGanados;
            return b.diferenciaPuntos - a.diferenciaPuntos;
        });
    },

    // NUEVO MÉTODO: Generar tabla avanzada con más estadísticas
    generarTablaAvanzada(torneo) {
        const estadisticas = this.calcularEstadisticas(torneo);
        const tabla = Object.keys(UserSystem.users).map(jugador => ({
            jugador,
            partidosJugados: estadisticas[jugador].partidosJugados,
            partidosGanados: estadisticas[jugador].partidosGanados,
            partidosPerdidos: estadisticas[jugador].partidosPerdidos,
            partidosEmpatados: estadisticas[jugador].partidosEmpatados,
            puntosFavor: Math.round(estadisticas[jugador].puntosFavor), // SIN DECIMALES
            puntosContra: Math.round(estadisticas[jugador].puntosContra), // SIN DECIMALES
            diferenciaPuntos: estadisticas[jugador].diferenciaPuntos,
            porcentajeVictorias: estadisticas[jugador].porcentajeVictorias,
            promedioFavor: estadisticas[jugador].promedioFavor,
            promedioContra: estadisticas[jugador].promedioContra,
            rol: UserSystem.users[jugador].role
        }));

        return tabla.sort((a, b) => {
            if (b.porcentajeVictorias !== a.porcentajeVictorias) return b.porcentajeVictorias - a.porcentajeVictorias;
            if (b.partidosGanados !== a.partidosGanados) return b.partidosGanados - a.partidosGanados;
            return b.diferenciaPuntos - a.diferenciaPuntos;
        });
    }
};

// SISTEMA DE PLAYOFFS
const PlayoffSystem = {
    playoffs: JSON.parse(localStorage.getItem('pokemonPlayoffs')) || {},
    
    savePlayoffs() {
        localStorage.setItem('pokemonPlayoffs', JSON.stringify(this.playoffs));
    },
    
    generarPlayoffsDesdeTabla(torneoId) {
        const torneo = TournamentSystem.torneos.find(t => t.id === torneoId);
        if (!torneo) return null;
        
        const tablaGeneral = StatisticsSystem.generarTablaGeneral(torneo);
        
        // Tomar los 8 mejores para Play-In
        const playInContendientes = tablaGeneral.slice(0, 8);
        
        this.playoffs[torneoId] = {
            torneoId: torneoId,
            torneoNombre: torneo.nombre,
            estado: 'playin', // playin, semifinales, final, completado
            playInA: {
                jugadores: playInContendientes.slice(0, 4).map(j => j.jugador),
                resultados: Array(4).fill(null),
                ganadores: []
            },
            playInB: {
                jugadores: playInContendientes.slice(4, 8).map(j => j.jugador),
                resultados: Array(4).fill(null),
                ganadores: []
            },
            semifinalA: {
                jugadores: [],
                resultado: null,
                ganador: null
            },
            semifinalB: {
                jugadores: [],
                resultado: null,
                ganador: null
            },
            final: {
                jugadores: [],
                resultado: null,
                ganador: null,
                campeon: null
            },
            fechaCreacion: new Date().toISOString()
        };
        
        this.savePlayoffs();
        return this.playoffs[torneoId];
    },
    
    avanzarASemifinales(torneoId) {
        const playoff = this.playoffs[torneoId];
        if (!playoff || playoff.estado !== 'playin') return false;
        
        // Verificar que todos los Play-In estén completos
        const playInACompleto = playoff.playInA.ganadores.length === 2;
        const playInBCompleto = playoff.playInB.ganadores.length === 2;
        
        if (!playInACompleto || !playInBCompleto) {
            NotificationSystem.show('❌ Primero debes completar todos los partidos de Play-In', 'error');
            return false;
        }
        
        playoff.semifinalA.jugadores = playoff.playInA.ganadores;
        playoff.semifinalB.jugadores = playoff.playInB.ganadores;
        playoff.estado = 'semifinales';
        this.savePlayoffs();
        return true;
    },
    
    avanzarAFinal(torneoId) {
        const playoff = this.playoffs[torneoId];
        if (!playoff || playoff.estado !== 'semifinales') return false;
        
        if (!playoff.semifinalA.ganador || !playoff.semifinalB.ganador) {
            NotificationSystem.show('❌ Primero debes completar ambas semifinales', 'error');
            return false;
        }
        
        playoff.final.jugadores = [playoff.semifinalA.ganador, playoff.semifinalB.ganador];
        playoff.estado = 'final';
        this.savePlayoffs();
        return true;
    },
    
    completarTorneo(torneoId) {
        const playoff = this.playoffs[torneoId];
        if (!playoff || playoff.estado !== 'final' || !playoff.final.ganador) {
            NotificationSystem.show('❌ Primero debes completar la final', 'error');
            return false;
        }
        
        playoff.final.campeon = playoff.final.ganador;
        playoff.estado = 'completado';
        this.savePlayoffs();
        
        // Mostrar ventana de campeón
        this.mostrarVentanaCampeon(playoff.final.campeon, playoff.torneoNombre);
        return true;
    },
    
    mostrarVentanaCampeon(campeon, torneoNombre) {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        
        document.body.insertAdjacentHTML('beforeend', `
            <div id="ventanaCampeon" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 2000; animation: fadeIn 0.5s ease;">
                <div style="background: linear-gradient(135deg, #fbbf24, #d97706); padding: 40px; border-radius: 20px; text-align: center; color: white; max-width: 500px; width: 90%; border: 4px solid #f59e0b; box-shadow: 0 0 50px rgba(251, 191, 36, 0.5);">
                    <div style="font-size: 4em; margin-bottom: 20px;">🏆</div>
                    <h1 style="font-size: 2.5em; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">¡CAMPEÓN!</h1>
                    <h2 style="font-size: 2em; margin: 0 0 20px 0; color: #1e293b;">${campeon}</h2>
                    <p style="font-size: 1.2em; margin-bottom: 30px; opacity: 0.9;">Ha sido coronado como el ganador del torneo</p>
                    <p style="font-size: 1.1em; margin-bottom: 30px; font-weight: bold;">${torneoNombre}</p>
                    <button onclick="cerrarVentanaCampeon()" 
                            style="padding: 15px 30px; background: #1e293b; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; font-weight: bold; transition: all 0.3s ease;">
                        ¡Celebrar!
                    </button>
                </div>
            </div>
        `);
        
        // Agregar animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },
    
    getPlayoffHTML(torneoId) {
        const playoff = this.playoffs[torneoId];
        if (!playoff) return this.getPlayoffVacioHTML(torneoId);
        
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        
        return `
            <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; margin-bottom: 25px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="color: ${theme.primaryColor}; margin: 0; font-size: 1.8em; display: flex; align-items: center; gap: 10px;">
                        <span style="background: ${theme.primaryColor}; color: white; padding: 8px 12px; border-radius: 10px;">🏆</span>
                        FASE FINAL - PLAYOFFS
                    </h2>
                    <div style="display: flex; gap: 10px;">
                        ${playoff.estado === 'playin' ? `
                            <button onclick="PlayoffSystem.avanzarASemifinales('${torneoId}')" 
                                    style="padding: 10px 16px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9em;">
                                Avanzar a Semifinales
                            </button>
                        ` : ''}
                        ${playoff.estado === 'semifinales' ? `
                            <button onclick="PlayoffSystem.avanzarAFinal('${torneoId}')" 
                                    style="padding: 10px 16px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9em;">
                                Avanzar a Final
                            </button>
                        ` : ''}
                        ${playoff.estado === 'final' ? `
                            <button onclick="PlayoffSystem.completarTorneo('${torneoId}')" 
                                    style="padding: 10px 16px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9em;">
                                Coronar Campeón
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- PLAY-IN A Y B -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    ${this.getPlayInHTML(playoff.playInA, 'PLAY-IN A', torneoId, theme)}
                    ${this.getPlayInHTML(playoff.playInB, 'PLAY-IN B', torneoId, theme)}
                </div>
                
                <!-- SEMIFINALES -->
                ${playoff.estado !== 'playin' ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        ${this.getSemifinalHTML(playoff.semifinalA, 'SEMIFINAL A', torneoId, theme)}
                        ${this.getSemifinalHTML(playoff.semifinalB, 'SEMIFINAL B', torneoId, theme)}
                    </div>
                ` : ''}
                
                <!-- FINAL -->
                ${playoff.estado === 'final' || playoff.estado === 'completado' ? `
                    <div style="text-align: center;">
                        ${this.getFinalHTML(playoff.final, torneoId, theme)}
                    </div>
                ` : ''}
                
                ${playoff.estado === 'completado' ? `
                    <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; color: white;">
                        <h3 style="margin: 0 0 10px 0; font-size: 1.5em;">🏆 TORNEO COMPLETADO</h3>
                        <p style="margin: 0; font-size: 1.1em;">El campeón ha sido coronado</p>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    getPlayInHTML(playIn, titulo, torneoId, theme) {
        return `
            <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; border: 2px solid #8b5cf6;">
                <h3 style="color: #8b5cf6; margin: 0 0 15px 0; text-align: center; font-size: 1.2em;">${titulo}</h3>
                <div style="display: grid; gap: 10px;">
                    ${playIn.jugadores.map((jugador, index) => {
                        const oponenteIndex = index % 2 === 0 ? index + 1 : index - 1;
                        const oponente = playIn.jugadores[oponenteIndex];
                        const resultado = playIn.resultados[index];
                        const ganador = playIn.ganadores.includes(jugador);
                        
                        if (index % 2 !== 0) return ''; // Mostrar solo una vez por pareja
                        
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid ${theme.borderColor};">
                                <div style="flex: 1;">
                                    <div style="font-weight: bold; color: ${theme.textColor}; margin-bottom: 5px;">${jugador}</div>
                                    <div style="color: ${theme.secondaryColor};">VS</div>
                                    <div style="font-weight: bold; color: ${theme.textColor}; margin-top: 5px;">${oponente}</div>
                                </div>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    ${resultado === null ? `
                                        <button onclick="abrirModalPlayIn('${torneoId}', '${titulo}', ${index}, '${jugador}', '${oponente}')" 
                                                style="padding: 8px 12px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8em;">
                                            Ingresar Resultado
                                        </button>
                                    ` : `
                                        <div style="text-align: center;">
                                            <div style="font-size: 1.2em; font-weight: bold; color: ${ganador ? '#10b981' : '#ef4444'};">
                                                ${resultado}
                                            </div>
                                            <div style="font-size: 0.7em; color: ${theme.secondaryColor};">
                                                ${ganador ? 'GANADOR' : 'PERDEDOR'}
                                            </div>
                                        </div>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    getSemifinalHTML(semifinal, titulo, torneoId, theme) {
        return `
            <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 12px; border: 2px solid #3b82f6;">
                <h3 style="color: #3b82f6; margin: 0 0 15px 0; text-align: center; font-size: 1.2em;">${titulo}</h3>
                ${semifinal.jugadores.length === 2 ? `
                    <div style="text-align: center;">
                        <div style="margin-bottom: 15px;">
                            <div style="font-weight: bold; color: ${theme.textColor}; font-size: 1.1em;">${semifinal.jugadores[0]}</div>
                            <div style="color: ${theme.secondaryColor}; margin: 5px 0;">VS</div>
                            <div style="font-weight: bold; color: ${theme.textColor}; font-size: 1.1em;">${semifinal.jugadores[1]}</div>
                        </div>
                        ${semifinal.resultado ? `
                            <div style="font-size: 1.5em; font-weight: bold; color: #10b981; margin: 10px 0;">
                                ${semifinal.resultado}
                            </div>
                            <div style="color: ${theme.secondaryColor};">
                                Ganador: ${semifinal.ganador}
                            </div>
                        ` : `
                            <button onclick="abrirModalSemifinal('${torneoId}', '${titulo}')" 
                                    style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                Ingresar Resultado
                            </button>
                        `}
                    </div>
                ` : `
                    <div style="text-align: center; color: ${theme.secondaryColor}; padding: 20px;">
                        Esperando ganadores del Play-In...
                    </div>
                `}
            </div>
        `;
    },
    
    getFinalHTML(final, torneoId, theme) {
        return `
            <div style="background: linear-gradient(135deg, #fbbf24, #d97706); padding: 30px; border-radius: 16px; border: 3px solid #f59e0b; color: white; max-width: 400px; margin: 0 auto;">
                <h3 style="margin: 0 0 20px 0; text-align: center; font-size: 1.5em; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">GRAN FINAL</h3>
                ${final.jugadores.length === 2 ? `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-weight: bold; font-size: 1.3em; margin-bottom: 10px;">${final.jugadores[0]}</div>
                        <div style="font-size: 1.1em; margin: 10px 0;">🎯 VS 🎯</div>
                        <div style="font-weight: bold; font-size: 1.3em; margin-top: 10px;">${final.jugadores[1]}</div>
                    </div>
                    ${final.resultado ? `
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: bold; margin: 10px 0;">
                                ${final.resultado}
                            </div>
                            ${final.campeon ? `
                                <div style="font-size: 1.2em; font-weight: bold; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 10px;">
                                    🏆 CAMPEÓN: ${final.campeon} 🏆
                                </div>
                            ` : `
                                <div style="color: #1e293b; font-weight: bold;">
                                    Ganador: ${final.ganador}
                                </div>
                            `}
                        </div>
                    ` : `
                        <button onclick="abrirModalFinal('${torneoId}')" 
                                style="padding: 12px 24px; background: #1e293b; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; font-weight: bold;">
                            Jugar Final
                        </button>
                    `}
                ` : `
                    <div style="text-align: center; padding: 20px;">
                        Esperando ganadores de semifinales...
                    </div>
                `}
            </div>
        `;
    },
    
    getPlayoffVacioHTML(torneoId) {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        return `
            <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; margin-bottom: 25px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); text-align: center;">
                <h2 style="color: ${theme.primaryColor}; margin: 0 0 15px 0; font-size: 1.8em;">🏆 FASE FINAL</h2>
                <p style="color: ${theme.secondaryColor}; margin-bottom: 20px;">Genera los playoffs basados en la tabla general del torneo</p>
                <button onclick="PlayoffSystem.generarPlayoffsDesdeTabla('${torneoId}')" 
                        style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; font-weight: bold;">
                    Generar Playoffs
                </button>
            </div>
        `;
    }
};

// SISTEMA DE INTERFAZ
const UISystem = {
    showMainPage() {
        NavigationSystem.currentPage = 'inicio';
        document.getElementById('app').innerHTML = this.getMainPageHTML();
    },

    getMainPageHTML() {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        return `
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%); min-height: 100vh; color: white;">
                <div style="max-width: 1000px; margin: 0 auto;">
                    <h1 style="font-size: 2.5em; margin-bottom: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"> TORNEOS POKÈMON </h1>
                    <p style="font-size: 1.1em; margin-bottom: 30px; opacity: 0.9;"> Sistema de gestión de torneos Pokémon </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                        ${Object.keys(UserSystem.users).map(name => this.getUserCardHTML(name)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    getUserCardHTML(name) {
        const user = UserSystem.users[name];
        const roleDisplay = user.role === 'ADMIN' ? 'Administrador' : 
                          user.role === 'MAESTRO' ? 'Maestro' : 'Entrenador';
        
        return `
            <div onclick="openLogin('${name}')" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 20px; border-radius: 15px; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(0,0,0,0.2); text-align: center;">
                ${ProfileSystem.getAvatarHTML(name, 'medium')}
                <div style="font-weight: bold; color: white; font-size: 1em; margin: 12px 0 6px 0;">${name}</div>
                <div style="color: rgba(255,255,255,0.8); font-size: 0.85em;">
                    ${roleDisplay}
                </div>
            </div>
        `;
    },

    showTorneosPage() {
        NavigationSystem.currentPage = 'torneos';
        NavigationSystem.currentTorneo = null;
        document.getElementById('app').innerHTML = this.getTorneosPageHTML();
    },

    getTorneosPageHTML() {
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        return `
            <div style="padding: 15px; background: ${theme.background}; min-height: 100vh; color: ${theme.textColor}; transition: all 0.4s ease;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    ${this.getTorneosHeaderHTML(theme)}
                    ${UserSystem.canManageTorneos ? this.getCrearTorneoHTML(theme) : ''}
                    ${this.getListaTorneosHTML(theme)}
                </div>
            </div>
        `;
    },

    getTorneosHeaderHTML(theme) {
        return `
            <div style="background: ${theme.cardBackground}; padding: 18px; border-radius: 14px; margin-bottom: 18px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); transition: all 0.4s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div>
                        <h1 style="color: ${theme.primaryColor}; margin: 0; font-size: 1.6em; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.1em;">🏆</span> TORNEO POKÈMON 
                        </h1>
                        <p style="margin: 3px 0 0 0; color: ${theme.secondaryColor}; font-size: 0.85em;">Sistema de gestión de torneos</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${ThemeSystem.getThemeSwitch()}
                        ${UserSystem.getUserBadge()}
                    </div>
                </div>
                
                <!-- MENÚ DE NAVEGACIÓN -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    ${NavigationSystem.getMenuHTML()}
                    <div style="color: ${theme.secondaryColor}; font-size: 0.8em; font-weight: 500; background: rgba(100, 116, 139, 0.1); padding: 5px 10px; border-radius: 6px;">
                        ${NavigationSystem.currentTorneo ? `Torneo activo: ${NavigationSystem.currentTorneo.nombre}` : 'Selecciona un torneo'}
                    </div>
                </div>
            </div>
        `;
    },

    getCrearTorneoHTML(theme) {
        return UserSystem.canManageTorneos ? `
            <div style="background: ${theme.cardBackground}; padding: 18px; border-radius: 14px; margin-bottom: 18px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); transition: all 0.4s ease;">
                <h3 style="color: #34d399; margin-bottom: 12px; font-size: 1.1em; display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 1em;">➕</span> NUEVO TORNEO
                </h3>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
                    <input type="text" id="nombreTorneo" placeholder="Nombre del torneo" 
                           style="flex: 1; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid ${theme.borderColor}; border-radius: 8px; color: ${theme.textColor}; font-size: 0.9em; transition: all 0.3s ease;">
                    <button onclick="openBackgroundSelector()" 
                            style="padding: 10px 12px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.85em; transition: all 0.3s ease;">
                        🎨 Fondo
                    </button>
                    <button onclick="crearTorneo()" 
                            style="padding: 10px 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.85em; transition: all 0.3s ease;">
                        Crear
                    </button>
                </div>
                <div id="backgroundSelectorContainer" style="display: none;">
                    ${TournamentBackgrounds.getBackgroundSelectorHTML()}
                </div>
            </div>
        ` : '';
    },

    getListaTorneosHTML(theme) {
        const torneos = TournamentSystem.torneos;
        return `
            <div>
                <h2 style="color: ${theme.primaryColor}; margin-bottom: 14px; font-size: 1.3em; display: flex; align-items: center; gap: 6px;">
                    <span>📋</span> TORNEOS DISPONIBLES
                </h2>
                ${torneos.length === 0 ? this.getNoTorneosHTML(theme) : this.getTorneosGridHTML(theme)}
            </div>
        `;
    },

    getNoTorneosHTML(theme) {
        return `
            <div style="text-align: center; padding: 30px; background: ${theme.cardBackground}; border-radius: 14px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); transition: all 0.4s ease;">
                <p style="color: ${theme.secondaryColor}; font-size: 0.95em;">
                    ${UserSystem.canManageTorneos ? 'Crea tu primer torneo Pokémon' : 'Espera a que un administrador cree torneos'}
                </p>
            </div>
        `;
    },

    getTorneosGridHTML(theme) {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                ${TournamentSystem.torneos.map((torneo, index) => this.getTorneoCardHTML(torneo, index, theme)).join('')}
            </div>
        `;
    },

    getTorneoCardHTML(torneo, index, theme) {
        const torneoBackground = TournamentBackgrounds.getTorneoBackground(torneo.id);
        
        return `
            <div style="background: ${torneoBackground}; padding: 18px; border-radius: 14px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); transition: all 0.4s ease; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-height: 140px;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 1;"></div>
                
                <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h3 style="color: white; margin: 0 0 10px 0; font-size: 1.2em; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); line-height: 1.2;">${torneo.nombre}</h3>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.85em;">
                            <p style="margin: 4px 0; display: flex; align-items: center; gap: 4px;">
                                <span style="font-size: 0.8em;">📅</span> ${torneo.fechaCreacion}
                            </p>
                            <p style="margin: 4px 0; display: flex; align-items: center; gap: 4px;">
                                <span style="font-size: 0.8em;">👤</span> ${torneo.creadoPor}
                            </p>
                            <p style="margin: 4px 0; display: flex; align-items: center; gap: 4px;">
                                <span style="font-size: 0.8em;">⚡</span> 
                                <span style="color: ${torneo.jornadaGenerada ? '#34d399' : '#fbbf24'}; font-weight: bold;">
                                    ${torneo.jornadaGenerada ? 'GENERADA' : 'PENDIENTE'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
                        ${this.getTorneoButtonsHTML(torneo, index, theme)}
                    </div>
                </div>
            </div>
        `;
    },

    getTorneoButtonsHTML(torneo, index, theme) {
        const buttons = [
            `<button onclick="seleccionarTorneo(${index}, 'calendario')" 
                    style="padding: 6px 10px; background: rgba(255,255,255,0.9); color: #1e293b; border: none; border-radius: 6px; font-size: 0.8em; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 3px;">
                <span style="font-size: 0.8em;">📅</span> Calendario
            </button>`,
            `<button onclick="seleccionarTorneo(${index}, 'resultados')" 
                    style="padding: 6px 10px; background: rgba(255,255,255,0.9); color: #1e293b; border: none; border-radius: 6px; font-size: 0.8em; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 3px;">
                <span style="font-size: 0.8em;">📊</span> Resultados
            </button>`,
            `<button onclick="seleccionarTorneo(${index}, 'playoffs')" 
                    style="padding: 6px 10px; background: rgba(255,255,255,0.9); color: #1e293b; border: none; border-radius: 6px; font-size: 0.8em; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 3px;">
                <span style="font-size: 0.8em;">🏆</span> Playoffs
            </button>`
        ];

        if (UserSystem.canManageTorneos) {
            if (!torneo.jornadaGenerada) {
                buttons.push(`
                    <button onclick="generarJornadaTorneo(${index})" 
                            style="padding: 6px 10px; background: rgba(16, 185, 129, 0.9); color: white; border: none; border-radius: 6px; font-size: 0.8em; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 3px;">
                        <span style="font-size: 0.8em;">🎯</span> Generar
                    </button>
                `);
            }
            buttons.push(`
                <button onclick="eliminarTorneo(${index})" 
                        style="padding: 6px 10px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 6px; font-size: 0.8em; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 3px;">
                    <span style="font-size: 0.8em;">🗑️</span> Eliminar
                </button>
            `);
            
            buttons.push(`
                <button onclick="openTorneoBackgroundSelector(${index})" 
                        style="padding: 6px 10px; background: rgba(139, 92, 246, 0.9); color: white; border: none; border-radius: 6px; font-size: 0.8em; cursor: pointer; font-weight: 600; transition: all 0.3s ease; display: flex; align-items: center; gap: 3px;">
                    <span style="font-size: 0.8em;">🎨</span> Fondo
                </button>
            `);
        }

        return buttons.join('');
    }
};

// PÁGINA DE GESTIÓN DE PERFILES
function showProfilePage(targetUser = null) {
    const userToEdit = targetUser || UserSystem.currentUser;
    const canEdit = ProfileSystem.canEditProfile(UserSystem.currentUser, userToEdit);
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    
    document.getElementById('app').innerHTML = `
        <div style="padding: 20px; background: ${theme.background}; min-height: 100vh; color: ${theme.textColor}; transition: all 0.4s ease;">
            <div style="max-width: 800px; margin: 0 auto;">
                <!-- HEADER -->
                <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 20px; margin-bottom: 25px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h1 style="color: ${theme.primaryColor}; margin: 0; font-size: 2.2em;">Perfil</h1>
                            <p style="margin: 5px 0 0 0; color: ${theme.secondaryColor};">${userToEdit === UserSystem.currentUser ? 'Tu perfil' : `Perfil de ${userToEdit}`}</p>
                        </div>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            ${ThemeSystem.getThemeSwitch()}
                            ${UserSystem.getUserBadge()}
                        </div>
                    </div>
                    
                    <button onclick="showTorneosPage()" 
                            style="padding: 10px 20px; background: ${theme.primaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">
                        ← Volver al Inicio
                    </button>
                </div>

                <div style="background: ${theme.cardBackground}; padding: 30px; border-radius: 20px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); text-align: center;">
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: ${theme.primaryColor}; margin-bottom: 20px;">Avatar Actual</h3>
                        <div style="display: inline-block;">
                            ${ProfileSystem.getAvatarHTML(userToEdit, 'large')}
                        </div>
                    </div>
                    
                    ${canEdit ? `
                        <div style="margin-bottom: 30px;">
                            <h3 style="color: ${theme.primaryColor}; margin-bottom: 20px;">Cambiar Imagen de Perfil</h3>
                            <input type="file" id="profileImageInput" accept="image/*" 
                                   style="margin-bottom: 15px; color: ${theme.textColor};"
                                   onchange="previewProfileImage('${userToEdit}')">
                            <div id="imagePreview" style="margin: 15px 0;"></div>
                            <button onclick="uploadProfileImage('${userToEdit}')" 
                                    style="padding: 12px 25px; background: #10b981; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s ease;">
                                💾 Guardar Imagen
                            </button>
                        </div>
                    ` : `
                        <div style="color: ${theme.secondaryColor}; padding: 20px; background: rgba(100, 116, 139, 0.1); border-radius: 10px;">
                            Solo ${userToEdit} puede cambiar esta imagen de perfil
                        </div>
                    `}
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid ${theme.borderColor};">
                        <h3 style="color: ${theme.primaryColor}; margin-bottom: 15px;">Información del Usuario</h3>
                        <div style="display: inline-block; text-align: left;">
                            <p><strong>Nombre:</strong> ${userToEdit}</p>
                            <p><strong>Rol:</strong> ${UserSystem.users[userToEdit].role === 'ADMIN' ? '🛡️ Administrador' : UserSystem.users[userToEdit].role === 'MAESTRO' ? '👨‍🏫 Maestro' : '🎮 Entrenador'}</p>
                            <p><strong>Última actualización:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// PÁGINA DE GESTIÓN DE USUARIOS (SOLO PARA ADMINS Y MAESTROS)
function showUserManagementPage() {
    if (!UserSystem.canManageUsers) {
        NotificationSystem.show('❌ Solo administradores y maestros pueden acceder a esta página', 'error');
        return;
    }
    
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    
    document.getElementById('app').innerHTML = `
        <div style="padding: 20px; background: ${theme.background}; min-height: 100vh; color: ${theme.textColor}; transition: all 0.4s ease;">
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 20px; margin-bottom: 25px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h1 style="color: ${theme.primaryColor}; margin: 0; font-size: 2.2em;">Usuarios</h1>
                            <p style="margin: 5px 0 0 0; color: ${theme.secondaryColor};">Agregar y gestionar usuarios del sistema</p>
                        </div>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            ${ThemeSystem.getThemeSwitch()}
                            ${UserSystem.getUserBadge()}
                        </div>
                    </div>
                    
                    <button onclick="showTorneosPage()" 
                            style="padding: 10px 20px; background: ${theme.primaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">
                        ← Volver al Inicio
                    </button>
                </div>

                <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 20px; margin-bottom: 25px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <h3 style="color: #34d399; margin-bottom: 20px;">Agregar Nuevo Usuario</h3>
                    <div style="display: grid; grid-template-columns: 1fr auto auto auto; gap: 10px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: ${theme.secondaryColor}; font-size: 0.9em;">Nombre de usuario</label>
                            <input type="text" id="newUserName" placeholder="Nombre del usuario" 
                                   style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid ${theme.borderColor}; border-radius: 8px; color: ${theme.textColor};">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: ${theme.secondaryColor}; font-size: 0.9em;">Rol</label>
                            <select id="newUserRole" style="padding: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid ${theme.borderColor}; border-radius: 8px; color: ${theme.textColor};">
                                <option value="ENTRENADOR">🎮 Entrenador</option>
                                ${UserSystem.isAdmin ? '<option value="MAESTRO">👨‍🏫 Maestro</option>' : ''}
                                ${UserSystem.isAdmin ? '<option value="ADMIN">🛡️ Administrador</option>' : ''}
                            </select>
                        </div>
                        <div id="passwordField" style="display: none;">
                            <label style="display: block; margin-bottom: 5px; color: ${theme.secondaryColor}; font-size: 0.9em;">Contraseña</label>
                            <input type="password" id="newUserPassword" placeholder="Contraseña" 
                                   style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid ${theme.borderColor}; border-radius: 8px; color: ${theme.textColor};">
                        </div>
                        <button onclick="addNewUser()" 
                                style="padding: 12px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s ease;">
                            ➕ Agregar
                        </button>
                    </div>
                </div>

                <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 20px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <h3 style="color: ${theme.primaryColor}; margin-bottom: 20px;">📋 Usuarios del Sistema</h3>
                    <div id="userList">
                        ${UserManagementSystem.getUserListHTML()}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('newUserRole').addEventListener('change', function() {
        const showPassword = this.value === 'ADMIN' || this.value === 'MAESTRO';
        document.getElementById('passwordField').style.display = showPassword ? 'block' : 'none';
    });
}

// CALENDARIO CON FUNCIONALIDAD DE EDICIÓN COMPLETA
function showCalendarPage() {
    NavigationSystem.currentPage = 'calendario';
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    const jornadas = torneoActual ? torneoActual.jornadas : [];
    const torneoBackground = torneoActual ? TournamentBackgrounds.getTorneoBackground(torneoActual.id) : theme.background;
    
    document.getElementById('app').innerHTML = `
        <div style="padding: 16px; background: ${torneoBackground}; min-height: 100vh; color: ${theme.textColor}; transition: all 0.4s ease;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: ${theme.cardBackground}; padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); transition: all 0.4s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h1 style="color: ${theme.primaryColor}; margin: 0; font-size: 1.8em;">📅 ${torneoActual.nombre}</h1>
                            <p style="margin: 4px 0 0 0; color: ${theme.secondaryColor}; font-size: 0.9em;">Calendario oficial - Estructura desde Excel</p>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            ${ThemeSystem.getThemeSwitch()}
                            ${UserSystem.getUserBadge()}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        ${NavigationSystem.getMenuHTML()}
                        <div style="display: flex; gap: 8px;">
                            <button onclick="NavigationSystem.selectPage('resultados')" 
                                    style="padding: 8px 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85em; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px;">
                                <span>📊</span> Ver Resultados
                            </button>
                            <button onclick="showPlayoffsPage('${torneoActual.id}')" 
                                    style="padding: 8px 12px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85em; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px;">
                                <span>🏆</span> Playoffs
                            </button>
                        </div>
                    </div>
                </div>

                ${jornadas.length === 0 ? `
                    <div style="text-align: center; padding: 40px; background: ${theme.cardBackground}; border-radius: 16px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); transition: all 0.4s ease;">
                        <p style="color: ${theme.secondaryColor}; font-size: 1em;">No hay jornadas generadas</p>
                    </div>
                ` : `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px;">
                        ${jornadas.map((jornada, jornadaIndex) => `
                            <div style="background: ${theme.cardBackground}; padding: 20px; border-radius: 16px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); transition: all 0.4s ease;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <h3 style="color: ${theme.primaryColor}; margin: 0; font-size: 1.2em;">${jornada.numero}</h3>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <span style="background: ${jornadaIndex === 4 ? '#f59e0b' : '#10b981'}; color: white; padding: 6px 12px; border-radius: 12px; font-size: 0.8em; font-weight: bold;">
                                            ${jornada.partidos.length} Partidos
                                        </span>
                                        <span style="color: ${theme.secondaryColor}; font-size: 0.8em;">${jornada.fecha}</span>
                                    </div>
                                </div>
                                
                                ${jornada.partidos.map((partido, partidoIndex) => {
                                    const puedeEditar = TournamentSystem.puedeEditarPartido(partido);
                                    const esGanadorLocal = partido.ganador === partido.local;
                                    const esGanadorVisitante = partido.ganador === partido.visitante;
                                    const esEmpate = partido.ganador === "Empate";
                                    
                                    return `
                                        <div onclick="${puedeEditar ? `abrirModalEdicion(${jornadaIndex}, ${partidoIndex})` : ''}" 
                                             style="position: relative; display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 10px 0; background: ${puedeEditar ? 'rgba(96, 165, 250, 0.1)' : 'rgba(100, 116, 139, 0.1)'}; border-radius: 10px; border-left: 4px solid ${puedeEditar ? theme.primaryColor : theme.secondaryColor}; ${puedeEditar ? 'cursor: pointer;' : ''} transition: all 0.3s ease;">
                                            
                                            <div style="flex: 1;">
                                                <strong style="${currentUser === partido.local ? `color: ${theme.primaryColor};` : `color: ${theme.textColor};`} font-size: 0.9em;">
                                                    ${partido.local}
                                                    ${currentUser === partido.local ? ' (TÚ)' : ''}
                                                </strong>
                                                <span style="margin-left: 8px; padding: 4px 8px; background: ${esGanadorLocal ? '#10b981' : (esEmpate ? '#f59e0b' : 'rgba(100, 116, 139, 0.3)')}; color: ${esGanadorLocal || esEmpate ? 'white' : theme.textColor}; border-radius: 6px; font-weight: bold; font-size: 0.85em;">
                                                    ${partido.marcadorLocal === 0.1 ? '0.1' : partido.marcadorLocal}
                                                </span>
                                            </div>
                                            
                                            <div style="font-weight: bold; color: ${theme.secondaryColor}; margin: 0 12px; font-size: 0.9em;">VS</div>
                                            
                                            <div style="flex: 1; text-align: right;">
                                                <span style="margin-right: 8px; padding: 4px 8px; background: ${esGanadorVisitante ? '#10b981' : (esEmpate ? '#f59e0b' : 'rgba(100, 116, 139, 0.3)')}; color: ${esGanadorVisitante || esEmpate ? 'white' : theme.textColor}; border-radius: 6px; font-weight: bold; font-size: 0.85em;">
                                                    ${partido.marcadorVisitante === 0.1 ? '0.1' : partido.marcadorVisitante}
                                                </span>
                                                <strong style="${currentUser === partido.visitante ? `color: ${theme.primaryColor};` : `color: ${theme.textColor};`} font-size: 0.9em;">
                                                    ${partido.visitante}
                                                    ${currentUser === partido.visitante ? ' (TÚ)' : ''}
                                                </strong>
                                            </div>
                                            
                                            <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); background: ${esEmpate ? '#f59e0b' : theme.primaryColor}; color: white; padding: 3px 10px; border-radius: 10px; font-size: 0.75em; font-weight: bold; white-space: nowrap;">
                                                ${esEmpate ? '🤝 Empate' : partido.ganador === "Por jugar" ? '⏳ Por jugar' : `🏆 ${partido.ganador}`}
                                            </div>
                                            
                                            ${puedeEditar ? `
                                                <div style="position: absolute; top: 6px; right: 6px; font-size: 0.7em; color: ${theme.primaryColor}; font-weight: bold;">
                                                    ✏️
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
        
        <div id="modalEdicion" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; width: 90%; max-width: 450px; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.5); border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                <h3 style="color: ${theme.primaryColor}; margin-bottom: 20px; font-size: 1.2em;" id="modalTitulo">Editar Marcador</h3>
                <div id="modalContenido"></div>
                <div style="margin-top: 20px; display: flex; gap: 8px; justify-content: center;">
                    <button onclick="cerrarModal()" style="padding: 10px 16px; background: ${theme.secondaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9em; transition: all 0.3s ease;">Cancelar</button>
                    <button onclick="guardarResultado()" style="padding: 10px 16px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9em; transition: all 0.3s ease;">Guardar</button>
                </div>
            </div>
        </div>
    `;
}

// PÁGINA DE RESULTADOS MEJORADA - DISEÑO ACTUALIZADO
function showResultadosPage() {
    NavigationSystem.currentPage = 'resultados';
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    const torneoBackground = torneoActual ? TournamentBackgrounds.getTorneoBackground(torneoActual.id) : theme.background;
    
    if (!torneoActual || !torneoActual.jornadas || torneoActual.jornadas.length === 0) {
        document.getElementById('app').innerHTML = `
            <div style="padding: 16px; background: ${torneoBackground}; min-height: 100vh; color: ${theme.textColor}; transition: all 0.4s ease;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="background: ${theme.cardBackground}; padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div>
                                <h1 style="color: ${theme.primaryColor}; margin: 0; font-size: 1.8em;">📊 ${torneoActual.nombre} - RESULTADOS</h1>
                                <p style="margin: 4px 0 0 0; color: ${theme.secondaryColor}; font-size: 0.9em;">Estadísticas del torneo</p>
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center;">
                                ${ThemeSystem.getThemeSwitch()}
                                ${UserSystem.getUserBadge()}
                            </div>
                        </div>
                        
                        ${NavigationSystem.getMenuHTML()}
                    </div>
                    <div style="background: ${theme.cardBackground}; padding: 40px; border-radius: 16px; text-align: center; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                        <h2 style="color: #f87171; margin-bottom: 15px; font-size: 1.3em;">⚠️ No hay datos disponibles</h2>
                        <p style="color: ${theme.secondaryColor}; margin-bottom: 20px; font-size: 0.95em;">Este torneo no tiene jornadas generadas o no hay partidos jugados.</p>
                        <button onclick="NavigationSystem.selectPage('torneos')" 
                                style="padding: 10px 20px; background: ${theme.primaryColor}; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; font-size: 0.9em; transition: all 0.3s ease;">
                            🏆 Volver a Torneos
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const tablaEstadistica = StatisticsSystem.generarTablaEstadistica(torneoActual);
    const tablaGeneral = StatisticsSystem.generarTablaGeneral(torneoActual);
    
    document.getElementById('app').innerHTML = `
        <div style="padding: 16px; background: ${torneoBackground}; min-height: 100vh; color: ${theme.textColor}; transition: all 0.4s ease;">
            <div style="max-width: 1400px; margin: 0 auto;">
                <div style="background: ${theme.cardBackground}; padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h1 style="color: ${theme.primaryColor}; margin: 0; font-size: 1.8em;">📊 ${torneoActual.nombre}</h1>
                            <p style="margin: 4px 0 0 0; color: ${theme.secondaryColor}; font-size: 0.9em;">Estadísticas actualizadas en tiempo real</p>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            ${ThemeSystem.getThemeSwitch()}
                            ${UserSystem.getUserBadge()}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        ${NavigationSystem.getMenuHTML()}
                        <div style="display: flex; gap: 8px;">
                            <button onclick="NavigationSystem.selectPage('calendario')" 
                                    style="padding: 8px 12px; background: ${theme.primaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85em; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px;">
                                <span>📅</span> Calendario
                            </button>
                            <button onclick="showPlayoffsPage('${torneoActual.id}')" 
                                    style="padding: 8px 12px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85em; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px;">
                                <span>🏆</span> Playoffs
                            </button>
                        </div>
                    </div>
                </div>

                <!-- TABLA ESTADÍSTICA PRINCIPAL - DISEÑO MEJORADO -->
                <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; margin-bottom: 25px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <h2 style="color: ${theme.primaryColor}; margin-bottom: 25px; text-align: center; font-size: 1.6em; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span style="background: ${theme.primaryColor}; color: white; padding: 8px 12px; border-radius: 10px;">📈</span> 
                        TABLA DE CLASIFICACIÓN
                    </h2>
                    
                    <div style="overflow-x: auto; border-radius: 12px; border: 1px solid ${theme.borderColor}; background: rgba(255, 255, 255, 0.05);">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}dd);">
                                    <th style="padding: 16px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.9em; border-radius: 8px 0 0 0;">POS</th>
                                    <th style="padding: 16px; text-align: left; border: none; color: white; font-weight: bold; font-size: 0.9em;">JUGADOR</th>
                                    <th style="padding: 16px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.9em;">PJ</th>
                                    <th style="padding: 16px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.9em;">PG</th>
                                    <th style="padding: 16px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.9em;">PF</th>
                                    <th style="padding: 16px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.9em;">PC</th>
                                    <th style="padding: 16px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.9em; border-radius: 0 8px 0 0;">DIF</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tablaEstadistica.map((jugador, index) => {
                                    const isCurrentUser = currentUser === jugador.jugador;
                                    const rowBackground = isCurrentUser ? 
                                        `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.primaryColor}10)` :
                                        (index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)');
                                    
                                    return `
                                        <tr style="background: ${rowBackground}; ${isCurrentUser ? `border: 2px solid ${theme.primaryColor};` : ''}">
                                            <td style="padding: 14px; text-align: center; border: none; font-weight: bold; color: ${index < 3 ? '#fbbf24' : '#bfdbfe'}; font-size: 1em;">
                                                ${index + 1}
                                                ${index === 0 ? ' 🥇' : index === 1 ? ' 🥈' : index === 2 ? ' 🥉' : ''}
                                            </td>
                                            <td style="padding: 14px; border: none; font-weight: bold; color: ${isCurrentUser ? theme.primaryColor : theme.textColor}; font-size: 0.95em;">
                                                <div style="display: flex; align-items: center; gap: 10px;">
                                                    ${ProfileSystem.getAvatarHTML(jugador.jugador, 'small')}
                                                    <div>
                                                        <div>${jugador.jugador}</div>
                                                        <div style="font-size: 0.8em; color: ${theme.secondaryColor};">
                                                            ${jugador.rol === 'ADMIN' ? '🛡️ Admin' : jugador.rol === 'MAESTRO' ? '👨‍🏫 Maestro' : '🎮 Entrenador'}
                                                            ${isCurrentUser ? ' <span style="color: #60a5fa;">(TÚ)</span>' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style="padding: 14px; text-align: center; border: none; color: ${theme.secondaryColor}; font-weight: 500; font-size: 0.95em;">${jugador.partidosJugados}</td>
                                            <td style="padding: 14px; text-align: center; border: none; color: #34d399; font-weight: bold; font-size: 1em;">${jugador.partidosGanados}</td>
                                            <td style="padding: 14px; text-align: center; border: none; font-weight: bold; color: ${theme.textColor}; font-size: 0.95em;">${Math.round(jugador.puntosFavor)}</td>
                                            <td style="padding: 14px; text-align: center; border: none; color: ${theme.secondaryColor}; font-weight: 500; font-size: 0.95em;">${Math.round(jugador.puntosContra)}</td>
                                            <td style="padding: 14px; text-align: center; border: none; font-weight: bold; color: ${jugador.diferenciaPuntos >= 0 ? '#34d399' : '#f87171'}; font-size: 1em;">
                                                ${jugador.diferenciaPuntos > 0 ? '+' : ''}${jugador.diferenciaPuntos}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 15px; color: ${theme.secondaryColor}; font-size: 0.8em; text-align: center;">
                        <strong>Leyenda:</strong> POS=Posición, PJ=Partidos Jugados, PG=Partidos Ganados, PF=Puntos a Favor, PC=Puntos en Contra, DIF=Diferencia
                    </div>
                </div>

                <!-- TABLA GENERAL MEJORADA -->
                <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <h2 style="color: ${theme.primaryColor}; margin-bottom: 25px; text-align: center; font-size: 1.6em; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span style="background: #10b981; color: white; padding: 8px 12px; border-radius: 10px;">🏆</span> 
                        ESTADÍSTICAS DETALLADAS
                    </h2>
                    
                    <div style="overflow-x: auto; border-radius: 12px; border: 1px solid ${theme.borderColor}; background: rgba(255, 255, 255, 0.05);">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #10b981, #059669);">
                                    <th style="padding: 14px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.85em; border-radius: 8px 0 0 0;">POS</th>
                                    <th style="padding: 14px; text-align: left; border: none; color: white; font-weight: bold; font-size: 0.85em;">JUGADOR</th>
                                    <th style="padding: 14px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.85em;">PJ</th>
                                    <th style="padding: 14px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.85em;">PG</th>
                                    <th style="padding: 14px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.85em;">PF</th>
                                    <th style="padding: 14px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.85em;">PC</th>
                                    <th style="padding: 14px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.85em;">DIF</th>
                                    <th style="padding: 14px; text-align: center; border: none; color: white; font-weight: bold; font-size: 0.85em; border-radius: 0 8px 0 0;">% VICTORIAS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tablaGeneral.map((jugador, index) => {
                                    const isCurrentUser = currentUser === jugador.jugador;
                                    const rowBackground = isCurrentUser ? 
                                        `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.primaryColor}10)` :
                                        (index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)');
                                    
                                    return `
                                        <tr style="background: ${rowBackground}; ${isCurrentUser ? `border: 2px solid ${theme.primaryColor};` : ''}">
                                            <td style="padding: 12px; text-align: center; border: none; font-weight: bold; color: ${index < 3 ? '#fbbf24' : '#bfdbfe'}; font-size: 0.9em;">
                                                ${index + 1}
                                            </td>
                                            <td style="padding: 12px; border: none; font-weight: bold; color: ${isCurrentUser ? theme.primaryColor : theme.textColor}; font-size: 0.9em;">
                                                ${jugador.jugador}
                                                ${isCurrentUser ? ' <span style="color: #60a5fa;">(TÚ)</span>' : ''}
                                            </td>
                                            <td style="padding: 12px; text-align: center; border: none; color: ${theme.secondaryColor}; font-size: 0.9em;">${jugador.partidosJugados}</td>
                                            <td style="padding: 12px; text-align: center; border: none; color: #34d399; font-weight: bold; font-size: 0.9em;">${jugador.partidosGanados}</td>
                                            <td style="padding: 12px; text-align: center; border: none; font-weight: bold; color: ${theme.textColor}; font-size: 0.9em;">${Math.round(jugador.puntosFavor)}</td>
                                            <td style="padding: 12px; text-align: center; border: none; color: ${theme.secondaryColor}; font-size: 0.9em;">${Math.round(jugador.puntosContra)}</td>
                                            <td style="padding: 12px; text-align: center; border: none; font-weight: bold; color: ${jugador.diferenciaPuntos >= 0 ? '#34d399' : '#f87171'}; font-size: 0.9em;">
                                                ${jugador.diferenciaPuntos > 0 ? '+' : ''}${jugador.diferenciaPuntos}
                                            </td>
                                            <td style="padding: 12px; text-align: center; border: none; font-weight: bold; color: ${jugador.porcentajeVictorias >= 50 ? '#34d399' : '#f87171'}; font-size: 0.9em;">
                                                <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                                    <span>${jugador.porcentajeVictorias}%</span>
                                                    ${jugador.porcentajeVictorias >= 70 ? '🔥' : jugador.porcentajeVictorias >= 50 ? '⚡' : '📊'}
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 15px; color: ${theme.secondaryColor}; font-size: 0.75em; text-align: center;">
                        <strong>Leyenda:</strong> PJ=Partidos Jugados, PG=Partidos Ganados, PF=Puntos a Favor, PC=Puntos en Contra, DIF=Diferencia, % Victorias=Porcentaje de victorias
                    </div>
                </div>

                <!-- RESUMEN DE ESTADÍSTICAS -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}dd); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                        <div style="font-size: 2em; font-weight: bold;">${tablaGeneral.length}</div>
                        <div style="font-size: 0.9em;">JUGADORES</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                        <div style="font-size: 2em; font-weight: bold;">${tablaGeneral.reduce((total, j) => total + j.partidosJugados, 0)}</div>
                        <div style="font-size: 0.9em;">PARTIDOS TOTALES</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                        <div style="font-size: 2em; font-weight: bold;">${Math.round(tablaGeneral.reduce((total, j) => total + j.puntosFavor, 0))}</div>
                        <div style="font-size: 0.9em;">PUNTOS TOTALES</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// PÁGINA DE PLAYOFFS
function showPlayoffsPage(torneoId = null) {
    if (!torneoId && NavigationSystem.currentTorneo) {
        torneoId = NavigationSystem.currentTorneo.id;
    }
    
    if (!torneoId) {
        NotificationSystem.show('⚠️ Primero selecciona un torneo', 'warning');
        NavigationSystem.selectPage('torneos');
        return;
    }
    
    NavigationSystem.currentPage = 'playoffs';
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    const torneo = TournamentSystem.torneos.find(t => t.id === torneoId);
    const torneoBackground = torneo ? TournamentBackgrounds.getTorneoBackground(torneo.id) : theme.background;
    
    document.getElementById('app').innerHTML = `
        <div style="padding: 16px; background: ${torneoBackground}; min-height: 100vh; color: ${theme.textColor}; transition: all 0.4s ease;">
            <div style="max-width: 1400px; margin: 0 auto;">
                <div style="background: ${theme.cardBackground}; padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h1 style="color: ${theme.primaryColor}; margin: 0; font-size: 1.8em;">🏆 ${torneo.nombre} - PLAYOFFS</h1>
                            <p style="margin: 4px 0 0 0; color: ${theme.secondaryColor}; font-size: 0.9em;">Fase final del torneo</p>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            ${ThemeSystem.getThemeSwitch()}
                            ${UserSystem.getUserBadge()}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        ${NavigationSystem.getMenuHTML()}
                        <div style="display: flex; gap: 8px;">
                            <button onclick="NavigationSystem.selectPage('resultados')" 
                                    style="padding: 8px 12px; background: ${theme.primaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85em; display: flex; align-items: center; gap: 4px;">
                                <span>📊</span> Resultados
                            </button>
                            <button onclick="NavigationSystem.selectPage('calendario')" 
                                    style="padding: 8px 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85em; display: flex; align-items: center; gap: 4px;">
                                <span>📅</span> Calendario
                            </button>
                        </div>
                    </div>
                </div>

                ${PlayoffSystem.getPlayoffHTML(torneoId)}
            </div>
        </div>
    `;
}

// MODALES PARA PLAYOFFS
function abrirModalPlayIn(torneoId, grupo, indexPartido, jugador1, jugador2) {
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="modalPlayIn" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2000;">
            <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; width: 90%; max-width: 400px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                <h3 style="color: ${theme.primaryColor}; margin-bottom: 20px; text-align: center;">${grupo}: ${jugador1} vs ${jugador2}</h3>
                
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 15px; align-items: center; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <div style="font-weight: bold; margin-bottom: 10px;">${jugador1}</div>
                        <input type="number" id="marcadorPlayIn1" min="0" max="9" value="0" 
                               style="width: 60px; padding: 10px; text-align: center; font-size: 1.2em; border: 2px solid ${theme.borderColor}; border-radius: 8px; background: rgba(15, 23, 42, 0.6); color: ${theme.textColor};">
                    </div>
                    
                    <div style="font-weight: bold; color: ${theme.secondaryColor}; font-size: 1.5em;">VS</div>
                    
                    <div style="text-align: center;">
                        <div style="font-weight: bold; margin-bottom: 10px;">${jugador2}</div>
                        <input type="number" id="marcadorPlayIn2" min="0" max="9" value="0" 
                               style="width: 60px; padding: 10px; text-align: center; font-size: 1.2em; border: 2px solid ${theme.borderColor}; border-radius: 8px; background: rgba(15, 23, 42, 0.6); color: ${theme.textColor};">
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="cerrarModalPlayIn()" 
                            style="padding: 10px 20px; background: ${theme.secondaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Cancelar
                    </button>
                    <button onclick="guardarResultadoPlayIn('${torneoId}', '${grupo}', ${indexPartido}, '${jugador1}', '${jugador2}')" 
                            style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    `);
}

function abrirModalSemifinal(torneoId, semifinal) {
    const playoff = PlayoffSystem.playoffs[torneoId];
    const semifinalData = semifinal === 'SEMIFINAL A' ? playoff.semifinalA : playoff.semifinalB;
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="modalSemifinal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2000;">
            <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; width: 90%; max-width: 400px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                <h3 style="color: #3b82f6; margin-bottom: 20px; text-align: center;">${semifinal}</h3>
                
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 15px; align-items: center; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <div style="font-weight: bold; margin-bottom: 10px;">${semifinalData.jugadores[0]}</div>
                        <input type="number" id="marcadorSemi1" min="0" max="9" value="0" 
                               style="width: 60px; padding: 10px; text-align: center; font-size: 1.2em; border: 2px solid ${theme.borderColor}; border-radius: 8px; background: rgba(15, 23, 42, 0.6); color: ${theme.textColor};">
                    </div>
                    
                    <div style="font-weight: bold; color: ${theme.secondaryColor}; font-size: 1.5em;">VS</div>
                    
                    <div style="text-align: center;">
                        <div style="font-weight: bold; margin-bottom: 10px;">${semifinalData.jugadores[1]}</div>
                        <input type="number" id="marcadorSemi2" min="0" max="9" value="0" 
                               style="width: 60px; padding: 10px; text-align: center; font-size: 1.2em; border: 2px solid ${theme.borderColor}; border-radius: 8px; background: rgba(15, 23, 42, 0.6); color: ${theme.textColor};">
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="cerrarModalSemifinal()" 
                            style="padding: 10px 20px; background: ${theme.secondaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Cancelar
                    </button>
                    <button onclick="guardarResultadoSemifinal('${torneoId}', '${semifinal}')" 
                            style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    `);
}

function abrirModalFinal(torneoId) {
    const playoff = PlayoffSystem.playoffs[torneoId];
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="modalFinal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2000;">
            <div style="background: ${theme.cardBackground}; padding: 30px; border-radius: 16px; width: 90%; max-width: 450px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px); text-align: center;">
                <h3 style="color: #f59e0b; margin-bottom: 25px; font-size: 1.5em;">🏆 GRAN FINAL 🏆</h3>
                
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center; margin-bottom: 25px;">
                    <div style="text-align: center;">
                        <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 15px;">${playoff.final.jugadores[0]}</div>
                        <input type="number" id="marcadorFinal1" min="0" max="9" value="0" 
                               style="width: 70px; padding: 12px; text-align: center; font-size: 1.5em; border: 3px solid ${theme.borderColor}; border-radius: 10px; background: rgba(15, 23, 42, 0.6); color: ${theme.textColor};">
                    </div>
                    
                    <div style="font-weight: bold; color: ${theme.secondaryColor}; font-size: 2em;">VS</div>
                    
                    <div style="text-align: center;">
                        <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 15px;">${playoff.final.jugadores[1]}</div>
                        <input type="number" id="marcadorFinal2" min="0" max="9" value="0" 
                               style="width: 70px; padding: 12px; text-align: center; font-size: 1.5em; border: 3px solid ${theme.borderColor}; border-radius: 10px; background: rgba(15, 23, 42, 0.6); color: ${theme.textColor};">
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="cerrarModalFinal()" 
                            style="padding: 12px 24px; background: ${theme.secondaryColor}; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em;">
                        Cancelar
                    </button>
                    <button onclick="guardarResultadoFinal('${torneoId}')" 
                            style="padding: 12px 24px; background: #f59e0b; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; font-weight: bold;">
                        Coronar Campeón
                    </button>
                </div>
            </div>
        </div>
    `);
}

// FUNCIONES PARA GUARDAR RESULTADOS DE PLAYOFFS - MODIFICADAS
function guardarResultadoPlayIn(torneoId, grupo, indexPartido, jugador1, jugador2) {
    const marcador1 = parseInt(document.getElementById('marcadorPlayIn1').value) || 0;
    const marcador2 = parseInt(document.getElementById('marcadorPlayIn2').value) || 0;
    
    if (marcador1 === marcador2) {
        NotificationSystem.show('❌ No puede haber empate en playoffs', 'error');
        return;
    }
    
    const playoff = PlayoffSystem.playoffs[torneoId];
    const playIn = grupo === 'PLAY-IN A' ? playoff.playInA : playoff.playInB;
    
    // Guardar resultados
    playIn.resultados[indexPartido] = `${marcador1}-${marcador2}`;
    playIn.resultados[indexPartido + 1] = `${marcador2}-${marcador1}`;
    
    // Determinar ganador
    const ganador = marcador1 > marcador2 ? jugador1 : jugador2;
    playIn.ganadores.push(ganador);
    
    PlayoffSystem.savePlayoffs();
    cerrarModalPlayIn();
    showPlayoffsPage(torneoId);
    
    NotificationSystem.show(`✅ Resultado guardado: ${jugador1} ${marcador1}-${marcador2} ${jugador2}<br>Ganador: ${ganador}`, 'success');
}

function guardarResultadoSemifinal(torneoId, semifinal) {
    const marcador1 = parseInt(document.getElementById('marcadorSemi1').value) || 0;
    const marcador2 = parseInt(document.getElementById('marcadorSemi2').value) || 0;
    
    if (marcador1 === marcador2) {
        NotificationSystem.show('❌ No puede haber empate en playoffs', 'error');
        return;
    }
    
    const playoff = PlayoffSystem.playoffs[torneoId];
    const semifinalData = semifinal === 'SEMIFINAL A' ? playoff.semifinalA : playoff.semifinalB;
    
    // Guardar resultado
    semifinalData.resultado = `${marcador1}-${marcador2}`;
    semifinalData.ganador = marcador1 > marcador2 ? semifinalData.jugadores[0] : semifinalData.jugadores[1];
    
    PlayoffSystem.savePlayoffs();
    cerrarModalSemifinal();
    showPlayoffsPage(torneoId);
    
    NotificationSystem.show(`✅ ${semifinal} guardada<br>Ganador: ${semifinalData.ganador}`, 'success');
}

function guardarResultadoFinal(torneoId) {
    const marcador1 = parseInt(document.getElementById('marcadorFinal1').value) || 0;
    const marcador2 = parseInt(document.getElementById('marcadorFinal2').value) || 0;
    
    if (marcador1 === marcador2) {
        NotificationSystem.show('❌ No puede haber empate en la final', 'error');
        return;
    }
    
    const playoff = PlayoffSystem.playoffs[torneoId];
    
    // Guardar resultado
    playoff.final.resultado = `${marcador1}-${marcador2}`;
    playoff.final.ganador = marcador1 > marcador2 ? playoff.final.jugadores[0] : playoff.final.jugadores[1];
    
    PlayoffSystem.savePlayoffs();
    cerrarModalFinal();
    showPlayoffsPage(torneoId);
    
    NotificationSystem.show(`✅ Final guardada<br>Ganador: ${playoff.final.ganador}`, 'success');
}

// FUNCIONES PARA CERRAR MODALES DE PLAYOFFS
function cerrarModalPlayIn() {
    const modal = document.getElementById('modalPlayIn');
    if (modal) modal.remove();
}

function cerrarModalSemifinal() {
    const modal = document.getElementById('modalSemifinal');
    if (modal) modal.remove();
}

function cerrarModalFinal() {
    const modal = document.getElementById('modalFinal');
    if (modal) modal.remove();
}

function cerrarVentanaCampeon() {
    const ventana = document.getElementById('ventanaCampeon');
    if (ventana) ventana.remove();
}

// SISTEMA DE MODALES
const ModalSystem = {
    abrirModalEdicion(jornadaIndex, partidoIndex) {
        partidoEditando = { jornadaIndex, partidoIndex };
        const partido = torneoActual.jornadas[jornadaIndex].partidos[partidoIndex];
        const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
        
        document.getElementById('modalTitulo').innerHTML = `Editar Marcador: ${partido.local} vs ${partido.visitante}`;
        
        document.getElementById('modalContenido').innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px;">
                <div style="flex: 1; text-align: center;">
                    <h4 style="color: ${theme.textColor}; margin-bottom: 10px; font-size: 1em;">${partido.local}</h4>
                    <input type="number" id="marcadorLocal" value="${partido.marcadorLocal}" min="0" step="0.1"
                           oninput="calcularGanadorAutomatico()"
                           style="width: 70px; padding: 8px; text-align: center; background: rgba(15, 23, 42, 0.6); border: 1px solid ${theme.borderColor}; border-radius: 8px; color: ${theme.textColor}; font-size: 1.1em;">
                </div>
                
                <div style="font-weight: bold; color: ${theme.secondaryColor}; font-size: 1.3em;">VS</div>
                
                <div style="flex: 1; text-align: center;">
                    <h4 style="color: ${theme.textColor}; margin-bottom: 10px; font-size: 1em;">${partido.visitante}</h4>
                    <input type="number" id="marcadorVisitante" value="${partido.marcadorVisitante}" min="0" step="0.1"
                           oninput="calcularGanadorAutomatico()"
                           style="width: 70px; padding: 8px; text-align: center; background: rgba(15, 23, 42, 0.6); border: 1px solid ${theme.borderColor}; border-radius: 8px; color: ${theme.textColor}; font-size: 1.1em;">
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4 style="color: ${theme.textColor}; margin-bottom: 10px; font-size: 1em;">Resultado Automático:</h4>
                <div id="resultadoAutomatico" style="padding: 12px; background: rgba(96, 165, 250, 0.2); border-radius: 8px; border: 2px solid ${theme.primaryColor};">
                    <strong style="color: ${theme.primaryColor}; font-size: 1em;">🏆 ${partido.ganador}</strong>
                    <p style="margin: 6px 0 0 0; color: ${theme.secondaryColor}; font-size: 0.85em;">
                        El ganador se calcula automáticamente según los marcadores
                    </p>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding: 8px; background: rgba(139, 92, 246, 0.1); border-radius: 6px; border: 1px solid #8b5cf6;">
                <p style="margin: 0; color: #8b5cf6; font-size: 0.85em;">
                    💡 <strong>Marcador especial:</strong> Usa <strong>0.1</strong> para indicar derrota por incomparecencia<br>
                    <small>En las tablas estadísticas, 0.1 se contará como 1 punto</small>
                </p>
            </div>
        `;
        
        document.getElementById('modalEdicion').style.display = 'flex';
    },

    calcularGanadorAutomatico() {
        if (!partidoEditando) return;
        
        const marcadorLocal = parseFloat(document.getElementById('marcadorLocal').value) || 0;
        const marcadorVisitante = parseFloat(document.getElementById('marcadorVisitante').value) || 0;
        const partido = torneoActual.jornadas[partidoEditando.jornadaIndex].partidos[partidoEditando.partidoIndex];
        
        let ganador = "Por jugar";
        let color = ThemeSystem.themes[ThemeSystem.currentTheme].primaryColor;
        
        // Lógica especial para 0.1
        if (marcadorLocal === 0.1) {
            ganador = partido.visitante;
            color = "#10b981";
        } else if (marcadorVisitante === 0.1) {
            ganador = partido.local;
            color = "#10b981";
        } else if (marcadorLocal > marcadorVisitante) {
            ganador = partido.local;
            color = "#10b981";
        } else if (marcadorVisitante > marcadorLocal) {
            ganador = partido.visitante;
            color = "#10b981";
        } else if (marcadorLocal === marcadorVisitante && (marcadorLocal > 0 || marcadorVisitante > 0)) {
            ganador = "Empate";
            color = "#f59e0b";
        }
        
        const resultadoElement = document.getElementById('resultadoAutomatico');
        resultadoElement.innerHTML = `
            <strong style="color: ${color}; font-size: 1em;">
                ${ganador === "Por jugar" ? "⏳ Por jugar" : ganador === "Empate" ? "🤝 Empate" : `🏆 ${ganador}`}
            </strong>
            <p style="margin: 6px 0 0 0; color: ${ThemeSystem.themes[ThemeSystem.currentTheme].secondaryColor}; font-size: 0.85em;">
                ${ganador === "Por jugar" ? "Ingresa los marcadores para ver el resultado" : "El ganador se calcula automáticamente según los marcadores"}
            </p>
        `;
        resultadoElement.style.borderColor = color;
        resultadoElement.style.background = color === ThemeSystem.themes[ThemeSystem.currentTheme].primaryColor ? 'rgba(96, 165, 250, 0.2)' : 
                                       color === "#10b981" ? 'rgba(16, 185, 129, 0.2)' : 
                                       'rgba(245, 158, 11, 0.2)';
        
        partido.ganador = ganador;
    },

    cerrarModal() {
        document.getElementById('modalEdicion').style.display = 'none';
        partidoEditando = null;
    },

    guardarResultado() {
        if (!partidoEditando) return;
        
        const marcadorLocal = document.getElementById('marcadorLocal').value;
        const marcadorVisitante = document.getElementById('marcadorVisitante').value;
        const partido = torneoActual.jornadas[partidoEditando.jornadaIndex].partidos[partidoEditando.partidoIndex];
        
        if (marcadorLocal === '' || marcadorVisitante === '') {
            NotificationSystem.show('❌ Ingresa ambos marcadores', 'error');
            return;
        }
        
        if (parseFloat(marcadorLocal) < 0 || parseFloat(marcadorVisitante) < 0) {
            NotificationSystem.show('❌ Los marcadores no pueden ser negativos', 'error');
            return;
        }
        
        partido.marcadorLocal = parseFloat(marcadorLocal);
        partido.marcadorVisitante = parseFloat(marcadorVisitante);
        
        if (partido.ganador === "Por jugar") {
            if (partido.marcadorLocal > partido.marcadorVisitante) {
                partido.ganador = partido.local;
            } else if (partido.marcadorVisitante > partido.marcadorLocal) {
                partido.ganador = partido.visitante;
            } else {
                partido.ganador = "Empate";
            }
        }
        
        TournamentSystem.saveTorneos();
        this.cerrarModal();
        showCalendarPage();
        
        NotificationSystem.show('✅ Resultado guardado correctamente', 'success');
    }
};

// FUNCIONES PARA LA GESTIÓN DE IMÁGENES DE PERFIL - MODIFICADAS
function previewProfileImage(username) {
    const input = document.getElementById('profileImageInput');
    const preview = document.getElementById('imagePreview');
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="text-align: center;">
                    <p style="color: ${theme.secondaryColor}; margin-bottom: 10px;">Vista previa:</p>
                    <img src="${e.target.result}" 
                         style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid ${theme.primaryColor};">
                </div>
            `;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

function uploadProfileImage(username) {
    const input = document.getElementById('profileImageInput');
    
    if (!input.files || !input.files[0]) {
        NotificationSystem.show('❌ Selecciona una imagen primero', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        ProfileSystem.changeProfileImage(username, e.target.result);
        NotificationSystem.show('✅ Imagen de perfil actualizada correctamente', 'success');
        showProfilePage(username);
    };
    
    reader.readAsDataURL(input.files[0]);
}

// FUNCIÓN PARA AGREGAR NUEVO USUARIO - MODIFICADA
function addNewUser() {
    const username = document.getElementById('newUserName').value.trim();
    const role = document.getElementById('newUserRole').value;
    const password = (role === 'ADMIN' || role === 'MAESTRO') ? document.getElementById('newUserPassword').value : null;
    
    if (!username) {
        NotificationSystem.show('❌ Ingresa un nombre de usuario', 'error');
        return;
    }
    
    if ((role === 'ADMIN' || role === 'MAESTRO') && (!password || password.length < 4)) {
        NotificationSystem.show('❌ La contraseña debe tener al menos 4 caracteres', 'error');
        return;
    }
    
    if (UserManagementSystem.addUser(username, role, password)) {
        document.getElementById('newUserName').value = '';
        document.getElementById('newUserPassword').value = '';
        document.getElementById('passwordField').style.display = 'none';
        document.getElementById('userList').innerHTML = UserManagementSystem.getUserListHTML();
    }
}

// FUNCIONES PARA FONDOS PERSONALIZADOS - MODIFICADAS
function uploadCustomBackground() {
    const input = document.getElementById('customBackgroundInput');
    const nameInput = document.getElementById('customBackgroundName');
    
    if (!input.files || !input.files[0]) {
        NotificationSystem.show('❌ Selecciona una imagen primero', 'error');
        return;
    }
    
    if (!nameInput.value.trim()) {
        NotificationSystem.show('❌ Ingresa un nombre para el fondo', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const backgroundId = TournamentBackgrounds.addCustomBackground(nameInput.value.trim(), e.target.result);
        NotificationSystem.show('✅ Fondo personalizado agregado correctamente', 'success');
        input.value = '';
        nameInput.value = '';
        const container = document.getElementById('backgroundSelectorContainer');
        container.innerHTML = TournamentBackgrounds.getBackgroundSelectorHTML();
    };
    
    reader.readAsDataURL(input.files[0]);
}

function removeCustomBackground(backgroundId) {
    ConfirmationSystem.show(
        '¿Eliminar este fondo personalizado?',
        () => {
            if (TournamentBackgrounds.removeCustomBackground(backgroundId)) {
                NotificationSystem.show('✅ Fondo personalizado eliminado', 'success');
                const container = document.getElementById('backgroundSelectorContainer');
                container.innerHTML = TournamentBackgrounds.getBackgroundSelectorHTML();
            }
        }
    );
}

// MODAL PARA SELECCIONAR FONDO DE TORNEO
function openBackgroundSelector() {
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    const container = document.getElementById('backgroundSelectorContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'block';
}

function openTorneoBackgroundSelector(torneoIndex) {
    const torneo = TournamentSystem.torneos[torneoIndex];
    const theme = ThemeSystem.themes[ThemeSystem.currentTheme];
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="torneoBackgroundModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: ${theme.cardBackground}; padding: 25px; border-radius: 16px; width: 90%; max-width: 500px; border: 1px solid ${theme.borderColor}; backdrop-filter: blur(10px);">
                <h3 style="color: ${theme.primaryColor}; margin-bottom: 20px; font-size: 1.3em; display: flex; align-items: center; gap: 8px;">
                    🎨 Cambiar Fondo para "${torneo.nombre}"
                </h3>
                ${TournamentBackgrounds.getBackgroundSelectorHTML(torneo.id)}
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="closeTorneoBackgroundModal()" 
                            style="padding: 10px 16px; background: ${theme.secondaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `);
}

function closeTorneoBackgroundModal() {
    const modal = document.getElementById('torneoBackgroundModal');
    if (modal) modal.remove();
}

function selectTournamentBackground(backgroundKey, torneoId = null) {
    if (torneoId) {
        TournamentBackgrounds.setTorneoBackground(torneoId, backgroundKey);
        closeTorneoBackgroundModal();
        showTorneosPage();
        NotificationSystem.show('✅ Fondo del torneo actualizado correctamente', 'success');
    } else {
        window.selectedBackground = backgroundKey;
        const container = document.getElementById('backgroundSelectorContainer');
        container.style.display = 'none';
        const bg = TournamentBackgrounds.backgrounds[backgroundKey];
        NotificationSystem.show(`🎨 Fondo seleccionado: ${bg.name}`, 'info');
    }
}

// FUNCIONES GLOBALES
function initApp() {
    console.log('🚀 APP INICIADA');
    
    window.currentUser = null;
    window.torneos = JSON.parse(localStorage.getItem('pokemonTorneos')) || [];
    window.torneoActual = null;
    window.partidoEditando = null;
    window.selectedBackground = null;
    
    const savedUsers = localStorage.getItem('pokemonUsers');
    if (savedUsers) {
        UserSystem.users = JSON.parse(savedUsers);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .background-option:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
            border-color: #60a5fa !important;
        }
        
        .background-option.selected {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3) !important;
        }
        
        button {
            transition: all 0.2s ease !important;
        }
        
        button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        
        input, select {
            transition: all 0.3s ease !important;
        }
        
        input:focus, select:focus {
            outline: none !important;
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
        }

        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(100, 116, 139, 0.1);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(96, 165, 250, 0.6);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(96, 165, 250, 0.8);
        }
    `;
    document.head.appendChild(style);
    
    ThemeSystem.applyTheme();
    showMainPage();
}

function showMainPage() { UISystem.showMainPage(); }
function showTorneosPage() { UISystem.showTorneosPage(); }

function openLogin(trainerName) {
    if (UserSystem.login(trainerName)) {
        showTorneosPage();
    }
}

function crearTorneo() {
    const nombre = document.getElementById('nombreTorneo').value;
    const background = window.selectedBackground || 'default';
    
    if (TournamentSystem.crearTorneo(nombre, background)) {
        document.getElementById('nombreTorneo').value = '';
        window.selectedBackground = null;
        const container = document.getElementById('backgroundSelectorContainer');
        container.style.display = 'none';
        showTorneosPage();
        NotificationSystem.show('✅ Torneo creado con fondo personalizado! Ahora genera la jornada.', 'success');
    }
}

function eliminarTorneo(index) {
    TournamentSystem.eliminarTorneo(index);
}

function generarJornadaTorneo(index) {
    TournamentSystem.generarJornadaTorneo(index);
}

function seleccionarTorneo(torneoIndex, destino) {
    const torneo = torneos[torneoIndex];
    torneoActual = torneo;
    NavigationSystem.setCurrentTorneo(torneo);
    
    if (!torneo.jornadaGenerada || !torneo.jornadas?.length) {
        if (destino === 'calendario' || destino === 'resultados' || destino === 'playoffs') {
            NotificationSystem.show('⚠️ Este torneo no tiene jornada generada. Genera una jornada primero.', 'warning');
            return;
        }
    }
    
    if (destino === 'calendario') {
        NavigationSystem.selectPage('calendario');
    } else if (destino === 'resultados') {
        NavigationSystem.selectPage('resultados');
    } else if (destino === 'playoffs') {
        showPlayoffsPage(torneo.id);
    } else {
        NavigationSystem.selectPage('torneos');
    }
}

function abrirModalEdicion(jornadaIndex, partidoIndex) { ModalSystem.abrirModalEdicion(jornadaIndex, partidoIndex); }
function calcularGanadorAutomatico() { ModalSystem.calcularGanadorAutomatico(); }
function cerrarModal() { ModalSystem.cerrarModal(); }
function guardarResultado() { ModalSystem.guardarResultado(); }

// Cerrar menú al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const submenu = document.getElementById('torneosSubmenu');
    const torneosLink = document.querySelector('[onclick="NavigationSystem.toggleTorneosSubmenu()"]');
    
    if (submenu && torneosLink && !submenu.contains(event.target) && !torneosLink.contains(event.target)) {
        NavigationSystem.closeAllMenus();
    }
});

// INICIAR LA APLICACIÓN
initApp();