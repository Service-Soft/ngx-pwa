import { Component, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SynchronizeDialogData } from '../../models/synchronize-dialog-data.model';
import { NGX_PWA_OFFLINE_SERVICE, NgxPwaOfflineService } from '../../services/offline.service';
import { NgxPwaSynchronizeDialogComponent } from '../synchronize-dialog/synchronize-dialog.component';

/**
 * Displays a badge with the amount of cached offline request.
 * Can be clicked to open a dialog to sync cached requests to the server.
 */
@Component({
    selector: 'ngx-pwa-synchronize-badge',
    templateUrl: './synchronize-badge.component.html',
    styleUrls: ['./synchronize-badge.component.scss']
})
export class NgxPwaSynchronizeBadgeComponent<OfflineServiceType extends NgxPwaOfflineService> {

    /**
     * Configuration data for the Synchronize Dialog.
     */
    @Input()
    synchronizeDialogData?: SynchronizeDialogData;

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        readonly offlineService: OfflineServiceType,
        private readonly dialog: MatDialog
    ) { }

    /**
     * Opens the dialog for syncing cached requests to the server.
     */
    openSyncDialog(): void {
        this.dialog.open(
            NgxPwaSynchronizeDialogComponent,
            {
                autoFocus: false,
                restoreFocus: false,
                minWidth: '40%',
                data: this.synchronizeDialogData
            }
        );
    }
}