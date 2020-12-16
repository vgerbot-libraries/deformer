import { Side, getOppositeSite } from '../../foundation/Direction';
import { PolarPoint } from '../../foundation/math/coordinate/PolarCoordinate';
import { Vector } from '../../foundation/math/vector';
import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import ContourController, { DeformerHandler, HandlingType } from '../ContourController';
import ContourDeformer from '../Deformer';
import DeformerRenderer from '../DeformerRenderer';
import { DeformerLimitator } from '../DeformerLimitator';
import BoxLimitator from '../common/BoxLimitator';
import { SizeLimitator } from './SizeLimitator';
import { AvoidSwitchSideLimitator } from './SwitchSideLimitator';

export class QuadrilateralEdgeController extends ContourController<Quadrilateral> {
    constructor(editor: ContourDeformer<Quadrilateral>, public side: Side, public readonly size: number = 10) {
        super(editor);
    }
    public reverseDirection() {
        this.side = getOppositeSite(this.side);
    }
    public getDirectionName(): string {
        return Side[this.side].toLowerCase();
    }
    public getPoint(): PolarPoint {
        return this.contour.getPointBySide(this.side);
    }
    public render(renderer: DeformerRenderer) {
        renderer.save();
        const point = this.getPoint();
        renderer.config({
            fillStyle: '#00FFFF',
            strokeStyle: '#FF00FF',
            textAlign: 'center',
            textBaseLine: 'bottom'
        });
        renderer.renderSquare(point, this.size);
        renderer.getContext().fill();
        renderer.restore();
    }
    public handleMouseMove(position: MousePosition) {
        this.isMouseOver =
            this.getPoint()
                .vector(position.page)
                .length() < this.size;
        return {
            isMouseOver: this.isMouseOver
        };
    }
    public getCursorClass() {
        return this.getCursorClassName();
    }
    public deformerHandlers(e: EditorEvent, type: HandlingType) {
        const handlers: Array<DeformerHandler<Vector>> = [];
        let horizontalSide: Side | undefined;
        let verticalSide: Side | undefined;
        switch (this.side) {
            case Side.LEFT_TOP:
            case Side.LEFT_BOTTOM:
            case Side.LEFT:
                horizontalSide = Side.LEFT;
                break;
            case Side.RIGHT_TOP:
            case Side.RIGHT_BOTTOM:
            case Side.RIGHT:
                horizontalSide = Side.RIGHT;
                break;
        }
        switch (this.side) {
            case Side.LEFT_TOP:
            case Side.RIGHT_TOP:
            case Side.TOP:
                verticalSide = Side.TOP;
                break;
            case Side.LEFT_BOTTOM:
            case Side.RIGHT_BOTTOM:
            case Side.BOTTOM:
                verticalSide = Side.BOTTOM;
                break;
        }
        const move = e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION);
        if (horizontalSide !== undefined) {
            const hside = horizontalSide;
            handlers.push({
                cacheResultKey: 'quadrilateral-edge-horizontal',
                handle: () => {
                    const switchedSide = this.contour.addVector(move, hside);
                    return {
                        cacheData: move,
                        switchedSide
                    };
                },
                undo: (last?: Vector) => {
                    if (last) {
                        this.contour.addVector(last, hside);
                    }
                }
            });
        }
        if (verticalSide !== undefined) {
            const vside = verticalSide;
            handlers.push({
                cacheResultKey: 'quadrilateral-edge-vertical',
                handle: () => {
                    const switchedSide = this.contour.addVector(move, vside);
                    return {
                        cacheData: move,
                        switchedSide
                    };
                },
                undo: (last?: Vector) => {
                    if (last) {
                        this.contour.addVector(last, vside);
                    }
                }
            });
        }
        return handlers;
    }
    public supportLimitator(limitator: DeformerLimitator<any>) {
        if (
            limitator instanceof BoxLimitator ||
            limitator instanceof SizeLimitator ||
            limitator instanceof AvoidSwitchSideLimitator
        ) {
            return true;
        }
        return false;
    }
    protected getCursorClassName() {
        let cursorName;
        switch (this.side) {
            case Side.LEFT:
                cursorName = 'w-resize';
                break;
            case Side.RIGHT:
                cursorName = 'e-resize';
                break;
            case Side.TOP:
                cursorName = 'n-resize';
                break;
            case Side.BOTTOM:
                cursorName = 's-resize';
                break;
            case Side.LEFT_TOP:
                cursorName = 'nwse-resize';
                break;
            case Side.RIGHT_TOP:
                cursorName = 'nesw-resize';
                break;
            case Side.RIGHT_BOTTOM:
                cursorName = 'nwse-resize';
                break;
            case Side.LEFT_BOTTOM:
                cursorName = 'nesw-resize';
                break;
        }
        if (cursorName) {
            return 'deformer-editor--cursor-' + cursorName;
        } else {
            return this.editor.getCursorClass();
        }
    }
}
