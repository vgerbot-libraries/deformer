import { uniqId } from './unique';
type FieldWatcher<T> = (obj: T) => any;

type FieldDetector<T> = () => boolean;
type FieldDetectorFactory<T> = (obj: T) => FieldDetector<T> | Array<FieldDetector<T>>;
export class Lazy<Class> {
    private detectorFactories = {};
    public detectChange(...detectorFactories: Array<FieldDetectorFactory<Class>>) {
        return (targetPrototype: object, propertyKey: string | symbol) => {
            this.detectorFactories[propertyKey] = detectorFactories;
        };
    }
    public detectFieldChange(...watchFields: Array<string | FieldWatcher<Class>>) {
        return (targetPrototype: object, propertyKey: string | symbol) => {
            const CACHE_VALUE_KEY = uniqId('__cache_value_' + propertyKey.toString());
            this.detectChange(
                ...watchFields.map((watchField: string | FieldWatcher<Class>) => {
                    if (typeof watchField === 'string') {
                        return (obj: Class) => {
                            return () => {
                                try {
                                    return obj[CACHE_VALUE_KEY] !== obj[watchField];
                                } finally {
                                    obj[CACHE_VALUE_KEY] = obj[watchField];
                                }
                            };
                        };
                    } else {
                        return (obj: Class) => {
                            return () => {
                                const currentValue = watchField(obj);
                                try {
                                    return obj[CACHE_VALUE_KEY] !== currentValue;
                                } finally {
                                    obj[CACHE_VALUE_KEY] = currentValue;
                                }
                            };
                        };
                    }
                })
            );
        };
    }
    public property<ReturnType>(
        initializer: Initializer<Class, ReturnType>,
        readony: boolean = true
    ): PropertyDecorator {
        const key = uniqId('__lazy__');
        return (targetPrototype: object, propertyKey: string | symbol) => {
            const detectorsKey = uniqId('__lazy__detectors-' + propertyKey.toString());
            const ownDesciptor = Object.getOwnPropertyDescriptor(targetPrototype, propertyKey);
            if (ownDesciptor && !ownDesciptor.configurable) {
                delete targetPrototype[propertyKey];
            }
            const descriptor: PropertyDescriptor = {};
            const lazyThis$ = this;
            const detectorFactories = lazyThis$.detectorFactories[propertyKey];
            descriptor.get = function() {
                let detectors: Array<FieldDetector<Class>> = this[detectorsKey];
                if (!detectors) {
                    this[detectorsKey] = detectors = detectorFactories.reduce(
                        (all, factory) => all.concat(factory(this)),
                        []
                    );
                }
                if (detectors) {
                    const hasChanged = detectors.some(detector => {
                        return detector();
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
