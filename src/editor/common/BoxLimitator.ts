import { Contour } from '../../foundation/Contour';
import ContourController from '../ContourController';
import { DeformerLimitator } from '../DeformerLimitator';
import MoveController from './MoveController';
import { Vector } from '../../foundation/math/vector';
import { Lazy } from '../../foundation/lazy';

export interface BoxLimiatorOptions {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export default abstract class BoxLimitator extends DeformerLimitator<Contour> {
    public static createDynamicBoxByDOM(dom: Element): BoxLimitator {
        return new DynamicDOMBoxLimitator(dom);
    }
    public static createStaticBox(options: Partial<BoxLimiatorOptions>): BoxLimitator {
        return new StaticBoxLimitator(options);
    }
    protected constructor() {
        super();
    }
    public presetBox(): void {
        //
    }
    public abstract getLeft(): number;
    public abstract getTop(): number;
    public abstract getRight(): number;
    public abstract getBottom(): number;
    public handleIt(controller: ContourController<Contour>): boolean {
        return controller instanceof MoveController || controller.supportLimitator(this);
    }
    public accept(contour: Contour): boolean {
        const boundary = contour.getDeviceBoundary();
        this.presetBox();
        return (
            boundary.left >= this.getLeft() &&
            boundary.top >= this.getTop() &&
            boundary.right <= this.getRight() &&
            boundary.bottom <= this.getBottom()
        );
    }
    public adjust(contour: Contour, event: EditorEvent, controller: ContourController<Contour>): boolean {
        if (controller instanceof MoveController) {
            const boundary = contour.getDeviceBoundary();
            let offsetX = 0;
            let offsetY = 0;
            const left = this.getLeft();
            const right = this.getRight();
            const top = this.getTop();
            const bottom = this.getBottom();
            if (event.move.x > 0 && boundary.right > right) {
                offsetX = right - boundary.right;
            } else if (event.move.x < 0 && boundary.left < left) {
                offsetX = left - boundary.left;
            }
            if (event.move.y < 0 && boundary.top < top) {
                offsetY = top - boundary.top;
            } else if (event.move.y > 0 && boundary.bottom > bottom) {
                offsetY = bottom - boundary.bottom;
            }
            contour.move(new Vector(offsetX, -offsetY));
            return true;
        }
        return false;
    }
}
class StaticBoxLimitator extends BoxLimitator {
    private left: number = -Infinity;
    private top: number = -Infinity;
    private right: number = Infinity;
    private bottom: number = Infinity;
    constructor(options: Partial<BoxLimiatorOptions>) {
        super();
        this.left = this.getOptionValue(options, 'left', -Infinity);
        this.top = this.getOptionValue(options, 'top', -Infinity);
        this.right = this.getOptionValue(options, 'right', Infinity);
        this.bottom = this.getOptionValue(options, 'bottom', Infinity);
    }
    public getLeft(): number {
        return this.left;
    }
    public getTop(): number {
        return this.top;
    }
    public getRight(): number {
        return this.right;
    }
    public getBottom(): number {
        return this.bottom;
    }
    private getOptionValue(
        options: Partial<BoxLimiatorOptions>,
        key: keyof BoxLimiatorOptions,
        defaultValue: number,
    ): number {
        if (typeof options[key] === 'number') {
            return options[key]!;
        } else {
            return defaultValue;
        }
    }
}
const lazy = new Lazy<DynamicDOMBoxLimitator>();
class DynamicDOMBoxLimitator extends BoxLimitator {
    public resetBoundary: number = 0;
    @lazy.resetBy('resetBoundary')
    @lazy.property((it) => it.dom.getBoundingClientRect())
    private domBoundary!: DOMRect;
    constructor(private readonly dom: Element) {
        super();
    }
    public presetBox() {
        this.resetBoundary++;
    }
    public getLeft(): number {
        return this.domBoundary.left;
    }
    public getTop(): number {
        return this.domBoundary.top;
    }
    public getRight(): number {
        return this.domBoundary.right;
    }
    public getBottom(): number {
        return this.domBoundary.bottom;
    }
}
