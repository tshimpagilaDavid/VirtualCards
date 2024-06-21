import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {
  loading = true;
  userData: any; // Variable pour stocker les données utilisateur récupérées
  image: string = 'assets/images.png'; // Chemin de l'image par défaut
  imageClass: string = 'image'; // Classe CSS pour l'image
  entreprise: any;
  userId: any;

  constructor(private activateRoute: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit() {
    this.loading = true;
    this.activateRoute.params.subscribe(params => {
      this.entreprise = params['entreprise'];
      this.userId = params['userId'];
      this.retrieveEmployeeData();
    });
  }

  getFacebookUrl(username: string): string {
    // Vérifier si l'identifiant Facebook commence par "http://" ou "https://"
    if (!username.startsWith('http://') && !username.startsWith('https://')) {
      // Si l'identifiant Facebook ne commence pas par "http://" ou "https://", ajouter "https://www.facebook.com/" au début
      username = 'https://www.facebook.com/' + username;
    }
  
    // Retourner l'URL complète de la page Facebook
    return username;
  }

  getDomainUrl(site: string): string {
    // Vérifier si l'URL commence par "http://" ou "https://"
    if (!site.startsWith('http://') && !site.startsWith('https://')) {
      // Si l'URL ne commence pas par "http://" ou "https://", ajouter "https://" au début
      site = 'https://' + site;
    }
  
    // Supprimer "http://", "https://" et "www." de l'URL
    let domain = site.replace(/(^\w+:|^)\/\//, '').replace('www.', '');
  
    // Extraire le nom de domaine du site
    domain = domain.split('/')[0];
  
    // Retourner l'URL avec le nom de domaine seulement
    return domain;
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
    } finally {
      // Désactiver le loader après la récupération des données ou en cas d'erreur
      this.loading = false;
    }
  }
  captureAndDownload() {
    const element = document.documentElement;

    // Utiliser html2canvas pour capturer l'élément HTML
    html2canvas(element).then(canvas => {
      // Convertir le canvas en image PNG
      const imgData = canvas.toDataURL('image/png');

      // Créer un élément <a> pour le téléchargement
      const a = document.createElement('a');
      a.href = imgData;
      a.download = 'ma-carte-virtuelle.png';

      // Ajouter l'élément <a> à la page et simuler un clic pour télécharger
      document.body.appendChild(a);
      a.click();

      // Nettoyer
      document.body.removeChild(a);
    });
  }
}


