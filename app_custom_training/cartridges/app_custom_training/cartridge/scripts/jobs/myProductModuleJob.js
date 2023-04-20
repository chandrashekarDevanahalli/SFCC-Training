'use strict';
/**
 * Description of the module and the logic
 * 
 * @module cartridge/scripts/jobs/myProductModuleJob
 * @StepName MyProductsModuleJob
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');

var run1 = function () {
    try {
        var ProductMgr = require('dw/catalog/ProductMgr');
        var File = require('dw/io/File');
        var FileWriter = require('dw/io/FileWriter');
        var CSVStreamWriter = require('dw/io/CSVStreamWriter');

        var file = new File(File.IMPEX + '/src/products/' + Site.getCurrent().getID() + '.csv');

        if (!file.exists()) {
            Logger.info('myProductModule.js : File does not exists, create a new file');
            file.createNewFile();
        }

        var FileWriter = new FileWriter(file);
        var csvWriter = new CSVStreamWriter(FileWriter);

        csvWriter.writeNext('ProductID', 'Name', 'Availability', 'Price');

        var allProducts = ProductMgr.queryAllSiteProducts();
        while (allProducts.hasNext()) {
            var productObj = allProducts.next();
            if (pr)
                var id = productObj.ID;
            var name = productObj.name;
            var price = productObj.priceModel.price;
            var availability = productObj.availabilityModel.availabilityStatus;
            if (availability == 'NOT_AVAILABLE') {
                availability = 'OUT_OF_STOCK';
            }


            csvWriter.writeNext(id, name, availability, price);
        }

        Logger.info('myProductModule.js: flushing');
        FileWriter.flush();

        Logger.info('myProductModule.js: stream closing');
        csvWriter.close();

        Logger.info('myProductModule.js: closing the writer');
        FileWriter.close();

    } catch (e) {
        Logger.error('myProductModule.js: Error occured in the run function' + e.message);
        var err = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

/**
 * Description of the module and the logic it provides
 * 
 * @module cartridge/scripts/jobs/myProductModuleJob
 * @StepName MyProductsMoveModuleJob
 */
var run2 = function () {
    try {
        var File = require('dw/io/File');
        var file = new File(File.IMPEX + '/src/products/' + Site.getCurrent().getID() + '.csv');
        var file1 = new File(File.IMPEX + '/src/upload/' + Site.getCurrent().getID() + '.csv');


        var copy = file.copyTo(file1);
        Logger.info('MyProductsMoveModuleJob.js: files copied from products folder to upload folder');

        var remove = file.remove();
        Logger.info('MyProductsMoveModuleJob.js: files removed from product Folder');

    } catch (e) {
        Logger.error('MyProductsMoveModuleJob.js: Error occured in the run2 function' + e.message);
        var err2 = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run2 = run2;
module.exports.run1 = run1;