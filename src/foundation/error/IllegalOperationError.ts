export default class IllegalOperationError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'IllegalOperationError';
    }
}
