// Script simple pour forcer l'initialisation du bureau Windows XP
console.log("🚀 Script d'initialisation d'urgence chargé");

// Fonction pour initialiser le bureau de manière sécurisée
function initDesktopSafe() {
  console.log("🖥️ Initialisation sécurisée du bureau");
  
  // Masquer l'écran de chargement et afficher le bureau
  try {
    const loadingScreen = document.getElementById('loading-screen');
    const desktop = document.getElementById('desktop');
    
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (desktop) desktop.style.display = 'block';
    
    console.log("✅ Bureau affiché avec succès");
  } catch (e) {
    console.error("❌ Erreur lors de l'affichage du bureau:", e);
  }
  
  // Initialiser les icônes du bureau
  try {
    if (typeof window.DesktopManager !== 'undefined' && window.DesktopManager) {
      if (typeof window.DesktopManager.renderDesktopIcons === 'function') {
        window.DesktopManager.renderDesktopIcons();
        console.log("✅ Icônes du bureau rendues");
      }
      
      if (typeof window.DesktopManager.setupDraggableIcons === 'function') {
        window.DesktopManager.setupDraggableIcons();
        console.log("✅ Icônes configurées comme draggable");
      }
    } else {
      console.warn("⚠️ DesktopManager non disponible");
    }
  } catch (e) {
    console.error("❌ Erreur lors de l'initialisation des icônes:", e);
  }
  
  // Jouer le son de démarrage
  try {
    if (typeof window.WindowManager !== 'undefined' && window.WindowManager && 
        typeof window.WindowManager.playSound === 'function') {
      window.WindowManager.playSound('startup');
      console.log("🔊 Son de démarrage joué");
    }
  } catch (e) {
    console.warn("⚠️ Impossible de jouer le son de démarrage:", e);
  }
  
  // Afficher la popup de bienvenue
  try {
    setTimeout(() => {
      if (typeof window.showWelcomePopup === 'function') {
        window.showWelcomePopup();
        console.log("👋 Popup de bienvenue affichée");
      } else {
        console.warn("⚠️ La fonction showWelcomePopup n'est pas disponible");
      }
    }, 1500);
  } catch (e) {
    console.warn("⚠️ Impossible d'afficher la popup de bienvenue:", e);
  }
}

// Démarrer la séquence d'initialisation sécurisée
document.addEventListener('DOMContentLoaded', () => {
  console.log("🔄 DOM chargé, démarrage de la séquence d'initialisation sécurisée");
  
  // Tentative d'initialisation des données
  try {
    if (typeof window.DataManager !== 'undefined' && window.DataManager && 
        typeof window.DataManager.initData === 'function') {
      window.DataManager.initData();
      console.log("✅ Données initialisées");
    }
  } catch (e) {
    console.warn("⚠️ Impossible d'initialiser les données:", e);
  }
  
  // Simuler le chargement Windows XP
  console.log("⏳ Simulation du chargement Windows XP (3s)");
  setTimeout(initDesktopSafe, 3000);
  
  // Ajouter un raccourci clavier pour l'administration
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      try {
        if (typeof window.showAdminTest === 'function') {
          window.showAdminTest();
        } else {
          alert("Le panneau d'administration n'est pas disponible");
        }
      } catch (e) {
        console.error("❌ Erreur lors de l'ouverture du panneau d'administration:", e);
        alert("Erreur lors de l'ouverture du panneau d'administration");
      }
    }
  });
  
  // Bouton d'urgence pour forcer le chargement
  setTimeout(() => {
    if (document.getElementById('loading-screen') && 
        document.getElementById('loading-screen').style.display !== 'none') {
      console.log("🚨 Détection d'un problème de chargement, ajout du bouton d'urgence");
      
      // Créer un bouton d'urgence
      const emergencyButton = document.createElement('button');
      emergencyButton.innerText = "Forcer le chargement";
      emergencyButton.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 20px;
        background: #ff0000;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      `;
      
      emergencyButton.addEventListener('click', () => {
        initDesktopSafe();
        emergencyButton.remove();
      });
      
      // Ajouter le bouton à l'écran de chargement
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) loadingScreen.appendChild(emergencyButton);
    }
  }, 5000);
});
