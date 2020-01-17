import { NamingRule } from 'constants/common';
import { isString, isFunction, isNotBlank } from 'utils/common';

export function toLittleCamel(str = '') {
    return str.replace(/^[A-Z]/, (match) => match.toLowerCase());
}

export function toBigCamel(str = '') {
    return str.replace(/^[a-z]/, (match) => match.toUpperCase());
}

export function toDash(str = '') {
    return str.replace(/[A-Z]/g, (match, offset) => {	    
        var _str = match.toLowerCase();
        return offset > 0 ? '-' + _str : _str;
    });
}
  
export function toUnderline(str = '') {
    return str.replace(/[A-Z]/g, (match, offset) => {	    
        var _str = match.toLowerCase();
        return offset > 0 ? '_' + _str : _str;
    });
}

export function buildImportNameByRule(importName, module = '') {
    var newImportName;

    if (module === null || module === false) {
        return null;
    }

    if (isFunction(module)) {
        newImportName = buildImportNameByRule(importName, module(importName));   // 可能 function 返回 'little-camel'等规则
    } else if (isString(module) && isNotBlank(module)) {                        // 明确的命名
        module = module.trim();

        // 移除开头的 "/", 没有意义.
        // if (filename.startsWith('/')) {
        //     filename = filename.slice(1);
        // }
        // 根据4种规则 [xxx], 替换其中的字符
        // '[dash]/[little].js'.replace(/(\[[\-\w]+\])/g, (match, p1) => {
        newImportName = module.replace(/(\[[\-\w]+\])/gi, (match, p1) => {
            var component = p1;
            var mark = p1.slice(1, -1);
            var handler;

            switch (mark) {
                case NamingRule.LITTLE_CAMEL:
                    handler = toLittleCamel;
                    break;
                case NamingRule.BIG_CAMEL:
                    handler = toBigCamel;
                    break;
                case NamingRule.DASH:
                    handler = toDash;
                    break;
                case NamingRule.UNDERLINE:
                    handler = toUnderline;
                    break;
            }

            // 判断是否在 4 种规则中, 没有默认值了
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