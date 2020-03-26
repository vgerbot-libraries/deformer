import ContourController from '../ContourController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { PolarPoint } from '../../foundation/math/coordinate/PolarCoordinate';
import { Side, getOppositeSite } from '../../foundation/Direction';
import DeformerEditor from '../DeformerEditor';
import DeformerEditorRenderer from '../DeformerEditorRenderer';
import { Vector } from '../../foundation/math/vector';
import { QuadrilateralDeformerEditor } from './QuadrilateralDeformerEditor';
import { Interval } from '../../foundation/Interval';

export class QuadrilateralEdgeController extends ContourController<Quadrilateral> {
    constructor(
        public readonly editor: DeformerEditor<Quadrilateral>,
        public side: Side,
        public readonly size: number = 10
    ) {
        super(editor.contour);
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
    public render(renderer: DeformerEditorRenderer) {
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
        renderer.renderText(point, this.getDirectionName());
        renderer.restore();
    }
    public handleMouseMove(position: MousePosition) {
        this.isMouseOver =
            this.getPoint()
                .vector(position.page)
                .length() < this.size;
        if (this.isMouseOver) {
            this.editor.setCursor(this.getCursorClassName());
        }
    }
    public handlePanStart(e: EditorEvent) {
        this.contour.save();
        this.handlePanEvent(e);
    }
    public handlePanMove(e: EditorEvent) {
        this.contour.restore();
        this.contour.save();
        this.handlePanEvent(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.contour.restore();
        this.handlePanEvent(e);
        this.contour.apply();
    }
    public handlePanEvent(e: EditorEvent) {
        const switchedSide = this.contour.addVector(
            e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION),
            this.side
        );
        console.info(switchedSide);
        // this.handleLimitSize(switchedSide);
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
    // tslint:disable-next-line:member-ordering
    public handleLimitSize(switchedSide: boolean) {
        let widthInterval = Interval.NATURAL_NUMBER;
        let heightInterval = Interval.NATURAL_NUMBER;
        // let isLimitedMinWidth = false;
        // let isLimitedMinHeight = false;
        // let isLimitedMaxWidth = false;
        // let isLimitedMaxHeight = false;

        if (this.editor instanceof QuadrilateralDeformerEditor) {
            widthInterval = this.editor.getWidthInterval();
            heightInterval = this.editor.getHeightInterval();
            // isLimitedMinWidth = widthInterval.getMin() !== 0;
            // isLimitedMaxWidth = !isFinite(widthInterval.getMax());
            // isLimitedMinHeight = heightInterval.getMin() !== 0;
            // isLimitedMaxHeight = !isFinite(heightInterval.getMax());
        }
        const minWidth = widthInterval.getMin();
        const maxWidth = widthInterval.getMax();
        const minHeight = heightInterval.getMin();
        const maxHeight = heightInterval.getMax();
        if (switchedSide) {
            //
        } else {
            const width = this.contour.getWidth();
            const height = this.contour.getHeight();

            let ofsX = 0;
            let ofsY = 0;

            switch (this.side) {
                case Side.LEFT:
                case Side.LEFT_BOTTOM:
                case Side.LEFT_TOP:
                    if (width < minWidth) {
                        ofsX = -(minWidth - width);
                    } else if (width > maxWidth) {
                        ofsX = width - maxWidth;
                    }
                    break;
                case Side.RIGHT:
                case Side.RIGHT_TOP:
                case Side.RIGHT_BOTTOM:
                    if (width < minWidth) {
                        ofsX = minWidth - width;
                    } else if (width > maxWidth) {
                        ofsX = -(width - maxWidth);
                    }
                    break;
            }
            switch (this.side) {
                case Side.TOP:
                case Side.RIGHT_TOP:
                case Side.LEFT_TOP:
                    if (height < minHeight) {
                        ofsY = height - minHeight;
                    } else if (height > maxHeight) {
                        ofsY = -(height - maxHeight);
                    }
                    break;
                case Side.BOTTOM:
                case Side.RIGHT_BOTTOM:
                case Side.LEFT_BOTTOM:
                    if (height < minHeight) {
                        ofsY = -(height - minHeight);
                    } else if (height > maxHeight) {
                        ofsY = height - maxHeight;
                    }
                    break;
            }

            if (ofsX !== 0 || ofsX !== 0) {
                this.contour.addVector(new Vector(ofsX, ofsY), this.side);
            }
        }
    }
}
