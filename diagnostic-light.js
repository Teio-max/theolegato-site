// Script de diagnostic léger - Nettoyé
(function() {
  console.log("=== DIAGNOSTIC LÉGER RÉINITIALISÉ ===");
  
  // Attendre que la page soit chargée pour vérifier l'état des objets clés
  window.addEventListener('load', function() {
    console.log("🔍 Diagnostic de chargement");
    
    // Vérification de l'état des objets clés
    console.log("État AdminPanelManager:", typeof window.AdminPanelManager !== 'undefined' ? "Défini" : "Non défini");
    console.log("État WindowManager:", typeof window.WindowManager !== 'undefined' ? "Défini" : "Non défini");
    console.log("État createAdminPanelWindow:", typeof window.createAdminPanelWindow === 'function' ? "Défini" : "Non défini");
    
    // Vérifier les conflits potentiels dans les implémentations admin
    const adminFiles = [
      'admin-fix-window.js',
      'admin-fix-simple.js',
      'admin-panel-enhanced.js',
      'admin-fix.js'
    ];
    
    console.log("📊 Analyse des fichiers admin chargés:");
    adminFiles.forEach(file => {
      const script = document.querySelector(`script[src="${file}"]`);
      console.log(`- ${file}: ${script ? "Chargé" : "Non chargé"}`);
    });
    
    // Créer un écouteur pour les erreurs
    window.addEventListener('error', function(e) {
      console.error("🚨 ERREUR GLOBALE:", e.message, "dans", e.filename, "ligne", e.lineno);
    });
  });
  
  console.log("✅ Diagnostic-light.js réinitialisé avec succès");
})();
