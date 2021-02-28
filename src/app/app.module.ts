import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from "../material.module";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ScorerComponent } from './scorer/scorer.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PlayerPointsComponent } from './dashboard/player-points/player-points.component';
import { AdministratorComponent } from './administrator/administrator.component';
import { RegistrationComponent } from './registration/registration.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ScorerComponent,
    PlayerPointsComponent,
    AdministratorComponent,
    RegistrationComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    HttpClientModule
  ],
  entryComponents: [ConfirmationDialogComponent],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: {} }],
  bootstrap: [AppComponent]
})
export class AppModule { }
