import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

const firebaseConfig = {
  apiKey: "AIzaSyB1VNcbNUfag-QxeStyiQXGwG0ReF3eE_g",
  authDomain: "virtualcards-8b5ac.firebaseapp.com",
  projectId: "virtualcards-8b5ac",
  storageBucket: "virtualcards-8b5ac.appspot.com",
  messagingSenderId: "811804329781",
  appId: "1:811804329781:web:8ecd2a5c499150bfb8ae7c",
  measurementId: "G-7P3GW66FEJ"
};

@NgModule({
  declarations: [AppComponent],
  imports: [AngularFireModule.initializeApp(firebaseConfig),AngularFireAuthModule,AngularFirestoreModule,BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [ BarcodeScanner,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
