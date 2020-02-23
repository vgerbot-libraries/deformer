import ContourController from '../../ContourController';
import { MousePosition, PanMoveOffset, HammerDirection } from '../../event-input';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { QuadrilateralDeformerEditor } from './QuadrilateralDeformerEditor';
import { PolarPoint } from '../../foundation/math/coordinate/PolarCoordinate';
import { DeviceCoordinate } from '../../foundation/math/coordinate/DeviceCoordinate';
import { Direction, getOppositeDirection } from '../../foundation/Direction';
import { QuadrilateralControllerEventHandler } from './QuadrilateralControllerEventHandler';

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
    private readonly handler = new QuadrilateralControllerEventHandler(this);
    constructor(
        public readonly editor: QuadrilateralDeformerEditor,
        public direction: Direction,
        public readonly size: number = 10
    ) {
        super(editor.contour);
        this.dom = document.createElement('div');
    }
    public setDirection(direction: Direction) {
        this.direction = direction;
    }
    public reverseDirection() {
        this.direction = getOppositeDirection(this.direction);
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
    public afterAllHandleMouseMove(controllers: Array<ContourController<Quadrilateral>>) {
        if (!this.isMouseOver) {
            return;
        }
        controllers
            .filter(ctrl => ctrl !== this && ctrl.isMouseOver && ctrl instanceof QuadrilateralController)
            .forEach(ctrl => {
                ctrl.isMouseOver = false;
            });
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
    public isOneOfTheSpecificDirections(offsetDirection: HammerDirection, ...directions: HammerDirection[]) {
        return directions.some(d => {
            return (d | offsetDirection) === d;
        });
    }
    private handlePanEvent(holder: DeformerHolderElement, offset: PanMoveOffset) {
        // let ofsY = offset.moveY;
        let isHandled = false;
        outer: switch (this.direction) {
            case Direction.LEFT:
            case Direction.RIGHT:
                isHandled = this.handler.handleHorizontalPanEvent(offset);
                break outer;
            case Direction.TOP:
            case Direction.BOTTOM:
                isHandled = this.handler.handleVerticalPanEvent(offset);
                break;
            case Direction.LEFT_TOP:
            case Direction.RIGHT_TOP:
            case Direction.RIGHT_BOTTOM:
            case Direction.LEFT_BOTTOM:
                isHandled = this.handler.handleDiagonalPanEvent(offset, this.direction);
                break;
        }
        if (isHandled) {
            this.editor.updateUI();
        }
    }
}
