export function mousePositionFromHammerInput(e: HammerInput): MousePosition {
    const native = e.srcEvent;
    if (native instanceof TouchEvent) {
        return mousePositionFromMouseEvent(native.touches[0], e.target);
    } else {
        return mousePositionFromMouseEvent(native, e.target);
    }
}
export function mousePositionFromMouseEvent(
    e: MouseEvent | Touch | PointerEvent,
    relativeTo: DeformerHolderElement = document.documentElement
) {
    let offsetX: number;
    let offsetY: number;
    if (e instanceof MouseEvent && e.target === relativeTo) {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    } else {
        const rect = relativeTo.getBoundingClientRect();
        offsetX = e.pageX - rect.left;
        offsetY = e.pageY - rect.top;
    }
    return {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenX: e.screenX,
        screenY: e.screenY,
        offsetX,
        offsetY
    };
}

export interface MousePosition {
    readonly clientX: number;
    readonly clientY: number;
    readonly pageX: number;
    readonly pageY: number;
    readonly screenX: number;
    readonly screenY: number;
    readonly offsetX: number;
    readonly offsetY: number;
}
export interface PanMoveOffset {
    moveX: number;
    moveY: number;
    totalMoveX: number;
    totalMoveY: number;
    mousePosition: MousePosition;
}
