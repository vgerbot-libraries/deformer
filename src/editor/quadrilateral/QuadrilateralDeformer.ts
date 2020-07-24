import ContourDeformer, { ContourDeformerOptions } from '../Deformer';
import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import { QuadrilateralEdgeController } from './EdgeController';
import { Side } from '../../foundation/Direction';
import MoveController from './MoveController';
import RotationController from './RotationController';
import QuadrilateralOperationMode from './OperationMode';
import { DeformerInteraction } from '../DeformerInteraction';

export interface QuadrilateralDeformerOptions extends ContourDeformerOptions<Quadrilateral> {
    contour: Quadrilateral;
    enableVerticies?: boolean; // 启用所有顶点控制点
    enableEdge?: boolean; // 启用所有边控制点
    operationMode?: QuadrilateralOperationMode; // 控制模式
}
export class QuadrilateralDeformer extends ContourDeformer<Quadrilateral> {
    private operationMode: QuadrilateralOperationMode = QuadrilateralOperationMode.DEFAULT;
    private enableEdge: boolean;
    private enableVerticies: boolean;
    private defaultInteraction;
    constructor(options: QuadrilateralDeformerOptions) {
        super(options);
        this.defaultInteraction = new DeformerInteraction<Quadrilateral>(this);
        this.enableEdge = options.enableEdge === true;
        this.enableVerticies = options.enableVerticies !== false;
        if (options.operationMode !== undefined) {
            this.operationMode = options.operationMode;
        }
        if (this.moveable) {
            this.defaultInteraction.attachController(new MoveController(this.defaultInteraction));
        }
        if (this.enableEdge) {
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.LEFT)
            );
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.RIGHT)
            );
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.TOP)
            );
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.BOTTOM)
            );
        }
        if (this.enableVerticies) {
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.LEFT_TOP)
            );
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.RIGHT_TOP)
            );
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.RIGHT_BOTTOM)
            );
            this.defaultInteraction.attachController(
                new QuadrilateralEdgeController(this.defaultInteraction, Side.LEFT_BOTTOM)
            );
        }
        if (this.rotatable) {
            this.defaultInteraction.attachController(new RotationController(this.defaultInteraction));
        }
        this.setCurrentInteraction(this.defaultInteraction);
    }
    public getOperationMode() {
        return this.operationMode;
    }
    public switchOperationMode(mode: QuadrilateralOperationMode) {
        if (this.operationMode === mode) {
            return;
        }
        this.operationMode = mode;
    }
}
