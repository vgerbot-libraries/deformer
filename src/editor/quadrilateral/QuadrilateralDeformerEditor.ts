import DeformerEditor, { DeformerEditorOptions } from '../DeformerEditor';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { QuadrilateralEdgeController } from './EdgeController';
import { Side } from '../../foundation/Direction';
import MoveController from './MoveController';
import RotationController from './RotationController';

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
        if (this.moveable) {
            this.attach(new MoveController(this));
        }
        if ($options.enableEdge) {
            this.attach(new QuadrilateralEdgeController(this, Side.LEFT));
            this.attach(new QuadrilateralEdgeController(this, Side.RIGHT));
            this.attach(new QuadrilateralEdgeController(this, Side.TOP));
            this.attach(new QuadrilateralEdgeController(this, Side.BOTTOM));
        }
        if (this.rotatable) {
            this.attach(new RotationController(this));
        }
        this.updateUIOnNodeInserted();
    }
    public updateUI() {
        const boundary = this.contour.getDeviceBoundary();
        const padding = this.getPadding();
        const displayBoundary = boundary.expand(padding);
        this.getDOM().style.cssText += `
            left: ${displayBoundary.left}px;
            top: ${displayBoundary.top}px;
            width: ${displayBoundary.getWidth()}px;
            height: ${displayBoundary.getHeight()}px;
        `;
        this.renderer.setOffset(padding);
        this.renderer.reset(displayBoundary, boundary);
        this.controllers.forEach(ctrl => {
            ctrl.render(this.renderer);
        });
    }
    private updateUIOnNodeInserted() {
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(mutationList => {
                const dom = this.getDOM();
                const findMatch = mutationList.some(record => {
                    const addedNodes = record.addedNodes;
                    const len = addedNodes.length;
                    for (let i = 0; i < len; i++) {
                        if (addedNodes.item(i) === dom) {
                            return true;
                        }
                    }
                    return false;
                });
                if (findMatch) {
                    this.updateUI();
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            this.addDestroyHook(() => {
                observer.disconnect();
            });
        } else {
            this.getDOM().addEventListener('DOMNodeInserted', () => {
                this.updateUI();
            });
        }
    }
}
