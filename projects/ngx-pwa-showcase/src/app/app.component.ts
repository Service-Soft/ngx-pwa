/* eslint-disable jsdoc/require-jsdoc */
import { AfterContentChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FooterRow, NavbarRow } from 'ngx-material-navigation';
import { navbarRows } from './navigation.data';
import { OfflineService } from './services/offline.service';
import { UpdateService } from './services/update.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentChecked {

    navbarRows: NavbarRow[] = navbarRows;
    footerRows: FooterRow[] = [];

    @ViewChild('footer', { read: ElementRef })
    footer?: ElementRef<HTMLElement>;

    otherElementsHeight: number = 0;

    constructor(readonly offlineService: OfflineService, private readonly updateService: UpdateService) {}

    ngOnInit(): void {
        this.updateService.subscribeToUpdateEvents();
    }

    ngAfterContentChecked(): void {
        let res: number = 0;
        res += this.footer?.nativeElement.offsetHeight ?? 0;
        res += this.offlineService.isOffline || this.offlineService.cachedRequests.length ? 50 : 0;
        this.otherElementsHeight = res;
    }
}