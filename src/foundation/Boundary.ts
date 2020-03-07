export class Boundary {
    constructor(
        public readonly left: number,
        public readonly top: number,
        public readonly right: number,
        public readonly bottom: number
    ) {}
    public getWidth() {
        return this.right - this.left;
    }
    public getHeight() {
        return this.bottom - this.top;
    }
    public expand(offset: number) {
        return new Boundary(this.left - offset, this.top - offset, this.right + offset, this.bottom + offset);
    }
}
