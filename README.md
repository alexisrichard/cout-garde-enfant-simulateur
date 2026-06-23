# 🍼 Simulateur du coût de garde d'enfant (France, 2026)

Estimez et comparez le coût réel d'une **garde d'enfant à domicile** (emploi direct, Pajemploi / CMG)
et d'une **place en crèche** (barème national PSU) — y compris les **CMG**, les **crédits d'impôt**
et le **plafonnement global des niches fiscales à 10 000 €**.

Tout tient dans une page HTML statique : **aucune donnée n'est envoyée nulle part**, tout est calculé
dans votre navigateur.

**▶️ Démo en ligne : <https://alexisrichard.github.io/cout-garde-enfant-simulateur/>**

> ⚠️ **Avertissement.** Estimation **indicative**, sans valeur contractuelle, qui ne constitue **pas un
> conseil fiscal**. Les barèmes évoluent et votre situation peut comporter des spécificités. Vérifiez vos
> droits réels sur les simulateurs officiels (Pajemploi, CAF) et auprès d'un professionnel.

## ✨ Fonctionnalités

- **Garde à domicile** : salaire brut/net (avec heures supplémentaires), cotisations, déduction
  forfaitaire patronale, **CMG rémunération** + **CMG cotisations**, crédit d'impôt emploi à domicile.
- **Crèche** (Paris, Levallois, Neuilly, crèche privée PSU/employeur) : tarif horaire selon le barème
  PSU, crédit d'impôt frais de garde hors domicile.
- **Scénarios combinés** crèche + domicile, avec écrêtement automatique au **plafond des niches (10 000 €)**.
- Boutons de scénarios pré-définis, calcul **en temps réel**, détail du calcul affiché.

## 🚀 Utilisation

1. Ouvrez simplement [`index.html`](index.html) dans un navigateur (ou via GitHub Pages si activé).
2. Réglez les paramètres : le coût réel mensuel/annuel se met à jour en direct.

### Pré-remplir avec vos données (et les garder privées)

Copiez le modèle et renseignez vos valeurs :

```bash
cp config.example.js config.js
```

`config.js` est **ignoré par git** (voir `.gitignore`) : vos données restent sur votre machine et ne sont
jamais publiées. Le simulateur le charge automatiquement pour pré-remplir les champs.

## 📐 Paramètres 2026 (vérifiés sur sources officielles)

**Garde à domicile (emploi direct)**

| Paramètre | Valeur |
|---|---|
| Net / brut | ≈ 78,12 % (cotisations salariales ≈ 21,88 %) |
| Cotisations patronales | ≈ 44,70 % du brut (+ 5 € contribution santé travail) |
| Déduction forfaitaire patronale | 2 €/h travaillée (hors congés payés, ~47 sem/an) |
| Durée légale / heures sup. | 40 h ; +25 % (41→48 h) ; +50 % (>48 h) |
| CMG — coût horaire de référence | 10,50 € |
| CMG — taux d'effort (garde à domicile) | 1 enf 0,1238 % · 2 enf 0,1032 % · 3 enf 0,0826 % |
| CMG cotisations — plafond | 524 €/mois (<3 ans) · 263 €/mois (3-6 ans) |
| Crédit d'impôt emploi à domicile | 50 %, plafond 12 000 € + 1 500 €/enfant (max 15 000 €) |

**Crèche (accueil collectif, barème PSU national)**

| Paramètre | Valeur |
|---|---|
| Tarif horaire | ressources mensuelles (bornées) × taux d'effort |
| Taux d'effort | 1 enf 0,0619 % · 2 enf 0,0516 % · 3 enf 0,0413 % |
| Plancher / plafond ressources | 814,62 € / 8 500 € (Neuilly : 9 162 €) |
| Inclus | repas, couches, lait (aucun supplément) |
| Crédit d'impôt frais de garde (<6 ans) | 50 %, plafond 3 500 €/enfant (max 1 750 €/an) |

**Plafond global des niches fiscales** : 10 000 €/an et par foyer (crédits garde inclus).

## ✅ Validation

- Le modèle **garde à domicile** reproduit un relevé Pajemploi réel et le **simulateur officiel URSSAF**
  (reste à charge + CMG) au centime près.
- Le modèle **crèche** reproduit le **simulateur Les Petits Chaperons Rouges** sur plusieurs scénarios
  (1/2/3 enfants × volumes horaires × niveaux de revenu).

## 📚 Sources

- URSSAF — réforme CMG : <https://www.urssaf.fr/accueil/actualites/evolution-cmg-ce-qui-va-changer.html>
- URSSAF — simulateur reste à charge / CMG : <https://www.urssaf.fr/accueil/outils-documentation/simulateurs/calculer-reste-a-charge-cmg-pe.html>
- CNAF — barème participations familiales EAJE 2026 (crèche)
- Crédit d'impôt frais de garde : <https://www.service-public.gouv.fr/particuliers/vosdroits/F8>
- Crédit d'impôt emploi à domicile : <https://www.service-public.gouv.fr/particuliers/vosdroits/F12>
- Plafonnement des niches fiscales : <https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/le-plafonnement-global-des-avantages-fiscaux-comment-ca-marche>

## 📄 Licence

[MIT](LICENSE) — réutilisez librement. Les contributions et corrections de barème sont bienvenues.
