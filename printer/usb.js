'use strict'
const {getDeviceList} = require('usb')
const Connection = require('./connection')
const PRINTER_TYPE = 0x07;

function promisify (fn){
    return (...args) => {
        return new Promise((resolve, reject) => {
            if (args.length !== fn.length - 1)
                reject(
                    new RangeError("[ promisify ]: 包装后传入的参数与原函数所需数量不符合！")
                );
            fn(...args, (...args) => {
                if (args[0]) {
                    reject(args[0]);
                } else {
                    resolve(...args.slice(1));
                }
            });
        });
    };
}
class USB extends Connection {
    #inpoint = null;
    #outpoint = null;

    constructor () {
        super();

        const device = getDeviceList().filter(d => {
            return d.configDescriptor.interfaces.filter(arr => {
                return arr.filter(inf => {
                    return inf.bInterfaceClass === PRINTER_TYPE;
                })[0];
            })[0];
        })[0];
        device.open();
        device.interfaces?.[0].claim();
        [ this.#inpoint, this.#outpoint ] = device.interfaces[0].endpoints.sort(endPoint => {
            return {
                "OutEndpoint": 1,
                "InEndpoint": -1
            }[Reflect.getPrototypeOf(endPoint).constructor.name];
        });
        this.#inpoint.on("data", chunk => {
            this._events.data(chunk);
        });
        this.#inpoint.on("error", err => {
            this._events.error(err);
        });
        this.#inpoint.startPoll();
    }

    /**
     * 数据写入
     *
     * @param {Uint8Array} buffer
     * @returns {Promise}
     * @override
     */
    write (buffer) {
        return promisify(this.#outpoint.transfer.bind(this.#outpoint))(buffer);
    }
}

module.exports = USB