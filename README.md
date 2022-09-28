# NgxPwa

Provides functionality around the progressive web app functionality in angular.
Most notably the an approach to cache POST, UPDATE and DELETE requests.

This library also includes:
- An interceptor that automatically caches POST, UPDATE and DELETE requests when the user is offline
- An offline status bar that also shows if some requests are cached offline
- A service that handles the cached requests and the syncing. It also provides functionality to work with data that you added offline
- A dialog in which the user can sync his locally cached requests
- A service that takes care of notifications
- A simple dialog to display when a new version of the pwa is available
- A little service that handles new updates

# Table of Contents
- [NgxPwa](#ngxpwa)
- [Table of Contents](#table-of-contents)
- [Requirements](#requirements)
- [NgxPwaOfflineService](#ngxpwaofflineservice)
  - [Usage](#usage)
    - [Define your OfflineService](#define-your-offlineservice)
    - [Override the injection token](#override-the-injection-token)
  - [Api](#api)
    - [NgxPwaOfflineService](#ngxpwaofflineservice-1)
    - [CachedRequest](#cachedrequest)
- [OfflineRequestInterceptor](#offlinerequestinterceptor)
  - [Usage](#usage-1)
  - [Api](#api-1)
    - [OfflineRequestInterceptor](#offlinerequestinterceptor-1)
    - [RequestMetadata](#requestmetadata)
- [NgxPwaOfflineStatusBarComponent](#ngxpwaofflinestatusbarcomponent)
  - [Usage](#usage-2)
  - [Api](#api-2)
- [NgxPwaSynchronizeBadgeComponent](#ngxpwasynchronizebadgecomponent)
  - [Usage](#usage-3)
  - [Api](#api-3)
- [NgxPwaSynchronizeDialogComponent](#ngxpwasynchronizedialogcomponent)
  - [Usage](#usage-4)
  - [Api](#api-4)
    - [NgxPwaSynchronizeDialogComponent](#ngxpwasynchronizedialogcomponent-1)
    - [SynchronizeDialogData](#synchronizedialogdata)
- [NgxPwaNotificationService](#ngxpwanotificationservice)
  - [Usage](#usage-5)
  - [Api](#api-5)
- [NgxPwaUpdateService](#ngxpwaupdateservice)
  - [Usage](#usage-6)
  - [Api](#api-6)
    - [NgxPwaUpdateService](#ngxpwaupdateservice-1)
    - [NgxPwaVersionReadyDialogComponent](#ngxpwaversionreadydialogcomponent)
    - [VersionReadyDialogData](#versionreadydialogdata)

# Requirements
This package relies on the [angular material library](https://material.angular.io/guide/getting-started) to render its components.
You also need to have the uuid, lodash and dompurify packages installed.

# NgxPwaOfflineService
The NgxPwaOfflineService handles most of the logic for handling cached request:
- It provides a method with which you can apply any local changes to a given data array
- It saves offline requests to localstorage and loads them again
- It provides you with the information if the user is currently offline
- It also handles syncing any local requests to the server

It is also used in most of the other parts of this library.

In order to use it you need to extend your own service from it and register it in your app.module.ts provider array.

## Usage
### Define your OfflineService
```typescript
import { NgxPwaOfflineService } from 'ngx-pwa';

@Injectable({providedIn: 'root'})
export class OfflineService extends NgxPwaOfflineService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly snackbar: MatSnackBar,
        private readonly ngZone: NgZone
    ) {
        super(httpClient, snackbar, ngZone);
    }
}
```
As you can see, basically everything is already configured with default values.

You can however also customize [all other parts of the NgxPwaOfflineService](#ngxpwaofflineservice).

### Override the injection token
Everything else is already dealt with, all parts of NgxPwa already use that service. Now you need to provide it to them by overriding the injection token. Add the following to your app.module.ts:

```typescript
import { NGX_PWA_OFFLINE_SERVICE } from 'ngx-pwa';
...
providers: [
    ...
    {
        provide: NGX_PWA_OFFLINE_SERVICE,
        useExisting: OfflineService
    }
    ...
]
...
```
That's it! Now you are ready to use all the parts NgxPwa has to offer:

## Api
### NgxPwaOfflineService
```typescript
/**
 * The base class for an offline service.
 */
export class NgxPwaOfflineService {
    /**
     * The key under which any requests are saved in local storage.
     */
    readonly CACHED_REQUESTS_KEY = 'requests';

    /**
     * The prefix of offline generated ids.
     * Is used to check if a request still has unresolved dependencies.
     */
    readonly OFFLINE_ID_PREFIX = 'offline';

    /**
     * A snackbar message to display when the synchronization of all cached requests has been finished.
     */
    protected readonly ALL_SYNC_FINISHED_SNACK_BAR_MESSAGE = 'Synchronization finished';

    /**
     * A snackbar message to display when the synchronization of all cached requests fails.
     */
    protected readonly ALL_SYNC_FAILED_SNACK_BAR_MESSAGE = 'Synchronization failed, please try again later';

    /**
     * A snackbar message to display when the synchronization of a single cached requests has been finished.
     */
    protected readonly SINGLE_SYNC_FINISHED_SNACK_BAR_MESSAGE = 'Synchronization finished';

    /**
     * A snackbar message to display when the synchronization of a single cached requests fails.
     */
    protected readonly SINGLE_SYNC_FAILED_SNACK_BAR_MESSAGE = 'Synchronization failed, please try again later';

    /**
     * Whether or not the user has no internet connection.
     */
    isOffline: boolean = false;

    /**
     * A subject of all the requests that have been done while offline.
     * Needs to be used for applying offline data or syncing the requests to the api.
     */
    private readonly cachedRequestsSubject: BehaviorSubject<CachedRequest<unknown>[]>;

    /**
     * The currently stored cached requests (if there are any).
     */
    get cachedRequests(): CachedRequest<unknown>[] {
        return this.cachedRequestsSubject.value;
    }
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

        const stringData = localStorage.getItem(this.CACHED_REQUESTS_KEY);
        const requestsData = stringData ? JSON.parse(stringData) as CachedRequest<unknown>[] : [];
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
        const cachedRequests = this.cachedRequests.filter(req => req.metadata.type === type);
        for (const req of cachedRequests) {
            switch (req.request.method) {
                case HttpMethod.POST:
                    res.push(req.request.body as EntityType);
                    break;
                case HttpMethod.PATCH:
                    const patchIdKey: keyof EntityType = req.metadata.idKey;
                    const index = res.findIndex(e => req.request.urlWithParams.includes(`${e[patchIdKey]}`));
                    res[index] = this.updateOffline(req.request.body as EntityType, res[index]);
                    break;
                case HttpMethod.DELETE:
                    const deleteIdKey: keyof EntityType = req.metadata.idKey;
                    res.splice(res.findIndex(e => req.request.urlWithParams.includes(`${e[deleteIdKey]}`)), 1);
                    break;
                default:
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
        const cachedRequestsPriorChanges = LodashUtilities.cloneDeep(this.cachedRequests);
        try {
            const res = await this.syncSingleRequest(request);
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
        const cachedRequestsPriorChanges = LodashUtilities.cloneDeep(this.cachedRequests);
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
        const request = this.cachedRequests.find(r => !this.hasUnresolvedDependency(r)) as CachedRequest<BaseEntityType<unknown>> | undefined;
        if (!request) {
            return;
        }
        const res = await this.syncSingleRequest(request);
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
        const requestObservable = this.request(request);
        if (!requestObservable) {
            throw new Error();
        }
        return await firstValueFrom(requestObservable);
    }

    private updateOfflineIdsInRequests<T>(request: CachedRequest<T>, res: T): void {
        if (this.cachedRequests.length && request.request.body != null) {
            const idKey = request.metadata.idKey;
            if (res[idKey] != null) {
                const requestsString = `${this.cachedRequests}`.split(request.request.body[idKey] as string).join(res[idKey] as string);
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
                return;
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
```
### CachedRequest
If you don't override it the default functionality of the NgxPwaOfflineService uses the [HttpContext](https://angular.io/api/common/http/HttpContext) to get the model type from a request.

That way it knows if e.g. a user POST request should be added to a users list when applyOfflineData is called.

How this exactly works and what you need to do on your requests is written in the [OfflineRequestInterceptor Section](#offlinerequestinterceptor).

```typescript
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
```

# OfflineRequestInterceptor
The OfflineRequestInterceptor automatically saves POST, PATCH and DELETE requests when the user is offline.

In case of an POST request it also generates an id with a prefix to distinguish it from a real id. This is needed to add another entity to an offline entity.

It also gets the requests metadata from the [HttpContext](https://angular.io/api/common/http/HttpContext).
## Usage
In your app.module.ts:

```typescript
import { OfflineRequestInterceptor } from 'ngx-pwa';
...
providers: [
    ...
    {
        provide: HTTP_INTERCEPTORS,
        useClass: OfflineRequestInterceptor,
        multi: true
    }
    ...
]
...
```
Unfortunately to apply any offline requests to your data, the type of the request body and some other metadata is required.

This can be given to the interceptor by using angulars [HttpContext](https://angular.io/api/common/http/HttpContext) whenever you do a request:

```typescript
import { HttpContext, HttpClient } from '@angular/common/http';
import { NGX_PWA_HTTP_CONTEXT_METADATA, RequestMetadata } from 'ngx-pwa';
...
constructor(private readonly http: HttpClient) {}

someMethod(): void {
    ...
    const metadata: RequestMetadata = {
        idKey: 'id', // optional, defaults to 'id'
        type: 'testDataType',
        displayValue: 'POST' + JSON.stringify(testData) // optional
    };
    const context: HttpContext = new HttpContext().set(NGX_PWA_HTTP_CONTEXT_METADATA, metadata);
    this.http.post('url/test', testData, { context: context });
    ...
}
...
```
## Api
### OfflineRequestInterceptor
```typescript
/**
 * An interceptor that caches any POST, UPDATE or DELETE requests when the user is offline.
 */
@Injectable()
export class OfflineRequestInterceptor<OfflineServiceType extends NgxPwaOfflineService> implements HttpInterceptor {

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        private readonly offlineService: OfflineServiceType,
    ) { }

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
```
### RequestMetadata
```typescript
/**
 * Model for providing information about a request.
 * Is needed for various things when the request is cached locally.
 */
export interface RequestMetadata {
    /**
     * The idKey of the request.
     *
     * @default 'id'
     */
    idKey?: keyof BaseEntityType<unknown>,
    /**
     * The type of the request body.
     * Is needed to apply offline request to local data.
     */
    type: string,
    /**
     * How to display the request inside the sync dialog.
     * Can use html.
     */
    displayValue?: string
}

export const NGX_PWA_HTTP_CONTEXT_METADATA = new HttpContextToken<RequestMetadata | undefined>(() => undefined);
```

# NgxPwaOfflineStatusBarComponent
## Usage
1. Import NgxPwaOfflineStatusBarModule
2. Use in your html:
```html
<!-- All configuration is optional -->
<ngx-pwa-offline-status-bar></ngx-pwa-offline-status-bar>
```
## Api
```typescript
/**
 * Shows a offline warning when the user is not online.
 */
@Component({
    selector: 'ngx-pwa-offline-status-bar',
    templateUrl: './offline-status-bar.component.html',
    styleUrls: ['./offline-status-bar.component.scss']
})
export class NgxPwaOfflineStatusBarComponent<OfflineServiceType extends NgxPwaOfflineService> implements OnInit {
    /**
     * The message to display when the user is offline.
     *
     * @default 'Offline'
     */
    @Input()
    offlineMessage!: string;

    /**
     * The message to display when the user has changes that aren't synced to the api.
     *
     * @default 'Unsaved Changes'
     */
    @Input()
    unsavedChangesMessage!: string;

    /**
     * Whether or not to display a badge that shows the amount of cached requests and can open a dialog to sync changes to the server.
     */
    @Input()
    displayUnsavedChangesSynchronizeBadge!: boolean;

    /**
     * Configuration data for the Synchronize Dialog.
     */
    @Input()
    synchronizeDialogData?: SynchronizeDialogData;

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        readonly offlineService: OfflineServiceType,
    ) { }

    ngOnInit(): void {
        this.offlineMessage = this.offlineMessage ?? 'Offline';
        this.unsavedChangesMessage = this.unsavedChangesMessage ?? 'Unsaved Changes';
        this.displayUnsavedChangesSynchronizeBadge = this.displayUnsavedChangesSynchronizeBadge ?? true;
    }
}
```

# NgxPwaSynchronizeBadgeComponent
## Usage
1. Import NgxPwaSynchronizeBadgeModule
2. Use in your html:
```html
<!-- All configuration is optional -->
<ngx-pwa-synchronize-badge></ngx-pwa-synchronize-badge>
```
## Api
```typescript
/**
 * Displays a badge with the amount of cached offline request.
 * Can be clicked to open a dialog to sync cached requests to the server.
 */
@Component({
    selector: 'ngx-pwa-synchronize-badge',
    templateUrl: './synchronize-badge.component.html',
    styleUrls: ['./synchronize-badge.component.scss']
})
export class NgxPwaSynchronizeBadgeComponent<OfflineServiceType extends NgxPwaOfflineService> {

    /**
     * Configuration data for the Synchronize Dialog.
     */
    @Input()
    synchronizeDialogData?: SynchronizeDialogData;

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        readonly offlineService: OfflineServiceType,
        private readonly dialog: MatDialog
    ) { }

    /**
     * Opens the dialog for syncing cached requests to the server.
     */
    openSyncDialog(): void {
        this.dialog.open(
            SynchronizeDialogComponent,
            {
                autoFocus: false,
                restoreFocus: false,
                minWidth: '40%',
                data: this.synchronizeDialogData
            }
        );
    }
}
```

# NgxPwaSynchronizeDialogComponent
## Usage
1. Open a mat dialog with this component:
```typescript
this.dialog.open(NgxPwaSynchronizeDialogComponent);
```
## Api
### NgxPwaSynchronizeDialogComponent
```typescript
/**
 * The dialog for syncing cached requests to the server.
 */
@Component({
    selector: 'ngx-pwa-synchronize-dialog',
    templateUrl: './synchronize-dialog.component.html',
    styleUrls: ['./synchronize-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDividerModule,
        MatDialogModule
    ]
})
export class NgxPwaSynchronizeDialogComponent<OfflineServiceType extends NgxPwaOfflineService> implements OnInit {

    PurifyUtilities = PurifyUtilities;

    /**
     * The provided dialog data filled up with default values.
     */
    dialogData!: SynchronizeDialogDataInternal;

    constructor(
        @Inject(NGX_PWA_OFFLINE_SERVICE)
        readonly offlineService: OfflineServiceType,
        readonly sanitizer: DomSanitizer,
        private readonly dialogRef: MatDialogRef<NgxPwaSynchronizeDialogComponent<OfflineServiceType>>,
        @Inject(MAT_DIALOG_DATA)
        readonly data: SynchronizeDialogData
    ) { }

    ngOnInit(): void {
        this.dialogData = new SynchronizeDialogDataInternal(this.data);
    }

    /**
     * Sends a specific cached request to the server.
     *
     * @param request - The request that should be synced.
     */
    async syncSingleRequest(request: CachedRequest<unknown>): Promise<void> {
        await this.offlineService.sync(request);
        if (!this.offlineService.cachedRequests.length) {
            this.dialogRef.close();
        }
    }

    /**
     * Removes a single request from the cache.
     *
     * @param request - The request that should be removed.
     */
    removeSingleRequest(request: CachedRequest<unknown>): void {
        this.offlineService.removeSingleRequest(request);
        if (!this.offlineService.cachedRequests.length) {
            this.dialogRef.close();
        }
    }

    /**
     * Sends all cached requests to the server. Tries to handle dependencies of requests on each other.
     */
    async syncAll(): Promise<void> {
        await this.offlineService.syncAll();
        if (!this.offlineService.cachedRequests.length) {
            this.dialogRef.close();
        }
    }

    /**
     * Removes all locally cached requests.
     */
    undoAll(): void {
        this.offlineService.cachedRequests = [];
        this.dialogRef.close();
    }

    /**
     * Closes the dialog.
     */
    close(): void {
        this.dialogRef.close();
    }
}
```
### SynchronizeDialogData
```typescript
/**
 * The type for the synchronize dialog data.
 */
export interface SynchronizeDialogData {
    /**
     * The title of the dialog.
     */
    title?: string,
    /**
     * The label for the close button.
     */
    closeButtonLabel?: string,
    /**
     * The label for the button that syncs everything.
     */
    syncAllButtonLabel?: string,
    /**
     * The label for the button that undoes all local changes.
     */
    undoAllButtonLabel?: string
}
```

# NgxPwaNotificationService
Provides functionality around using native push notifications.

## Usage
You need to extend your own notification service:
```typescript
...
import { NgxPwaNotificationService } from 'ngx-pwa';
...
@Injectable({providedIn: 'root'})
export class NotificationService extends NgxPwaNotificationService {

    readonly API_ENABLE_NOTIFICATIONS_URL: string = 'url';

    readonly API_DISABLE_NOTIFICATIONS_URL: string = 'url;

    readonly VAPID_PUBLIC_KEY: string = 'my public key';

    constructor(private readonly push: SwPush, private readonly httpClient: HttpClient) {
        super(push, httpClient);
    }
}
```
You can generate the vapid keys by running `web-push generate-vapid-keys --json` from the [web-push npm package](https://www.npmjs.com/package/web-push).

Now you can call its `askForNotificationPermission` method which will prompt for the users permission and send a PushSubscription to the provided url.

## Api
```typescript
/**
 * A base service that provides functionality regarding notifications.
 */
export abstract class NgxPwaNotificationService {
    /**
     * The url to send a new push subscription to.
     */
    abstract readonly API_ENABLE_NOTIFICATIONS_URL: string;

    /**
     * The url to send a request to when wanting to disable notifications.
     */
    abstract readonly API_DISABLE_NOTIFICATIONS_URL: string;

    /**
     * The public key of your VAPID key pair.
     * Is needed to receive and display push notifications.
     */
    abstract readonly VAPID_PUBLIC_KEY: string;

    /**
     * Whether or not the current user has notifications enabled.
     */
    get hasNotificationsEnabled(): boolean {
        return this.swPush.isEnabled;
    }

    constructor(private readonly swPush: SwPush, private readonly http: HttpClient) {}

    /**
     * Asks the user for permission to use push notifications.
     */
    async askForNotificationPermission(): Promise<void> {
        const pushSubscription = await this.swPush.requestSubscription({ serverPublicKey: this.VAPID_PUBLIC_KEY });
        void this.enableNotifications(pushSubscription);
    }

    /**
     * Enables notifications by sending a push subscription to the server.
     *
     * @param pushSubscription - The push subscription to send to the server.
     */
    protected async enableNotifications(pushSubscription: PushSubscription): Promise<void> {
        await firstValueFrom(this.http.post(this.API_ENABLE_NOTIFICATIONS_URL, pushSubscription));
    }

    /**
     * Disables notifications.
     */
    async disableNotifications(): Promise<void> {
        const pushSubscription = await firstValueFrom(this.swPush.subscription);
        if (!pushSubscription) {
            return;
        }
        await firstValueFrom(this.http.post(this.API_DISABLE_NOTIFICATIONS_URL, pushSubscription));
        await this.swPush.unsubscribe();
    }
}
```

# NgxPwaUpdateService
A simple Wrapper for SwUpdate that takes care of version updates events of your pwa.

Displays a [NgxPwaVersionReadyDialogComponent](#ngxpwaversionreadydialogcomponent) when a new version of the pwa was downloaded by default and ignores any other events.

## Usage
You need to extend your own update service:
```typescript
...
import { NgxPwaUpdateService } from 'ngx-pwa';
...

@Injectable({ providedIn: 'root' })
export class UpdateService extends NgxPwaUpdateService {
    constructor(
        private readonly update: SwUpdate,
        private readonly matDialog: MatDialog
    ) {
        super(update, matDialog);
    }
}
```

Then you need to call the `subscribeToUpdateEvents` method e.g. in your app.component.ts:
```typescript
...
constructor(private readonly updateService: UpdateService) {}

ngOnInit(): void {
    this.updateService.subscribeToUpdateEvents();
}
...
```

## Api
### NgxPwaUpdateService
```typescript
/**
 * Provides helpers for handling pwa version updates.
 */
export class NgxPwaUpdateService {

    constructor(private readonly swUpdate: SwUpdate, private readonly dialog: MatDialog) { }

    /**
     * Subscribes to any version update events.
     */
    subscribeToUpdateEvents(): void {
        if (!this.swUpdate.isEnabled) {
            return;
        }
        this.swUpdate.versionUpdates.subscribe(e => {
            switch (e.type) {
                case 'VERSION_READY':
                    void this.onVersionReady();
                    break;
                case 'VERSION_DETECTED':
                    this.onVersionDetected();
                    break;
                case 'VERSION_INSTALLATION_FAILED':
                    this.onVersionInstallationFailed();
                    break;
                case 'NO_NEW_VERSION_DETECTED':
                    this.onNoNewVersionDetected();
                    break;
            }
        });
    }

    /**
     * Gets called when no new version was found.
     */
    protected onNoNewVersionDetected(): void {
        return;
    }

    /**
     * Gets called when the installation of a new version fails.
     */
    protected onVersionInstallationFailed(): void {
        return;
    }

    /**
     * Gets called when a new version has been found.
     */
    protected onVersionDetected(): void {
        return;
    }

    /**
     * Gets called when a new version has been installed.
     */
    protected async onVersionReady(): Promise<void> {
        const dialogRef = this.dialog.open(NgxPwaVersionReadyDialogComponent, { autoFocus: false, restoreFocus: false });
        const res = await firstValueFrom(dialogRef.afterClosed()) as 'update' | 'cancel';
        if (res === 'update') {
            window.location.reload();
        }
    }

    /**
     * Manually checks for updates.
     *
     * @returns Whether or not new updates are available.
     */
    async checkForUpdates(): Promise<boolean> {
        return await this.swUpdate.checkForUpdate();
    }
}
```
### NgxPwaVersionReadyDialogComponent
```typescript
/**
 * A dialog that gets displayed when a new version of the pwa has been downloaded and is ready for install.
 */
@Component({
    selector: 'ngx-pwa-version-ready-dialog',
    templateUrl: './version-ready-dialog.component.html',
    styleUrls: ['./version-ready-dialog.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule
    ]
})
export class NgxPwaVersionReadyDialogComponent implements OnInit {

    /**
     * The data to customize the Version Ready Dialog.
     * Is built from the MAT_DIALOG_DATA input.
     */
    versionReadyDialogData!: VersionReadyDialogDataInternal;

    constructor(
        private readonly dialogRef: MatDialogRef<NgxPwaVersionReadyDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        readonly data?: VersionReadyDialogData,
    ) { }

    ngOnInit(): void {
        this.versionReadyDialogData = new VersionReadyDialogDataInternal(this.data);
    }

    /**
     * Closes the dialog with data to trigger a reload of the app.
     */
    update(): void {
        this.dialogRef.close('update');
    }

    /**
     * Closes the dialog with data to not trigger anything.
     */
    cancel(): void {
        this.dialogRef.close('cancel');
    }
}
```
### VersionReadyDialogData
```typescript
/**
 * The data to customize the Version Ready Dialog.
 */
export interface VersionReadyDialogData {
    /**
     * The title of the dialog.
     *
     * @default 'New Version downloaded'
     */
    title?: string,
    /**
     * The message to display inside the dialog content.
     *
     * @default 'A new version has been downloaded. Do you want to install it now?'
     */
    message?: string,
    /**
     * The label for the button that updates the pwa.
     *
     * @default 'Reload'
     */
    confirmButtonLabel?: string,
    /**
     * The label for the button that closes the dialog without updating the pwa.
     *
     * @default 'Not now'
     */
    cancelButtonLabel?: string
}
```