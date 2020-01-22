export class MousePosition {
    public readonly clientX: number;
    public readonly clientY: number;
    public readonly pageX: number;
    public readonly pageY: number;
    public readonly screenX: number;
    public readonly screenY: number;
    public readonly offsetX: number;
    public readonly offsetY: number;

    constructor(e: MouseEvent | Touch, relativeTo: DeformerHolderElement = document.documentElement) {
        this.clientX = e.clientX;
        this.clientY = e.clientY;
        this.pageX = e.pageX;
        this.pageY = e.pageY;
        this.screenX = e.screenX;
        this.screenY = e.screenY;
        if (e instanceof MouseEvent && e.target === relativeTo) {
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;
        } else {
            const rect = relativeTo.getBoundingClientRect();
            this.offsetX = this.pageX - rect.left;
            this.offsetY = this.pageY - rect.top;
        }
    }
}
