/* eslint-disable jsdoc/require-jsdoc */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';
import { NgxPwaUpdateService } from 'ngx-pwa';

@Injectable({ providedIn: 'root' })
export class UpdateService extends NgxPwaUpdateService {
    constructor(
        private readonly update: SwUpdate,
        private readonly matDialog: MatDialog
    ) {
        super(update, matDialog);
    }
}