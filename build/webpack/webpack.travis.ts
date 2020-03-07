import { configChain } from './webpack.test';

configChain.devtool('nosources-source-map');

configChain.externals(['chai', 'sinon', 'sinon-chai']);

export default configChain.toConfig();
