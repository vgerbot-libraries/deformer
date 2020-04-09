export default class UnsupportedError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'UnsupportedError';
    }
}
