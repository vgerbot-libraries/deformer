import DeformerEditor, { DeformerEditorOptions } from '../DeformerEditor';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { QuadrilateralEdgeController } from './EdgeController';
import { Side } from '../../foundation/Direction';

export interface QuadrilateralDeformerEditorOptions extends DeformerEditorOptions<Quadrilateral> {
    contour: Quadrilateral;
    enableVerticies?: boolean; // 启用所有顶点控制点
    enableEdge?: boolean; // 启用所有边控制点
}
export default class QuadrilateralDeformerEditor extends DeformerEditor<Quadrilateral> {
    constructor(options: QuadrilateralDeformerEditorOptions) {
        super(options);
        const enableEdge = options.enableEdge === true;
        const enableVerticies = options.enableVerticies !== false;
        const $options = Object.assign(
            {
                enableVerticies,
                enableEdge
            },
            options
        );
        if ($options.enableEdge) {
            this.attach(new QuadrilateralEdgeController(this, Side.LEFT));
            this.attach(new QuadrilateralEdgeController(this, Side.RIGHT));
            this.attach(new QuadrilateralEdgeController(this, Side.TOP));
            this.attach(new QuadrilateralEdgeController(this, Side.BOTTOM));
        }
        this.updateUI();
    }
    public updateUI() {
        const boundary = this.contour.getDeviceBoundary();
        const padding = 5;
        const width = boundary.getWidth();
        const height = boundary.getHeight();
        const displayWidth = width + padding * 2;
        const displayHeight = height + padding * 2;
        this.getDOM().style.cssText += `
            left: ${boundary.left - padding}px;
            top: ${boundary.top - padding}px;
            width: ${displayWidth}px;
            height: ${displayHeight}px;
        `;
        this.renderer.setOffset(padding);
        this.renderer.reset(displayWidth, displayHeight);
        this.controllers.forEach(ctrl => {
            ctrl.render(this.renderer);
        });
    }
}
