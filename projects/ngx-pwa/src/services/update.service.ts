import { MatDialog } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { NgxPwaVersionReadyDialogComponent } from '../components/version-ready-dialog/version-ready-dialog.component';

/**
 * Provides helpers for handling pwa version updates.
 */
export class NgxPwaUpdateService {

    constructor(private readonly swUpdate: SwUpdate, private readonly dialog: MatDialog) { }

    /**
     * Subscribes to any version update events.
     */
    subscribeToUpdateEvents(): void {
        if (!this.swUpdate.isEnabled) {
            return;
        }
        this.swUpdate.versionUpdates.subscribe(e => {
            switch (e.type) {
                case 'VERSION_READY':
                    void this.onVersionReady();
                    break;
                case 'VERSION_DETECTED':
                    this.onVersionDetected();
                    break;
                case 'VERSION_INSTALLATION_FAILED':
                    this.onVersionInstallationFailed();
                    break;
                case 'NO_NEW_VERSION_DETECTED':
                    this.onNoNewVersionDetected();
                    break;
            }
        });
    }

    /**
     * Gets called when no new version was found.
     */
    protected onNoNewVersionDetected(): void {
        return;
    }

    /**
     * Gets called when the installation of a new version fails.
     */
    protected onVersionInstallationFailed(): void {
        return;
    }

    /**
     * Gets called when a new version has been found.
     */
    protected onVersionDetected(): void {
        return;
    }

    /**
     * Gets called when a new version has been installed.
     */
    protected async onVersionReady(): Promise<void> {
        const dialogRef = this.dialog.open(NgxPwaVersionReadyDialogComponent, { autoFocus: false, restoreFocus: false });
        const res = await firstValueFrom(dialogRef.afterClosed()) as 'update' | 'cancel';
        if (res === 'update') {
            window.location.reload();
        }
    }

    /**
     * Manually checks for updates.
     *
     * @returns Whether or not new updates are available.
     */
    async checkForUpdates(): Promise<boolean> {
        return await this.swUpdate.checkForUpdate();
    }
}