/**
 * Description of the module and the logic it provides
 * 
 * @module cartridge/scripts/jobs/myCopyModuleJob
 * @StepName MyCopyModuleJob
 * @function run
 */
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

var run = function (args) {
    try {
        var File = require('dw/io/File');
        var folderName = args.folderName;
        var fileName = args.fileName;
        var file = new File(File.IMPEX + '/sftp/' + folderName + File.SEPARATOR + fileName + '.xml');
        var file1 = new File(File.IMPEX + '/src/' + folderName + File.SEPARATOR + fileName + '.xml');
        var copy = file.copyTo(file1);
        Logger.info('MyCopyModuleJob.js: files copied from products folder to upload folder');

        //var remove = file.remove();
        //Logger.info('MyCopyModuleJob.js: files removed from product Folder');

    } catch (e) {
        Logger.error('MyCopyModuleJob.js: Error occured in the run function' + e.message);
        var err2 = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run = run;