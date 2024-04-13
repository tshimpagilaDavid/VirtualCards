import { Component, ViewChild, ElementRef } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as QRCode from 'qrcode';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
interface Routes {
  navigate(url: string): void;
}


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
  telephone!: number;
  whatsapp!: number;
  mail: any = '';
  site!: URL;

  image: string = 'assets/images.png';
  image2: string | ArrayBuffer | null = this.image;
  qrCodeImageUrl: string | null = null;
  imageClass: string = 'image';
  selectedFile: any;

  constructor(
    private router: Router,
    private barcodeScanner: BarcodeScanner,  
    private firestore: AngularFirestore,
    private platform: Platform,
    private storage: AngularFireStorage
    ) {}

    openGallery() {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      fileInput.click();
    }
    
    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0]; // Assignez la valeur de selectedFile à this.selectedFile
      const selectedFile = this.selectedFile;
      
      // Vous pouvez maintenant traiter le fichier sélectionné comme vous le souhaitez
      // Par exemple, vous pouvez afficher l'image dans votre application ou l'enregistrer sur le serveur.
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = () => {
          this.image2 = reader.result;
          this.imageClass = 'image fit-image';
        };
        reader.readAsDataURL(selectedFile);
      }
      console.log(selectedFile);
    }
    

    async addUserAndGenerateQR() {
      try {
          if (!this.selectedFile) {
              console.error('Aucune image sélectionnée.');
              return;
          }
  
          // Télécharger l'image dans le stockage de Firebase
          const filePath = `images/${Date.now()}_${this.selectedFile.name}`;
          const fileRef = this.storage.ref(filePath);
          const uploadTask = this.storage.upload(filePath, this.selectedFile);
  
          // Attendre la fin du téléchargement de l'image
          await uploadTask.snapshotChanges().pipe(
              finalize(async () => {
                  // Obtenir l'URL de téléchargement de l'image
                  const imageUrl = await fileRef.getDownloadURL().toPromise();
  
                  // Ajouter les données de l'utilisateur (y compris l'URL de l'image) à Firestore
                  const userData = {
                      nom: this.nom,
                      prenom: this.prenom,
                      poste: this.poste,
                      entreprise: this.entreprise,
                      localisation: this.localisation,
                      imageUrl: imageUrl,
                      telephone: this.telephone,
                      whatsapp: this.whatsapp,
                      mail: this.mail,
                      site: this.site // Ajoutez l'URL de l'image ici
                      // Ajoutez d'autres champs si nécessaire
                  };
                  const userRef = await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').add(userData);
                  const userId = userRef.id; // Récupérer l'ID du document nouvellement créé
  
                  // Générer le code QR à partir de l'ID de l'utilisateur et de l'URL de la page
                  const pageUrl = `https://virtualcards-8b5ac.web.app/my/${userId}`;// URL de la page

                  const qrCodeImageUrl = await this.generateAndUploadQRCode(pageUrl, userId);
                  this.qrCodeImageUrl = qrCodeImageUrl;
  
                  // Mettre à jour le document de l'utilisateur avec l'URL de l'image du code QR
                  await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').doc(userId).update({
                      qrCodeImageUrl: qrCodeImageUrl
                  });
  
                  console.log('Utilisateur ajouté avec succès et code QR généré.');
              })
          ).toPromise();
      } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'utilisateur et de la génération du code QR :', error);
      }
    }
  
    async generateAndUploadQRCode(userId: string, pageUrl: string) {
      try {
          console.log('Début de la génération et du téléchargement du code QR.'); 
    
          // Construire l'URL de la page avec les données utilisateur
          const fullUrl = `${pageUrl}?userId=${userId}`;
          console.log('URL complète de la page:', fullUrl);
    
          // Générer le code QR à partir de l'URL de la page
          const qrCodeDataURL = await QRCode.toDataURL(fullUrl);
          console.log('Données URL du code QR généré:', qrCodeDataURL);
    
          // Convertir les données de l'image du code QR en Blob
          const qrCodeBlob = this.dataURLtoBlob(qrCodeDataURL);
    
          // Télécharger l'image du code QR dans le stockage Firebase
          const qrCodeFilePath = `qrcodes/${userId}_qrcode.png`;
          console.log('Chemin du fichier du code QR:', qrCodeFilePath);
    
          const qrCodeFileRef = this.storage.ref(qrCodeFilePath);
          await qrCodeFileRef.put(qrCodeBlob);
    
          // Obtenir l'URL de téléchargement de l'image du code QR
          const qrCodeImageUrl = await qrCodeFileRef.getDownloadURL().toPromise(); // Utiliser toPromise()
          console.log('URL de téléchargement de l\'image du code QR :', qrCodeImageUrl);
          console.log('Code QR généré et téléchargé avec succès.');
          return qrCodeImageUrl; // Retournez l'URL de téléchargement de l'image du code QR
      } catch (error) {
          console.error('Erreur lors de la génération et du téléchargement du code QR :', error);
          throw error;
      }
  }

   dataURLtoBlob(dataURL: string) {
      const parts = dataURL.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
       }

      return new Blob([uInt8Array], { type: contentType });
    }


  
  async scanQRCode() {
      try {
          // Scanner le code QR
          const barcodeData = await this.barcodeScanner.scan();
  
          // Vérifier si le scan a été annulé ou non
          if (!barcodeData.cancelled) {
              // Récupérer l'ID du document Firestore depuis le texte du code QR
              const userId = barcodeData.text;
              console.log('userId extrait du code QR :', userId);
              await this.retrieveUserData(userId);
          }
      } catch (error) {
          console.error('Erreur lors du scan du code QR :', error);
      }
  }
  
  async retrieveUserData(userId: string) {
    try {
      // Récupérer les données de l'utilisateur depuis Firestore
      const userDoc = await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').doc(userId).get().toPromise();
      
      if (userDoc.exists) {
          const userData = userDoc.data();
          localStorage.setItem('userData', JSON.stringify(userData));

          // Rediriger l'utilisateur vers la page MyPage avec l'ID de l'utilisateur dans l'URL
          window.location.href = `https://virtualcards-8b5ac.web.app/my/${userId}`;
      } else {
          console.error('L\'utilisateur avec l\'identifiant spécifié n\'existe pas.');
      }
  } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
  }
  }
  
  // Méthode pour naviguer vers une certaine URL
  navigate(url: string, userData: unknown) {
      try {
          this.router.navigateByUrl(url);
      } catch (error) {
          console.error('Erreur lors de la navigation :', error);
      }
  }

}

