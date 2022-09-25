import { Inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseOfflineService, NGX_OFFLINE_SERVICE } from './offline.service';
import { HttpMethod } from '../models/http-method.enum';
import { UuidUtilities } from '../encapsulation/uuid.utilities';

/**
 * An interceptor that caches any POST, UPDATE or DELETE requests when the user is offline.
 */
@Injectable()
export class OfflineRequestInterceptor<OfflineServiceType extends BaseOfflineService> implements HttpInterceptor {

    constructor(
        @Inject(NGX_OFFLINE_SERVICE)
        private readonly offlineService: OfflineServiceType,
    ) { }

    // eslint-disable-next-line jsdoc/require-jsdoc
    intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        if (!this.requestShouldBeCached(req)) {
            return next.handle(req);
        }
        if (req.method === HttpMethod.POST) {
            if (req.body == null) {
                return next.handle(req);
            }
            (req.body[this.offlineService.getIdKeyFromRequest(req)] as string) = `offline ${UuidUtilities.generate()}`;
        }
        this.offlineService.cachedRequests.concat(req);
        return next.handle(req);
    }

    private requestShouldBeCached(req: HttpRequest<unknown>): boolean {
        return this.offlineService.isOffline
            && this.requestMethodIsPostPatchOrDelete(req)
            && !this.urlShouldNotBeCached(req.url);
    }

    private requestMethodIsPostPatchOrDelete(req: HttpRequest<unknown>): boolean {
        return req.method === HttpMethod.POST || req.method === HttpMethod.PATCH || req.method === HttpMethod.DELETE;
    }

    private urlShouldNotBeCached(url: string): boolean {
        return url.endsWith('/login')
            || url.endsWith('/refresh-token')
            || url.endsWith('/request-reset-password')
            || url.endsWith('/confirm-reset-password')
            || url.endsWith('/verify-password-reset-token');
    }
}