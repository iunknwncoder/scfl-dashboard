import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ScorerComponent } from './scorer/scorer.component';
import { AdministratorComponent } from './administrator/administrator.component';
import { RegistrationComponent } from './registration/registration.component';


const routes: Routes = [{
  path: '',
  component: DashboardComponent
},
{
  path: 'dashboard',
  component: DashboardComponent
}, {
  path: 'scorer',
  component: ScorerComponent
}, {
  path: 'administrator',
  component: AdministratorComponent
}, {
  path: 'registration',
  component: RegistrationComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
