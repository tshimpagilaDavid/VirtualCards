import { Component, ViewChild, ElementRef } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;


  qrContent: string = 'Contenu du QR code à afficher';
  nom: any = '';
  prenom: any ='';
  poste: any = '';
  entreprise: any ='';
  localisation: any = '';

  image: string = 'assets/images.png';
  qrCodeImage: string | undefined;

  constructor(private barcodeScanner: BarcodeScanner,  
    private firestore: AngularFirestore,
    private platform: Platform
    ) {}
    

    async addUserAndGenerateQR() {
      try {
        // Ajouter les données de l'utilisateur à Firestore
        const userData = {
          nom: this.nom,
          prenom: this.prenom,
          poste: this.poste,
          entreprise: this.entreprise,
          localisation: this.localisation
          // Ajoutez d'autres champs si nécessaire
        };
        const userRef = await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').add(userData);
        const userId = userRef.id; // Récupérer l'ID du document nouvellement créé
    
        // Générer un code QR à partir des informations de l'utilisateur
        await this.generateQRCode(userId);
    
        console.log('Utilisateur ajouté avec succès et code QR généré.');
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur et de la génération du code QR :', error);
      }
    }
    
    async generateQRCode(userId: string) {
      try {
        // Récupérer les données de l'utilisateur depuis Firestore
        const userDoc = await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').doc(userId).get().toPromise();
        const userData = userDoc.data();
    
        // Construire la chaîne de données à encoder dans le code QR
        const qrContent = `Nom: ${userData!['nom']}, Prénom: ${userData!['prenom']}, Poste: ${userData!['poste']}, Entreprise: ${userData!['entreprise']}, Localisation: ${userData!['localisation']}`;
    
        // Générer le code QR à partir de la chaîne de données
        const qrCodeDataURL = await QRCode.toDataURL(qrContent);
    
        // Afficher le code QR dans votre application (par exemple, en l'assignant à une variable dans votre composant)
        this.qrCodeImage = qrCodeDataURL;
    
        console.log('Code QR généré avec succès pour l\'utilisateur:', userId);
      } catch (error) {
        console.error('Erreur lors de la génération du code QR pour l\'utilisateur:', error);
      }
    }
}

