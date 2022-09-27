
/**
 * The data to customize the Version Ready Dialog.
 */
export interface VersionReadyDialogData {
    /**
     * The title of the dialog.
     *
     * @default 'New Version downloaded'
     */
    title?: string,
    /**
     * The message to display inside the dialog content.
     *
     * @default 'A new version has been downloaded. Do you want to install it now?'
     */
    message?: string,
    /**
     * The label for the button that updates the pwa.
     *
     * @default 'Reload'
     */
    confirmButtonLabel?: string,
    /**
     * The label for the button that closes the dialog without updating the pwa.
     *
     * @default 'Not now'
     */
    cancelButtonLabel?: string
}