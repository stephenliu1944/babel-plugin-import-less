import { join } from 'path';

it('path', () => {
    console.log('xxx aaa: ', join('xxx', 'aaa', '../bbb'));
    console.log('/xxx aaa ', join('/xxx', 'aaa'));
    console.log('/xxx/ aaa: ', join('/xxx/', 'aaa'));
    console.log('/xxx/ /aaa: ', join('/xxx/', '/aaa'));
    console.log('/xxx /aaa: ', join('/xxx/bbb', './aaa'));
    console.log('/xxx /aaa/: ', join('/xxx/bbb/', './aaa/'));
});