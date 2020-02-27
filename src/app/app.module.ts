import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from "../material.module";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyTeamComponent } from './my-team/my-team.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ScorerComponent } from './scorer/scorer.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PlayerPointsComponent } from './dashboard/player-points/player-points.component';

@NgModule({
  declarations: [
    AppComponent,
    MyTeamComponent,
    DashboardComponent,
    ScorerComponent,
    PlayerPointsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule
  ],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: {} }],
  bootstrap: [AppComponent]
})
export class AppModule { }
