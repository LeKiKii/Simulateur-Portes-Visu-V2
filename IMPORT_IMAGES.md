# Guide d'importation des images de portes

Pour ajouter vos propres images de portes à l'application, suivez ces étapes :

1. **Ajouter les fichiers images**
   - Déposez vos fichiers images (JPG, PNG) dans le dossier : `public/images/doors/`.
   - Exemple : `public/images/doors/ma-porte-bois.jpg`.

2. **Mettre à jour la configuration**
   - Ouvrez le fichier `src/data/doors.js`.
   - Ajoutez une nouvelle entrée dans la liste `DOORS` ou modifiez une existante.
   - Utilisez le chemin absolu à partir de la racine publique pour `imageSrc`.

**Exemple de code dans `src/data/doors.js` :**

```javascript
{
  id: 'custom-door-1',
  name: 'Ma Porte Personnalisée',
  category: 'Bois',
  // Le chemin commence par /images/doors/ suivi du nom de votre fichier
  imageSrc: '/images/doors/ma-porte-bois.jpg',
}
```

Une fois le fichier sauvegardé, l'application se mettra à jour automatiquement (si le serveur de développement est lancé) ou au prochain redémarrage.
