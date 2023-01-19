/* eslint-disable jsdoc/require-jsdoc */
import { HttpRequest } from '@angular/common/http';
import { BaseEntityType } from '../services/offline.service';
import { HttpMethod } from './http-method.enum';
import { RequestMetadata } from './request-metadata.model';

/**
 * The internal request metadata.
 * Sets default values.
 */
export class RequestMetadataInternal implements RequestMetadata {
    idKey: keyof BaseEntityType<unknown>;
    type: string;
    displayValue: string;

    constructor(request: HttpRequest<unknown>, data?: RequestMetadata) {
        this.idKey = data?.idKey ?? 'id' as keyof BaseEntityType<unknown>;
        this.type = data?.type ?? '';
        this.displayValue = data?.displayValue ?? defaultCachedRequestMetadata(request);
    }
}

function defaultCachedRequestMetadata(req: HttpRequest<unknown>): string {
    const color: string = getColorForHttpMethod(req.method);
    return `<b style="color: ${color};">${req.method}</b> ${req.url}`;
}

function getColorForHttpMethod(method: string): string {
    switch (method) {
        case HttpMethod.POST:
            return 'green';
        case HttpMethod.PATCH:
            return 'black';
        case HttpMethod.DELETE:
            return 'red';
        default:
            return 'black';
    }
}