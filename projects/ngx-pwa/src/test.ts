/* eslint-disable jsdoc/require-jsdoc */
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import 'zone.js';
import 'zone.js/testing';

declare const require: {
    context: (path: string, deep?: boolean, filter?: RegExp) => {
        <T>(id: string): T,
        keys: () => string[]
    }
};

getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);

// eslint-disable-next-line @typescript-eslint/typedef
const context = require.context('./', true, /\.spec\.ts$/);
context.keys().forEach(context);