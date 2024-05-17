import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {
  userData: any; // Variable pour stocker les données de l'utilisateur récupérées
  entreprise: string | null = null; // Initialiser l'entreprise à null
  image: string = 'assets/images.png'; // Chemin de l'image par défaut
  imageClass: string = 'image'; // Classe CSS pour l'image
  userId: string | undefined;

  constructor(private activateRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    // Extraire le paramètre 'entreprise' de l'URL
    this.entreprise = this.activateRoute.snapshot.paramMap.get('entreprise');

    // Vérifier si 'entreprise' est définie
    if (this.entreprise) {
      console.log('Nom de l\'entreprise spécifié dans l\'URL :', this.entreprise);
      // Récupérer les données de l'employé correspondant à l'ID de l'entreprise à partir de Firestore
      this.retrieveEmployeeData(this.userId!, this.entreprise);
    } else {
      console.error('Aucun nom d\'entreprise spécifié dans l\'URL.');
    }
  }
  
  async retrieveEmployeeData(userId: string, entreprise: string) {
    try {
      // Accéder à la sous-collection "employees" du document d'entreprise
     const snapshot = await this.firestore.collection('business-cards').doc(entreprise).collection('employees').doc(userId).get().toPromise();
      
      // Vérifier si le document existe
      if (snapshot.exists) {
        // Obtenez les données de l'employé
        this.userData = snapshot.data();
        console.log('Données de l\'employé récupérées :', this.userData);
      } else {
        console.error('Aucun employé trouvé pour l\'entreprise spécifiée.');
      }
  
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'employé :', error);
    }
  }
}


