import { DeformerLimitator } from '../DeformerLimitator';
import { Contour } from '../../foundation/Contour';
import ContourController from '../ContourController';
import MoveController from './MoveController';

export interface BoxLimiatorOptions {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export default class BoxLimitator extends DeformerLimitator<Contour> {
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
    public handleIt(controller: ContourController<Contour>): boolean {
        return controller instanceof MoveController;
    }
    public accept(contour: Contour): boolean {
        const boundary = contour.getDeviceBoundary();
        return (
            boundary.left >= this.left &&
            boundary.top >= this.top &&
            boundary.right <= this.right &&
            this.bottom <= this.bottom
        );
    }
    private getOptionValue(
        options: Partial<BoxLimiatorOptions>,
        key: keyof BoxLimiatorOptions,
        defaultValue: number
    ): number {
        if (typeof options[key] === 'number') {
            return options[key]!;
        } else {
            return defaultValue;
        }
    }
}
