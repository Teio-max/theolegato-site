// Ce fichier contient seulement les modifications à la fin du script.js

// Code d'initialisation - UN SEUL BLOC
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les données
  DataManager.initData();
  
  // Simuler le chargement Windows XP
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    
    // Initialiser l'interface
    DesktopManager.renderDesktopIcons();
    DesktopManager.setupDraggableIcons();
    
    // Jouer le son de démarrage
    WindowManager.playSound('startup');
    
    // Afficher la popup de bienvenue après un court délai
    setTimeout(() => {
      if (typeof window.showWelcomePopup === 'function') {
        window.showWelcomePopup();
      } else {
        console.error("La fonction showWelcomePopup n'est pas disponible");
      }
    }, 1500); // Délai pour laisser le bureau s'afficher correctement
  }, 3000);
  
  // Ajouter un raccourci clavier pour l'administration
  document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+A pour ouvrir le panneau d'administration
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      if (typeof window.showAdminTest === 'function') {
        window.showAdminTest();
      } else {
        alert("Le test du panneau d'administration n'est pas disponible");
      }
    }
  });
});
