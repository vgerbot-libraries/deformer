import ContourController from '../../ContourController';
import { MousePosition, PanMoveOffset, HammerDirection } from '../../event-input';
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
    public reverseDirection() {
        if (this.direction > 0b1111) {
            this.direction = this.direction & 0b1111;
        } else {
            this.direction = 0b100000 | this.direction;
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
        this.handlePanEvent(holder, offset);
    }
    public handlePanMove(holder: DeformerHolderElement, offset: PanMoveOffset) {
        this.handlePanEvent(holder, offset);
    }
    public handlePanStop(holder: DeformerHolderElement, offset: PanMoveOffset) {
        this.handlePanEvent(holder, offset);
    }
    private isDirection(offsetDirection: HammerDirection, ...directions: HammerDirection[]) {
        return directions.some(d => {
            return (d | offsetDirection) === d;
        });
    }
    private handleHorizontalPanEvent(offset: PanMoveOffset): boolean {
        if (
            !this.isDirection(offset.direction, HammerDirection.LEFT, HammerDirection.RIGHT, HammerDirection.HORIZONTAL)
        ) {
            return false;
        }
        const isLeft = this.direction === Direction.LEFT;
        const contour = this.contour;
        const leftTop = contour.getLeftTop().toDevice();
        const rightTop = contour.getRightTop().toDevice();
        let ofsX = offset.moveX;
        const mouseX = offset.mousePosition.clientX;
        const leftSideX = leftTop.getDeviceX();
        const rightSideX = rightTop.getDeviceX();
        if (isLeft) {
            if ((mouseX > leftSideX && ofsX < 0) || (mouseX < leftSideX && ofsX > 0)) {
                return false;
            }
        } else {
            // is right side
            if ((mouseX < rightSideX && ofsX > 0) || (mouseX > rightSideX && ofsX < 0)) {
                return false;
            }
        }
        const width = rightTop.x - leftTop.x;
        if (width < Math.abs(ofsX)) {
            this.editor.reverseControllersDirection(this.direction);
            if (ofsX < 0) {
                ofsX += width;
            } else {
                ofsX -= width;
            }
        }
        if (isLeft) {
            contour.addLeftOffset(ofsX);
        } else {
            contour.addRightOffset(ofsX);
        }
        return true;
    }
    private handleVerticalPanEvent(offset: PanMoveOffset): boolean {
        return true;
    }
    private handlePanEvent(holder: DeformerHolderElement, offset: PanMoveOffset) {
        // let ofsY = offset.moveY;
        let isHandled = false;
        outer: switch (this.direction) {
            case Direction.LEFT:
            case Direction.RIGHT:
                isHandled = this.handleHorizontalPanEvent(offset);
                break outer;
            case Direction.TOP:
            // this.contour.addTopOffset(offset.moveY);
            // break;
            case Direction.BOTTOM:
                // this.contour.addBottomOffset(-offset.moveY);
                // break;
                isHandled = this.handleVerticalPanEvent(offset);
                break;
            case Direction.LEFT_TOP:
                break;
            case Direction.RIGHT_TOP:
                break;
            case Direction.RIGHT_BOTTOM:
                break;
            case Direction.LEFT_BOTTOM:
                break;
        }
        if (isHandled) {
            this.editor.updateUI();
        }
    }
}
