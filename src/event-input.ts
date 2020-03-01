import { DeviceCoordinate } from './foundation/math/coordinate/DeviceCoordinate';

export enum MouseOperationDirection {
    LEFT = Hammer.DIRECTION_LEFT,
    RIGHT = Hammer.DIRECTION_RIGHT,
    HORIZONTAL = Hammer.DIRECTION_HORIZONTAL,
    VERTICAL = Hammer.DIRECTION_VERTICAL,
    UP = Hammer.DIRECTION_UP,
    DOWN = Hammer.DIRECTION_DOWN
}
export function mousePositionFromHammerInput(e: HammerInput): MousePosition {
    const native = e.srcEvent;
    if (native instanceof TouchEvent) {
        return mousePositionFromMouseEvent(native.touches[0]);
    } else {
        return mousePositionFromMouseEvent(native);
    }
}
export function mousePositionFromMouseEvent(e: MouseEvent | Touch | PointerEvent) {
    const rect = (e.target as Element).getBoundingClientRect();
    const offsetX = e.pageX - rect.left;
    const offsetY = e.pageY - rect.top;
    return {
        client: DeviceCoordinate.ORIGIN.point(e.clientX, e.clientY),
        page: DeviceCoordinate.ORIGIN.point(e.pageX, e.pageY),
        screen: DeviceCoordinate.ORIGIN.point(e.screenX, e.screenY),
        offset: DeviceCoordinate.ORIGIN.point(offsetX, offsetY)
    };
}
