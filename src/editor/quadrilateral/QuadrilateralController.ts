import ContourController from '../../ContourController';
import { MousePosition, PanMoveOffset } from '../../event-input';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { QuadrilateralDeformerEditor } from './QuadrilateralDeformerEditor';
import { PolarPoint } from '../../foundation/math/coordinate/PolarCoordinate';
import { DeviceCoordinate } from '../../foundation/math/coordinate/DeviceCoordinate';

export enum Direction {
    // top and bottom
    TOP = 0b1000,
    BOTTOM = 0b101000,
    // left and right
    LEFT = 0b1001,
    RIGHT = 0b101001,
    // left-top and right-bottom
    LEFT_TOP = 0b1010,
    RIGHT_BOTTOM = 0b101010,
    // right-top and left-bottom
    RIGHT_TOP = 0b1011,
    LEFT_BOTTOM = 0b101011
}
type getPointMethodNames =
    | 'getLeftCenter'
    | 'getTopCenter'
    | 'getRightCenter'
    | 'getBottomCenter'
    | 'getLeftTop'
    | 'getRightTop'
    | 'getRightBottom'
    | 'getLeftBottom';

const ControllerPointMethodName: {
    [key: number]: getPointMethodNames;
} = {
    [Direction.LEFT]: 'getLeftCenter',
    [Direction.TOP]: 'getTopCenter',
    [Direction.RIGHT]: 'getRightCenter',
    [Direction.BOTTOM]: 'getBottomCenter',
    [Direction.LEFT_TOP]: 'getLeftTop',
    [Direction.RIGHT_TOP]: 'getRightTop',
    [Direction.RIGHT_BOTTOM]: 'getRightBottom',
    [Direction.LEFT_BOTTOM]: 'getLeftBottom'
};

export class QuadrilateralController extends ContourController<Quadrilateral> {
    private readonly dom: HTMLElement;
    constructor(
        protected editor: QuadrilateralDeformerEditor,
        public direction: Direction,
        public readonly size: number = 10
    ) {
        super(editor.contour);
        this.dom = document.createElement('div');
    }
    public setDirection(direction: Direction) {
        const xor = this.direction ^ direction;
        if (xor === 32 || xor === 0) {
            this.direction = direction;
        } else {
            throw new Error('Uncompatible direction');
        }
    }
    public getDirectionName(): string {
        return Direction[this.direction].toLowerCase();
    }
    public getDOM() {
        return this.dom;
    }
    public getPoint(): PolarPoint {
        const method = this.contour[ControllerPointMethodName[this.direction]];
        return method.apply(this.contour, []);
    }
    public handleMouseMove(holder: DeformerHolderElement, positions: MousePosition[]) {
        const position = positions[0];
        const point = this.getPoint().toDevice();
        const mousePoint = DeviceCoordinate.ORIGIN.point(position.pageX, position.pageY);
        this.isMouseOver = point.vector(mousePoint).length() < this.size;
    }
    public handlePanStart(holder: DeformerHolderElement, offset: PanMoveOffset) {
        throw new Error('Method not implemented.');
    }
    public handlePanMove(holder: DeformerHolderElement, offset: PanMoveOffset) {
        throw new Error('Method not implemented.');
    }
    public handlePanStop(holder: DeformerHolderElement, offset: PanMoveOffset) {
        throw new Error('Method not implemented.');
    }
}
