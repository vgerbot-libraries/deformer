import { JSEventEmitter, DOMEventListenerOptions } from '../EventEmitter';
import Hammer from 'hammerjs';
import ContourController from '../editor/ContourController';
import Disposable from '../Disposable';
import { mousePositionFromMouseEvent, mousePositionFromHammerInput } from '../event-input';
import { isTouchDevice } from '../foundation/devices';
import { Contour } from '../foundation/Contour';
import RotationController from './RotationController';
import { Vector } from '../foundation/math/vector';
import DeformerEditorRenderer from './DeformerEditorRenderer';
import './editor.css';

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
    rotationController?: RotationController<C>;
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
    protected rotationController?: RotationController<C>;
    protected readonly renderer: DeformerEditorRenderer;
    private readonly emitter: JSEventEmitter = new JSEventEmitter();
    private readonly hammer: HammerManager;
    private oprControllers: Array<ContourController<C>> = [];
    private dom: HTMLElement = this.getDOM();
    constructor(options: DeformerEditorOptions<C>) {
        super();
        this.contour = options.contour;
        this.rotatable = options.rotatable === true;
        this.moveable = options.moveable === undefined ? true : options.moveable;
        this.hammer = new Hammer(this.getDOM());
        this.renderer = this.createRenderer();
        if (this.rotatable) {
            this.rotationController = this.createRotationController();
        }
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
        this.controllers.push(controller);
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
    public abstract updateUI();
    public getControllers() {
        return this.controllers;
    }
    public getOprControllers() {
        return this.oprControllers;
    }
    protected createRotationController() {
        return new RotationController(this, this.contour);
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
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction
            };
            this.contour.save();
            if (this.rotationController?.isMouseOver) {
                this.rotationController?.handlePanStart(editorEvent);
                this.rotationController?.afterAllHandlePanStart([]);
            }
            const oprControllers = this.oprControllers.slice(0);
            oprControllers.forEach(controller => {
                controller.handlePanStart(editorEvent);
            });
            oprControllers.forEach(ctrl => {
                ctrl.afterAllHandlePanMove(this.oprControllers);
            });
            this.emitter.emit('update', this.contour);
            this.updateUI();
            this.contour.restore();
        });
        this.hammer.on('panmove', e => {
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction
            };
            this.contour.save();
            if (this.rotationController?.isMouseOver) {
                this.rotationController?.handlePanMove(editorEvent);
                this.rotationController?.afterAllHandlePanMove([]);
            }
            const oprControllers = this.oprControllers.slice(0);
            oprControllers.forEach(controller => {
                controller.handlePanMove(editorEvent);
            });
            oprControllers.forEach(ctrl => {
                ctrl.afterAllHandlePanMove(this.oprControllers);
            });
            this.emitter.emit('update', this.contour);
            this.updateUI();
            this.contour.restore();
        });
        this.hammer.on('panend', e => {
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction
            };
            if (this.rotationController?.isMouseOver) {
                this.rotationController?.handlePanStop(editorEvent);
                this.rotationController?.afterAllHandlePanStop([]);
            }
            const oprControllers = this.oprControllers.slice(0);
            oprControllers.forEach(controller => {
                controller.handlePanStop(editorEvent);
            });
            oprControllers.forEach(ctrl => {
                ctrl.afterAllHandlePanStop(this.oprControllers);
            });
            this.contour.apply();
            this.emitter.emit('update', this.contour);
            this.updateUI();
        });
        if (this.rotatable) {
            this.hammer.on('rotate', e => {
                this.rotationController?.handleRotate(e.rotation);
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
        this.controllers.forEach(controller => {
            controller.handleMouseMove(position);
        });
        this.controllers.forEach(ctrl => {
            ctrl.afterAllHandleMouseMove(this.controllers);
        });
        this.oprControllers = this.controllers.filter(it => it.isMouseOver);
        this.rotationController?.handleMouseMove(position);
        // this.rotationController?.afterAllHandleMouseMove(this.rotationController]);
    }
}
