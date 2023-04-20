'use strict';
/**
 * Description of the module and the logic
 * 
 * @module cartridge/scripts/jobs/myAllProductsToCSVJob
 * @StepName MyProductsModuleJob
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Result = require('dw/svc/Result');


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
            var good = '1'
            var svc = LocalServiceRegistry.createService('app_custom_training.http.allsiteproducts.get', {
                createRequest: function (svc, params) {
                    svc = svc.setRequestMethod('GET');
                    var url = svc.getURL();
                    url += '?pid=' + params.pid;
                    svc = svc.setURL(url);
                    return "";
                },
                parseResponse: function (svc, responseObject) {
                    return responseObject;
                }
            });
            var productObj = allProducts.next();
            var pid = productObj.ID;
            var result = svc.call({
                pid: pid
            });
            var resultObj = JSON.parse(result.object.text)
            var ATS = resultObj.ATS;
            var id = productObj.ID;
            var name = productObj.name;
            csvWriter.writeNext(id, name, ATS);
        }

        Logger.info('myAllProductsToCSV.js: flushing');
        FileWriter.flush();

        Logger.info('myAllProductsToCSV.js: stream closing');
        csvWriter.close();

        Logger.info('myAllProductsToCSV.js: closing the writer');
        FileWriter.close();

    } catch (e) {
        Logger.error('myAllProductsToCSV.js: Error occured in the run function' + e.message);
        var err = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};


module.exports.run = run;