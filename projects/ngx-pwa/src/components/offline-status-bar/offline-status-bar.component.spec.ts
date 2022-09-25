import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPWAOfflineStatusBarComponent } from './offline-status-bar.component';

describe('NgxPWAOfflineStatusBarComponent', () => {
    let component: NgxPWAOfflineStatusBarComponent;
    let fixture: ComponentFixture<NgxPWAOfflineStatusBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ NgxPWAOfflineStatusBarComponent ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(NgxPWAOfflineStatusBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});