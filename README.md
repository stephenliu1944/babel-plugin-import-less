# babel-plugin-import-less
This plugin is used for import module on demand loading.

README: [English](https://github.com/stephenliu1944/babel-plugin-import-less/blob/master/README.md) | [简体中文](https://github.com/stephenliu1944/babel-plugin-import-less/blob/master/README-zh_CN.md)

## Install
```
npm install -D babel-plugin-import-less
```

## Usage
### Use for lodash
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'lodash',
        module: '[little-camel]'
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

### Use for antd
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'antd',
        module: 'lib/[dash]',
        // import style
        style: 'style'              // use less style
        // or
        style: 'style/css'          // use css style
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

### Use for antd-mobile
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'antd-mobile',
        module: 'lib/[dash]',
        // import style
        style: 'style'              // use less style
        // or
        style: 'style/css'          // use css style
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

### Use for @material-ui/core
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: '@material-ui/core',
        module: '[big-camel]'
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

### Use for reactstrap
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'reactstrap',
        module: 'lib/[big-camel]'
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

### Use multiple plugins
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'lodash',
        module: '[little-camel]'
    }, 'lodash'],                   // need a plugin name
    ['babel-plugin-import-less', {
        library: 'antd',
        module: 'lib/[dash]',
        style: 'style'
    }, 'antd']                      // need a plugin name
];
```

## Template
The following substitutions are available in module and style template strings.
Template|Example
-|-
[little-camel] | componentName
[big-camel] | ComponentName
[dash] | component-name
[underline] | component_name

## Options
```js
{
    library,
    importDefault,
    module,
    style
}
```

### library
Library name. Suport String, required.  

### importDefault
Transform import type to default, false means addNamed. Boolean, default to true.  
```js
// true
import Button from 'antd/lib/button';
// false
import { Button } from 'antd/lib/button';
```

### module
Import module path. Suport string and function type, required.  
function return value also suport template string. return null or false won't import module.
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'xxx',
        module: name => `lib/${name === 'SCButton' ? 'scButton' : '[little-camel]'}`,
    }]
];
```

### style
Import style path with module. Suport string, function and array type.   
function return value also suport template string. return null or false won't import module.  
NOTE: if start with '/' then style path will append to library path otherwise append to module path.

style start with "/":
```js
['babel-plugin-import-less', {
    library: 'xxx',
    module: 'lib/[dash]',
    style: '/less/[little-camel]'
}]

import { DateTime } from 'xxx';
        ↓
var _button = require('xxx/lib/date-time');

require('antd/less/dateTime');
```

style to upper path:
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
