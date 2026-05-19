# scolia
projet integrateur de gestion d'un établissement scolaire
# 💰 Module Finance — Backend Laravel

**Développé par : NGWAMBE MARIELLA**
**Branche : branche_mariella**

---

## 📋 Description
Module de gestion financière du SGS.
Gère les paiements de scolarité, les reçus PDF et les alertes de retard.

---

## 🗄️ Tables créées
- `modes_paiement` → Espèces, Mobile Money, Virement
- `scolarites` → Frais dus par élève
- `paiements` → Historique des paiements

---

## 🛣️ Routes API disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/finance/paiements | Liste des paiements |
| POST | /api/finance/paiements | Enregistrer un paiement |
| GET | /api/finance/paiements/{id} | Détail d'un paiement |
| DELETE | /api/finance/paiements/{id} | Annuler un paiement |
| GET | /api/finance/paiements/{id}/recu | Télécharger reçu PDF |
| GET | /api/finance/scolarites | Liste des scolarités |
| GET | /api/finance/stats | Statistiques financières |
| GET | /api/finance/alertes-retard | Élèves en retard |

---

## 🔐 Sécurité
- Auth Sanctum obligatoire
- Throttle 60 req/min
- Accès par rôle (admin, secrétaire, directeur)
- SoftDeletes sur les paiements
- Logs d'audit

---

## ⚙️ Installation
```bash
composer require barryvdh/laravel-dompdf
php artisan migrate
```
