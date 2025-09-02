// Utiliser cette fonction pour tester le panneau admin
function showAdminTest() {
  console.log("Test du panneau admin");
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
