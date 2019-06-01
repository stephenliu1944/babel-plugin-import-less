import { join } from 'path';
import { addSideEffect, addDefault, addNamed } from '@babel/helper-module-imports';
import { NamingRule } from 'constants/common';
import { isString, isFunction, isNotBlank } from 'utils/common';
import * as helpers from 'helpers/string';

var { toLittleCamel, toBigCamel, toDash, toUnderline } = helpers;
var { LITTLE_CAMEL, BIG_CAMEL, DASH, UNDERLINE } = NamingRule;
var RuleHandler = {
    [LITTLE_CAMEL]: toLittleCamel,
    [BIG_CAMEL]: toBigCamel,
    [DASH]: toDash,
    [UNDERLINE]: toUnderline
};

function buildNameByRule(name, rule) {
    var ruleName;

    if (RuleHandler[rule]) {
        ruleName = RuleHandler[rule](name);
    } else if (isFunction(rule)) {
        ruleName = buildNameByRule(name, rule(name));   // 可能 function 返回 'little-camel'等规则
    } else if (isString(rule)) {                        // 明确的命名
        ruleName = rule.trim();
    } else {
        ruleName = name;
    }

    /*   switch (rule) {
        case NamingRule.LITTLE_CAMEL:   // 小驼峰
            name = toLittleCamel(name);
            break;
        case NamingRule.BIG_CAMEL:      // 大驼峰
            name = toBigCamel(name);
            break;
        case NamingRule.DASH:           // 中横线
            name = toDash(name);
            break;
        case NamingRule.UNDERLINE:     // 下划线
            name = toUnderline(name);
            break;
        default:
            if (isString(rule)) {       // specific name
                name = rule.trim();
            } else if (isFunction(rule)) {
                name = rule(name, helpers);
                if(){

                }
            }
    } */

    return ruleName;
}

function buildPath(...args) {
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
            directory: null,
            namingRule: NamingRule.BIG_CAMEL,
            importDefault: true,
            style: false
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
        var { library, directory, namingRule, importDefault, style } = this._options;
        
        if (source === library) {
            path.node.specifiers.forEach((specifier) => {
                if (this.types.isImportSpecifier(specifier)) {
                    var { imported, local } = specifier;
                    // 处理组件的命名规则(folder or file)
                    var componentName = buildNameByRule(imported.name, namingRule);
                    // 处理组件的全路径, /library/directory/componentName
                    var componentPath = buildPath(library, directory, componentName);
                    
                    var newImportDeclaration;
                    // 添加修改过路径的新 JS 节点
                    if (importDefault) {
                        newImportDeclaration = addDefault(path, componentPath);            // import hintedName from "source"
                    } else {
                        newImportDeclaration = addNamed(path, local.name, componentPath);  // import { named } from "source"
                    }
                    
                    // 保存需要替换的标识符 Identifier 名称, 注意: 可能会和其他地方的局部变量标识符重复, 确保path.type是ImportSpecifier
                    this.markIdentifiers[local.name] = newImportDeclaration;

                    // handle style node
                    if (style) {
                        let { directory: _directory, namingRule: _namingRule, ext } = style;
                        // style 路径默认使用 /library/directory
                        let styleDirectory = buildPath(library, directory);     // set default directory
                        let styleName = '';
                        let extension = '';

                        if (_directory) {
                            if (_directory.startsWith('/')) {   
                                // 从根路径开始设置样式路径, 说明样式文件保存在和组件不同的目录, 如: '/less/component' to '/library/less/component'.
                                styleDirectory = buildPath(library, _directory);
                            } else {                            
                                // 在 componentPath 后追加路径, 说明样式文件保存在组件下的目录, 如: 'style' to '/library/directory/componentName/style'.
                                styleDirectory = buildPath(componentPath, _directory);
                            }
                        } 
                        
                        if (_namingRule) {
                            // 处理style的命名规则(folder or file)
                            styleName = buildNameByRule(imported.name, _namingRule);
                        } 

                        if (isNotBlank(ext)) {
                            extension = ext.trim().startsWith('.') ? ext : '.' + ext;
                        } 
                        // 处理style的全路径
                        let stylePath = buildPath(styleDirectory, styleName + extension);
                        // 添加 style 节点
                        addSideEffect(path, stylePath);
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

