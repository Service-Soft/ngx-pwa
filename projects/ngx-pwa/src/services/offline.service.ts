import { HttpClient, HttpRequest } from '@angular/common/http';
import { InjectionToken, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { LodashUtilities } from '../encapsulation/lodash.utilities';
import { HttpMethod } from '../models/http-method.enum';
import { RequestMetadataInternal } from '../models/request-metadata-internal.model';

/**
 * The Generic Base EntityType.
 */
export type BaseEntityType<T> = { [K in keyof T]: unknown };

// eslint-disable-next-line @typescript-eslint/typedef
export const NGX_PWA_OFFLINE_SERVICE = new InjectionToken(
    'Provider for the OfflineService used eg. in the offline request interceptor.',
    {
        providedIn: 'root',
        factory: () => {
        // eslint-disable-next-line no-console
            console.error(
            // eslint-disable-next-line max-len
                'No OfflineService has been provided for the token NGX_OFFLINE_SERVICE\nAdd this to your app.module.ts provider array:\n{\n    provide: NGX_PWA_OFFLINE_SERVICE,\n    useExisting: MyOfflineService\n}'
            );
        }
    }
);

/**
 * The type of a cached offline request.
 * Contains the http request as well as some metadata.
 */
export interface CachedRequest<T> {
    /**
     * The actual http request.
     */
    request: HttpRequest<T>,
    /**
     * The metadata for that request.
     */
    metadata: RequestMetadataInternal
}

/**
 * The base class for an offline service.
 */
export class NgxPwaOfflineService {
    /**
     * The key under which any requests are saved in local storage.
     */
    readonly CACHED_REQUESTS_KEY: string = 'requests';

    /**
     * The prefix of offline generated ids.
     * Is used to check if a request still has unresolved dependencies.
     */
    readonly OFFLINE_ID_PREFIX: string = 'offline';

    /**
     * A snackbar message to display when the synchronization of all cached requests has been finished.
     */
    protected readonly ALL_SYNC_FINISHED_SNACK_BAR_MESSAGE: string = 'Synchronization finished';

    /**
     * A snackbar message to display when the synchronization of all cached requests fails.
     */
    protected readonly ALL_SYNC_FAILED_SNACK_BAR_MESSAGE: string = 'Synchronization failed, please try again later';

    /**
     * A snackbar message to display when the synchronization of a single cached requests has been finished.
     */
    protected readonly SINGLE_SYNC_FINISHED_SNACK_BAR_MESSAGE: string = 'Synchronization finished';

    /**
     * A snackbar message to display when the synchronization of a single cached requests fails.
     */
    protected readonly SINGLE_SYNC_FAILED_SNACK_BAR_MESSAGE: string = 'Synchronization failed, please try again later';

    /**
     * Whether or not the user has no internet connection.
     */
    isOffline: boolean = false;

    /**
     * A subject of all the requests that have been done while offline.
     * Needs to be used for applying offline data or syncing the requests to the api.
     */
    private readonly cachedRequestsSubject: BehaviorSubject<CachedRequest<unknown>[]>;

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The currently stored cached requests (if there are any).
     */
    get cachedRequests(): CachedRequest<unknown>[] {
        return this.cachedRequestsSubject.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set cachedRequests(cachedRequests: CachedRequest<unknown>[]) {
        localStorage.setItem(this.CACHED_REQUESTS_KEY, JSON.stringify(cachedRequests));
        this.cachedRequestsSubject.next(cachedRequests);
    }

    constructor(
        private readonly http: HttpClient,
        private readonly snackBar: MatSnackBar,
        private readonly zone: NgZone
    ) {
        this.isOffline = !navigator.onLine;
        window.ononline = () => this.isOffline = !navigator.onLine;
        window.onoffline = () => this.isOffline = !navigator.onLine;

        const stringData: string | null = localStorage.getItem(this.CACHED_REQUESTS_KEY);
        const requestsData: CachedRequest<unknown>[] = stringData ? JSON.parse(stringData) as CachedRequest<unknown>[] : [];
        this.cachedRequestsSubject = new BehaviorSubject(requestsData);
    }

    /**
     * Applies any offline data that has been cached to the given values.
     *
     * @param type - The type of the provided entities. Is needed to check if any cached requests of the same type exist.
     * @param entities - The already existing data.
     * @returns The already existing entities extended/modified by the offline cached requests.
     */
    applyOfflineData<EntityType extends BaseEntityType<EntityType>>(
        type: string,
        entities: EntityType[]
    ): EntityType[] {
        if (!this.cachedRequests.length) {
            return entities;
        }
        const res: EntityType[] = Array.from(entities);
        const cachedRequests: CachedRequest<unknown>[] = this.cachedRequests.filter(req => req.metadata.type === type);
        for (const req of cachedRequests) {
            switch (req.request.method) {
                case HttpMethod.POST:
                    res.push(req.request.body as EntityType);
                    break;
                case HttpMethod.PATCH:
                    const patchIdKey: keyof EntityType = req.metadata.idKey;
                    const index: number = res.findIndex(e => req.request.urlWithParams.includes(`${e[patchIdKey]}`));
                    res[index] = this.updateOffline(req.request.body as EntityType, res[index]);
                    break;
                case HttpMethod.DELETE:
                    const deleteIdKey: keyof EntityType = req.metadata.idKey;
                    res.splice(res.findIndex(e => req.request.urlWithParams.includes(`${e[deleteIdKey]}`)), 1);
                    break;
                default:
                    // eslint-disable-next-line no-console
                    console.error('There was an unknown http-method in one of your cached offline requests:', req.request.method);
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
     * Sends a specific cached request to the server.
     *
     * @param request - The request that should be synced.
     */
    async sync<T>(request: CachedRequest<T>): Promise<void> {
        const cachedRequestsPriorChanges: CachedRequest<unknown>[] = LodashUtilities.cloneDeep(this.cachedRequests);
        try {
            const res: Awaited<T> = await this.syncSingleRequest(request);
            this.zone.run(() => {
                this.snackBar.open(this.SINGLE_SYNC_FINISHED_SNACK_BAR_MESSAGE, undefined, { duration: 2500 });
            });
            this.removeSingleRequest(request);
            this.updateOfflineIdsInRequests(request, res);
        }
        catch (error) {
            this.zone.run(() => {
                this.snackBar.open(this.SINGLE_SYNC_FAILED_SNACK_BAR_MESSAGE, undefined, { duration: 2500 });
            });
            this.cachedRequests = cachedRequestsPriorChanges;
        }
    }

    /**
     * Sends all cached requests to the server. Tries to handle dependencies of requests on each other.
     */
    async syncAll(): Promise<void> {
        const cachedRequestsPriorChanges: CachedRequest<unknown>[] = LodashUtilities.cloneDeep(this.cachedRequests);
        try {
            await this.syncAllRecursive();
            this.zone.run(() => {
                this.snackBar.open(this.ALL_SYNC_FINISHED_SNACK_BAR_MESSAGE, undefined, { duration: 2500 });
            });
            this.cachedRequests = [];
        }
        catch (error) {
            this.zone.run(() => {
                this.snackBar.open(this.ALL_SYNC_FAILED_SNACK_BAR_MESSAGE, undefined, { duration: 2500 });
            });
            this.cachedRequests = cachedRequestsPriorChanges;
        }
    }

    /**
     * The recursive method used to syn all requests to the api.
     */
    protected async syncAllRecursive(): Promise<void> {
        // eslint-disable-next-line max-len
        const request: CachedRequest<BaseEntityType<unknown>> | undefined = this.cachedRequests.find(r => !this.hasUnresolvedDependency(r)) as CachedRequest<BaseEntityType<unknown>> | undefined;
        if (!request) {
            return;
        }
        const res: BaseEntityType<unknown> = await this.syncSingleRequest(request);
        this.updateOfflineIdsInRequests(request, res);
        await this.syncAllRecursive();
    }

    /**
     * Sends a single cached request to the server.
     *
     * @param request - The request that should be synced.
     * @returns A promise of the request result.
     */
    protected async syncSingleRequest<T>(
        request: CachedRequest<T>
    ): Promise<T> {
        if (this.isOffline || this.hasUnresolvedDependency(request)) {
            throw new Error();
        }
        const requestObservable: Observable<T> | undefined = this.request(request);
        if (!requestObservable) {
            throw new Error();
        }
        return await firstValueFrom(requestObservable);
    }

    private updateOfflineIdsInRequests<T>(request: CachedRequest<T>, res: T): void {
        if (this.cachedRequests.length && request.request.body != null) {
            const idKey: keyof BaseEntityType<unknown> = request.metadata.idKey;
            if (res[idKey] != null) {
                // eslint-disable-next-line max-len
                const requestsString: string = `${this.cachedRequests}`.split(request.request.body[idKey] as string).join(res[idKey] as string);
                this.cachedRequests = JSON.parse(requestsString) as CachedRequest<T>[];
            }
        }
    }

    /**
     * Calls http.post/patch/delete etc. On the provided request.
     *
     * @param request - The request that should be sent.
     * @returns The observable of the request or undefined if something went wrong.
     */
    protected request<EntityType extends BaseEntityType<EntityType>>(
        request: CachedRequest<EntityType>
    ): Observable<EntityType> | undefined {
        switch (request.request.method) {
            case HttpMethod.POST:
                return this.http.post<EntityType>(
                    request.request.urlWithParams,
                    LodashUtilities.omit(request.request.body, request.metadata.idKey)
                );
            case HttpMethod.PATCH:
                return this.http.patch<EntityType>(request.request.urlWithParams, request.request.body);
            case HttpMethod.DELETE:
                return this.http.delete<EntityType>(request.request.urlWithParams);
            default:
                return undefined;
        }
    }

    /**
     * Checks if the given request has an unresolved dependency by looking for the keyword 'offline' inside of it.
     *
     * @param request - The request that should be checked.
     * @returns Whether or no the given request has an unresolved dependency.
     */
    hasUnresolvedDependency(request: CachedRequest<unknown>): boolean {
        return request.request.urlWithParams.includes(this.OFFLINE_ID_PREFIX)
            || `${request.request.body}`.includes(this.OFFLINE_ID_PREFIX);
    }

    /**
     * Removes a single request from the cache.
     *
     * @param request - The request that should be removed.
     */
    removeSingleRequest(request: CachedRequest<unknown>): void {
        this.cachedRequests.splice(this.cachedRequests.indexOf(request), 1);
        this.cachedRequests = this.cachedRequests;
    }
}