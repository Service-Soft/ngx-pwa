import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPwaSynchronizeBadgeModule } from '../synchronize-badge/synchronize-badge.module';
import { NgxPwaOfflineStatusBarComponent } from './offline-status-bar.component';

@NgModule({
    imports: [
        CommonModule,
        NgxPwaSynchronizeBadgeModule
    ],
    declarations: [NgxPwaOfflineStatusBarComponent],
    exports: [NgxPwaOfflineStatusBarComponent]
})
export class NgxPwaOfflineStatusBarModule { }