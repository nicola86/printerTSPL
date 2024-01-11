'use strict'
const Connection = require('./connection')
const Language = require('./Language')


function expand(source,target){
    Reflect.ownKeys(Object.getPrototypeOf(source)).forEach(k => {
        if (k === "constructor") return;
        Object.defineProperty(target, k, {
            enumerable: true,
            value: new Proxy(source[k], {
                apply(...[{ name: key }, , args]) {
                    if (key.startsWith("_")) {
                        return source[key](...args);
                    } else {
                        source[key](...args);
                        return target;
                    }
                }
            })
        });
    });
}
class PrinterOption {

    static Fields = {
        /**
         * tspl类或tspl类的配置文件
         */
        language: null,
        connection: null
    };

    constructor(option = {}) {
        const res = Object.create(null);
        const handleConfig = (k) => {
            return {
                language() {
                    if (!(option[k] instanceof Language))
                        throw new Error(`[ PrinterOption ] language 字段必须为Connection类型`);
                    else
                        return option[k];
                },
                connection() {
                    if (!(option[k] instanceof Connection))
                        throw new Error(`[ PrinterOption ] connection 字段必须为Language类型`);
                    else
                        return option[k];
                }
            }[k];
        };
        Reflect.ownKeys(PrinterOption.Fields).forEach(k => {
            Object.defineProperty(res, k, {
                configurable: true,
                value: handleConfig(k)()
            });
        });
        return res;
    }
}

class Printer {
    static Option = PrinterOption;

    #option = {};

    constructor(option = {}) {
        this.#option = new PrinterOption(option);
        expand(this.#option.language, this);
    }

    /**
     * 执行打印
     *
     * @return {Promise}
     * @public
     */
    print() {
        const source = this.#option.language._export();
        return this.#option.connection.write(source);
    }
}

// export default Printer;
module.exports=Printer