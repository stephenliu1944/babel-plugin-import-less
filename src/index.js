import Plugin from './plugin';

export default function({ types }) {
    // 此 this 是 babel-plugin 环境
    var plugin = new Plugin({ types });

    return {
        pre() {
            plugin.setOptions(this.opts);
        },
        visitor: {
            Program: {
                enter(path, { opts }) {
                    plugin.init();          
                },
                exit(path, { opts }) {
                    plugin.cleanup();
                }
            },
            ...plugin.getVisitor()
        },
        post() {
            plugin.destroy();
        }
    };
}
