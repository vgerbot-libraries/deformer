import DeformerEditor, { DeformerEditorOptions } from '../DeformerEditor';
import { QuadrilateralController } from './QuadrilateralController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import template from './editor.ejs';
import './editor.css';
import { DeviceCoordinate } from '../../foundation/math/coordinate/DeviceCoordinate';
import { Direction } from '../../foundation/Direction';

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
    private controlsDOM: HTMLElement;
    constructor(options: QuadrilateralDeformerEditorOptions) {
        super(options);
        this.controlsDOM = this.dom.querySelector('.deformer--editor-controls') as HTMLElement;
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
            this.attach(new QuadrilateralController(this, Direction.LEFT));
        }
        if ($options.enableRight) {
            this.attach(new QuadrilateralController(this, Direction.RIGHT));
        }
        if ($options.enableTop) {
            this.attach(new QuadrilateralController(this, Direction.TOP));
        }
        if ($options.enableBottom) {
            this.attach(new QuadrilateralController(this, Direction.BOTTOM));
        }
        if ($options.enableLeftTop) {
            this.attach(new QuadrilateralController(this, Direction.LEFT_TOP));
        }
        if ($options.enableRightTop) {
            this.attach(new QuadrilateralController(this, Direction.RIGHT_TOP));
        }
        if ($options.enableRightBottom) {
            this.attach(new QuadrilateralController(this, Direction.RIGHT_BOTTOM));
        }
        if ($options.enableLeftBottom) {
            this.attach(new QuadrilateralController(this, Direction.LEFT_BOTTOM));
        }
        this.attach = () => {
            throw new Error('Illegal operation!');
        };
        this.updateUI();
    }
    public attach(controller: QuadrilateralController): boolean {
        try {
            return super.attach(controller);
        } finally {
            this.controlsDOM.appendChild(controller.getDOM());
        }
    }
    public updateUI() {
        this.controllers.forEach(ctrl => {
            const direction = ctrl.direction;
            switch (direction) {
                case Direction.LEFT:
            }
        });
        const origin = this.contour.getLeftTop().toDevice();
        const coordinate = new DeviceCoordinate(origin.x, origin.y);
        this.controllers.forEach(ctrl => {
            const dom = ctrl.getDOM();
            const point = ctrl.getPoint().toDevice(coordinate);
            dom.className = `deformer--editor-controller deformer--editor-controller-${ctrl.getDirectionName()}`;
            dom.style.cssText = `
                width: ${ctrl.size}px;
                height: ${ctrl.size}px;
                left: ${point.x - ctrl.size / 2}px;
                top: ${point.y - ctrl.size / 2}px;
                font-size: 10px;
            `;
            dom.innerText = ctrl.getDirectionName();
        });
        const boundary = this.contour.getDeviceBoundary();
        this.dom.style.cssText = `
            left: ${boundary.left}px;
            top: ${boundary.top}px;
            width: ${boundary.right - boundary.left}px;
            height: ${boundary.bottom - boundary.top}px;
        `;
    }
    public reverseControllersDirection(direction: Direction) {
        const otherSideDirection = (() => {
            if (direction > 0b1111) {
                return direction & 0b1111;
            } else {
                return 0b100000 | direction;
            }
        })();
        this.exchangeDirection(direction, otherSideDirection);
    }
    public exchangeDirection(fromDirection: Direction, toDirection: Direction) {
        let fromSideCtrl!: QuadrilateralController;
        let toSideCtrl!: QuadrilateralController;
        this.controllers.forEach(ctrl => {
            if (ctrl.direction === fromDirection) {
                fromSideCtrl = ctrl;
            } else if (ctrl.direction === toDirection) {
                toSideCtrl = ctrl;
            }
        });
        fromSideCtrl.setDirection(toDirection);
        toSideCtrl.setDirection(fromDirection);
    }
    public getDOM() {
        if (!this.dom) {
            this.dom = this.parseTemplateToDOM();
            (this.dom as any).editor = this;
        }
        return this.dom;
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
