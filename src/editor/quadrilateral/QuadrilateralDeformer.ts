import ContourDeformer, { ContourDeformerOptions } from '../Deformer';
import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import { QuadrilateralEdgeController } from './EdgeController';
import { QuadrilateralVertexController } from './VertexController';
import { Side } from '../../foundation/Direction';
import MoveController from './MoveController';
import RotationController from './RotationController';

export interface QuadrilateralDeformerOptions extends ContourDeformerOptions<Quadrilateral> {
    contour: Quadrilateral;
    enableVerticies?: boolean; // 启用所有顶点控制点
    enableEdge?: boolean; // 启用所有边控制点
}
export class QuadrilateralDeformer extends ContourDeformer<Quadrilateral> {
    private enableEdge: boolean;
    private enableVerticies: boolean;
    constructor(options: QuadrilateralDeformerOptions) {
        super(options);
        this.enableEdge = options.enableEdge === true;
        this.enableVerticies = options.enableVerticies !== false;
        if (this.moveable) {
            this.attach(new MoveController(this));
        }
        if (this.enableEdge) {
            this.attach(new QuadrilateralEdgeController(this, Side.LEFT));
            this.attach(new QuadrilateralEdgeController(this, Side.RIGHT));
            this.attach(new QuadrilateralEdgeController(this, Side.TOP));
            this.attach(new QuadrilateralEdgeController(this, Side.BOTTOM));
        }
        if (this.enableVerticies) {
            this.attach(new QuadrilateralVertexController(this, Side.LEFT_TOP));
            this.attach(new QuadrilateralVertexController(this, Side.RIGHT_TOP));
            this.attach(new QuadrilateralVertexController(this, Side.RIGHT_BOTTOM));
            this.attach(new QuadrilateralVertexController(this, Side.LEFT_BOTTOM));
        }
        if (this.rotatable) {
            this.attach(new RotationController(this));
        }
    }
}
