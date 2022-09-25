import { v4 } from 'uuid';
/**
 * Encapsulates functionality of uuid.
 */
export abstract class UuidUtilities {
    /**
     * Generates a uuid.
     *
     * @returns A random new uuid.
     */
    static generate(): string {
        return v4();
    }
}