# Boutons et appels à l'action

Règle : le libellé dit ce que le visiteur gagne. Test : « Je veux [libellé] » doit être une phrase naturelle, et le clic la tient immédiatement. Les boutons purement fonctionnels de l'application gardent un verbe court, seuls leurs contrastes sont vérifiés.

Contrastes mesurés sur la version de production locale (couleurs calculées dans Chrome) : texte du bouton >= 4,5:1, fond ou bordure >= 3:1 contre la page, au repos et au survol.

| Page | Stade | Avant | Après | Gain | Contraste après |
|---|---|---|---|---|---|
| Accueil, bouton principal | Découverte | Créer mon compte | Facturer gratuitement | Le plan gratuit existe, l'inscription le promet ("Gratuit, sans carte") | texte 10,44:1, survol 6,87:1 |
| Accueil, bouton secondaire | Décision (client existant) | Se connecter | Retrouver mes factures | Le visiteur revient à ses factures | texte 19,24:1, bordure 1,94 -> 3,45:1 |
| Inscription, envoi | Décision | Créer mon compte | Ouvrir mon espace de facturation | Le compte ouvre l'espace /app | texte 10,44:1, survol 6,87:1 |
| Connexion, envoi | Décision | Se connecter | Retrouver mes factures | Retour direct à l'espace | texte 10,44:1, survol 6,87:1 |
| Connexion, lien d'inscription | Découverte | S'inscrire | Facturer gratuitement | Même promesse que l'accueil | texte 9,6:1 |
| Inscription, lien de connexion | Décision | Se connecter | Retrouver mes factures | Même promesse que la connexion | texte 9,6:1 |
| Clients, quota atteint | Considération | Passe à un plan supérieur | Débloquer plus de clients | Le plan lève la limite de clients | texte brass sur surface 9,6:1 |
| Abonnement, plan Starter | Considération | Choisir | Gérer 10 clients | Chiffre repris de la carte du plan | 10,44:1 |
| Abonnement, plan Pro | Considération | Choisir | Gérer 50 clients | idem | 10,44:1 |
| Abonnement, plan Illimité | Considération | Choisir | Gérer sans limite | idem | 9,6:1 |
| Abonnement, Stripe indisponible | Considération | Bientôt | Bientôt disponible | Dit clairement que le paiement n'est pas ouvert | désactivé |
| Abonnement, plan en cours | Fonctionnel | Gratuit | Plan gratuit | Clarté | désactivé |
| Facture, émission | Fonctionnel | Valider & Lien | Émettre et obtenir le lien | Dit ce que l'action produit | 10,44:1 |

Inchangés (fonctionnels) : Ajouter, Enregistrer, Appliquer, Continuer (onboarding), Nouvelle facture, Créer ma première facture, Quitter la session, Retour à l'accueil, J'accepte cette facture.

Corrections d'accessibilité : noms accessibles sur les boutons à icône seule (copier le lien, supprimer une ligne), survol de suppression passé de #b3261e à red-400.
