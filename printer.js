'use strict'
const Printer = require('./printer/printer')
const Usb = require('./printer/usb')
const Tspl = require('./printer/tspl')
const { encode } = require('GBKCodec')

const labelPrint = async() =>{
    const print = new Printer({
        connection: new Usb,
        language: new Tspl({
            size: "40mm, 30mm",
            gap: "2mm, 0mm",
            encoder: encode
        })
    });
    await print.text(40, 10, '前端精湛掌握', 2, 'TSS24.BF2')
    await print.bar(5, 96, 560, 4)
    await print.print();
}

labelPrint().then()