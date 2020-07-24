import Deformer, { ContourDeformerOptions } from '../Deformer';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';
import IrregularPolygonVertexController from './IrregularVertexController';
import RotationController from './RotationController';
import MoveController from './MoveController';
import { DeformerInteraction } from '../DeformerInteraction';

export interface IrregularPolygonDeformerOptions extends ContourDeformerOptions<IrregularPolygon> {}

export class IrregularPolygonDeformer extends Deformer<IrregularPolygon> {
    private defaultInteraction;
    constructor(options: IrregularPolygonDeformerOptions) {
        super(options);
        this.defaultInteraction = new DeformerInteraction<IrregularPolygon>(this);
        const points = this.contour.getAllPoints();
        points.forEach((_, index) => {
            this.defaultInteraction.attachController(
                new IrregularPolygonVertexController(this.defaultInteraction, index, 10)
            );
        });
        if (this.rotatable) {
            this.defaultInteraction.attachController(new RotationController(this.defaultInteraction));
        }
        if (this.moveable) {
            this.defaultInteraction.attachController(new MoveController(this.defaultInteraction));
        }
        this.setCurrentInteraction(this.defaultInteraction);
    }
    public addPoint(point: AnyPoint) {
        const index = this.contour.addPoint(point);
        this.defaultInteraction.attachController(
            new IrregularPolygonVertexController(this.defaultInteraction, index, 10)
        );
        return () => {
            this.contour.removePoint(index);
        };
    }
}
