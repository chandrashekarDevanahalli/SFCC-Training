'use strict';

/**
 * Description of the module and the logic it provides
 * 
 * @module cartridge/scripts/jobs/myOrderModuleJob
 */


var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

var run = function () {
    try {
        var SystemObjectMgr = require('dw/object/SystemObjectMgr');
        var File = require('dw/io/File');
        var FileWriter = require('dw/io/FileWriter');
        var CSVStreamWriter = require('dw/io/CSVStreamWriter');

        //var file1 = new File(File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + 'orders' + File.SEPARATOR + 'orders.csvs');
        var file = new File(File.IMPEX + '/src/orders/orders.csv')

        if (!file.exists()) {
            Logger.info('myOrderModulejob.js : File does not exists, create a new file');
            file.createNewFile();
        }

        var FileWriter = new FileWriter(file);
        var csvWriter = new CSVStreamWriter(FileWriter);

        csvWriter.writeNext("Order No", "Billing First Name",
            "Billing Last Name", "Sub Total", " Tax", "Shipping Cost", "Order Total");

        var orderList = SystemObjectMgr.getAllSystemObjects("Order");
        while (orderList.hasNext()) {
            var orderObj = orderList.next();
            var orderNo = orderObj.orderNo;
            var billingFirstName = orderObj.billingAddress.firstName;
            var billingLastName = orderObj.billingAddress.lastName;
            var subTotal = orderObj.merchandizeTotalGrossPrice.value;
            var Tax = orderObj.shippingTotalTax.value;
            var shippingCost = orderObj.shippingTotalPrice.value;
            var orderTotal = orderObj.totalGrossPrice.value;

            csvWriter.writeNext(orderNo, billingFirstName, billingLastName,
                subTotal, Tax, shippingCost, orderTotal);
        }

        Logger.info('myOrderModuleJob.js: flushing');
        FileWriter.flush();

        Logger.info('myOrderModuleJob.js: stream closing');
        csvWriter.close();

        Logger.info('myOrderModuleJob.js: closing the writer');
        FileWriter.close();


    } catch (e) {
        Logger.error('myModuleOrderjob.js: Error occured in the run function' + e.message);
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run = run;