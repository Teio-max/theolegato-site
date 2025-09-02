// Correctif simple pour le panneau d'administration
// Version compatible avec admin-panel-enhanced.js

console.log("📝 Chargement du correctif admin-fix-simple.js en mode compatibilité");

// Ce fichier est maintenant obsolète car la fonction globale createAdminPanelWindow 
// est désormais définie directement dans admin-panel-enhanced.js

// Code de compatibilité au cas où admin-panel-enhanced.js n'est pas chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log("📝 Vérification du mode compatibilité admin");
  
  // Définir une fonction globale createAdminPanelWindow sécurisée sans risque de récursion
  window.createAdminPanelWindow = function(editItemId = null, itemType = 'film') {
    console.log("📝 Appel à createAdminPanelWindow de admin-fix-simple.js");
    
    if (typeof window.AdminPanelManager !== 'undefined' && typeof window.AdminPanelManager.createPanel === 'function') {
      console.log("✅ AdminPanelManager.createPanel est disponible, appel direct...");
      try {
        return window.AdminPanelManager.createPanel(editItemId, itemType);
      } catch (error) {
        console.error("❌ Erreur lors de l'appel à createPanel:", error);
        alert("Erreur lors de l'ouverture du panneau d'administration: " + error.message);
        
        // Solution de secours - Créer une fenêtre simple
        if (typeof window.WindowManager !== 'undefined' && typeof window.WindowManager.createWindow === 'function') {
          console.log("⚠️ Création d'une fenêtre d'administration de secours");
          const fallbackWindow = window.WindowManager.createWindow({
            title: "Administration (Secours)",
            width: 600,
            height: 400,
            content: "<div style='padding: 20px;'><h2>Panneau d'administration (Mode Secours)</h2><p>Le panneau d'administration normal n'a pas pu être chargé.</p><p>Veuillez vérifier la console pour plus d'informations.</p></div>"
          });
          return fallbackWindow;
        }
      }
    } else {
      console.error("⚠️ AdminPanelManager n'est pas disponible ou sa méthode createPanel n'existe pas");
      alert("Le panneau d'administration n'est pas disponible. Veuillez rafraîchir la page.");
      return null;
    }
  };
  console.log("📝 Fonction createAdminPanelWindow définie en mode sécurisé");
});
