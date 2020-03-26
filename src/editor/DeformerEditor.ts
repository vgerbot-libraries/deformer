import { JSEventEmitter, DOMEventListenerOptions } from '../EventEmitter';
import Hammer from 'hammerjs';
import ContourController from '../editor/ContourController';
import Disposable from '../Disposable';
import { mousePositionFromMouseEvent, mousePositionFromHammerInput } from '../event-input';
import { isTouchDevice } from '../foundation/devices';
import { Contour } from '../foundation/Contour';
import { Vector } from '../foundation/math/vector';
import DeformerEditorRenderer from './DeformerEditorRenderer';
import './editor.less';

interface EventTypes {
    mousemove: MouseEvent;
    mousedown: MouseEvent;
    mouseup: MouseEvent;
    touchmove: TouchEvent;
    touchstart: TouchEvent;
    touchend: TouchEvent;
}
export interface DeformerEditorOptions<C extends Contour> {
    contour: C;
    moveable?: boolean;
    rotatable?: boolean;
}

interface DeformerEventMap {
    update: (contour: Contour) => void;
}

export default abstract class DeformerEditor<C extends Contour> extends Disposable {
    public readonly contour: C;
    protected rotatable: boolean;
    protected moveable: boolean;
    protected readonly controllers: Array<ContourController<C>> = [];
    protected readonly renderer: DeformerEditorRenderer;
    private readonly emitter: JSEventEmitter = new JSEventEmitter();
    private readonly hammer: HammerManager;
    private currentMouseOverController?: ContourController<C>;
    private dom: HTMLElement = this.getDOM();
    private padding: number = 5;
    private cursorClass: string = 'deformer-editor--cursor-default';
    constructor(options: DeformerEditorOptions<C>) {
        super();
        this.contour = options.contour;
        this.rotatable = options.rotatable === true;
        this.moveable = options.moveable === undefined ? true : options.moveable;
        this.hammer = new Hammer(this.getDOM());
        this.renderer = this.createRenderer();
        this.dom.appendChild(this.renderer.getDOM());
        this.prepare();
    }
    public on<K extends keyof DeformerEventMap>(type: K, callback: DeformerEventMap[K]) {
        return this.emitter.on(type, callback);
    }
    public once<K extends keyof DeformerEventMap>(type: K, callback: DeformerEventMap[K]) {
        return this.emitter.on(type, callback, { once: true });
    }
    public clearListeners() {
        return this.emitter.clear();
    }
    public attach(controller: ContourController<C>): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            return false;
        }
        if (this.controllers.length === 0) {
            this.controllers.push(controller);
        } else {
            let insertIndex = this.controllers.length - 1;
            const zindex = controller.getZIndex();
            this.controllers.some((ctrl, i) => {
                if (ctrl.getZIndex() > zindex) {
                    insertIndex = i;
                    return true;
                }
                return false;
            });
            this.controllers.splice(insertIndex, 0, controller);
        }
        controller.attached(this);
        return true;
    }
    public detach(controller: ContourController<C>): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            this.controllers.splice(index, 1);
            return true;
        }
        return false;
    }
    public getDOM(): HTMLElement {
        if (!this.dom) {
            this.dom = document.createElement('div');
            this.dom.classList.add('deformer-editor');
        }
        return this.dom;
    }
    public setPadding(padding: number) {
        this.padding = padding;
    }
    public getPadding() {
        return this.padding;
    }
    public abstract updateUI();
    public getControllers() {
        return this.controllers;
    }
    public getCurrentMouseOverController() {
        return this.currentMouseOverController;
    }
    public setCurrentMouseOverController(ctrl: ContourController<C>) {
        this.currentMouseOverController = ctrl;
    }
    public setCursor(cursorClass: string) {
        const dom = this.getDOM();
        dom.classList.remove(this.cursorClass);
        dom.classList.add(cursorClass);
        this.cursorClass = cursorClass;
    }
    public getCursorClass() {
        return this.cursorClass;
    }
    protected createRenderer() {
        return new DeformerEditorRenderer();
    }
    protected prepare() {
        this.addDestroyHook(() => this.hammer.destroy());
        this.hammer.add(
            new Hammer.Pan({
                direction: Hammer.DIRECTION_ALL
            })
        );
        if (this.rotatable) {
            this.hammer.add(new Hammer.Rotate({}));
        }
        let isMouseDown = false;
        if (isTouchDevice) {
            this.attachDOMEvent('touchstart', e => {
                isMouseDown = true;
            });
            this.attachDOMEvent(
                'touchend',
                e => {
                    isMouseDown = false;
                },
                this.getDOM(),
                {
                    capture: true
                }
            );
            this.attachDOMEvent(
                'touchmove',
                e => {
                    if (e.touches.length !== 1) {
                        return;
                    }
                    this.handleMouseMove(mousePositionFromMouseEvent(e.touches[0]));
                },
                this.getDOM(),
                {
                    capture: true,
                    passive: true
                }
            );
        } else {
            this.attachDOMEvent('mousedown', e => {
                isMouseDown = true;
            });
            this.attachDOMEvent(
                'mouseup',
                e => {
                    isMouseDown = false;
                },
                document,
                {
                    capture: true
                }
            );
            this.attachDOMEvent(
                'mousemove',
                e => {
                    if (isMouseDown) {
                        return;
                    }
                    this.handleMouseMove(mousePositionFromMouseEvent(e));
                },
                this.getDOM(),
                {
                    capture: true,
                    passive: true
                }
            );
        }
        this.hammer.on('panstart', e => {
            if (!this.currentMouseOverController) {
                return;
            }
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction
            };
            this.currentMouseOverController.handlePanStart(editorEvent);
            this.emitter.emit('update', this.contour);
            this.updateUI();
        });
        this.hammer.on('panmove', e => {
            if (!this.currentMouseOverController) {
                return;
            }
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction
            };
            this.currentMouseOverController.handlePanMove(editorEvent);
            this.emitter.emit('update', this.contour);
            this.updateUI();
            this.contour.restore();
        });
        this.hammer.on('panend', e => {
            if (!this.currentMouseOverController) {
                return;
            }
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction
            };
            this.currentMouseOverController.handlePanStop(editorEvent);
            this.emitter.emit('update', this.contour);
            this.updateUI();
        });
        if (this.rotatable) {
            this.hammer.on('rotate', e => {
                // TODO: handle rotation controller
            });
        }
    }
    private attachDOMEvent<T extends keyof EventTypes>(
        type: T,
        listener: (e: EventTypes[T]) => void,
        target: Document | HTMLElement = this.getDOM(),
        options?: DOMEventListenerOptions | boolean
    ) {
        target.addEventListener(type, listener as EventListener, options);
        this.addDestroyHook(() => {
            target.removeEventListener(type, listener as EventListener, options);
        });
    }
    private handleMouseMove(position: MousePosition) {
        if (this.currentMouseOverController) {
            this.currentMouseOverController.isMouseOver = false;
            this.currentMouseOverController = undefined;
        }
        this.setCursor('default');
        this.controllers.forEach(controller => {
            controller.handleMouseMove(position);
            if (controller.isMouseOver) {
                if (this.currentMouseOverController) {
                    this.currentMouseOverController.isMouseOver = false;
                }
                this.currentMouseOverController = controller;
            }
        });
        this.controllers.forEach(ctrl => {
            ctrl.afterAllHandleMouseMove();
        });
    }
}
