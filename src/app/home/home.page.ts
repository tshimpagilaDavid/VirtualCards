import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  nom: any = '';
  prenom: any ='';
  poste: any = '';
  entreprise: any ='';
  localisation: any = '';

  image: string = 'assets/images.png';

  constructor(private barcodeScanner: BarcodeScanner,  private firestore: AngularFirestore) {}

  generateQR() {
    // Générer le contenu du QR code avec les informations saisies
    const qrContent = `${this.nom}, ${this.prenom}, ${this.poste}, ${this.entreprise}, ${this.localisation}`;
  
    // Vérifier si la collection de l'entreprise existe déjà
    const businessCardsCollectionRef = this.firestore.collection('business-cards').doc(this.entreprise).collection('employees');
    businessCardsCollectionRef.get().toPromise().then(querySnapshot => {
      if (querySnapshot!.empty) {
        // La collection de l'entreprise n'existe pas, créez-la d'abord
        return this.firestore.collection('business-cards').doc(this.entreprise).set({});
      } else {
        // La collection de l'entreprise existe déjà, pas besoin de la créer
        return Promise.resolve();
      }
    }).then(() => {
      // Enregistrer les informations de l'employé dans la collection de l'entreprise
      return businessCardsCollectionRef.add({
        nom: this.nom,
        prénom: this.prenom,
        poste: this.poste,
        localisation: this.localisation,
        // Ajoutez d'autres champs si nécessaire
      });
    }).then((docRef) => {
      console.log('Employé enregistré avec ID :', docRef.id);
      // Générer le QR code à partir des données
      this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, qrContent).then(data => {
        console.log('QR Code généré :', data);
        // Afficher le QR code ou faire d'autres actions si nécessaire
      }, err => {
        console.error('Erreur lors de la génération du QR code :', err);
      });
    }).catch(error => {
      console.error('Erreur lors de l\'enregistrement de l\'employé dans Firestore :', error);
    });
  }

}
