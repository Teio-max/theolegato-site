// Fichier de diagnostic pour le panneau d'administration
console.log("🔍 Chargement du diagnostic admin...");

// Fonction pour inspecter l'état des objets clés
function inspectAdminObjects() {
  console.log("=== DIAGNOSTIC ADMIN ===");
  console.log("AdminPanelManager exists:", typeof window.AdminPanelManager !== 'undefined');
  console.log("createAdminPanelWindow exists:", typeof window.createAdminPanelWindow === 'function');
  console.log("originalCreateAdminPanelWindow exists:", typeof window.originalCreateAdminPanelWindow === 'function');
  
  if (typeof window.AdminPanelManager !== 'undefined') {
    console.log("AdminPanelManager.createPanel exists:", typeof window.AdminPanelManager.createPanel === 'function');
    console.log("AdminPanelManager.init exists:", typeof window.AdminPanelManager.init === 'function');
  }
  
  console.log("WindowManager exists:", typeof window.WindowManager !== 'undefined');
  if (typeof window.WindowManager !== 'undefined') {
    console.log("WindowManager.createWindow exists:", typeof window.WindowManager.createWindow === 'function');
  }
  
  console.log("=== FIN DIAGNOSTIC ===");
}

// Vérifier l'état après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log("🔍 DOM chargé, diagnostic initial...");
  inspectAdminObjects();
  
  // Vérifier à nouveau après un délai
  setTimeout(() => {
    console.log("🔍 Diagnostic après délai de 1 seconde...");
    inspectAdminObjects();
  }, 1000);
});

// Remplacer temporairement la fonction de vérification de mot de passe
// pour obtenir plus d'informations de diagnostic
const originalCheckAdminPass = window.checkAdminPass;
window.checkAdminPass = function(winId) {
  console.log("🔍 Tentative de connexion admin, diagnostic préalable...");
  inspectAdminObjects();
  
  const pass = document.getElementById('admin-pass').value;
  console.log(`🔑 Vérification du mot de passe: ${pass}`);
  
  if (pass === 'sitethéi') {
    console.log("✅ Mot de passe correct, fermeture de la fenêtre de login...");
    document.getElementById(winId).remove();
    
    console.log("🔍 Diagnostic avant ouverture du panneau d'administration...");
    inspectAdminObjects();
    
    console.log("🚀 Tentative d'ouverture du panneau d'administration...");
    try {
      const panel = window.createAdminPanelWindow();
      console.log("📊 Résultat de createAdminPanelWindow:", panel);
    } catch (error) {
      console.error("❌ Erreur lors de l'ouverture du panneau d'administration:", error);
    }
    
    console.log("🔍 Diagnostic après tentative d'ouverture...");
    inspectAdminObjects();
  } else {
    console.log("❌ Mot de passe incorrect.");
    document.getElementById('admin-error').textContent = 'Mot de passe incorrect.';
  }
};

console.log("🔍 Diagnostic admin chargé et prêt.");
