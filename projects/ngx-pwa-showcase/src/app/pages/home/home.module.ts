import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { NgxPwaSynchronizeBadgeModule } from 'ngx-pwa';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        NgxPwaSynchronizeBadgeModule,
        MatButtonModule
    ],
    declarations: [HomeComponent]
})
export class HomeModule { }