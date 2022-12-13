import { DOMEventListenerOptions, JSEventEmitter } from '../EventEmitter';
import Hammer from 'hammerjs';
import ContourController, { DeformerHandlerResult, HandlingType } from './ContourController';
import Disposable from '../Disposable';
import { mousePositionFromHammerInput, mousePositionFromMouseEvent } from '../event-input';
import { isTouchDevice } from '../foundation/devices';
import { Contour, ContourState } from '../foundation/Contour';
import { Vector } from '../foundation/math/vector';
import DeformerRenderer from './DeformerRenderer';
import './editor.less';
import { DeformerLimitator } from './DeformerLimitator';
import noop from '../foundation/noop';

interface EventTypes {
    mousemove: MouseEvent;
    mousedown: MouseEvent;
    mouseup: MouseEvent;
    touchmove: TouchEvent;
    touchstart: TouchEvent;
    touchend: TouchEvent;
}
export interface ContourDeformerOptions<C extends Contour> {
    contour: C;
    moveable?: boolean;
    rotatable?: boolean;
    limitations?: Array<DeformerLimitator<C>>;
}

interface DeformerEventMap {
    update: (contour: Contour) => void;
}

export default abstract class ContourDeformer<C extends Contour> extends Disposable {
    public readonly contour: C;
    protected rotatable: boolean;
    protected moveable: boolean;
    protected readonly controllers: Array<ContourController<C>> = [];
    protected readonly renderer: DeformerRenderer;
    private readonly emitter: JSEventEmitter = new JSEventEmitter();
    private readonly hammer: HammerManager;
    private currentMouseOverController?: ContourController<C>;
    private dom: HTMLElement = this.getDOM();
    private padding: number = 5;
    private cursorClass: string = 'deformer-editor--cursor-default';
    private limitations: Array<DeformerLimitator<C>> = [];
    private lastContourState: ContourState;
    private tempVariables = {};
    private currentLimitators: Array<DeformerLimitator<C>> = [];
    constructor(options: ContourDeformerOptions<C>) {
        super();
        this.contour = options.contour;
        this.lastContourState = this.contour.getSavableState();
        this.rotatable = options.rotatable === true;
        this.moveable = options.moveable === undefined ? true : options.moveable;
        if (options.limitations) {
            this.limitations.push(...options.limitations);
        }
        this.hammer = new Hammer(this.getDOM());
        this.renderer = this.createRenderer();
        this.dom.appendChild(this.renderer.getDOM());
        this.prepare();
        this.attachUpdateUIEvents();
    }
    public setTempVar(name: string, value: any) {
        this.tempVariables[name] = value;
    }
    public getTempVar<T>(name: string): T {
        return this.tempVariables[name] as T;
    }
    public removeTempVar(name: string) {
        delete this.tempVariables[name];
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
        controller.attached(this, this.hammer);
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
        this.controllers.forEach((ctrl) => {
            ctrl.render(this.renderer);
        });
    }
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
        if (this.cursorClass === cursorClass) {
            return;
        }
        const dom = this.getDOM();
        dom.classList.remove(this.cursorClass);
        dom.classList.add(cursorClass);
        this.cursorClass = cursorClass;
    }
    public getCursorClass() {
        return this.cursorClass;
    }
    public validateHandleResult(result: DeformerHandlerResult<unknown>) {
        return !this.currentLimitators.some((limit) => !limit.accept(this.contour, result));
    }
    public handleLimitator(result: DeformerHandlerResult<unknown>) {
        const accepted = this.validateHandleResult(result);
        if (accepted) {
            this.lastContourState = this.contour.getSavableState();
            return false;
        } else {
            this.contour.resetState(this.lastContourState);
            return true;
        }
    }
    public isRotatable() {
        return this.rotatable;
    }
    public isMoveable() {
        return this.moveable;
    }
    protected createRenderer() {
        return new DeformerRenderer();
    }
    protected prepare() {
        this.addDestroyHook(() => this.hammer.destroy());
        this.addDestroyHook(() => (this.tempVariables = {}));
        this.hammer.add(
            new Hammer.Pan({
                direction: Hammer.DIRECTION_ALL,
            }),
        );
        if (this.rotatable) {
            this.hammer.add(new Hammer.Rotate({}));
        }
        let isMouseDown = false;
        if (isTouchDevice) {
            this.attachDOMEvent('touchstart', () => {
                isMouseDown = true;
            });
            this.attachDOMEvent(
                'touchend',
                () => {
                    isMouseDown = false;
                },
                this.getDOM(),
                {
                    capture: true,
                },
            );
            this.attachDOMEvent(
                'touchmove',
                (e) => {
                    if (e.touches.length !== 1) {
                        return;
                    }
                    this.handleMouseMove(mousePositionFromMouseEvent(e.touches[0]));
                },
                this.getDOM(),
                {
                    capture: true,
                    passive: true,
                },
            );
        } else {
            this.attachDOMEvent('mousedown', () => {
                isMouseDown = true;
            });
            this.attachDOMEvent(
                'mouseup',
                () => {
                    isMouseDown = false;
                },
                document,
                {
                    capture: true,
                },
            );
            this.attachDOMEvent(
                'mousemove',
                (e) => {
                    if (isMouseDown) {
                        return;
                    }
                    this.handleMouseMove(mousePositionFromMouseEvent(e));
                },
                this.getDOM(),
                {
                    capture: true,
                    passive: true,
                },
            );
        }
        this.hammer.on('panstart', (e) => {
            const currentMouseOverController = this.currentMouseOverController;
            if (!currentMouseOverController) {
                return;
            }
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction,
            };
            if (!this.continueHandle(editorEvent)) {
                return;
            }
            this.contour.save();
            this.handleContoller(editorEvent, HandlingType.START);
            this.emitter.emit('start-update', this.contour);
            this.emitter.emit('update', this.contour);
            this.updateUI();
        });
        this.hammer.on('panmove', (e) => {
            const currentMouseOverController = this.currentMouseOverController;
            if (!currentMouseOverController) {
                return;
            }
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction,
            };
            if (!this.continueHandle(editorEvent)) {
                return;
            }
            this.contour.restore();
            this.contour.save();
            this.handleContoller(editorEvent, HandlingType.MOVE);
            this.emitter.emit('update', this.contour);
            this.updateUI();
        });
        this.hammer.on('panend', (e) => {
            const currentMouseOverController = this.currentMouseOverController;
            if (!currentMouseOverController) {
                return;
            }
            const position = mousePositionFromHammerInput(e);
            const editorEvent: EditorEvent = {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction,
            };
            if (!this.continueHandle(editorEvent)) {
                return;
            }
            this.contour.restore();
            this.contour.save();
            const clearMethod = this.handleContoller(editorEvent, HandlingType.END);
            this.contour.apply();
            this.emitter.emit('update', this.contour);
            this.emitter.emit('update-end', this.contour);
            this.updateUI();
            clearMethod();
        });
        if (this.rotatable) {
            this.hammer.on('rotate', () => {
                // TODO: handle rotation controller
            });
        }
    }
    protected attachUpdateUIEvents() {
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
                subtree: true,
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
    private handleContoller(editorEvent: EditorEvent, type: HandlingType) {
        const currentMouseOverController = this.currentMouseOverController;
        if (!currentMouseOverController) {
            return noop;
        }
        const handlers = currentMouseOverController.deformerHandlers(editorEvent, type);
        handlers.forEach((handler) => {
            this.contour.save();
            const lastResult = this.getTempVar(handler.cacheResultKey);
            const result = handler.handle();
            if (!this.validateHandleResult(result)) {
                let someOneAdjustSuccess = false;
                this.currentLimitators.forEach((limitator) => {
                    const adjusted = limitator.adjust(this.contour, editorEvent, currentMouseOverController, result);
                    if (adjusted) {
                        someOneAdjustSuccess = adjusted;
                    }
                });
                if (someOneAdjustSuccess) {
                    this.contour.pop();
                } else {
                    this.contour.restore();
                    handler.undo(lastResult);
                }
            } else {
                this.setTempVar(handler.cacheResultKey, result.cacheData);
                this.contour.pop();
            }
        });
        return () => {
            handlers.forEach((handler) => {
                const key = handler.cacheResultKey;
                this.removeTempVar(key);
            });
        };
    }
    private continueHandle(event: EditorEvent) {
        return !this.currentLimitators.some((limit) => !limit.continueHandle(event, this.contour));
    }
    private attachDOMEvent<T extends keyof EventTypes>(
        type: T,
        listener: (e: EventTypes[T]) => void,
        target: Document | HTMLElement = this.getDOM(),
        options?: DOMEventListenerOptions | boolean,
    ) {
        target.addEventListener(type, listener as EventListener, options);
        this.addDestroyHook(() => {
            target.removeEventListener(type, listener as EventListener, options);
        });
    }
    private handleMouseMove(position: MousePosition) {
        let currentMouseOverController = this.currentMouseOverController;
        if (currentMouseOverController) {
            currentMouseOverController.isMouseOver = false;
            currentMouseOverController = undefined;
        }

        for (const controller of this.controllers) {
            controller.handleMouseMove(position);
            if (controller.isMouseOver) {
                if (currentMouseOverController) {
                    currentMouseOverController.isMouseOver = false;
                }
                currentMouseOverController = controller;
            }
        }

        this.currentMouseOverController = currentMouseOverController;

        if (currentMouseOverController) {
            this.setCursor(currentMouseOverController.getCursorClass());
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.currentLimitators = this.limitations.filter((limit) => limit.handleIt(currentMouseOverController!));
        } else {
            this.setCursor('default');
            this.currentLimitators = [];
        }
        this.controllers.forEach((ctrl) => {
            ctrl.afterAllHandleMouseMove();
        });
    }
}
