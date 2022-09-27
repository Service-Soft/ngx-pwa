import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPwaSynchronizeBadgeComponent } from './synchronize-badge.component';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatBadgeModule,
        MatDialogModule
    ],
    declarations: [NgxPwaSynchronizeBadgeComponent],
    exports: [NgxPwaSynchronizeBadgeComponent]
})
export class NgxPwaSynchronizeBadgeModule { }