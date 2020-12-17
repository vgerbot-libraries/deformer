import { expect } from 'chai';
import { DIRECTION_RIGHT } from 'hammerjs';
import BoxLimitator, { BoxLimiatorOptions } from '../../../../../src/editor/common/BoxLimitator';
import MoveController from '../../../../../src/editor/common/MoveController';
import ContourController, {
    DeformerHandler,
    DeformerHandlerResult,
    HandlingType
} from '../../../../../src/editor/ContourController';
import Deformer from '../../../../../src/editor/Deformer';
import DeformerRenderer from '../../../../../src/editor/DeformerRenderer';
import { Contour } from '../../../../../src/foundation/Contour';
import { Direction } from '../../../../../src/foundation/Direction';
import { DeviceCoordinate } from '../../../../../src/foundation/math/coordinate/DeviceCoordinate';
import { Vector } from '../../../../../src/foundation/math/vector';
import { Quadrilateral } from '../../../../../src/foundation/shapes/Quadrilateral';

describe('BoxLimitator', () => {
    it('[BoxLimitator] should the range of the option values be handled correctly', () => {
        const box1 = BoxLimitator.createStaticBox({});
        expect(box1.getLeft()).to.be.equal(-Infinity);
        expect(box1.getRight()).to.be.equal(Infinity);
        expect(box1.getTop()).to.be.equal(-Infinity);
        expect(box1.getBottom()).to.be.equal(Infinity);
        const options = {
            left: 'not a number',
            right: 12
        };
        const box2 = BoxLimitator.createStaticBox((options as unknown) as BoxLimiatorOptions);
        expect(box2.getLeft()).to.be.equal(-Infinity);
        expect(box2.getRight()).to.be.equal(12);

        const dom = document.createElement('div');
        dom.getBoundingClientRect = sinon.stub(dom, 'getBoundingClientRect').returns({
            left: 0,
            top: 0,
            right: 1920,
            bottom: 1080,
            x: 0,
            y: 0,
            height: 1080,
            width: 1920,
            toJSON() {
                return '';
            }
        });
        const box3 = BoxLimitator.createDynamicBoxByDOM(dom);
        expect(box3.getLeft()).to.be.equal(0);
        expect(box3.getRight()).to.be.equal(1920);
        expect(box3.getTop()).to.be.equal(0);
        expect(box3.getBottom()).to.be.equal(1080);
    });
    it('[StaticBoxLimitator] should the boundary not changed after called presetBox()', () => {
        const box = BoxLimitator.createStaticBox({});
        expect(box.getLeft()).to.be.equal(-Infinity);
        expect(box.getRight()).to.be.equal(Infinity);
        expect(box.getTop()).to.be.equal(-Infinity);
        expect(box.getBottom()).to.be.equal(Infinity);
        box.presetBox();
        expect(box.getLeft()).to.be.equal(-Infinity);
        expect(box.getRight()).to.be.equal(Infinity);
        expect(box.getTop()).to.be.equal(-Infinity);
        expect(box.getBottom()).to.be.equal(Infinity);
    });
    it('[DynamicDOMBoxLimitator] should the boundary changed after called presetBox()', () => {
        const dom = document.createElement('div');
        const rect = {
            left: 0,
            top: 0,
            right: 1920,
            bottom: 1080,
            x: 0,
            y: 0,
            height: 1080,
            width: 1920,
            toJSON() {
                return JSON.stringify(rect);
            }
        };
        const rect2 = Object.assign({}, rect, {
            left: 12,
            x: 12
        });
        dom.getBoundingClientRect = sinon.stub().returns(rect);
        const box = BoxLimitator.createDynamicBoxByDOM(dom);
        expect(box.getLeft()).to.be.equal(0);
        expect(box.getRight()).to.be.equal(1920);
        expect(box.getTop()).to.be.equal(0);
        expect(box.getBottom()).to.be.equal(1080);
        expect(dom.getBoundingClientRect).to.be.calledOnce;

        dom.getBoundingClientRect = sinon.stub().returns(rect2);
        rect2.left = 12;
        expect(box.getLeft()).to.be.equal(0);
        box.presetBox();
        expect(box.getLeft()).to.be.equal(12);
        expect(dom.getBoundingClientRect).to.be.calledOnce;
    });
    it('[BoxLimitator] should handleIt work correctly', () => {
        const fakeDeformer = {
            contour: {} as Contour
        } as Deformer<Contour>;
        class NotMoveabltController extends ContourController<Contour> {
            constructor() {
                super(fakeDeformer);
            }
            public deformerHandlers(): any {
                //
            }
            public handleMouseMove(): any {
                //
            }
            public render() {
                //
            }
        }
        class TestMoveableController extends MoveController<Contour> {
            constructor() {
                super(fakeDeformer);
            }
            protected handleMove(): DeformerHandlerResult<Vector> {
                throw new Error('Method not implemented.');
            }
            public supportLimitator(limitator: BoxLimitator) {
                return limitator === box;
            }
        }
        const box = BoxLimitator.createStaticBox({});
        expect(box.handleIt(new NotMoveabltController())).to.be.false;
        expect(box.handleIt(new TestMoveableController())).to.be.true;
    });
    it('[BoxLimitator] Should adjust() method work correctly', () => {
        const box = BoxLimitator.createStaticBox({
            left: 0,
            right: 120,
            top: 0,
            bottom: 120
        });
        const fakeDeformer = {
            contour: {} as Contour
        } as Deformer<Contour>;
        class TestMoveableController extends MoveController<Contour> {
            constructor() {
                super(fakeDeformer);
            }
            protected handleMove(): DeformerHandlerResult<Vector> {
                throw new Error('Method not implemented.');
            }
            public supportLimitator(limitator: BoxLimitator) {
                return limitator === box;
            }
        }
        {
            // 40 * 40
            const contour = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, 100, 140, 60, 100);
            const width = contour.getWidth();
            const result = box.adjust(
                contour,
                {
                    move: new Vector(40, 0),
                    direction: DIRECTION_RIGHT,
                    position: {
                        client: DeviceCoordinate.ORIGIN.origin,
                        page: DeviceCoordinate.ORIGIN.origin,
                        screen: DeviceCoordinate.ORIGIN.origin,
                        offset: DeviceCoordinate.ORIGIN.origin
                    }
                },
                new TestMoveableController()
            );
            expect(result).to.be.true;
            expect(contour.getLeftTop().toDevice().x).to.be.eq(box.getRight() - width);
            expect(contour.getRightTop().toDevice().x).to.be.eq(box.getRight());
            expect(contour.getLeftTop().toDevice().y).to.be.eq(60);
        }
        {
            // 40 * 40
            const contour = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, -20, 20, 60, 100);
            const result = box.adjust(
                contour,
                {
                    move: new Vector(-40, 0),
                    direction: DIRECTION_RIGHT,
                    position: {
                        client: DeviceCoordinate.ORIGIN.origin,
                        page: DeviceCoordinate.ORIGIN.origin,
                        screen: DeviceCoordinate.ORIGIN.origin,
                        offset: DeviceCoordinate.ORIGIN.origin
                    }
                },
                new TestMoveableController()
            );
            expect(result).to.be.true;
            expect(contour.getLeftTop().toDevice().x).to.be.eq(0);
            expect(contour.getRightTop().toDevice().x).to.be.eq(40);
            expect(contour.getLeftTop().toDevice().y).to.be.eq(60);
        }
        {
            // 40 * 40
            const contour = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, 0, 40, 100, 140);
            const height = contour.getHeight();
            const result = box.adjust(
                contour,
                {
                    move: new Vector(0, 40),
                    direction: DIRECTION_RIGHT,
                    position: {
                        client: DeviceCoordinate.ORIGIN.origin,
                        page: DeviceCoordinate.ORIGIN.origin,
                        screen: DeviceCoordinate.ORIGIN.origin,
                        offset: DeviceCoordinate.ORIGIN.origin
                    }
                },
                new TestMoveableController()
            );
            expect(result).to.be.true;
            expect(contour.getLeftTop().toDevice().y).to.be.eq(box.getBottom() - height);
            expect(contour.getLeftBottom().toDevice().y).to.be.eq(box.getBottom());
            expect(contour.getLeftTop().toDevice().x).to.be.eq(0);
        }
        {
            // 40 * 40
            const contour = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, 0, 40, -20, 20);
            const result = box.adjust(
                contour,
                {
                    move: new Vector(0, -40),
                    direction: DIRECTION_RIGHT,
                    position: {
                        client: DeviceCoordinate.ORIGIN.origin,
                        page: DeviceCoordinate.ORIGIN.origin,
                        screen: DeviceCoordinate.ORIGIN.origin,
                        offset: DeviceCoordinate.ORIGIN.origin
                    }
                },
                new TestMoveableController()
            );
            expect(result).to.be.true;
            expect(contour.getLeftTop().toDevice().y).to.be.eq(0);
            expect(contour.getLeftBottom().toDevice().y).to.be.eq(40);
            expect(contour.getLeftTop().toDevice().x).to.be.eq(0);
        }

        {
            class NotMoveabltController extends ContourController<Contour> {
                constructor() {
                    super(fakeDeformer);
                }
                public deformerHandlers(): any {
                    //
                }
                public handleMouseMove(): any {
                    //
                }
                public render() {
                    //
                }
            }
            const contour = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, 0, 40, -20, 20);
            const result = box.adjust(
                contour,
                {
                    move: new Vector(0, -40),
                    direction: DIRECTION_RIGHT,
                    position: {
                        client: DeviceCoordinate.ORIGIN.origin,
                        page: DeviceCoordinate.ORIGIN.origin,
                        screen: DeviceCoordinate.ORIGIN.origin,
                        offset: DeviceCoordinate.ORIGIN.origin
                    }
                },
                new NotMoveabltController()
            );
            expect(result).to.be.false;
            expect(contour.getLeftTop().toDevice().x).to.be.equal(0);
            expect(contour.getLeftTop().toDevice().y).to.be.equal(-20);
            expect(contour.getLeftBottom().toDevice().y).to.be.equal(20);
            expect(contour.getRightBottom().toDevice().x).to.be.equal(40);
        }
    });
    it('[BoxLimitator] Should accept() method work correctly', () => {
        const box = BoxLimitator.createStaticBox({
            left: 0,
            right: 120,
            top: 0,
            bottom: 120
        });
        const contour1 = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, 0, 40, 0, 40);
        const contour2 = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, 0, 40, -20, 20);
        const contour3 = Quadrilateral.fromCoordinate(DeviceCoordinate.ORIGIN, -20, 20, 0, 40);
        expect(box.accept(contour1)).to.be.true;
        expect(box.accept(contour2)).to.be.false;
        expect(box.accept(contour3)).to.be.false;
    });
});
