import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsComponent } from './alerts.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AuthModule } from '../auth/auth.module';

@NgModule({
  declarations: [
    AlertsComponent
  ],

  imports: [
    CommonModule,
    AlertModule,
    AuthModule
  ],
  exports: [
    AlertsComponent
  ]
})

export class AlertsModule { }
