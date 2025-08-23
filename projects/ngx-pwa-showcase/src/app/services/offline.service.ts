
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxPwaOfflineService } from 'ngx-pwa';

@Injectable({ providedIn: 'root' })
export class OfflineService extends NgxPwaOfflineService {
    constructor(
        http: HttpClient,
        snackBar: MatSnackBar,
        zone: NgZone,
        @Inject(PLATFORM_ID)
        platformId: object
    ) {
        super(http, snackBar, zone, platformId);
    }
}