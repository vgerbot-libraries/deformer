import { JSEventEmitter, JSListenerFn, DOMEventListenerOptions } from '../EventEmitter';
import Hammer from 'hammerjs';
import ContourController from '../ContourController';
import Disposable from '../Disposable';
import { MousePosition, mousePositionFromMouseEvent, mousePositionFromHammerInput } from '../event-input';
import { isTouchDevice } from '../foundation/devices';
import { Contour } from '../Contour';

interface EventTypes {
    mousemove: MouseEvent;
    touchmove: TouchEvent;
}
export interface DeformerEditorOptions<C extends Contour> {
    contour: C;
    holder: DeformerHolderElement;
    rotatable?: boolean;
    moveable?: boolean;
}
export default class DeformerEditor<C extends Contour, CC extends ContourController<C>> extends Disposable {
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
        this.hammer = new Hammer(this.holder);
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
    protected prepare() {
        this.addDestroyHook(() => this.hammer.destroy());
        this.hammer.add(
            new Hammer.Pan({
                direction: Hammer.DIRECTION_ALL
            })
        );
        if (isTouchDevice) {
            this.attachDOMEventToHolder(
                'touchmove',
                e => {
                    const positions: MousePosition[] = [];
                    for (let i = 0, len = e.touches.length; i++; i < len) {
                        positions.push(mousePositionFromMouseEvent(e.touches[i], this.holder));
                    }
                    this.handleMouseMove(positions);
                },
                {
                    capture: true,
                    passive: true
                }
            );
        } else {
            this.attachDOMEventToHolder(
                'mousemove',
                e => {
                    this.handleMouseMove([mousePositionFromMouseEvent(e, this.holder)]);
                },
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
                    mousePosition: position
                });
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
                    mousePosition: position
                });
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
                    mousePosition: position
                });
            });
            lastDeltaX = e.deltaX;
            lastDeltaY = e.deltaY;
        });
    }
    private attachDOMEventToHolder<T extends keyof EventTypes>(
        type: T,
        listener: (e: EventTypes[T]) => void,
        options?: DOMEventListenerOptions | boolean
    ) {
        this.holder.addEventListener(type, listener as EventListener, options);
        this.addDestroyHook(() => {
            this.holder.removeEventListener(type, listener as EventListener, options);
        });
    }
    private handleMouseMove(positions: MousePosition[]) {
        this.controllers.forEach(controller => {
            controller.handleMouseMove(this.holder, positions);
        });
        this.mouseOverControllers = this.controllers.filter(it => it.isMouseOver);
    }
}
