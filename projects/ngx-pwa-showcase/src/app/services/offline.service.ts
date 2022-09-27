/* eslint-disable jsdoc/require-jsdoc */
import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxPwaOfflineService } from 'ngx-pwa';

@Injectable({providedIn: 'root'})
export class OfflineService extends NgxPwaOfflineService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly snackbar: MatSnackBar,
        private readonly ngZone: NgZone
    ) {
        super(httpClient, snackbar, ngZone);
    }
}