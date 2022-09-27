/**
 * The type for the synchronize dialog data.
 */
export interface SynchronizeDialogData {
    /**
     * The title of the dialog.
     */
    title?: string,
    /**
     * The label for the close button.
     */
    closeButtonLabel?: string,
    /**
     * The label for the button that syncs everything.
     */
    syncAllButtonLabel?: string,
    /**
     * The label for the button that undoes all local changes.
     */
    undoAllButtonLabel?: string
}