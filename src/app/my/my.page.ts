import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {
  userData: any; // Variable pour stocker les données utilisateur récupérées
  userId: string | null = null; // Initialiser l'ID à null
  image: string = 'assets/images.png'; // Chemin de l'image par défaut
  imageClass: string = 'image'; // Classe CSS pour l'image
  entreprise: any;

  constructor(private activateRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    // Extraire le paramètre 'userId' de l'URL
    this.userId = this.activateRoute.snapshot.paramMap.get('userId');
    this.entreprise = this.activateRoute.snapshot.paramMap.get('entreprise')

    // Vérifier si 'userId' est défini
    if (this.userId) {
      console.log('ID utilisateur spécifié dans l\'URL :', this.userId);
      // Récupérer les données de l'employé correspondant à l'ID à partir de Firestore
      this.retrieveUserData(this.entreprise, this.userId);
    } else {
      console.error('Aucun identifiant utilisateur spécifié dans l\'URL.');
    }
  }
  
  async retrieveUserData(_entreprise: string, userId: string): Promise<void> {
    try {
      // Accéder au document spécifique dans la sous-collection "employees" en utilisant l'ID
      const userDoc = await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').doc(userId).get().toPromise();
      
      // Vérifier si le document existe
      if (userDoc.exists) {
        // Récupérer les données du document
        this.userData = userDoc.data();
        console.log('Données utilisateur récupérées :', this.userData);
      } else {
        console.error('Aucun utilisateur trouvé avec l\'identifiant spécifié.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'utilisateur :', error);
    }
  }
}


