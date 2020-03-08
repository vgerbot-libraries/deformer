declare type Getter = (target, propertyKey) => any;
declare type Initializer<T, R> = (target: T) => R;
declare interface EquationSolution {
    k: number;
    b: number;
}
declare type DeformerHolderElement = HTMLElement | SVGElement;

declare module '*.ejs' {
    export default function compilerTemplate(options: any): string;
}
declare module '*.less';

type DevicePoint = import('../foundation/math/coordinate/DeviceCoordinate').DevicePoint;
type AnyPoint = import('../foundation/math/coordinate/Coordinate').AnyPoint;
type Vector = import('../foundation/math/vector').Vector;
type MouseOperationDirection = import('../event-input').MouseOperationDirection;

declare interface MousePosition {
    readonly client: DevicePoint;
    readonly page: DevicePoint;
    readonly screen: DevicePoint;
    readonly offset: DevicePoint;
}

declare interface EditorEvent {
    move: Vector;
    position: MousePosition;
    direction: MouseOperationDirection;
}
