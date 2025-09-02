// Utiliser cette fonction pour tester le panneau admin
function showAdminTest() {
  console.log("Test du panneau admin");
  
  // Demander le mot de passe d'administration
  const password = prompt("Veuillez entrer le mot de passe administrateur:", "");
  
  // Vérifier le mot de passe
  if (password !== "sitethéi") {
    alert("Mot de passe incorrect. Accès refusé.");
    return;
  }
  
  if (typeof window.AdminManager !== "undefined") {
    window.AdminManager.createPanel();
  } else if (typeof window.createAdminPanelWindow === "function") {
    window.createAdminPanelWindow();
  } else {
    alert("Erreur: Le panneau admin n'est pas disponible");
  }
}

// Exposer globalement
window.showAdminTest = showAdminTest;
