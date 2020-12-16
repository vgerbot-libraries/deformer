import Disposable from '../../src/Disposable';

describe('disposable', () => {
    it('Should all destroy function be called when destroying', () => {
        const hooks = [sinon.fake(), sinon.fake(), sinon.fake(), sinon.fake()];
        class MyDisposable extends Disposable {
            constructor() {
                super();
                this.addDestroyHook(...hooks);
            }
        }
        const disposable = new MyDisposable();
        hooks.forEach(hook => {
            expect(hook).to.be.not.called;
        });
        disposable.destroy();
        expect(hooks).is.not.empty;
        expect(disposable['hooks']).is.empty;
        hooks.forEach(hook => {
            expect(hook).to.be.calledOnce;
        });
    });
});
