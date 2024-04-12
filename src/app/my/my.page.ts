import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {

  userData: any;
  userId: any | null = null;
  image: string = 'assets/images.png';
  imageClass: string = 'image';

  constructor(private activatedRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      // Extraire l'ID de l'URL
      this.userId = params.get('userId');
      // Vérifier si l'ID est présent
      if (this.userId) {
        // Récupérer les données de l'utilisateur à partir de Firestore
        this.retrieveUserData();
      } else {
        console.error('Aucun identifiant d\'utilisateur spécifié dans l\'URL.');
      }
    });
  }

  retrieveUserData() {
    // Récupérer les données de l'utilisateur depuis Firestore
    this.firestore.collection('business-cards').doc(this.userId).get().toPromise().then(doc => {
      if (doc.exists) {
        // Stocker les données de l'utilisateur
        this.userData = doc.data();
      } else {
        console.error('Aucun utilisateur trouvé avec l\'identifiant spécifié.');
      }
    }).catch(error => {
      console.error('Erreur lors du chargement des données de l\'utilisateur:', error);
    });
  }
}



