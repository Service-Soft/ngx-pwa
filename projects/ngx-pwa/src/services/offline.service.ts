import { HttpClient, HttpRequest } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { LodashUtilities } from '../encapsulation/lodash.utilities';
import { HttpMethod } from '../models/http-method.enum';

/**
 * The Generic Base EntityType.
 */
export type BaseEntityType<T> = { [K in keyof T]: unknown };

export const NGX_OFFLINE_SERVICE = new InjectionToken('Provider for the OfflineService used eg. in the offline request interceptor.', {
    providedIn: 'root',
    factory: () => {
        // eslint-disable-next-line no-console
        console.error(
            // eslint-disable-next-line max-len
            'No OfflineService has been provided for the token NGX_OFFLINE_SERVICE\nAdd this to your app.module.ts provider array:\n{\n    provide: NGX_OFFLINE_SERVICE,\n    useExisting: MyOfflineService\n}',
        );
    },
});

/**
 * The base class for an offline service.
 */
export abstract class BaseOfflineService {
    private readonly CACHED_REQUESTS_KEY = 'requests';

    /**
     * Whether or not the user has no internet connection.
     */
    isOffline: boolean = false;

    /**
     * A subject of all the requests that have been done while offline.
     * Needs to be used for applying offline data or syncing the requests to the api.
     */
    private readonly cachedRequestsSubject: BehaviorSubject<HttpRequest<unknown>[]>;

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The currently stored cached requests (if there are any).
     */
    get cachedRequests(): HttpRequest<unknown>[] {
        return this.cachedRequestsSubject.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set cachedRequests(cachedRequests: HttpRequest<unknown>[]) {
        localStorage.setItem(this.CACHED_REQUESTS_KEY, JSON.stringify(cachedRequests));
        this.cachedRequestsSubject.next(cachedRequests);
    }

    constructor(private readonly http: HttpClient) {
        this.isOffline = !navigator.onLine;
        window.ononline = () => this.isOffline = !navigator.onLine;
        window.onoffline = () => this.isOffline = !navigator.onLine;

        const stringData = localStorage.getItem(this.CACHED_REQUESTS_KEY);
        const requestsData = stringData ? JSON.parse(stringData) as HttpRequest<unknown>[] : [];
        this.cachedRequestsSubject = new BehaviorSubject(requestsData);
    }

    /**
     * Gets the type of the provided request.
     *
     * @param request - The http request to get the type from.
     */
    protected abstract getTypeFromRequest<Type>(request: HttpRequest<unknown>): Type;

    /**
     * Gets the id key of the provided request.
     *
     * @param request - The http request to get the idKey from.
     * @returns The idKey of the given request. Defaults to 'id'.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getIdKeyFromRequest<EntityType extends BaseEntityType<EntityType>>(request: HttpRequest<EntityType>): keyof EntityType {
        return 'id' as keyof EntityType;
    }

    /**
     * Applies any offline data that has been cached to the given values.
     *
     * @param type - The type of the provided entities. Is needed to check if any cached requests of the same type exist.
     * @param entities - The already existing data.
     * @returns The already existing entities extended/modified by the offline cached requests.
     */
    applyOfflineData<EntityType extends BaseEntityType<EntityType>, Type>(
        type: Type,
        entities: EntityType[]
    ): EntityType[] {
        if (!this.cachedRequests.length) {
            return entities;
        }
        const res: EntityType[] = Array.from(entities);
        const cachedRequests = this.cachedRequests.filter(req => this.getTypeFromRequest<Type>(req) === type) as HttpRequest<EntityType>[];
        for (const req of cachedRequests) {
            switch (req.method) {
                case HttpMethod.POST:
                    res.push(req.body as EntityType);
                    break;
                case HttpMethod.PATCH:
                    const patchIdKey = this.getIdKeyFromRequest(req);
                    const index = res.findIndex(e => req.urlWithParams.includes(`${e[patchIdKey]}`));
                    res[index] = this.updateOffline(req.body as EntityType, res[index]);
                    break;
                case HttpMethod.DELETE:
                    const deleteIdKey = this.getIdKeyFromRequest(req);
                    res.splice(res.findIndex(e => req.urlWithParams.includes(`${e[deleteIdKey]}`)), 1);
                    break;
                default:
                    // eslint-disable-next-line no-console
                    console.error('There was an unknown http-method in one of your cached offline requests:', req.method);
                    break;
            }
        }
        return res;
    }

    /**
     * Applies an UPDATE to an entity without sending a request to the server.
     *
     * @param changes - The changes that should be made to the entity.
     * @param entity - The entity that should be updated.
     * @returns The updated entity.
     */
    protected updateOffline<EntityType extends BaseEntityType<EntityType>>(
        changes: Partial<EntityType>,
        entity: EntityType
    ): EntityType {
        for (const key in changes) {
            entity[key] = changes[key] as EntityType[Extract<keyof EntityType, string>];
        }
        return entity;
    }

    /**
     * Sends all cached requests to the server. Tries to handle dependencies of requests on each other.
     */
    async syncAll(): Promise<void> {
        const request = this.cachedRequests.find(r => !this.hasUnresolvedDependency(r));
        if (!request) {
            return;
        }
        await this.syncSingleRequest(request as HttpRequest<BaseEntityType<unknown>>);
        await this.syncAll();
    }

    /**
     * Sends a single cached request to the server.
     *
     * @param request - The request that should be synced.
     */
    async syncSingleRequest<EntityType extends BaseEntityType<EntityType>>(request: HttpRequest<EntityType>): Promise<void> {
        if (this.isOffline || this.hasUnresolvedDependency(request)) {
            return;
        }
        this.removeSingleRequest(request);
        const requestObservable = this.request(request);
        if (!requestObservable) {
            return;
        }
        await firstValueFrom(requestObservable)
            .then(res => {
                // TODO
                // this.snackBarService.open('Synchronization finished');
                if (!this.cachedRequests.length || !request.body) {
                    return;
                }
                const idKey = this.getIdKeyFromRequest(request);
                if (res[idKey] != null) {
                    const requestsString = `${this.cachedRequests}`
                        .split(request.body[idKey] as string)
                        .join(res[idKey] as string);
                    this.cachedRequests = JSON.parse(requestsString) as HttpRequest<unknown>[];
                }
            })
            .catch(() => {
                // TODO
                // this.dialog.open(InfoDialogComponent, {
                //     data: 'Synchronization failed, please try again later'
                // });
                if (!this.cachedRequests.includes(request)) {
                    this.cachedRequests.push(request);
                }
                return;
            });
    }

    private request<EntityType extends BaseEntityType<EntityType>>(request: HttpRequest<EntityType>): Observable<EntityType> | undefined {
        switch (request.method) {
            case HttpMethod.POST:
                const idKey = this.getIdKeyFromRequest(request);
                return this.http.post<EntityType>(request.urlWithParams, LodashUtilities.omit(request.body, idKey));
            case HttpMethod.PATCH:
                return this.http.patch<EntityType>(request.urlWithParams, request.body);
            case HttpMethod.DELETE:
                return this.http.delete<EntityType>(request.urlWithParams);
            default:
                return;
        }
    }

    /**
     * Checks if the given request has an unresolved dependency by looking for the keyword 'offline' inside of it.
     *
     * @param request - The request that should be checked.
     * @returns Whether or no the given request has an unresolved dependency.
     */
    protected hasUnresolvedDependency(request: HttpRequest<unknown>): boolean {
        return request.urlWithParams.includes('offline')
            || `${request.body}`.includes('offline');
    }

    /**
     * Removes a single request from the cache.
     *
     * @param request - The request that should be removed.
     */
    removeSingleRequest(request: HttpRequest<unknown>): void {
        this.cachedRequests.splice(this.cachedRequests.indexOf(request), 1);
    }
}