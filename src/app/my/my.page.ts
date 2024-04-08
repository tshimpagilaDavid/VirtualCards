import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {

  businessCardId: any = '';
  businessCardData: any;
  route: any;
  user: any;
  image: string = 'assets/images.png';
  imageClass: string = 'image';

  constructor(private activatedRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit() {
    this.businessCardId = this.activatedRoute.snapshot.paramMap.get('id');
    this.loadBusinessCardData();
  }

  loadBusinessCardData() {
    this.firestore.collection('business-cards').doc(this.businessCardId).get().toPromise().then((doc) => {
      if (doc.exists) {
        this.businessCardData = doc.data();
      } else {
        console.log('Aucune carte de visite trouvée avec l\'identifiant spécifié.');
      }
    }).catch((error) => {
      console.error('Erreur lors du chargement des données de la carte de visite:', error);
    });
  }

}
