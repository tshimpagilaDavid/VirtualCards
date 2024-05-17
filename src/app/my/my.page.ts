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
  entreprise: string | null = null;

  constructor(private activateRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    // Extraire le paramètre 'entreprise' de l'URL
    this.entreprise = this.activateRoute.snapshot.paramMap.get('entreprise');
    // Extraire le paramètre 'userId' de l'URL
    this.userId = this.activateRoute.snapshot.paramMap.get('userId');

    // Vérifier si 'entreprise' et 'userId' sont définis
    if (this.entreprise && this.userId) {
      console.log('Nom de l\'entreprise spécifié dans l\'URL :', this.entreprise);
      console.log('ID utilisateur spécifié dans l\'URL :', this.userId);
      // Récupérer les données de l'employé à partir de Firestore
      this.retrieveEmployeeData(this.entreprise, this.userId);
    } else {
      console.error('Aucun nom d\'entreprise ou ID utilisateur spécifié dans l\'URL.');
    }
  }
  
  async retrieveEmployeeData(entreprise: string, userId: string): Promise<void> {
    try {
      // Accéder au document de l'utilisateur dans la sous-collection "employees" de l'entreprise
      const userDoc = await this.firestore.collection('business-cards').doc(entreprise).collection('employees').doc(userId).get().toPromise();
      
      // Vérifier si le document de l'utilisateur existe
      if (userDoc.exists) {
        // Stocker les données de l'utilisateur
        this.userData = userDoc.data();
        console.log('Données de l\'utilisateur récupérées :', this.userData);
      } else {
        console.error('Aucun utilisateur trouvé avec l\'identifiant spécifié.');
      }
  
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'utilisateur :', error);
    }
  }
}


