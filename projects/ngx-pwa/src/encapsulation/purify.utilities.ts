import * as DOMPurify from 'dompurify';

/**
 * Contains HelperMethods around handling the purification of html strings.
 * Is less strict than angular's own sanitizer.
 */
export abstract class PurifyUtilities {

    /**
     * Sanitizes the given source string.
     *
     * @param source - The html value as a string.
     * @returns A sanitized string of the given source.
     */
    static sanitize(source: string): string {
        return DOMPurify.sanitize(source);
    }
}