// ─────────────────────────────────────────────────────────────────────────
//  CONFIG PERSONNELLE (modèle)
//  Copiez ce fichier en  config.js  (ignoré par git) et mettez VOS valeurs.
//  Au chargement, le simulateur pré-remplit automatiquement les champs.
//  Aucune de ces valeurs n'est envoyée nulle part : tout est calculé dans le navigateur.
// ─────────────────────────────────────────────────────────────────────────
window.SIM_CONFIG = {
  revenu: 5000,        // revenu mensuel net imposable du foyer (année N-2). >8500 => aides plafonnées
  nbEnfants: 2,        // nombre d'enfants à charge du foyer
  autresNiches: 0,     // autres crédits/réductions d'impôt déjà utilisés (€/an) — plafond global 10 000 €

  gadOn: true,         // garde à domicile activée ?
  gadHeures: 40,       // heures/semaine
  gadTaux: 12.89,      // taux horaire BRUT (€) — 12,89 = minimum conventionnel 2026
  gadAge: 'moins3',    // âge du plus jeune enfant gardé à domicile : 'moins3' ou '3a6'

  crOn: false,         // crèche activée ?
  crVille: 'prive',    // 'paris' | 'levallois' | 'neuilly' | 'prive'
  crHeures: 50,        // heures réservées/semaine
};
