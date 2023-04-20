'use strict';

/**
 * Description of the module and the logic it provides
 * 
 * @module cartridge/scripts/jobs/myCsvToXmlJob
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

var run = function () {
    try {
        var SystemObjectMgr = require('dw/object/SystemObjectMgr');
        var File = require('dw/io/File');
        var FileWriter = require('dw/io/FileWriter');
        var XMLIndentingStreamWriter = require('dw/io/XMLIndentingStreamWriter');
        var CSVStreamReader = require('dw/io/CSVStreamReader');
        var Reader = require('dw/io/Reader');
        var FileReader = require('dw/io/FileReader');

        var file = new File(File.IMPEX + '/src/stores/storesData.csv')

        var read = new FileReader(file)

        var csvReader = new CSVStreamReader(read, ",").readAll();

        var xmlfile = new File(File.IMPEX + '/src/stores/targetFile.xml');
        if (!xmlfile.exists()) {
            Logger.info('myCsvToXmljob.js : File does not exists, create a new file');
            xmlfile.createNewFile();
        }
        var fileWriter = new FileWriter(xmlfile);
        var xsw = new XMLIndentingStreamWriter(fileWriter);

        xsw.writeStartDocument("UTF-8", "1.0");
        xsw.writeStartElement("stores");
        xsw.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/stores/2022-11-21");
        for (var i = 1; i < csvReader.length - 1; i++) {
            xsw.writeStartElement("store");
            xsw.writeAttribute("store-id", csvReader[i][0])
            xsw.writeStartElement("name");
            xsw.writeCharacters(csvReader[i][0]);
            xsw.writeEndElement();
            xsw.writeStartElement("address1");
            xsw.writeCharacters(csvReader[i][1]);
            xsw.writeEndElement();
            xsw.writeStartElement("postal-code");
            xsw.writeCharacters(csvReader[i][2]);
            xsw.writeEndElement();
            xsw.writeStartElement("country-code");
            xsw.writeCharacters(csvReader[i][3]);
            xsw.writeEndElement();
            xsw.writeEndElement();
        }
        xsw.writeEndElement();
        xsw.writeEndDocument();
        xsw.close();
        read.close();

        Logger.info('myCsvToXmlJob.js: flushing');
        fileWriter.flush();


        Logger.info('myCsvToXmlJob.js: closing the writer');
        fileWriter.close();


    } catch (e) {
        Logger.error('myCsvToXmljob.js: Error occured in the run function' + e.message);
        var err1 = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run = run;