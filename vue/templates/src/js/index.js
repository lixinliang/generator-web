import 'normalize.css';
import './sass/index.scss';
import app from './app.vue';

if (process.env.NODE_ENV !== 'production') {
    require('../_index.html');
}

Vue.use(Vuex);

new Vue({
    render : ( createElement ) => createElement(app),
}).$mount('app');

setTimeout(() => {
    require.ensure(['./test.vue'], () => {
        const test = require('./test.vue');
        new Vue(test).$mount('test');
    }, 'test')
}, 2000);
