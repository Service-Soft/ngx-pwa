import { Inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CachedRequest, NgxPwaOfflineService, NGX_PWA_OFFLINE_SERVICE } from './offline.service';
import { HttpMethod } from '../models/http-method.enum';
import { UuidUtilities } from '../encapsulation/uuid.utilities';
import { NGX_PWA_HTTP_CONTEXT_METADATA } from '../models/request-metadata.model';
import { RequestMetadataInternal } from '../models/request-metadata-internal.model';

/**
 * An interceptor that caches any POST, UPDATE or DELETE requests when the user is offline.
 */
@Injectable()
export class OfflineRequestInterceptor<OfflineServiceType extends NgxPwaOfflineService> implements HttpInterceptor {

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        private readonly offlineService: OfflineServiceType,
    ) { }

    // eslint-disable-next-line jsdoc/require-jsdoc
    intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        if (!this.requestShouldBeCached(req)) {
            return next.handle(req);
        }
        const metadata = this.getRequestMetadata(req);
        if (req.method === HttpMethod.POST && req.body != null) {
            (req.body[metadata.idKey] as unknown as string) = `${this.offlineService.OFFLINE_ID_PREFIX} ${UuidUtilities.generate()}`;
        }
        const cachedRequest: CachedRequest<T> = {
            request: req,
            metadata: metadata
        };
        this.offlineService.cachedRequests = this.offlineService.cachedRequests.concat(cachedRequest);
        return next.handle(req);
    }

    private getRequestMetadata(request: HttpRequest<unknown>): RequestMetadataInternal {
        const metadata = request.context.get(NGX_PWA_HTTP_CONTEXT_METADATA);
        if (!metadata) {
            // eslint-disable-next-line no-console
            console.error('No metadata for the request', request.urlWithParams, ' was found.\nUsing fallback default values.');
        }
        const internalMetadata = new RequestMetadataInternal(request, metadata);
        return internalMetadata;
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
            || url.endsWith('/register')
            || url.endsWith('/refresh-token')
            || url.endsWith('/request-reset-password')
            || url.endsWith('/confirm-reset-password')
            || url.endsWith('/verify-password-reset-token');
    }
}