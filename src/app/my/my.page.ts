import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {

  userData: any;
  userId: any = '';
  route: any;
  user: any;
  image: string = 'assets/images.png';
  imageClass: string = 'image';

  constructor(private activatedRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUserData();
    } else {
      console.error('Aucun identifiant d\'utilisateur spécifié dans l\'URL.');
    }
  }

  loadUserData() {
    // Récupérer les données de l'utilisateur depuis Firestore
    this.firestore.collection('business-cards').doc(this.userId).get().toPromise().then((doc) => {
      if (doc.exists) {
        this.userData = doc.data();
      } else {
        console.log('Aucun utilisateur trouvé avec l\'identifiant spécifié.');
        // Gérer le cas où l'utilisateur n'existe pas
      }
    }).catch((error) => {
      console.error('Erreur lors du chargement des données de l\'utilisateur:', error);
    });
  }
}
