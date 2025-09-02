// Script pour corriger le chargement du site
console.log("🚀 Initialisation du correctif de chargement");

// Cette fonction s'assure que la page passe à l'étape du bureau
// si le chargement normal échoue
function fixLoading() {
  console.log("🔧 Vérification de l'état du chargement");
  
  // Attend 5 secondes puis vérifie si l'écran de chargement est toujours visible
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    const desktop = document.getElementById('desktop');
    
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      console.log("⚠️ Écran de chargement bloqué, application du correctif");
      
      // Force l'affichage du bureau
      if (loadingScreen) loadingScreen.style.display = 'none';
      if (desktop) desktop.style.display = 'block';
      
      // Tente d'initialiser le bureau manuellement
      try {
        if (window.DesktopManager && typeof window.DesktopManager.renderDesktopIcons === 'function') {
          window.DesktopManager.renderDesktopIcons();
        }
        if (window.DesktopManager && typeof window.DesktopManager.setupDraggableIcons === 'function') {
          window.DesktopManager.setupDraggableIcons();
        }
        console.log("✅ Bureau initialisé manuellement");
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation manuelle du bureau:", error);
      }
    }
  }, 6000); // Un peu plus que le délai normal de 3000ms dans script.js
}

// Exécuter le correctif
document.addEventListener('DOMContentLoaded', fixLoading);

// Définir une fonction globale pour forcer le chargement du bureau
window.forceLoadDesktop = function() {
  const loadingScreen = document.getElementById('loading-screen');
  const desktop = document.getElementById('desktop');
  
  if (loadingScreen) loadingScreen.style.display = 'none';
  if (desktop) desktop.style.display = 'block';
  
  // Tente d'initialiser le bureau
  try {
    if (window.DesktopManager) {
      if (typeof window.DesktopManager.renderDesktopIcons === 'function') {
        window.DesktopManager.renderDesktopIcons();
      }
      if (typeof window.DesktopManager.setupDraggableIcons === 'function') {
        window.DesktopManager.setupDraggableIcons();
      }
    }
    console.log("✅ Bureau chargé manuellement");
  } catch (error) {
    console.error("❌ Erreur lors du chargement manuel du bureau:", error);
  }
};
