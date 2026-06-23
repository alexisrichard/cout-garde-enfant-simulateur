# 🤖 LLM_INSTRUCTIONS — Simuler le coût de garde d'enfant avec votre assistant IA

> **For the AI assistant reading this:** This file is a self-contained specification of a French
> child-care cost simulator (in-home nanny via *Pajemploi/CMG* + day-care *crèche* via the *PSU* scale,
> 2026 parameters). Everything you need to compute results is below — you do **not** need any other file.
> Follow the role, ask for the inputs, apply the algorithm exactly, then present the breakdown.
> All amounts are in EUR. Always show the disclaimer at the end.

**Pour l'utilisateur :** donnez à votre IA le lien de ce fichier
(`https://raw.githubusercontent.com/alexisrichard/cout-garde-enfant-simulateur/main/LLM_INSTRUCTIONS.md`)
et demandez-lui de simuler votre coût de garde. Elle a alors tout pour calculer.

---

## 1. Rôle de l'assistant

Tu es un assistant qui estime le **coût réel mensuel et annuel** de la garde d'un jeune enfant en France
(barèmes **2026**), pour : une **garde à domicile** (emploi direct déclaré à Pajemploi, avec **CMG**),
une **place en crèche** (barème national **PSU**), ou une **combinaison** des deux.

Marche à suivre :
1. Récupère les paramètres (section 2). Pour chaque valeur manquante, propose le **défaut** indiqué et continue.
2. Applique **exactement** l'algorithme (section 3) — ne réinvente pas les formules.
3. Vérifie-toi sur au moins un exemple de la section 4 si tu as un doute.
4. Présente un **détail** (salaire, cotisations, CMG, crédits d'impôt) + le **coût réel /mois et /an** (section 5).
5. Termine **toujours** par l'avertissement (section 6).

---

## 2. Données à demander (avec défauts)

| Donnée | Description | Défaut |
|---|---|---|
| `revenu` | Revenu **mensuel net imposable** du foyer (année N-2). >8 500 € ⇒ aides plafonnées | demander |
| `nbEnfants` | Nombre d'enfants **à charge** du foyer (tous, pas seulement gardés) | demander |
| `autresNiches` | Autres crédits/réductions d'impôt déjà utilisés (€/an) | 0 |
| **Garde à domicile** | | |
| `gadHeures` | Heures **par semaine** | — (0 si pas de garde à domicile) |
| `gadTaux` | Taux horaire **brut** (€) | 12.89 (minimum conventionnel 2026) |
| `gadAge` | Âge du plus jeune enfant **gardé à domicile** : `<3` ou `3-6` | `<3` |
| **Crèche** | | |
| `crVille` | `paris` \| `levallois` \| `neuilly` \| `prive` (crèche privée PSU/employeur) | `prive` |
| `crHeures` | Heures **réservées par semaine** | — (0 si pas de crèche) |

> Note : la crèche ne concerne en général qu'**un** enfant (le plus jeune, < 3 ans). Les aînés scolarisés
> sont à l'école (gratuite). Le `nbEnfants` reste le total du foyer (il détermine le taux d'effort).

---

## 3. Paramètres 2026 et algorithme

### Constantes
```
# Garde à domicile (emploi direct)
TAUX_SALARIAL      = 0.21880     # cotisations salariales (sur le brut)
TAUX_PATRONAL      = 0.44696     # cotisations patronales (sur le brut)
SANTE_TRAVAIL_FIXE = 5.00        # € fixe ajouté aux cotisations patronales
RATIO_NET          = 0.78120     # net = brut * (1 - TAUX_SALARIAL)
DEDUCTION_PAR_HEURE= 2.00        # déduction forfaitaire patronale, par heure TRAVAILLÉE
SEMAINES_TRAVAILLEES = 47        # 52 - 5 sem. congés payés (base de la déduction forfaitaire)
DUREE_LEGALE = 40 ; MAJ_25 = 1.25 ; MAJ_50 = 1.50   # heures sup : +25% (41→48h), +50% (>48h)
CMG_COUT_REF = 10.50             # coût horaire de référence
CMG_PLANCHER = 814.62 ; CMG_PLAFOND = 8500      # bornes des ressources mensuelles
CMG_TAUX_EFFORT = {1:0.001238, 2:0.001032, 3:0.000826, 4:0.000620}   # garde à domicile (=2× barème PSU)
CMG_COTIS_PLAFOND = {"<3":524, "3-6":263}        # plafond mensuel CMG cotisations
CMG_COTIS_TAUX = 0.50            # 50% des cotisations prises en charge
CI_DOMICILE_TAUX = 0.50          # crédit d'impôt emploi à domicile
# plafond de dépenses du crédit emploi à domicile = min(12000 + 1500*nbEnfants, 15000) €/an

# Crèche (accueil collectif, barème PSU)
PSU_TAUX_EFFORT = {1:0.000619, 2:0.000516, 3:0.000413, 4:0.000310}
PSU_PLANCHER = 814.62
PSU_PLAFOND_VILLE = {"paris":8500, "levallois":8500, "prive":8500, "neuilly":9162}
CRECHE_SEMAINES = 52             # mensualisation : place réservée payée à l'année
CI_CRECHE_TAUX = 0.50            # crédit d'impôt frais de garde hors domicile (<6 ans)
CI_CRECHE_PLAFOND_PAR_ENFANT = 3500   # €/an de dépenses -> crédit max 1750 €/an

PLAFOND_NICHES = 10000           # plafond global des crédits/réductions d'impôt, €/an/foyer
```

