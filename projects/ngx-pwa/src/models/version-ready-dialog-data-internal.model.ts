import { VersionReadyDialogData } from './version-ready-dialog-data.model';

/**
 * The internal data to customize the Version Ready Dialog.
 * Sets default values.
 */
export class VersionReadyDialogDataInternal implements VersionReadyDialogData {
    // eslint-disable-next-line jsdoc/require-jsdoc
    title: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    message: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    confirmButtonLabel: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    cancelButtonLabel: string;

    constructor(data?: VersionReadyDialogData) {
        this.title = data?.title ?? 'New Update available';
        this.message = data?.message ?? 'A new version has been downloaded. Do you want to install it now?';
        this.confirmButtonLabel = data?.confirmButtonLabel ?? 'Reload';
        this.cancelButtonLabel = data?.cancelButtonLabel ?? 'Not now';
    }
}