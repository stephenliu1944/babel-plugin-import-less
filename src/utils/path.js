import { join } from 'path';

export function getPathDir(path = '') {
    // 解析这 6 种 URL:
    // 'xxx'
    // '/xxx'
    // 'xxx/'
    // '/xxx/'
    // '/xxx/xxx'
    // 'xxx.js'
    // '/xxx.js'
    // 'xxx/xxx.js'
    // '/xxx/xxx.js'
    // 替换掉 '/xxx.js' 部分
    return path.replace(/(\/?[_\w]+\.\w+)$/, '');
}

export function joinPath(...args) {
    var paths = args.map(path => path || '');
    return join(...paths).replace(/\\/g, '/');
}