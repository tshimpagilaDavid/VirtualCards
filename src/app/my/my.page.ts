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
    this.activateRoute.paramMap.subscribe(async params => {
      // Extraire l'ID de l'URL
      this.userId = params.get('userId');
      // Vérifier si l'ID est présent
      if (this.userId) {
        // Récupérer les données de l'utilisateur à partir de Firestore
        await this.retrieveUserData(this.userId);
      } else {
        console.error('Aucun identifiant d\'utilisateur spécifié dans l\'URL.');
      }
    });
  }

  async retrieveUserData(userId: string) {
    const userDoc = this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').doc(userId).get().toPromise();
    // Récupérer les données de l'utilisateur depuis Firestore
    const userData = await userDoc;
    console.log('UserData:', userData); // Vérifier les données récupérées dans la console
    if (userData.exists) {
      // Stocker les données de l'utilisateur
      this.userData = userData.data();
    } else {
      console.error('Aucun utilisateur trouvé avec l\'identifiant spécifié.');
    }
  }
}



