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
export class QuadrilateralDeformerEditor extends DeformerEditor<Quadrilateral> {
    constructor(options: QuadrilateralDeformerEditorOptions) {
        super(options);
        const enableEdge = options.enableEdge === true;
        const enableVerticies = options.enableVerticies !== false;

        if (this.moveable) {
            this.attach(new MoveController(this));
        }
        if (enableEdge) {
            this.attach(new QuadrilateralEdgeController(this, Side.LEFT));
            this.attach(new QuadrilateralEdgeController(this, Side.RIGHT));
            this.attach(new QuadrilateralEdgeController(this, Side.TOP));
            this.attach(new QuadrilateralEdgeController(this, Side.BOTTOM));
        }
        if (enableVerticies) {
            this.attach(new QuadrilateralEdgeController(this, Side.LEFT_TOP));
            this.attach(new QuadrilateralEdgeController(this, Side.RIGHT_TOP));
            this.attach(new QuadrilateralEdgeController(this, Side.RIGHT_BOTTOM));
            this.attach(new QuadrilateralEdgeController(this, Side.LEFT_BOTTOM));
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
            const observer = new MutationObserver(() => {
                const dom = this.getDOM();
                if (dom.parentElement) {
                    this.updateUI();
                    observer.disconnect();
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
            const eventListener = () => {
                this.updateUI();
                this.getDOM().removeEventListener('DOMNodeInserted', eventListener);
            };
            this.getDOM().addEventListener('DOMNodeInserted', eventListener);
        }
    }
}
