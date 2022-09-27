import { Component, Inject, Input, OnInit } from '@angular/core';
import { SynchronizeDialogData } from '../../models/synchronize-dialog-data.model';
import { NgxPwaOfflineService, NGX_PWA_OFFLINE_SERVICE } from '../../services/offline.service';

/**
 * Shows a offline warning when the user is not online.
 */
@Component({
    selector: 'ngx-pwa-offline-status-bar',
    templateUrl: './offline-status-bar.component.html',
    styleUrls: ['./offline-status-bar.component.scss']
})
export class NgxPwaOfflineStatusBarComponent<OfflineServiceType extends NgxPwaOfflineService> implements OnInit {
    /**
     * The message to display when the user is offline.
     *
     * @default 'Offline'
     */
    @Input()
    offlineMessage!: string;

    /**
     * The message to display when the user has changes that aren't synced to the api.
     *
     * @default 'Unsaved Changes'
     */
    @Input()
    unsavedChangesMessage!: string;

    /**
     * Whether or not to display a badge that shows the amount of cached requests and can open a dialog to sync changes to the server.
     */
    @Input()
    displayUnsavedChangesSynchronizeBadge!: boolean;

    /**
     * Configuration data for the Synchronize Dialog.
     */
    @Input()
    synchronizeDialogData?: SynchronizeDialogData;

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        readonly offlineService: OfflineServiceType,
    ) { }

    ngOnInit(): void {
        this.offlineMessage = this.offlineMessage ?? 'Offline';
        this.unsavedChangesMessage = this.unsavedChangesMessage ?? 'Unsaved Changes';
        this.displayUnsavedChangesSynchronizeBadge = this.displayUnsavedChangesSynchronizeBadge ?? true;
    }
}