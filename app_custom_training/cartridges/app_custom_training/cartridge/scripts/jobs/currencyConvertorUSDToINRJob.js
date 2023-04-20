'use strict';

/**
 * Description of the module and the logic it provides
 * 
 * @module cartridge/scripts/jobs/currencyConvertorUSDToINRJob
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Catalog = require('dw/catalog/Catalog');


var run = function () {
    try {
        var SystemObjectMgr = require('dw/object/SystemObjectMgr');
        var File = require('dw/io/File');
        var FileWriter = require('dw/io/FileWriter');
        var XMLStreamReader = require('dw/io/XMLStreamReader');
        var XMLIndentingStreamWriter = require('dw/io/XMLIndentingStreamWriter');
        var Reader = require('dw/io/Reader');
        var FileReader = require('dw/io/FileReader');
        var PriceBookMgr = require('dw/catalog/PriceBookMgr');
        var ProductMgr = require('dw/catalog/ProductMgr');
        var System = require('dw/system/System');


        var orgPrefs = System.getPreferences();
        var myOrgPrefValue = orgPrefs.getCustom()["currencyConvertorJSON"];
        var currencyConvertorObj = JSON.parse(myOrgPrefValue);

        for (var i = 0; i < currencyConvertorObj.length; i++) {

            var targetPriceBookId = currencyConvertorObj[i]["target-price-book-id"]
            var targetBookCurrency = currencyConvertorObj[i]["target-price-book-currency"]
            var sourcePriceBookId = currencyConvertorObj[i]["src-price-book-id"].toString();
            var targetPriceBookName = PriceBookMgr.getPriceBook(sourcePriceBookId).displayName;
            var exchangeRate = currencyConvertorObj[i]["exchange-rate"]

            //if file is not created create a new file
            var xmlfile = new File(File.IMPEX + '/src/priceBooks/' + targetPriceBookId + '.xml');
            if (!xmlfile.exists()) {
                Logger.info('currencyConvertorUSDToINRJob.js : File does not exists, create a new file');
                xmlfile.createNewFile();
            }
            var fileWriter = new FileWriter(xmlfile);
            var xsw = new XMLIndentingStreamWriter(fileWriter);


            //Start of writing XML document
            xsw.writeStartDocument("UTF-8", "1.0");
            xsw.writeStartElement("pricebooks");
            xsw.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/pricebook/2006-10-31");
            xsw.writeStartElement("pricebook");
            xsw.writeStartElement("header");
            xsw.writeAttribute("pricebook-id", targetPriceBookId)
            xsw.writeStartElement("currency");
            xsw.writeCharacters(targetBookCurrency);
            xsw.writeEndElement();
            xsw.writeStartElement("display-name");
            xsw.writeAttribute("xml:lang", "x-default");
            xsw.writeCharacters(targetPriceBookName);
            xsw.writeEndElement();
            xsw.writeStartElement("online-flag");
            xsw.writeCharacters(true);
            xsw.writeEndElement();
            if (targetPriceBookId) {
                xsw.writeStartElement("parent");
                xsw.writeCharacters(targetPriceBookId);
                xsw.writeEndElement();
            }
            xsw.writeEndElement();
            xsw.writeStartElement("price-tables");

            Logger.info("currencyConvertor : Iterating over all the objects")
            var allProducts = ProductMgr.queryAllSiteProducts();
            while (allProducts.hasNext()) {
                var productObj = allProducts.next();

                var productId = productObj.ID;
                var quantities = productObj.priceModel.priceTable.quantities;
                var a = typeof (quantities);
                var priceExists = productObj.priceModel.price.available;

                if (priceExists) {
                    if (quantities.length == 0) {
                        continue;
                    } else {
                        if (productObj.priceModel.getPriceBookPrice(sourcePriceBookId).available) {
                            if (quantities.length == 1) {
                                var price = productObj.priceModel.getPriceBookPrice(sourcePriceBookId)
                                var actualPrice = price * exchangeRate;
                                xsw.writeStartElement("price-table");
                                xsw.writeAttribute("product-id", productId)
                                xsw.writeStartElement("amount");
                                xsw.writeAttribute("quantity", "1");
                                xsw.writeCharacters(actualPrice);
                                xsw.writeEndElement();
                                xsw.writeEndElement();

                            } else {
                                xsw.writeStartElement("price-table");
                                xsw.writeAttribute("product-id", productId)
                                for (var j = 0; j < quantities.length; j++) {
                                    var price = productObj.priceModel.getPriceBookPricePerUnit(sourcePriceBookId,
                                        quantities[j]);
                                    var actualPrice = price * exchangeRate;
                                    xsw.writeStartElement("amount");
                                    xsw.writeAttribute("quantity", j + 1);
                                    xsw.writeCharacters(actualPrice);
                                    xsw.writeEndElement();
                                }
                                xsw.writeEndElement();
                            }
                        }
                    }
                }
            }
            xsw.writeEndElement();
            xsw.writeEndElement();
            xsw.writeEndElement();
            xsw.writeEndElement();
            xsw.writeEndDocument();
            xsw.close();
        }


        Logger.info('currencyConvertorUSDToINRJob.js: flushing');
        fileWriter.flush();


        Logger.info('currencyConvertorUSDToINRJob.js: closing the writer');
        fileWriter.close();


    } catch (e) {
        Logger.error('currencyConvertorUSDToINRJob.js: Error occured in the run function' + e.message);
        var err1 = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run = run;