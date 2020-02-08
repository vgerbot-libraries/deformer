import { uniqId } from './unique';
type FieldChangeDetector<T> = (obj: T) => boolean;
type FieldWatcher<T> = (obj: T) => any;
export class Lazy<Class> {
    private changeDetectors = {};
    public resetOnChange(...watchFields: string[] | Array<FieldWatcher<Class>>) {
        return (targetPrototype: object, propertyKey: string | symbol) => {
            const FIRST_TIME_DETECTION_VALUE = {};
            const detectors = (this.changeDetectors[propertyKey] = []) as Array<FieldChangeDetector<Class>>;
            watchFields.forEach((watchField: string | FieldWatcher<Class>) => {
                if (typeof watchField === 'string') {
                    let lastValue = FIRST_TIME_DETECTION_VALUE;
                    detectors.push((obj: Class) => {
                        try {
                            if (lastValue === FIRST_TIME_DETECTION_VALUE) {
                                return false;
                            }
                            return lastValue !== obj[watchField];
                        } finally {
                            lastValue = obj[watchField];
                        }
                    });
                } else {
                    detectors.push(
                        (() => {
                            let lastValue = FIRST_TIME_DETECTION_VALUE;
                            return (obj: Class) => {
                                const currentValue = watchField(obj);
                                try {
                                    return lastValue !== currentValue;
                                } finally {
                                    lastValue = currentValue;
                                }
                            };
                        })()
                    );
                }
            });
        };
    }
    public property<ReturnType>(
        initializer: Initializer<Class, ReturnType>,
        readony: boolean = true
    ): PropertyDecorator {
        const key = uniqId('__lazy__');
        return (targetPrototype: object, propertyKey: string | symbol) => {
            const ownDesciptor = Object.getOwnPropertyDescriptor(targetPrototype, propertyKey);
            if (ownDesciptor && !ownDesciptor.configurable) {
                delete targetPrototype[propertyKey];
            }
            const descriptor: PropertyDescriptor = {};
            const lazyThis$ = this;
            descriptor.get = function() {
                const changeDetectors = lazyThis$.changeDetectors[propertyKey] as Array<FieldChangeDetector<Class>>;
                if (changeDetectors) {
                    const hasChanged = changeDetectors.some(detector => {
                        return detector(this as any);
                    });
                    if (hasChanged) {
                        return (this[key] = initializer(this as any));
                    }
                }
                if (!(key in this)) {
                    this[key] = initializer(this as any);
                }
                return this[key];
            };
            if (!readony) {
                descriptor.set = newValue => {
                    this[key] = newValue;
                };
            }
            descriptor.enumerable = true;
            descriptor.configurable = true;
            Object.defineProperty(targetPrototype, propertyKey, descriptor);
        };
    }
}
