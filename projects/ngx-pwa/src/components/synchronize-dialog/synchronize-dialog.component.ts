import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { PurifyUtilities } from '../../encapsulation/purify.utilities';
import { CachedRequest, NgxPwaOfflineService, NGX_PWA_OFFLINE_SERVICE } from '../../services/offline.service';
import { SynchronizeDialogData } from '../../models/synchronize-dialog-data.model';
import { SynchronizeDialogDataInternal } from '../../models/synchronize-dialog-data-internal.model';

/**
 * The dialog for syncing cached requests to the server.
 */
@Component({
    selector: 'ngx-pwa-synchronize-dialog',
    templateUrl: './synchronize-dialog.component.html',
    styleUrls: ['./synchronize-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDividerModule,
        MatDialogModule
    ]
})
export class NgxPwaSynchronizeDialogComponent<OfflineServiceType extends NgxPwaOfflineService> implements OnInit {

    // eslint-disable-next-line jsdoc/require-jsdoc
    PurifyUtilities = PurifyUtilities;

    /**
     * The provided dialog data filled up with default values.
     */
    dialogData!: SynchronizeDialogDataInternal;

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        readonly offlineService: OfflineServiceType,
        readonly sanitizer: DomSanitizer,
        private readonly dialogRef: MatDialogRef<NgxPwaSynchronizeDialogComponent<OfflineServiceType>>,
        @Inject(MAT_DIALOG_DATA)
        readonly data: SynchronizeDialogData
    ) { }

    ngOnInit(): void {
        this.dialogData = new SynchronizeDialogDataInternal(this.data);
    }

    /**
     * Sends a specific cached request to the server.
     *
     * @param request - The request that should be synced.
     */
    async syncSingleRequest(request: CachedRequest<unknown>): Promise<void> {
        await this.offlineService.sync(request);
        if (!this.offlineService.cachedRequests.length) {
            this.dialogRef.close();
        }
    }

    /**
     * Removes a single request from the cache.
     *
     * @param request - The request that should be removed.
     */
    removeSingleRequest(request: CachedRequest<unknown>): void {
        this.offlineService.removeSingleRequest(request);
        if (!this.offlineService.cachedRequests.length) {
            this.dialogRef.close();
        }
    }

    /**
     * Sends all cached requests to the server. Tries to handle dependencies of requests on each other.
     */
    async syncAll(): Promise<void> {
        await this.offlineService.syncAll();
        if (!this.offlineService.cachedRequests.length) {
            this.dialogRef.close();
        }
    }

    /**
     * Removes all locally cached requests.
     */
    undoAll(): void {
        this.offlineService.cachedRequests = [];
        this.dialogRef.close();
    }

    /**
     * Closes the dialog.
     */
    close(): void {
        this.dialogRef.close();
    }
}