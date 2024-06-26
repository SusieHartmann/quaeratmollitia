/* Модуль сжатия js-скриптов, css-стилей, html-файлов и
 * конвертации картинок в css-стилях 
 * в base64 и помещения их в файл стилей
 */
(function() {
    'use strict';
    
    var DIR         = __dirname +'/',
        LIBDIR      = DIR + 'lib/',
        os          = require('os'),
        main        = require(LIBDIR + 'main'),
        img         = main.require(LIBDIR + 'img'),
        mkdirp      = main.require('mkdirp'),
        platform    = process.platform,
        WIN32       = platform === 'win32',
        crypto      = main.crypto,
        fs          = main.fs,
        path        = main.path,
        Util        = main.util,
        
        TMPDIR, MinFolder;
    
    if (os.tmpdir) {
        TMPDIR      = os.tmpdir();
        MinFolder      = TMPDIR + '/minify/';
        
        if (!WIN32)
            MinFolder += process.getuid() + '/';
    } else {
        MinFolder   = DIR + '/min/';
    }
    
    /* Trying to create folder min
     * where woud be minifyed versions
     * of files 511(10)=777(8)
     * rwxrwxrwx
     */
    function makeDir(callback) {
        fs.exists(MinFolder, function(exist) {
            var func = Util.retExec(callback, null);
            
            Util.ifExec(exist || !mkdirp, func, function() {
                mkdirp(MinFolder, 511, callback);
            });
        });
    }
    
    /**
     * function minificate js,css and html files
     * 
     * @param files     -   js, css or html file path
     * @param options   -   object contain main options
     */
    function optimize(file, options) {
        makeDir(function(error) {
            var name, basename, msg,
                notLog  = options.notLog,
                isObj   = Util.isObject(file);
            
            if (error)
                log(error, notLog);
            
            if (isObj)
                name    = Object.keys(file)[0];
            else
                name    = file;
            
            basename    = path.basename(name);
            msg         ='minify: reading file ' + basename + '...';
            
            log(msg, notLog);
            
             fs.readFile(name, 'utf8', Util.bind(fileRead, {
                name            : name,
                optimizeParams  : file,
                options         : options,
                callback        : onDataRead
            }));
        });
    }
    
   /**
    * Processing of files
    * @param fileData {name, data}
    */
    function onDataRead(fileData, error, data) {
        var ext, minFileName, 
            readFilesCount  = 0,
            options         = fileData.options,
            notLog          = options.notLog,
            filename        = fileData.name,
            basename        = path.basename(filename);
        
        log('minify: file ' + basename + ' read', notLog);
        
        if (error) {
            options.callback(error);
        } else {
            ext         = Util.getExtension(filename);
            minFileName = getName(filename, ext);
                
            main.optimize({
                ext : ext,
                data: data
            }, function(error, data) {
                if (error)
                    Util.exec(options.callback, error);
                else
                    Util.ifExec(ext !== '.css', function(error, optimizedData) {
                        var ret = Util.isString(optimizedData);
                        
                        if (ret)
                            data    = optimizedData;
                        
                        ++readFilesCount;
                        
                        writeFile(minFileName, data, notLog, function(dataMin) {
                            if (options)
                                if (options.returnName)
                                     Util.exec(options.callback, null, {
                                         name: minFileName
                                     });
                                 else
                                    Util.exec(options.callback, null, dataMin);
                            });
                        }, function(callback) {
                            img.optimize(filename, data, callback);
                        });
                });
        }
    }
    
    /**
     * function get name of file in min folder
     * 
     * @param name
     * @param ext
     */
    function getName(name, ext) {
        var ret, minFileName;
        
        if (Util.isString(name)) {
            if (!ext)
                ext         = Util.getExtension(name);
            
            minFileName = crypto.createHash('sha1')
                .update(name)
                .digest('hex') + ext;
            
            ret = MinFolder + minFileName;
        }
        
        return ret;
    }
    
    function fileRead(params, error, data) {
        if (params)
            Util.exec(params.callback, params, error, data);
    }
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(name, data, notLog, callback) {
        fs.writeFile(name, data, function(error) {
            var basename = path.basename(name),
                msg = 'minify: file ' + basename + ' written...';
            
            log(error || msg, notLog);
            
            Util.exec(callback, data);
        });
    }
    
    function log(msg, notLog) {
        if (!notLog)
            Util.log(msg);
    }
    
    exports.getName     = getName;
    exports.optimize    = optimize;
    exports.MinFolder   = MinFolder;
    
})();
