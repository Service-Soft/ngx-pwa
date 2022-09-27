import { cloneDeep, Many, omit } from 'lodash';

/**
 * Encapsulates functionality of lodash.
 */
export abstract class LodashUtilities {
    /**
     * The opposite of `_.pick`; this method creates an object composed of the
     * own and inherited enumerable properties of `object` that are not omitted.
     *
     * @param object - The source object.
     * @param paths - The property names to omit, specified
     * individually or in arrays.
     * @returns Returns the new object.
     */
    static omit<T extends object, K extends keyof T>(object: T | null | undefined, ...paths: Many<K>[]): Omit<T, K> {
        return omit(object, ...paths);
    }

    /**
     * This method is like _.clone except that it recursively clones value.
     *
     * @param value - The value to recursively clone.
     * @returns Returns the deep cloned value.
     */
    static cloneDeep<T>(value: T): T {
        return cloneDeep(value);
    }
}