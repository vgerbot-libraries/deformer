import DeformerEditor, { DeformerEditorOptions } from '../DeformerEditor';
import { QuadrilateralController, Direction } from './QuadrilateralController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import template from './editor.ejs';

export interface QuadrilateralDeformerEditorOptions extends DeformerEditorOptions<Quadrilateral> {
    contour: Quadrilateral;
    enableDiagonally?: boolean; // 启用所有对角控制点
    enableLeftTop?: boolean;
    enableRightTop?: boolean;
    enableLeftBottom?: boolean;
    enableRightBottom?: boolean;
    enableRim?: boolean; // 启用所有上下左右控制点
    enableLeft?: boolean;
    enableRight?: boolean;
    enableTop?: boolean;
    enableBottom?: boolean;
}

export class QuadrilateralDeformerEditor extends DeformerEditor<Quadrilateral, QuadrilateralController> {
    private dom!: HTMLElement;
    constructor(options: QuadrilateralDeformerEditorOptions) {
        super(options);
        const enableRim = options.enableRim === true;
        const enableDiagonally = options.enableDiagonally !== false;
        const $options = Object.assign(
            {
                enableDiagonally,
                enableLeftTop: enableDiagonally,
                enableRightTop: enableDiagonally,
                enableLeftBottom: enableDiagonally,
                enableRightBottom: enableDiagonally,
                enableRim,
                enableLeft: enableRim,
                enableRight: enableRim,
                enableTop: enableRim,
                enableBottom: enableRim
            },
            options
        );
        if ($options.enableLeft) {
            super.attach(new QuadrilateralController(this, Direction.LEFT));
        }
        if ($options.enableRight) {
            super.attach(new QuadrilateralController(this, Direction.RIGHT));
        }
        if ($options.enableTop) {
            super.attach(new QuadrilateralController(this, Direction.TOP));
        }
        if ($options.enableBottom) {
            super.attach(new QuadrilateralController(this, Direction.BOTTOM));
        }
        if ($options.enableLeftTop) {
            super.attach(new QuadrilateralController(this, Direction.LEFT_TOP));
        }
        if ($options.enableRightTop) {
            super.attach(new QuadrilateralController(this, Direction.RIGHT_TOP));
        }
        if ($options.enableRightBottom) {
            super.attach(new QuadrilateralController(this, Direction.RIGHT_BOTTOM));
        }
        if ($options.enableLeftBottom) {
            super.attach(new QuadrilateralController(this, Direction.LEFT_BOTTOM));
        }
    }
    public attach(controller: QuadrilateralController): boolean {
        throw new Error('Illegal operation!');
    }
    public updateUI() {
        this.controllers.forEach(ctrl => {
            const dom = ctrl.getDOM();
            const point = ctrl.getPoint().toDevice();
            dom.className = `.deformer--editor-controller .deformer--editor-controller-${ctrl.getDirectionName()}`;
            dom.style.cssText = `
                width: ${ctrl.size}px;
                height: ${ctrl.size}px;
                left: ${point.x - ctrl.size / 2}px;
                top: ${point.y - ctrl.size / 2}px;
            `;
        });
        const boundary = this.contour.getDeviceBoundary();
        this.dom.style.cssText = `
            left: ${boundary.left}px;
            top: ${boundary.top}px;
            width: ${boundary.right - boundary.left}px;
            height: ${boundary.bottom - boundary.top}px;
        `;
    }
    public getDOM() {
        return this.dom;
    }
    protected prepare() {
        super.prepare();
        const editorDOM = this.parseTemplateToDOM();
        const controlsDOM = editorDOM.querySelector('.deformer--editor-controls');
        this.controllers.forEach(ctl => {
            const dom = ctl.getDOM();
            // tslint:disable-next-line:no-unused-expression
            controlsDOM?.appendChild(dom);
        });
        this.dom = editorDOM;
        this.updateUI();
    }
    private parseTemplateToDOM() {
        const tpl = template({
            rotatable: this.rotatable
        });
        const div = document.createElement('div');
        div.innerHTML = tpl;
        return div.firstElementChild! as HTMLDivElement;
    }
}
