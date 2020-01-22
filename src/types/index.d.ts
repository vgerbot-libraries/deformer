declare type Getter = (target, propertyKey) => any;
declare type Initializer<T, R> = (target: T) => R;
declare interface EquationSolution {
    k: number;
    b: number;
}
declare type DeformerHolderElement = HTMLElement | SVGElement;
