import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyTeamComponent } from './my-team/my-team.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ScorerComponent } from './scorer/scorer.component';


const routes: Routes = [{
  path: '',
  component: DashboardComponent
}, {
  path: 'myteam',
  component: MyTeamComponent
},
{
  path: 'dashboard',
  component: DashboardComponent
}, {
  path: 'scorer',
  component: ScorerComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
