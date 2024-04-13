import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {
  userData: any; // Variable pour stocker les données utilisateur récupérées
  userId: any | null = null; // Initialiser userId à null
  image: string = 'assets/images.png'; // Chemin de l'image par défaut
  imageClass: string = 'image'; // Classe CSS pour l'image
  entreprise!: any;

  constructor(private activateRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    // Souscrire aux modifications des paramètres de l'URL
    this.activateRoute.paramMap.subscribe(async paramMap => {
      // Extraire l'ID de l'URL
      this.userId = paramMap.get('userId');
      // Vérifier si l'ID est présent
      if (this.userId) {
        console.log('ID utilisateur spécifié dans l\'URL :', this.userId);
        // Récupérer les données de l'utilisateur à partir de Firestore
        await this.retrieveUserData(this.userId);
      } else {
        console.error('Aucun identifiant d\'utilisateur spécifié dans l\'URL.');
      }
    });
  }

  async retrieveUserData(userId: string) {
    try {
      // Récupérer les données de l'utilisateur depuis Firestore
      const userDoc = await this.firestore.collection('business-cards').doc(userId).get().toPromise();
      if (userDoc.exists) {
        // Stocker les données de l'utilisateur
        this.userData = userDoc.data();
        console.log('Données utilisateur récupérées avec succès :', this.userData);
      } else {
        console.error('Aucun utilisateur trouvé avec l\'identifiant spécifié.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'utilisateur :', error);
    }
  }
}


