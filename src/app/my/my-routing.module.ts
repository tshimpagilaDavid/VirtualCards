import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyPage } from './my.page';

const routes: Routes = [
  {
    path: '/my/:userId',
    component: MyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyPageRoutingModule {}
