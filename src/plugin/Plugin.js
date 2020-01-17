import { addSideEffect, addDefault, addNamed } from '@babel/helper-module-imports';
import { NamingRule } from 'constants/common';
import { buildImportNameByRule } from 'helpers/string';
import { getPathDir, joinPath } from 'utils/path';
import { isString, isFunction, isArray, isEmpty } from 'utils/common';

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

    // 递归查找指定节点下的Identifier
    searchIdentifier(node) {
        if (!node) {
            return;
        }

        var identifier;

        switch (node.type) {
            case 'Identifier':
            case 'JSXIdentifier':
                identifier = node;
                break;
            case 'MemberExpression':
                identifier = this.searchIdentifier(node.object);    
                break;
            case 'CallExpression':
                identifier = this.searchIdentifier(node.callee);    
                break;
        }

        return identifier;
    }

    replaceIdentifier(node, path) {
        var identifierNode = this.searchIdentifier(node);

        if (identifierNode) {
            this.replaceIdentifierName(identifierNode, path);
        }
    }

    replaceIdentifierName(node, path) {
        var nodeName = node.name;
        var newIdentifier = this.markIdentifiers[nodeName]; // { type: 'Identifier', name: '_default4' }
        
        if (newIdentifier 
            && path.scope.hasBinding(nodeName)
            && path.scope.getBinding(nodeName).path.type === 'ImportSpecifier') {   // 文件中可能有重复的变量名, 确保类型是 ImportSpecifier
            node.name = newIdentifier.name;
        }
    }

    importStyle(style, directory, specifier, path) {
        if (isString(style) || isFunction(style)) {
            let filename = style;
            let { library } = this._options;
            let { imported, local } = specifier;
            let styleName = '';
            let styleRootPath;
    
            // 处理 style 的命名规则(folder or file)
            styleName = buildImportNameByRule(imported.name, filename);
    
            // 用户手动设置 null 表示不想添加
            if (styleName === null) {   
                return;
            // 如果 filename 以 '/' 开头, 默认根路径使用 /library/
            } else if (styleName.startsWith('/') || isEmpty(directory)) {               
                styleRootPath = library;
            // style 默认根路径使用 /library/component/
            } else {
                styleRootPath = directory;      
            }
           
            // 处理style的全路径
            let stylePath = joinPath(styleRootPath, styleName);
            // 添加 style 节点
            addSideEffect(path, stylePath);
        } else if (isArray(style)) {
            style.forEach(styleOpts => this.importStyle(styleOpts, directory, specifier, path));
        }
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

    // ---------------------------------------以下皆为 Visitor 方法---------------------------------------
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
        var { library, importDefault, module, style } = this._options;
        
        if (source === library) {
            path.node.specifiers.forEach((specifier) => {
                if (this.types.isImportSpecifier(specifier)) {
                    var { imported, local } = specifier;
                    // 处理组件的命名规则(folder or file)
                    var componentName = buildImportNameByRule(imported.name, module);

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

                    // ------------------Handle Style Node ---------------------------
                    // TODO: style 扩展为附件, 为对象或数组, 不特定为导入某个类型.
                    var componentDir = getPathDir(componentPath);
                    this.importStyle(style, componentDir, specifier, path);
                }
            });
            this.removePaths.push(path);
        }
    }

    /** 
     *  {foo} in import {foo} from "mod" 
     *  {foo as bar} in import {foo as bar} from "mod" 
     */
    // ImportSpecifier(path, state) {}

    /**
     * "foo" in import foo from 'mod'.
     */ 
    // ImportDefaultSpecifier(path, state) {}

    /**
     * "* as foo" in import * as foo from 'mod'.
     */
    // ImportNamespaceSpecifier(path, state) {}

    // 粒度太小, 应该使用更大级别的节点类型
    // Identifier(path, state) {}
   
    // MemberExpression(path, state) {}

    /*
        <Component></Component>
    */ 
    JSXIdentifier(path, state) {
        // 替换JSX中使用到的标识符名称, 确保一致.
        this.replaceIdentifier(path.node, path);
    }

    /*
        {}括号包含的内容
        <Component item={Form.Item}></Component>
    */ 
    JSXExpressionContainer(path, state) {
        this.replaceIdentifier(path.node.expression, path);
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

    // ReturnStatement(path, state) {}
}

