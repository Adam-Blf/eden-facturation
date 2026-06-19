# ADR 0001 - Contribution volontaire opt-in (parcours particulier)

Date : 2026-06-19
Statut : accepté

## Contexte

Le parcours particulier de 404 Monkey est gratuit. Pour le financer, on s'inspire
du modèle HelloAsso : proposer une contribution volontaire au moment du paiement.

HelloAsso, en pratique, s'auto-finance en pré-cochant la contribution et en comptant
sur le fait qu'une partie des payeurs oublie de la décocher. C'est un dark-pattern.

## Décision

La contribution est **strictement opt-in** :

1. Par défaut le montant est 0 et la case n'est **jamais** pré-cochée.
2. L'utilisateur ne contribue que s'il l'active de lui-même.
3. Libellé transparent, aucun montant pré-rempli incitatif, aucune friction pour
   refuser.

On accepte de gagner moins plutôt que de gagner sur l'oubli des gens.

## Conséquences

- Revenu du parcours particulier potentiellement plus faible qu'un modèle pré-coché.
- Confiance et image alignées avec les valeurs du produit.
- S'applique à toute mécanique de don ou d'upsell future.
