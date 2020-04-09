export default class IndexOutOfBoundsError extends Error {
    constructor(index: number, length: number) {
        super(`length: ${length}, index: ${index}`);
        this.name = 'IndexOutOfBoundsError';
    }
}
