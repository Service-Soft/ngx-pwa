import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPWAOfflineStatusBarComponent } from './offline-status-bar.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [NgxPWAOfflineStatusBarComponent],
    exports: [NgxPWAOfflineStatusBarComponent]
})
export class NgxPWAOfflineStatusBarModule { }