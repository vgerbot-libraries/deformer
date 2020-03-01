import EventEmitter from 'events';

export interface DOMEventListenerOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
}
export type JSListenerFn = (...args: any[]) => void;
export type OffListenerFn = () => void;
export interface JSEventListenerOptions {
    once?: boolean;
}

export interface IEventEmitter {
    on(type: string, callback: JSListenerFn): OffListenerFn;
    clear();
}

export class DOMEventEmitter implements IEventEmitter {
    private removeListeners: OffListenerFn[] = [];
    constructor(private element: EventTarget) {}

    public on(type: string, callback: EventListener, options?: DOMEventListenerOptions | boolean): OffListenerFn {
        this.element.addEventListener(type, callback, options);
        let isRemoved = false;
        const remove = () => {
            if (isRemoved) {
                return;
            }
            this.element.removeEventListener(type, callback, options);
            isRemoved = true;
            const index = this.removeListeners.indexOf(remove);
            this.removeListeners.splice(index, 1);
        };
        this.removeListeners.push(remove);
        return remove;
    }
    public clear() {
        this.removeListeners.forEach(rm => rm());
    }
}
export class JSEventEmitter implements IEventEmitter {
    private emitter: EventEmitter;
    private removeListeners: OffListenerFn[] = [];
    constructor() {
        this.emitter = new EventEmitter();
    }
    public on(type: string, listener: JSListenerFn, options?: JSEventListenerOptions) {
        const once = options ? options.once : false;
        const wrappedListener = (...args) => listener.apply(this.emitter, args);
        if (once) {
            this.emitter.once(type, wrappedListener);
        } else {
            this.emitter.on(type, wrappedListener);
        }
        let isRemoved = false;
        const remove = () => {
            if (isRemoved) {
                return;
            }
            this.emitter.removeListener(type, wrappedListener);
            isRemoved = true;
            const index = this.removeListeners.indexOf(remove);
            this.removeListeners.splice(index, 1);
        };
        this.removeListeners.push(remove);
        return remove;
    }
    public emit(type: string, ...args: any[]) {
        this.emitter.emit(type, ...args);
    }
    public clear() {
        this.removeListeners.forEach(rm => rm());
    }
}
