import { HttpContextToken } from '@angular/common/http';
import { BaseEntityType } from '../services/offline.service';

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

// eslint-disable-next-line max-len
export const NGX_PWA_HTTP_CONTEXT_METADATA: HttpContextToken<RequestMetadata | undefined> = new HttpContextToken<RequestMetadata | undefined>(() => undefined);