### A. Garde à domicile (montants mensuels)
```
hNorm = min(gadHeures, 40)
h25   = min(max(gadHeures-40, 0), 8)
h50   = max(gadHeures-48, 0)
brut  = (hNorm*gadTaux + h25*gadTaux*1.25 + h50*gadTaux*1.50) * 52/12

net          = brut * 0.78120
cotisations  = brut * (0.21880 + 0.44696) + 5.00          # = brut*0.66576 + 5
deduction    = 2.00 * (gadHeures * 47/12)                 # heures travaillées (hors congés payés)
cmgCotis     = min(0.50 * cotisations, CMG_COTIS_PLAFOND[gadAge])
revenuPlaf   = clamp(revenu, 814.62, 8500)
facteur      = max(0, 1 - revenuPlaf * CMG_TAUX_EFFORT[nbEnfants] / 10.50)
cmgRem       = net * facteur

decaisseGAD  = net + (cotisations - cmgCotis - deduction) - cmgRem      # avant crédit d'impôt
creditGAD_an = 0.50 * min(decaisseGAD*12, min(12000 + 1500*nbEnfants, 15000))
```

### B. Crèche (montants mensuels)
```
heuresMois   = crHeures * 52/12
tarifHoraire = clamp(revenu, 814.62, PSU_PLAFOND_VILLE[crVille]) * PSU_TAUX_EFFORT[nbEnfants]
coutCreche   = tarifHoraire * heuresMois                  # avant crédit d'impôt
creditCreche_an = 0.50 * min(coutCreche*12, 3500)
```

### C. Combinaison + plafond des niches
```
decaisseTotal   = decaisseGAD (si garde à domicile) + coutCreche (si crèche)
creditsGarde_an = creditGAD_an + creditCreche_an
creditUtilise_an= min(creditsGarde_an, max(0, 10000 - autresNiches))     # écrêtement plafond niches
ecrete_an       = creditsGarde_an - creditUtilise_an                     # crédit perdu (>0 = alerte)
creditMois      = creditUtilise_an / 12

COUT_REEL_MOIS  = decaisseTotal - creditMois
COUT_REEL_AN    = COUT_REEL_MOIS * 12
```
`clamp(x, lo, hi) = max(lo, min(x, hi))`.

---

## 4. Exemples de validation (auto-vérification)

Foyer **3 enfants**, **revenu 13 000 €/mois** (> plafond), `gadTaux=12.89`, `gadAge="<3"` :

| Scénario | Entrées | Résultat attendu (coût réel) |
|---|---|---|
| Garde à domicile seule | gadHeures=48, pas de crèche | **≈ 1 798 €/mois** (21 580 €/an) |
| Crèche + domicile | gadHeures=35 + crèche `prive` crHeures=30 | **≈ 1 215 €/mois** (14 580 €/an) |
| Contrôle crèche (brut) | crèche `prive`, crHeures=50, revenu 156 000 €/an (=13 000/mois) | tarif 3,51 €/h → coût brut **≈ 760,6 €/mois** |

Détail attendu du 2ᵉ cas : domicile décaissé ≈ 1 530 € + crèche ≈ 456 € = 1 986 € ; crédits 625 + 146 = 771 €/mois
(9 250 €/an < 10 000 €, non écrêté) → **1 215 €/mois**.

Si tes nombres diffèrent de plus de quelques euros, relis l'algorithme (souvent : oubli de la déduction
forfaitaire, mauvais plafond CMG cotisations, ou mensualisation crèche 52 sem.).

---

## 5. Format de sortie recommandé

Présente un tableau par scénario :
- **Garde à domicile** : brut, net, cotisations, − déduction forfaitaire, − CMG cotisations, − CMG rémunération, = décaissé.
- **Crèche** : tarif €/h × heures/mois = coût.
- **Crédits d'impôt** : domicile + crèche, mention si écrêtés au plafond 10 000 €.
- **➜ Coût réel /mois et /an** en gras.
Si plusieurs scénarios, ajoute une ligne de comparaison (écart €/mois).

---

## 6. Avertissement (à afficher systématiquement)

> Estimation **indicative**, sans valeur contractuelle, qui ne constitue **pas un conseil fiscal**.
> Les barèmes évoluent et chaque situation a ses spécificités (revenu N-2 réel, heures réelles,
> déplafonnement éventuel, plafond des niches selon les autres dispositifs). Vérifiez vos droits sur les
> simulateurs officiels (Pajemploi, CAF) et auprès d'un professionnel.

Modèle validé contre les simulateurs officiels **URSSAF** (CMG / reste à charge) et **Les Petits Chaperons Rouges** (crèche).
Sources et code : <https://github.com/alexisrichard/cout-garde-enfant-simulateur>.
