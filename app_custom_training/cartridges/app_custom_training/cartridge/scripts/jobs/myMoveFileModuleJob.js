/**
 * Description of the module and the logic it provides
 * 
 * @module cartridge/scripts/jobs/myMoveFileModuleJob
 * @StepNames MyMoveFileJobCatalog , MyMoveFileInventory , MyMoveFileJobPriceBooks
 * @function run
 */
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

var run = function (args) {
    try {
        var File = require('dw/io/File');
        var folderName = args.folderName;
        var fileName = args.fileName;
        var file2 = new File(File.IMPEX + '/sftp/' + folderName).listFiles();
        let i = 0;
        while (i < file2.length) {
            if ((file2[i].name).includes(fileName)) {
                var file3 = new File(File.IMPEX + '/src/' + fileName + '/' + file2[i].name);
                var copy = file2[i].copyTo(file3)
            }
            i++;
        }
        Logger.info('MyMoveFileJob.js: files copied from products folder to upload folder');

    } catch (e) {
        Logger.error('MyMoveFileJob.js: Error occured in the run function' + e.message);
        var err2 = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run = run;