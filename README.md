# babel-plugin-import-less
This plugin is used for import file on demand loading.

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
        namingRule: 'little-camel'  // use lodash/xxXX
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
        directory: 'lib',           
        namingRule: 'dash',         // use ant/lib/xxx-xxx folder
        style: {                    // import style file
            directory: 'style',     
            namingRule: 'index',    // use ant/lib/xxx/style/index file
            ext: 'css'              // js, css or less are all supported.
        }
    }]
];
```

app.jsx
```js
import { Button } from 'antd';
ReactDOM.render(<Button>xxxx</Button>);
        ↓
require('antd/lib/button/style/index.css');
var _button = require('antd/lib/button');
ReactDOM.render(<_button>xxxx</_button>);
```

### Use for antd-mobile
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'antd-mobile',
        directory: 'lib',           
        namingRule: 'dash',         // use for ant/lib/xxx-xxx folder
        style: {                    
            directory: 'style',     
            namingRule: 'index',    // use for ant/lib/xxx/style/index file
            ext: 'css'              // js, css or less are all supported.
        }
    }]
];
```

app.jsx
```js
import { Button } from 'antd-mobile';
ReactDOM.render(<Button>xxxx</Button>);
        ↓
require('antd-mobile/lib/button/style/index.css');
var _button = require('antd-mobile/lib/button');
ReactDOM.render(<_button>xxxx</_button>);
```

### Use for @material-ui/core
babel.config.js
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: '@material-ui/core'
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
        directory: 'lib'
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
        library: '@material-ui/core'
    }, '@material-ui/core'],        // just add unique name
    ['babel-plugin-import-less', {
        library: 'reactstrap',
        directory: 'lib'
    }, 'reactstrap']                // just add unique name
];
```

### function namingRule
```js
var plugins = [
    ['babel-plugin-import-less', {
        library: 'reactstrap',
        directory: 'lib',
        namingRule: (name) => {
            return name === 'Button' ? name : 'dash';   // you can return 'little-camel', 'big-camel', 'dash' or 'underline' also.
        },
    }]
];
```

## Options
```js
{
    library,             
    directory,           
    namingRule,          
    importDefault,       
    style: {             
        directory,       
        namingRule,      
        ext              
    }
}
```

### library
String, this option is required.  
Set library name.

### directory
String, default to null.  
Set components directory.

### namingRule
'little-camel', 'big-camel', 'dash', 'underline' or custom function, default to 'big-camel'.  
Set component naming rule(folder or file).
```
'little-camel'  -> componentName
'big-camel'     -> ComponentName
'dash'          -> component-name
'underline'     -> component_name
function        -> name => newName
```

### importDefault
Boolean, default to true.  
Transform import type to default, false means addNamed.
```js
// true
import Button from 'antd/lib/button';
// false
import { Button } from 'antd/lib/button';
```

### style
Boolean or Object, default to false.  
Import related style file.
### style.directory
String, default to components directory.  
Set styles directory. if start with '/' then style.directory will append to library otherwise append to component folder.
### style.namingRule
'little-camel', 'big-camel', 'dash', 'underline', specific name(like 'index') or function, default to null.  
Set style naming rule(folder or file).
### style.ext
String, e.g. 'css', 'less', 'sass' or 'js', default to null.  
Set style file's extension. if this option is specific, then style.namingRule is files.

## FAQ
### Cannot read property 'path' of null
Question
```js
var identifierName = this.replace[path$$1.node.name];
                                       ^
TypeError: Cannot read property 'path' of null
```
Answer   
clean babel cache.

babel.config.js
```js
api.cache(false);   // set cache to false.
```

webpack.config.js
```js
rules: [{
    test: /\.(js|jsx)?$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                cacheDirectory: false       // set cacheDirectory to false.
            }
        }
    ]
}, {
    ...
}]
```