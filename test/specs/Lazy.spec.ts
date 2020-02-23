import { Lazy } from '../../src/foundation/lazy';
import { expect } from 'chai';
import sinon from 'sinon';

describe('lazy', () => {
    it('should lazy property reset on change(watch by field name)', () => {
        const lazy = new Lazy<A>();
        const initLazyPropertySpy = sinon.spy();
        const detectChangeSpy = sinon.spy();
        class A {
            @lazy.detectFieldChange((aa: A) => {
                detectChangeSpy(aa);
                return aa.prop;
            })
            @lazy.property((aa: A) => {
                initLazyPropertySpy(aa);
                return aa.prop;
            })
            public lazyPropA!: string;
            constructor(public prop: string) {}
            public clone() {
                const cloned = new A(this.prop);
                for (const key in this) {
                    try {
                        (cloned as any)[key] = this[key];
                    } catch (e) {
                        //
                    }
                }
                return cloned;
            }
        }
        const valueA = '123456789';
        const valueB = 'asdasdf';
        const a = new A(valueA);
        expect(a.lazyPropA).to.be.eql(valueA);
        expect(detectChangeSpy).to.have.been.calledOnce;
        expect(initLazyPropertySpy).to.have.been.calledOnce;
        expect(initLazyPropertySpy.firstCall.args[0]).to.be.eq(a);

        const b = new A('12313');
        b.prop = '';
        expect(b.lazyPropA).to.be.eql('');
        expect(detectChangeSpy).to.have.been.calledTwice;

        a.prop = valueB;
        expect(a.lazyPropA).to.be.eql(valueB);
        expect(detectChangeSpy).to.have.been.calledThrice;
        expect(initLazyPropertySpy).to.have.been.calledThrice;
    });
});
