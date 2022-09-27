import { SynchronizeDialogData } from './synchronize-dialog-data.model';

/**
 * The internal dialog data for the synchronize dialog.
 * Sets default values.
 */
export class SynchronizeDialogDataInternal implements SynchronizeDialogData {
    // eslint-disable-next-line jsdoc/require-jsdoc
    title: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    closeButtonLabel: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    syncAllButtonLabel: string;
    // eslint-disable-next-line jsdoc/require-jsdoc
    undoAllButtonLabel: string;

    constructor(data?: SynchronizeDialogData) {
        this.title = data?.title ?? 'Sync';
        this.closeButtonLabel = data?.closeButtonLabel ?? 'Ok';
        this.syncAllButtonLabel = data?.syncAllButtonLabel ?? 'Sync all';
        this.undoAllButtonLabel = data?.undoAllButtonLabel ?? 'Undo all';
    }
}