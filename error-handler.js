// Module utilitaire pour gérer les erreurs et la journalisation
// Fournit des fonctionnalités de débogage avancées et de rapports d'erreurs

const ErrorHandler = {
  // Configuration
  config: {
    enableConsoleLog: true,
    enableErrorReporting: true,
    logLevel: localStorage.getItem('log_level') || 'info', // 'debug', 'info', 'warn', 'error'
    maxLogEntries: 100
  },
  
  // État interne
  state: {
    logs: [],
    errors: [],
    lastError: null
  },
  
  // Niveaux de log
  LOG_LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  },
  
  // Initialisation
  init() {
    console.log("🚀 Initialisation du gestionnaire d'erreurs");
    
    // Intercepter les erreurs globales
    this.setupGlobalErrorHandling();
    
    // Journaliser l'initialisation
    this.log('ErrorHandler initialisé', this.LOG_LEVELS.INFO);
  },
  
  // Configurer la gestion des erreurs globales
  setupGlobalErrorHandling() {
    // Intercepter les erreurs non gérées
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), event.filename, event.lineno);
      // Ne pas empêcher le comportement par défaut
      return false;
    });
    
    // Intercepter les rejets de promesse non gérés
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.handleError(error, 'Promise rejection', 0);
      // Ne pas empêcher le comportement par défaut
      return false;
    });
    
    // Intercepter console.error
    if (!this.originalConsoleError) {
      this.originalConsoleError = console.error.bind(console);
    }
    console.error = (...args) => {
      // Si déjà dans la chaîne d'erreur, éviter boucle
      if (this._inErrorForward) {
        this.originalConsoleError.apply(console, args);
        return;
      }
      this.originalConsoleError.apply(console, args);
      // Construire message lisible
      const errorMessage = args.map(arg => arg instanceof Error ? `${arg.name}: ${arg.message}` : String(arg)).join(' ');
      // Enregistrer sans repasser par console.error
      this._inErrorForward = true;
      try {
        this._pushErrorLog(errorMessage);
      } finally {
        this._inErrorForward = false;
      }
    };
  },
  
  // Gérer une erreur
  handleError(error, source = 'unknown', line = 0) {
    // Créer une entrée d'erreur
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      source: source,
      line: line,
      stack: error.stack || '',
      type: error.name || 'Error'
    };
    
    // Stocker l'erreur
    this.state.lastError = errorEntry;
    this.state.errors.unshift(errorEntry);
    
    // Limiter le nombre d'erreurs stockées
    if (this.state.errors.length > this.config.maxLogEntries) {
      this.state.errors.pop();
    }
    
    // Journaliser l'erreur
    this.log(`[ERROR] ${errorEntry.message} (${errorEntry.source}:${errorEntry.line})`, this.LOG_LEVELS.ERROR);
    
    // Retourner l'entrée d'erreur
    return errorEntry;
  },
  
  // Journaliser un message
  log(message, level = this.LOG_LEVELS.INFO, data = null) {
    // Vérifier si le niveau de log est suffisant
    if (!this.isLogLevelEnabled(level)) {
      return;
    }
    
    // Créer une entrée de journal
    const logEntry = {
      timestamp: new Date().toISOString(),
      message: message,
      level: level,
      data: data
    };
    
    // Stocker l'entrée
    this.state.logs.unshift(logEntry);
    
    // Limiter le nombre d'entrées stockées
    if (this.state.logs.length > this.config.maxLogEntries) {
      this.state.logs.pop();
    }
    
    // Afficher dans la console si activé
    if (this.config.enableConsoleLog) {
      switch (level) {
        case this.LOG_LEVELS.DEBUG:
          console.debug(`[DEBUG] ${message}`, data);
          break;
        case this.LOG_LEVELS.INFO:
          console.info(`[INFO] ${message}`, data);
          break;
        case this.LOG_LEVELS.WARN:
          console.warn(`[WARN] ${message}`, data);
          break;
        case this.LOG_LEVELS.ERROR:
          // Utiliser la version originale pour éviter ré-entrée
          if (this.originalConsoleError) {
            this.originalConsoleError(`[ERROR] ${message}`, data);
          } else {
            window.console && window.console.log && window.console.log(`[ERROR] ${message}`, data);
          }
          break;
      }
    }
    
    // Retourner l'entrée de journal
    return logEntry;
  },
  
  // Vérifier si un niveau de log est activé
  isLogLevelEnabled(level) {
    const levels = Object.values(this.LOG_LEVELS);
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    
    // Si le niveau de configuration ou le niveau demandé est invalide, autoriser
    if (configLevelIndex === -1 || requestedLevelIndex === -1) {
      return true;
    }
    
    // Autoriser si le niveau demandé est supérieur ou égal au niveau configuré
    return requestedLevelIndex >= configLevelIndex;
  },
  
  // Obtenir les logs
  getLogs(level = null, limit = null) {
    let filteredLogs = this.state.logs;
    
    // Filtrer par niveau si spécifié
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    // Limiter le nombre de résultats si spécifié
    if (limit && limit > 0) {
      filteredLogs = filteredLogs.slice(0, limit);
    }
    
    return filteredLogs;
  },
  
  // Obtenir les erreurs
  getErrors(limit = null) {
    let errors = this.state.errors;
    
    // Limiter le nombre de résultats si spécifié
    if (limit && limit > 0) {
      errors = errors.slice(0, limit);
    }
    
    return errors;
  },
  
  // Effacer les logs
  clearLogs() {
    this.state.logs = [];
    return true;
  },
  
  // Effacer les erreurs
  clearErrors() {
    this.state.errors = [];
    this.state.lastError = null;
    return true;
  }
};

// Méthode interne pour enregistrer une erreur sans reboucler
ErrorHandler._pushErrorLog = function(message){
  const entry = { timestamp:new Date().toISOString(), message, level:this.LOG_LEVELS.ERROR };
  this.state.logs.unshift(entry);
  if (this.state.logs.length > this.config.maxLogEntries) this.state.logs.pop();
  return entry;
};

// Exposer le module globalement
window.ErrorHandler = ErrorHandler;

// Initialiser le gestionnaire d'erreurs
document.addEventListener('DOMContentLoaded', function() {
  ErrorHandler.init();
});
