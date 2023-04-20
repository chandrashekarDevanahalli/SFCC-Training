'use strict';

var Site = require('dw/system/Site');
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');


var run = function () {
    try {
        var ProductMgr = require('dw/catalog/ProductMgr');
        var File = require('dw/io/File');
        var FileWriter = require('dw/io/FileWriter');
        var CSVStreamWriter = require('dw/io/CSVStreamWriter');

        var file = new File(File.IMPEX + '/src/products/' + Site.getCurrent().getID() + '.csv');

        if (!file.exists()) {
            Logger.info('myAllProductsToCSV.js : File does not exists, create a new file');
            file.createNewFile();
        }

        var FileWriter = new FileWriter(file);
        var csvWriter = new CSVStreamWriter(FileWriter);

        csvWriter.writeNext('ProductID', 'Name', 'ATS');

        var allProducts = ProductMgr.queryAllSiteProducts();
        while (allProducts.hasNext()) {
            var productObj = allProducts.next();

            var id = productObj.ID;
            var  dd = productObj.getImage('small');
            var name = productObj.name;
            var price = productObj.priceModel.price;

            csvWriter.writeNext(id, name, ats, price);
        }

        Logger.info('myModulejob.js: flushing');
        FileWriter.flush();

        Logger.info('myModulejob.js: stream closing');
        csvWriter.close();

        Logger.info('myModulejob.js: closing the writer');
        FileWriter.close();


    } catch (e) {
        Logger.error('myModulejob.js: Error occured in the run function' + e.message);
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run = run;