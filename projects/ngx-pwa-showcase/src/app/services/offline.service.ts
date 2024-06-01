
import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxPwaOfflineService } from 'ngx-pwa';

@Injectable({ providedIn: 'root' })
export class OfflineService extends NgxPwaOfflineService {
    constructor(http: HttpClient, snackBar: MatSnackBar, zone: NgZone) {
        super(http, snackBar, zone);
    }
}