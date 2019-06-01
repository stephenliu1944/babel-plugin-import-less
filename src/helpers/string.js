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