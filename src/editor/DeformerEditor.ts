import { JSEventEmitter, JSListenerFn, DOMEventListenerOptions } from '../EventEmitter';
import Hammer from 'hammerjs';
import ContourController from '../ContourController';
import Disposable from '../Disposable';
import { MousePosition } from '../event-input';
import { isTouchDevice } from '../foundation/devices';

interface EventTypes {
    mousemove: MouseEvent;
    touchmove: TouchEvent;
}

export default class DeformerEditor extends Disposable {
    private emitter: JSEventEmitter = new JSEventEmitter();
    private hammer: HammerManager;
    private controllers: ContourController[] = [];
    constructor(private readonly holder: DeformerHolderElement) {
        super();
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
    public attach(controller: ContourController): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            return false;
        }
        this.controllers.push(controller);
        return true;
    }
    public detach(controller: ContourController): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            this.controllers.splice(index, 1);
            return true;
        }
        return false;
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
    }
    private prepare() {
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
                        positions.push(new MousePosition(e.touches[i], this.holder));
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
                    this.handleMouseMove([new MousePosition(e, this.holder)]);
                },
                {
                    capture: true,
                    passive: true
                }
            );
        }
        this.hammer.on('panstart', e => {
            const { x, y } = e.center;

            console.info(x, y);
        });
    }
}
