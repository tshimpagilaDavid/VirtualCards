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
  image: string = 'assets/images.png'; // Chemin de l'image par défaut
  imageClass: string = 'image'; // Classe CSS pour l'image
  entreprise: any;
  userId: any;

  constructor(private activateRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit() {
    this.activateRoute.params.subscribe(params => {
      this.entreprise = params['entreprise'];
      this.userId = params['userId'];
      this.retrieveEmployeeData();
    });
  }

  async retrieveEmployeeData() {
    try {
      const userDoc = await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').doc(this.userId).get().toPromise();
      

      if (userDoc.exists) {
        this.userData = userDoc.data();
      } else {
        console.error('Utilisateur non trouvé.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'utilisateur :', error);
    }
  }
}


