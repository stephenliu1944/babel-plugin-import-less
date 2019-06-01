import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import del from 'rollup-plugin-delete';
import alias from 'rollup-plugin-alias';

const BUILD_PATH = process.env.BUILD_PATH || 'build';
const NODE_ENV = process.env.NODE_ENV;
const isDEV = NODE_ENV === 'development';

export function rollupMerge(source1 = {}, source2 = {}) {
    var { plugins: p1 = [], ...args1 } = source1;
    var { plugins: p2 = [], ...args2 } = source2;

    var config = {
        ...args1,
        ...args2,
        plugins: [
            ...p1,
            ...p2
            // TODO 每个插件有一个name属性和Function(resolveId)属性, 可用来对比是否为同一个plugin
        ]
    };

    return config;
}

export default function(fileName) {
    return {
        input: `src/${ isDEV ? 'dev' : 'index' }.js`,
        // external: !isDEV && ['ms'],      // 打包时排除外部依赖包
        plugins: [
            del({
                targets: `${BUILD_PATH}/${ fileName || '*' }`
            }),
            alias({
                constants: 'src/constants',
                helpers: 'src/helpers',
                utils: 'src/utils'
            }),
            babel({
                exclude: 'node_modules/**' // only transpile our source code
            }),
            commonjs(
                // isDEV && {
                //     namedExports: {
                //         'node_modules/module/dist/index.umd.js': ['isString']
                //     }
                // }
            ), 
            eslint({
                fix: true,
                throwOnError: true,
                include: ['src/**/*.js'], 
                configFile: `.eslintrc${ isDEV ? '' : '.prod' }.json`
            }),
            // 全局变量
            replace({
                __DEV__: isDEV,
                'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
            })
        ]
    };
}