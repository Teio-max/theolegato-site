// Solution de réparation globale pour le panneau d'administration
console.log("🛠️ Chargement de la solution de réparation admin...");

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log("🛠️ Préparation de la solution de réparation...");
  
  // Délai pour s'assurer que tous les scripts sont chargés
  setTimeout(() => {
    console.log("🛠️ Application de la solution de réparation pour le panneau d'administration");
    
    // Force l'initialisation de AdminPanelManager s'il existe mais n'est pas initialisé
    if (typeof window.AdminPanelManager !== 'undefined' && 
        typeof window.AdminPanelManager.init === 'function' &&
        !window.AdminPanelManager._initialized) {
      console.log("🛠️ Initialisation forcée de AdminPanelManager");
      try {
        window.AdminPanelManager.init();
        window.AdminPanelManager._initialized = true;
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de AdminPanelManager:", error);
      }
    }
    
    // Définir ou redéfinir la fonction createAdminPanelWindow globale
    window.createAdminPanelWindow = function(editItemId = null, itemType = 'film') {
      console.log("🛠️ Fonction createAdminPanelWindow réparée appelée");
      
      // Utiliser AdminPanelManager si disponible
      if (typeof window.AdminPanelManager !== 'undefined' && 
          typeof window.AdminPanelManager.createPanel === 'function') {
        console.log("🛠️ Utilisation de AdminPanelManager.createPanel");
        return window.AdminPanelManager.createPanel(editItemId, itemType);
      }
      
      // Fallback: créer une fenêtre d'administration simple
      console.log("🛠️ Création d'une fenêtre d'administration de secours");
      return createFallbackAdminWindow();
    };
    
    // Fonction de secours pour créer une fenêtre d'administration minimale
    function createFallbackAdminWindow() {
      if (typeof window.WindowManager === 'undefined' || 
          typeof window.WindowManager.createWindow !== 'function') {
        console.error("❌ WindowManager n'est pas disponible");
        alert("Impossible de créer la fenêtre d'administration : WindowManager n'est pas disponible");
        return null;
      }
      
      const content = `
        <div style="padding:20px;">
          <h3 style="margin-top:0;color:#0058a8;">Panneau d'administration (mode secours)</h3>
          <p>Le gestionnaire d'administration avancé n'est pas disponible.</p>
          <p>Cette fenêtre est une version minimale de secours.</p>
          <button id="refresh-admin-btn" style="padding:8px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;margin-top:15px;">
            Rafraîchir la page
          </button>
        </div>
      `;
      
      const win = window.WindowManager.createWindow({
        title: 'Administration (secours)',
        icon: 'icons/key.png',
        width: '500px',
        height: '300px',
        content: content
      });
      
      // Ajouter le gestionnaire pour le bouton de rafraîchissement
      setTimeout(() => {
        const refreshBtn = document.getElementById('refresh-admin-btn');
        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => {
            location.reload();
          });
        }
      }, 100);
      
      return win;
    }
    
    console.log("🛠️ Solution de réparation appliquée avec succès");
  }, 500);
});
