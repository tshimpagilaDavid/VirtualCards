import { Component, ViewChild, ElementRef } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as QRCode from 'qrcode';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
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

  image: string = 'assets/images.png';
  image2: string | ArrayBuffer | null = this.image;
  qrCodeImage: string | undefined;
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
              imageUrl: imageUrl // Ajoutez l'URL de l'image ici
              // Ajoutez d'autres champs si nécessaire
            };
            const userRef = await this.firestore.collection('business-cards').doc(this.entreprise).collection('employees').add(userData);
            const userId = userRef.id; // Récupérer l'ID du document nouvellement créé
            
            // Générer le code QR à partir de l'ID de l'utilisateur
            const qrCodeImageUrl = await this.generateAndUploadQRCode(userId);
            
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
    
    async generateAndUploadQRCode(userId: string) {
      try {
        // Construire la chaîne de données à encoder dans le code QR
        const qrContent = `Nom: ${this.nom}, Prénom: ${this.prenom}, Poste: ${this.poste}, Entreprise: ${this.entreprise}, Localisation: ${this.localisation}`;
        
        // Générer le code QR à partir de la chaîne de données
        const qrCodeDataURL = await QRCode.toDataURL(qrContent);
    
        // Convertir les données de l'image du code QR en Blob
        const qrCodeBlob = this.dataURLtoBlob(qrCodeDataURL);
    
        // Télécharger l'image du code QR dans le stockage Firebase
        const qrCodeFilePath = `qrcodes/${userId}_qrcode.png`;
        const qrCodeFileRef = this.storage.ref(qrCodeFilePath);
        await qrCodeFileRef.put(qrCodeBlob);
    
        // Obtenir l'URL de téléchargement de l'image du code QR
        const qrCodeImageUrl = await qrCodeFileRef.getDownloadURL().toPromise();
        this.qrCodeImage = qrCodeDataURL;
    
        console.log('Code QR généré et téléchargé avec succès.');
        return qrCodeImageUrl; // Retournez l'URL de téléchargement de l'image du code QR
      } catch (error) {
        console.error('Erreur lors de la génération et du téléchargement du code QR :', error);
        throw error;
      }
    }
    
    dataURLtoBlob(dataURL: string) {
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
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
  
          // Vérifier si le document existe
          if (userDoc.exists) {
              // Extraire les données de l'utilisateur du document
              const userData = userDoc.data();
              localStorage.setItem('userData', JSON.stringify(userData));
              
              // Rediriger l'utilisateur vers la page des détails de l'utilisateur
              window.location.href = `https://virtualcards-8b5ac.web.app/my`;
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

