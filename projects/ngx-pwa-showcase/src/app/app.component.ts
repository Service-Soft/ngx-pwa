import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { NavbarRow, NgxMatNavigationNavbarComponent } from 'ngx-material-navigation';
import { NgxPwaOfflineStatusBarComponent } from 'ngx-pwa';

import { navbarRows } from './navigation.data';
import { OfflineService } from './services/offline.service';
import { UpdateService } from './services/update.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [
        NgxMatNavigationNavbarComponent,
        NgxPwaOfflineStatusBarComponent,
        MatSnackBarModule,
        RouterModule
    ]
})
export class AppComponent implements OnInit, AfterContentChecked {

    navbarRows: NavbarRow[] = navbarRows;

    otherElementsHeight: number = 0;

    constructor(readonly offlineService: OfflineService, private readonly updateService: UpdateService) {}

    ngOnInit(): void {
        this.updateService.subscribeToUpdateEvents();
    }

    ngAfterContentChecked(): void {
        let res: number = 0;
        res += this.offlineService.isOffline || this.offlineService.cachedRequests.length ? 50 : 0;
        this.otherElementsHeight = res;
    }
}