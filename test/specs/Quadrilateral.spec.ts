import { Quadrilateral } from '../../src/foundation/Quadrilateral';
import { DeviceCoordinate } from '../../src/foundation/math/coordinate/DeviceCoordinate';

describe('Quadrilateral', function() {
    it('', function() {
        Quadrilateral.fromCoordinate(
            new DeviceCoordinate(0, 0),
            0, // left
            10, // right
            0, // top
            10 // bottom
        );
    });
});
