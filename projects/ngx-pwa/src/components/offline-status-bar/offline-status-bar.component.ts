import { Component, Inject, Input, OnInit } from '@angular/core';
import { BaseOfflineService, NGX_OFFLINE_SERVICE } from '../../services/offline.service';

/**
 * Shows a permanent warning above the navbar.
 */
@Component({
    selector: 'ngx-pwa-warning-status-bar',
    templateUrl: './offline-status-bar.component.html',
    styleUrls: ['./offline-status-bar.component.scss']
})
export class NgxPWAOfflineStatusBarComponent<OfflineServiceType extends BaseOfflineService> implements OnInit {
    /**
     * The message to display when the user is offline.
     */
    @Input()
    offlineMessage!: string;

    /**
     * The message to display when the user has changes that aren't synced to the api.
     */
    @Input()
    unsavedChangesMessage!: string;

    constructor(
        @Inject(NGX_OFFLINE_SERVICE)
        readonly offlineService: OfflineServiceType,
    ) { }

    ngOnInit(): void {
        this.offlineMessage = this.offlineMessage ?? 'Offline';
        this.unsavedChangesMessage = this.unsavedChangesMessage ?? 'Unsaved Changes';
    }
}