import { join } from 'path';
import { addSideEffect, addDefault, addNamed } from '@babel/helper-module-imports';
import { NamingRule } from 'constants/common';
import { isString, isFunction, isObject, isArray, isEmpty, isBlank, isNotBlank } from 'utils/common';
import * as helpers from 'helpers/string';

var { toLittleCamel, toBigCamel, toDash, toUnderline } = helpers;
var { LITTLE_CAMEL, BIG_CAMEL, DASH, UNDERLINE } = NamingRule;
var RuleHandler = {
    [LITTLE_CAMEL]: toLittleCamel,
    [BIG_CAMEL]: toBigCamel,
    [DASH]: toDash,
    [UNDERLINE]: toUnderline
};

function getPathDir(path = '') {
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

function buildNameByRule(importName, filename = '') {
    var newImportName;

    if (filename === null || filename === false) {
        return null;
    }

    if (isFunction(filename)) {
        newImportName = buildNameByRule(importName, filename(importName));   // 可能 function 返回 'little-camel'等规则
    } else if (isString(filename) && isNotBlank(filename)) {                        // 明确的命名
        filename = filename.trim();

        // 移除开头的 "/", 没有意义.
        // if (filename.startsWith('/')) {
        //     filename = filename.slice(1);
        // }
        // 根据4种规则 [xxx], 替换其中的字符
        // '[dash]/[little].js'.replace(/(\[[\-\w]+\])/g, (match, p1) => {
        newImportName = filename.replace(/(\[[\-\w]+\])/g, (match, p1) => {
            var component = p1;
            var mark = p1.slice(1, -1);
            var handler = RuleHandler[mark];
            // 判断是否在 4 种规则中
            if (handler) {
                component = handler(importName);
            } 
            return component;
        });
    } else {
        newImportName = importName;
    }

    return newImportName;
}

function joinPath(...args) {
    var paths = args.map(path => path || '');
    return join(...paths).replace(/\\/g, '/');
}

export default class Plugin {
    _options;
    types;
    removePaths;
    markIdentifiers;

    constructor({ types }) {
        this.types = types;
    }

    setOptions(options) {
        // default setting    
        this._options = Object.assign({
            library: null,
            // directory: null,
            filename: `[${NamingRule.BIG_CAMEL}]`,
            importDefault: true,
            style: false    // string, function, object, array
        }, options);
    }

    init() {
        this.removePaths = [];
        this.markIdentifiers = {};
    }
    
    cleanup() {
        this.removePaths.forEach((path) => path.remove());
    }

    destroy() {
        this._options = null;
        // 这两项设为空, 项目使用时会报缓存问题: api.cache(true).
        /* 
        this.types = null;
        this.replace = null;
            */
    }
    
    replaceIdentifierNodeName(node, path) {
        var nodeName = node.name;
        var newIdentifier = this.markIdentifiers[nodeName]; // { type: 'Identifier', name: '_default4' }
        
        if (newIdentifier 
            && path.scope.hasBinding(nodeName)
            && path.scope.getBinding(nodeName).path.type === 'ImportSpecifier') {   // 文件中可能有重复的变量名, 确保类型是 ImportSpecifier
            node.name = newIdentifier.name;
        }
    }

    getReplaceIdentifierNode(node) {
        var identifier;

        if (!node) {
            return;
        }

        switch (node.type) {
            case 'Identifier':
                identifier = node;
                break;
            case 'MemberExpression':
                identifier = this.getReplaceIdentifierNode(node.object);    
                break;
            case 'CallExpression':
                identifier = this.getReplaceIdentifierNode(node.callee);    
                break;
        }

        return identifier;
    }

    replaceIdentifier(node, path) {
        var identifierNode = this.getReplaceIdentifierNode(node);

        if (identifierNode) {
            this.replaceIdentifierNodeName(identifierNode, path);
        }
    }

    importStyle(style, directory, specifier, path) {
        let { filename } = style;
        let { library } = this._options;
        let { imported, local } = specifier;
        let styleRootPath = directory;      // style 路径默认使用 /library/directory
        let styleName = '';

        if ((isString(filename) && filename.startsWith('/'))
            || isEmpty(directory)) {   
            // '/less/component' > '/library/less/component'.
            styleRootPath = library;
        } 

        // 处理style的命名规则(folder or file)
        styleName = buildNameByRule(imported.name, filename);

        // 用户手动设置 null 表示不想添加
        if (styleName === null) {   
            return;
        }
       
        // 处理style的全路径
        let stylePath = joinPath(styleRootPath, styleName);
        // 添加 style 节点
        addSideEffect(path, stylePath);
    }

    // 根据大写字母开头的方法来筛选 Visitor
    getVisitor() {
        var visitor = {};
        var proto = Object.getPrototypeOf(this);

        Object.getOwnPropertyNames(proto).forEach((key) => {			
            var prop = this[key];
            if (key.match(/^[A-Z]/) && typeof prop === 'function') {
                // 注意: 这里把 this 指向了 Plugin 类的实例
                visitor[key] = prop.bind(this);
            }
        });	

        return visitor;
    }

    /* 
    TODO: getVisitors 扩展对象
    Program = {
        enter(path, { opts = {} }) {
            plugin.init(opts);
        },
        exit(path, { opts = {} }) {
            plugin && plugin.destroy();
        }
    } */

    /**
     * import React from 'react';
     * import { Steps, DatePicker } from 'antd';
     * import antd, { Button as B, Input } from 'antd';
     */     
    ImportDeclaration(path, state) {
        if (!path.node) {
            return;
        }

        var source = path.node.source.value;
        var { library, filename, importDefault, style } = this._options;
        
        if (source === library) {
            path.node.specifiers.forEach((specifier) => {
                if (this.types.isImportSpecifier(specifier)) {
                    var { imported, local } = specifier;
                    // 处理组件的命名规则(folder or file)
                    var componentName = buildNameByRule(imported.name, filename);

                    if (componentName === null) {   
                        return;
                    }
                    // 处理组件的全路径, /library/componentName
                    var componentPath = joinPath(library, componentName);
                    
                    var newImportDeclaration;
                    // 添加修改过路径的新 JS 节点
                    if (importDefault) {
                        newImportDeclaration = addDefault(path, componentPath);            // import defaultName from "source"
                    } else {
                        newImportDeclaration = addNamed(path, local.name, componentPath);  // import { named } from "source"
                    }
                    
                    // 保存需要替换的标识符 Identifier 名称, 注意: 可能会和其他地方的局部变量标识符重复, 确保path.type是ImportSpecifier
                    this.markIdentifiers[local.name] = newImportDeclaration;

                    // Handle Style Node --------------------------------------
                    // TODO: style 扩展为附件, 为对象或数组, 不特定为导入某个类型.
                    var componentDirectory = getPathDir(componentPath);
                    if (isArray(style)) {
                        style.forEach(styleOpts => this.importStyle(styleOpts, componentDirectory, specifier, path));
                    } else if (isObject(style)) {
                        this.importStyle(style, componentDirectory, specifier, path);
                    } else if (isString(style) || isFunction(style)) {
                        this.importStyle({ filename: style }, componentDirectory, specifier, path);
                    }
                }
            });
            this.removePaths.push(path);
        }
    }

    /** 
     *  {foo} in import {foo} from "mod" 
     *  {foo as bar} in import {foo as bar} from "mod" 
     */
    ImportSpecifier(path, state) {
    }

    /**
     * "foo" in import foo from 'mod'.
     */ 
    ImportDefaultSpecifier(path, state) {
    }

    /**
     * "* as foo" in import * as foo from 'mod'.
     */
    ImportNamespaceSpecifier(path, state) {
        
    }

    // 粒度太小, 使用更大级别的节点类型
    /* 
        dentifier(path, state) {}
     */

    // <Component></Component>
    JSXIdentifier(path, state) {
        // 替换JSX中使用到的标识符名称, 确保一致.
        this.replaceIdentifierNodeName(path.node, path);
    }

    MemberExpression(path, state) {
        // TODO: 
    }

    /* 
        var Form1 = Form;
        var Item = Form.Item; 
        var { Item } = Form; 
    */
    VariableDeclarator(path, state) {
        this.replaceIdentifier(path.node.init, path);
    }

    /*
        Form1 = Form;
        Item = Form.item;
     */ 
    ExpressionStatement(path, state) {
        // TODO: type = AssignmentExpression.right = Identifier | MemberExpression
    }

    AssignmentExpression(path, state) {
        this.replaceIdentifier(path.node.right, path);
    }

    CallExpression(path, state) {
        this.replaceIdentifier(path.node.callee, path);
    }

    ReturnStatement(path, state) {

    }
}

