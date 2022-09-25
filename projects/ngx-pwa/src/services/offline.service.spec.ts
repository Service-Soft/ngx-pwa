/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { BaseOfflineService } from './offline.service';

describe('Service: OfflineService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BaseOfflineService]
        });
    });

    it('should ...', inject([BaseOfflineService], (service: BaseOfflineService) => {
        expect(service).toBeTruthy();
    }));
});