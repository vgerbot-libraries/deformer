import { Lazy } from '../../src/foundation/lazy';
import { expect } from 'chai';

describe('lazy', () => {
    it('should lazy property reset on change(watch by field name)', () => {
        const lazy = new Lazy<A>();
        class A {
            @lazy.resetOnChange('prop')
            @lazy.property((aa: A) => {
                return aa.prop;
            })
            public lazyPropA!: string;
            constructor(public prop: string) {}
        }
        const valueA = '123456789';
        const valueB = 'asdasdf';
        const a = new A(valueA);
        expect(a.lazyPropA).to.be.eql(valueA);
        a.prop = valueB;
        expect(a.lazyPropA).to.be.eql(valueB);
        const b = new A('12313');
        b.prop = '';
        expect(a.lazyPropA).to.be.eql(valueB);
    });
    it('should reset on', () => {
        //
    });
});
