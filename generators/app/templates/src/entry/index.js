/**
 * @webpack
 * @library example
 * @libraryTarget umd
 */

import 'normalize.css';
import './sass/index.scss';

if (process.env.NODE_ENV !== 'production') {
    require('../_index.html');
}
