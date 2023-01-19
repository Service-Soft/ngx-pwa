
/**
 * Defines what data needs to be stored inside the environment constants.
 */
export interface Environment {
    /**
     * Whether or not the system is currently in production.
     */
    production: boolean,
    /**
     * The url of the api.
     */
    apiUrl: string
}