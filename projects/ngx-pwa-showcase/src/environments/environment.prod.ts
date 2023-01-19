import { Environment } from './environment.model';

export const environment: Environment = {
    // this is correct, as the production environment is used locally to run the pwa.
    apiUrl: 'http://localhost:3000',
    production: true
};