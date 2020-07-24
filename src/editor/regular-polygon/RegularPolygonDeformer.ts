import ContourDeformer, { ContourDeformerOptions } from '../Deformer';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import { RegularPolygonVertexController } from './RegularPolygonVertexController';
import RegularPolygonMoveController from './MoveController';
import RegularPolygonRotationController from './RotationController';
import { DeformerInteraction } from '../DeformerInteraction';

export interface RegularPolygonDeformerOptions extends ContourDeformerOptions<RegularPolygon> {
    rotatableVertices?: boolean;
}

export class RegularPolygonDeformer extends ContourDeformer<RegularPolygon> {
    private defaultInteraction;
    constructor(options: RegularPolygonDeformerOptions) {
        super(options);
        this.defaultInteraction = new DeformerInteraction<RegularPolygon>(this);
        const rotatableVertices =
            options.rotatableVertices === undefined ? options.rotatable === true : options.rotatableVertices;
        if (this.moveable) {
            this.defaultInteraction.attachController(new RegularPolygonMoveController(this.defaultInteraction));
        }
        this.contour.getAllPoints().forEach((_, i) => {
            this.defaultInteraction.attachController(
                new RegularPolygonVertexController(this.defaultInteraction, i, 10, rotatableVertices)
            );
        });
        if (this.rotatable) {
            this.defaultInteraction.attachController(new RegularPolygonRotationController(this.defaultInteraction));
        }
        this.setCurrentInteraction(this.defaultInteraction);
    }
}
