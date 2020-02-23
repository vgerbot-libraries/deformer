import { JSEventEmitter, JSListenerFn, DOMEventListenerOptions } from '../EventEmitter';
import Hammer from 'hammerjs';
import ContourController from '../ContourController';
import Disposable from '../Disposable';
import { MousePosition, mousePositionFromMouseEvent, mousePositionFromHammerInput } from '../event-input';
import { isTouchDevice } from '../foundation/devices';
import { Contour } from '../Contour';

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
    holder: DeformerHolderElement;
    rotatable?: boolean;
    moveable?: boolean;
}
export default abstract class DeformerEditor<C extends Contour, CC extends ContourController<C>> extends Disposable {
    public readonly contour: C;
    protected readonly holder: DeformerHolderElement;
    protected rotatable: boolean;
    protected moveable: boolean;
    protected controllers: CC[] = [];
    private emitter: JSEventEmitter = new JSEventEmitter();
    private hammer: HammerManager;
    private mouseOverControllers: CC[] = [];
    constructor(options: DeformerEditorOptions<C>) {
        super();
        this.holder = options.holder;
        this.contour = options.contour;
        this.rotatable = options.rotatable === undefined ? false : options.rotatable;
        this.moveable = options.moveable === undefined ? true : options.moveable;
        this.hammer = new Hammer(this.getDOM());
        this.prepare();
    }
    public on(type: string, callback: JSListenerFn) {
        return this.emitter.on(type, callback);
    }
    public once(type: string, callback: JSListenerFn) {
        return this.emitter.on(type, callback, { once: true });
    }
    public clearListeners() {
        return this.emitter.clear();
    }
    public attach(controller: CC): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            return false;
        }
        this.controllers.push(controller);
        return true;
    }
    public detach(controller: CC): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            this.controllers.splice(index, 1);
            return true;
        }
        return false;
    }
    public abstract getDOM(): HTMLElement;
    public abstract updateUI();
    protected prepare() {
        this.addDestroyHook(() => this.hammer.destroy());
        this.hammer.add(
            new Hammer.Pan({
                direction: Hammer.DIRECTION_ALL
            })
        );
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
                    const positions: MousePosition[] = [];
                    for (let i = 0, len = e.touches.length; i++; i < len) {
                        positions.push(mousePositionFromMouseEvent(e.touches[i], this.holder));
                    }
                    this.handleMouseMove(positions);
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
                    this.handleMouseMove([mousePositionFromMouseEvent(e, this.holder)]);
                },
                this.getDOM(),
                {
                    capture: true,
                    passive: true
                }
            );
        }
        let lastDeltaX: number = 0;
        let lastDeltaY: number = 0;
        this.hammer.on('panstart', e => {
            const position = mousePositionFromHammerInput(e);
            this.mouseOverControllers.forEach(controller => {
                controller.handlePanStart(this.holder, {
                    moveX: e.deltaX,
                    moveY: e.deltaY,
                    totalMoveX: e.deltaX,
                    totalMoveY: e.deltaY,
                    mousePosition: position,
                    direction: e.direction
                });
            });
            this.mouseOverControllers.forEach(ctrl => {
                ctrl.afterAllHandlePanMove(this.mouseOverControllers);
            });
            lastDeltaX = e.deltaX;
            lastDeltaY = e.deltaY;
        });
        this.hammer.on('panmove', e => {
            const position = mousePositionFromHammerInput(e);
            this.mouseOverControllers.forEach(controller => {
                controller.handlePanMove(this.holder, {
                    moveX: e.deltaX - lastDeltaX,
                    moveY: e.deltaY - lastDeltaY,
                    totalMoveX: e.deltaX,
                    totalMoveY: e.deltaY,
                    mousePosition: position,
                    direction: e.direction
                });
            });
            this.mouseOverControllers.forEach(ctrl => {
                ctrl.afterAllHandlePanMove(this.mouseOverControllers);
            });
            lastDeltaX = e.deltaX;
            lastDeltaY = e.deltaY;
        });
        this.hammer.on('panstop', e => {
            const position = mousePositionFromHammerInput(e);
            this.mouseOverControllers.forEach(controller => {
                controller.handlePanStop(this.holder, {
                    moveX: e.deltaX - lastDeltaX,
                    moveY: e.deltaY - lastDeltaY,
                    totalMoveX: e.deltaX,
                    totalMoveY: e.deltaY,
                    mousePosition: position,
                    direction: e.direction
                });
            });
            this.mouseOverControllers.forEach(ctrl => {
                ctrl.afterAllHandlePanStop(this.mouseOverControllers);
            });
            lastDeltaX = e.deltaX;
            lastDeltaY = e.deltaY;
        });
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
    private handleMouseMove(positions: MousePosition[]) {
        this.controllers.forEach(controller => {
            controller.handleMouseMove(this.holder, positions);
        });
        this.controllers.forEach(ctrl => {
            ctrl.afterAllHandleMouseMove(this.controllers);
        });
        this.mouseOverControllers = this.controllers.filter(it => it.isMouseOver);
    }
}
