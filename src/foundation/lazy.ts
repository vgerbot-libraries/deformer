import { uniqId } from './unique';
type FieldWatcher<T> = (obj: T) => any;

type FieldDetector = () => boolean;
type FieldDetectorFactory<T> = (obj: T) => FieldDetector | Array<FieldDetector>;

type Prototype = typeof Object.prototype;

export class Lazy<Class> {
    private detectorFactories = {};
    public detectChangeFactories(...detectorFactories: Array<FieldDetectorFactory<Class>>): PropertyDecorator {
        return (targetPrototype: Prototype, propertyKey: string | symbol) => {
            let cachedDetectorFactories = this.detectorFactories[propertyKey];
            if (!cachedDetectorFactories) {
                cachedDetectorFactories = [];
                this.detectorFactories[propertyKey] = cachedDetectorFactories;
            }
            cachedDetectorFactories.push(...detectorFactories);
        };
    }
    /**
     * @alias detectFieldChange
     * @param watchFields
     */
    public resetBy(...watchFields: Array<string | FieldWatcher<Class>>): PropertyDecorator {
        return this.detectFieldChange(...watchFields);
    }
    /**
     * @deprecated
     * @param watchFields
     */
    public detectFieldChange(...watchFields: Array<string | FieldWatcher<Class>>): PropertyDecorator {
        return (targetPrototype: Prototype, propertyKey: string | symbol) => {
            const detectorFactories = watchFields.map((watchField: string | FieldWatcher<Class>) => {
                if (typeof watchField === 'string') {
                    const CACHE_VALUE_KEY = uniqId(`__cache_value_${propertyKey.toString()}-${watchField}`);
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
                    const CACHE_VALUE_KEY = uniqId('__cache_value_' + propertyKey.toString());
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
            });
            const cachedDetectorFactories = this.detectorFactories[propertyKey];
            if (!cachedDetectorFactories) {
                this.detectorFactories[propertyKey] = detectorFactories;
            } else {
                this.detectorFactories[propertyKey].push(...detectorFactories);
            }
        };
    }
    public property<ReturnType>(
        initializer: Initializer<Class, ReturnType>,
        readony: boolean = true
    ): PropertyDecorator {
        const key = uniqId('__lazy__');
        return (targetPrototype: Prototype, propertyKey: string | symbol) => {
            const detectorsKey = uniqId('__lazy__detectors-' + propertyKey.toString());
            const ownDesciptor = Object.getOwnPropertyDescriptor(targetPrototype, propertyKey);
            if (ownDesciptor && !ownDesciptor.configurable) {
                delete targetPrototype[propertyKey];
            }
            const descriptor: PropertyDescriptor = {};
            // eslint-disable-next-line
            const lazyThis$ = this;
            descriptor.get = function() {
                let detectors: Array<FieldDetector> = this[detectorsKey];
                if (!detectors) {
                    const detectorFactories = lazyThis$.detectorFactories[propertyKey];
                    if (detectorFactories) {
                        this[detectorsKey] = detectors = detectorFactories.reduce(
                            (all, factory) => all.concat(factory(this)),
                            []
                        );
                    }
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
