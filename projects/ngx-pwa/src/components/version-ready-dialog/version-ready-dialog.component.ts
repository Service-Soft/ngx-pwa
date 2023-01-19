import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VersionReadyDialogDataInternal } from '../../models/version-ready-dialog-data-internal.model';
import { VersionReadyDialogData } from '../../models/version-ready-dialog-data.model';

/**
 * A dialog that gets displayed when a new version of the pwa has been downloaded and is ready for install.
 */
@Component({
    selector: 'ngx-pwa-version-ready-dialog',
    templateUrl: './version-ready-dialog.component.html',
    styleUrls: ['./version-ready-dialog.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule
    ]
})
export class NgxPwaVersionReadyDialogComponent implements OnInit {

    /**
     * The data to customize the Version Ready Dialog.
     * Is built from the MAT_DIALOG_DATA input.
     */
    versionReadyDialogData!: VersionReadyDialogDataInternal;

    constructor(
        private readonly dialogRef: MatDialogRef<NgxPwaVersionReadyDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        readonly data?: VersionReadyDialogData
    ) { }

    ngOnInit(): void {
        this.versionReadyDialogData = new VersionReadyDialogDataInternal(this.data);
    }

    /**
     * Closes the dialog with data to trigger a reload of the app.
     */
    update(): void {
        this.dialogRef.close('update');
    }

    /**
     * Closes the dialog with data to not trigger anything.
     */
    cancel(): void {
        this.dialogRef.close('cancel');
    }
}