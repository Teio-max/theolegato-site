// Gestionnaire du popup de bienvenue
// Ce module s'intègre avec DataManager pour sauvegarder et charger la configuration

console.log("🔄 Initialisation du gestionnaire de popup de bienvenue");

(function() {
  // Vérifier si DataManager est disponible
  if (typeof window.DataManager === 'undefined') {
    console.error("❌ DataManager n'est pas défini, impossible d'initialiser le gestionnaire de popup");
    return;
  }
  
  // Extension de DataManager pour gérer la configuration du popup
  const originalSaveDataMethod = window.DataManager.saveData;
  
  // Remplacer la méthode saveData pour inclure la configuration du popup
  window.DataManager.saveData = function() {
    console.log("💾 Sauvegarde des données avec configuration du popup...");
    
    // Ajouter la configuration du popup aux données globales à sauvegarder
    const configData = {
      films: this.data.films || [],
      articles: this.data.articles || [],
      projects: this.data.projects || [],
      desktopIcons: this.data.desktopIcons || [],
      welcomePopupConfig: this.data.welcomePopupConfig || {
        title: "Bienvenue sur mon site",
        name: "Théo Legato",
        description: "Développeur web et cinéaste passionné. Bienvenue sur mon portfolio où vous découvrirez mes projets, films et articles.",
        buttonText: "Découvrir le site",
        avatarImage: "avatar.jpg",
        socialLinks: [
          { name: 'Letterboxd', icon: 'letterboxd.png', url: 'https://letterboxd.com/theolegato/' },
          { name: 'GitHub', icon: 'icons/github.png', url: 'https://github.com/theolegato' },
          { name: 'LinkedIn', icon: 'icons/linkedin.png', url: 'https://linkedin.com/in/theolegato' },
          { name: 'Twitter', icon: 'icons/twitter.png', url: 'https://twitter.com/theolegato' }
        ]
      },
      homePageConfig: this.data.homePageConfig || {},
      bsodConfig: this.data.bsodConfig || {}
    };
    
    // Fusionner avec les données existantes
    this.data = { ...this.data, ...configData };
    
    // Appeler la méthode originale
    return originalSaveDataMethod.call(this);
  };
  
  // Extension de la méthode processData pour charger la configuration du popup
  const originalProcessDataMethod = window.DataManager.processData;
  
  // Remplacer la méthode processData pour inclure la configuration du popup
  window.DataManager.processData = function(data) {
    // Appeler la méthode originale d'abord
    if (typeof originalProcessDataMethod === 'function') {
      originalProcessDataMethod.call(this, data);
    }
    
    // Traiter spécifiquement la configuration du popup
    if (data && data.welcomePopupConfig) {
      this.data.welcomePopupConfig = data.welcomePopupConfig;
      console.log("✅ Configuration du popup de bienvenue chargée");
    }
    
    return true;
  };
  
  console.log("✅ Gestionnaire de popup de bienvenue initialisé");
})();
