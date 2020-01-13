# babel-plugin-import-less
该插件用于按需引入模块依赖, 减少不必要的代码.

README: [English](https://github.com/stephenliu1944/babel-plugin-import-less/blob/master/README.md) | [简体中文](https://github.com/stephenliu1944/babel-plugin-import-less/blob/master/README-zh_CN.md)

## 特性
- 灵活匹配模块和样式的引用路径
- 提供四种常用匹配规则
- 动态匹配路径

## 安装
```
npm install -D babel-plugin-import-less
```

## 示例
### 用于 lodash
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'lodash',
        module: '[little-camel]'    // 模块命名规则为小驼峰. 按需引入 lodash/ 路径下以小驼峰规则命名的js文件.
    }]
];
```

app.js
```js
import { indexOf } from 'lodash';
indexOf([1, 2, 3], 2);
        ↓
var _indexOf = require('lodash/indexOf');
_indexOf([1, 2, 3], 2);
```

### 用于 antd
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'antd',
        module: 'lib/[dash]',       // 按需引入 antd/lib/ 路径下以中横线规则命名的js文件.
        // import style
        style: 'style'              // 使用 less 样式(用于项目需要自定义主题), 按需引入 antd/lib/模块名/style/ 路径下的 index.js 文件.
        // or
        style: 'style/css'          // 使用 css 样式, 按需引入 antd/lib/模块名/style/ 路径下的 css.js 文件.
    }]
];
```

app.jsx
```js
import { Button } from 'antd';
ReactDOM.render(<Button>xxxx</Button>);
        ↓
var _button = require('antd/lib/button');
require('antd/lib/button/style');               // import less style
// or
require('antd/lib/button/style/css');           // import css style
ReactDOM.render(<_button>xxxx</_button>);
```

### 用于 antd-mobile
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'antd-mobile',
        module: 'lib/[dash]',       // 按需引入 antd-mobile/lib/ 路径下以中横线规则命名的js文件.
        // import style
        style: 'style'              // 使用 less 样式(用于项目需要自定义主题), 同上.
        // or
        style: 'style/css'          // 使用 css 样式, 同上.
    }]
];
```

app.jsx
```js
import { Button } from 'antd-mobile';
ReactDOM.render(<Button>xxxx</Button>);
        ↓
var _button = require('antd-mobile/lib/button');
require('antd-mobile/lib/button/style');            // import less style
// or
require('antd-mobile/lib/button/style/css');        // import css style
ReactDOM.render(<_button>xxxx</_button>);
```

### 用于 @material-ui/core
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: '@material-ui/core',
        module: '[big-camel]'                       // 按需引入 @material-ui/core/ 路径下以大驼峰规则命名的js文件.
    }]
];
```
app.jsx
```js
import { Button } from '@material-ui/core';
ReactDOM.render(<Button>xxxx</Button>);
        ↓
var _button = require('@material-ui/core/Button');
ReactDOM.render(<_button>xxxx</_button>);
```

### 用于 reactstrap
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'reactstrap',
        module: 'lib/[big-camel]'                   // 按需引入 reactstrap/lib 路径下以大驼峰规则命名的js文件.
    }]
];
```

app.jsx
```js
import { Button } from 'reactstrap';
ReactDOM.render(<Button>xxxx</Button>);
        ↓
var _button = require('reactstrap/lib/Button');
ReactDOM.render(<_button>xxxx</_button>);
```

### 用于多个模块
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'lodash',
        module: '[little-camel]'
    }, 'lodash'],                               // 需要为插件取一个名字, 'lodash'
    ['babel-plugin-import-less', {
        library: 'antd',
        module: 'lib/[dash]',
        style: 'style'
    }, 'antd']                                  // 需要为插件取一个名字, 'antd'
];
```

## 模板
下列的命名规则模板适用于module和style查找, 并且支持出现在自定义命名规则的返回值中.  

|命名规则|示例|说明|
|-|-|-|
|[little-camel]|componentName|小驼峰|
|[big-camel]|ComponentName|大驼峰|
|[dash]|component-name|中横线|
|[underline]|component_name|下划线|

## 配置项
```js
{
    library,
    importDefault,
    module,
    style
}
```

### library
引入的JS库名称, string类型, 必填.  

### importDefault
按需引入模块时是否以 default 方式引入, boolean类型, 默认true.
```js
// true
import Button from 'antd/lib/button';
// false
import { Button } from 'antd/lib/button';
```

### module
按需引入的模块(以 node_modules/library/ 为根路径), 支持string和function类型, 必填.  
function 的返回值必须是一个 string 类型, 返回值中包含字符串模板同样被支持, 返回 null 或 false 不会引入指定模块.
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'xxx',
        module: name => `lib/${name === 'MyButton' ? 'myButton' : '[little-camel]'}`,
    }]
];
```

### style
按需引入的模块样式(默认以 "node_modules/library/module/" 为根路径), 支持string, function, array类型, 必填.  
function 类型的返回值必须是一个 string 类型, 返回值中包含字符串模板同样被支持, 返回 null 或 false 不会引入指定样式.  
array 类型会引入多个文件.  
注意: 如果以 '/' 开头, 则样式以 "node_modules/library/" 为根路径引入.  

从 node_modules/library/ 路径引入:
```js
['babel-plugin-import-less', {
    library: 'xxx',
    module: 'lib/[dash]',
    style: '/less/[little-camel]'
}]

import { DateTime } from 'xxx';
        ↓
var _button = require('xxx/lib/date-time');
// style option start with "/"
require('antd/less/dateTime');
```

从 node_modules/xxx/lib/module-name 的上层路径引入:
```js
['babel-plugin-import-less', {
    library: 'xxx',
    module: 'lib/[dash]',
    style: '../less/[little-camel]'
}]

import { DateTime } from 'xxx';
        ↓
var _button = require('xxx/lib/date-time');
require('xxx/lib/less/dateTime');
```
