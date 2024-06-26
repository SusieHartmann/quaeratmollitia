(function() {
    'strict mode';
    
    global.minify = {};
    
    var DIR,
        LIBDIR,
        
        path,
        Util;
    
    /* Constants */
    exports.LIBDIR      = LIBDIR    = __dirname + '/',
    exports.DIR         = DIR       = LIBDIR + '../',
    
    /* Functions */
    exports.require                 = mrequire,
    exports.librequire              = librequire,
    exports.rootrequire             = rootrequire,
    
    /* Native Modules*/
    exports.crypto                  = require('crypto'),
    exports.fs                      = require('fs'),
    exports.path    = path          = require('path'),
    /* compitability with old versions of node */
    exports.fs.exists               = exports.fs.exists || exports.path.exists;
    
    exports.optimize                = optimize,
    
    /* Needed Modules */
    exports.util    = Util          = require('util.io');
    exports.mainpackage             = rootrequire('package');
    
    Util.getExtension               = path.extname;
    
    global.minify.main = exports;
    
    var html        = librequire('html'),
        js          = librequire('js'),
        css         = librequire('css');
    
    function optimize(params, callback) {
        var ret    = Util.checkObjTrue(params, ['ext', 'data']),
            p       = params;
        
        if (ret)
            switch(p.ext) {
                case '.js': 
                    js._uglifyJS(p.data, callback);
                    break;
                
                case '.html':
                    html.htmlMinify(p.data, callback);
                    break;
                
                case '.css':
                    css._cleanCSS(p.data, callback);
                    break;
            }
    }
    
    
    /**
     * function do safe require of needed module
     * @param {Strin} pSrc
     */
    function mrequire(pSrc) {
        var lModule,
        
        lError = Util.tryCatch(function() {
            lModule = require(pSrc);
        });
        
        if(lError)
            Util.log(lError);
        
        return lModule;
    }
    
    function rootrequire(pSrc) { return mrequire(DIR + pSrc); }
    
    function librequire(pSrc) { return mrequire(LIBDIR + pSrc); }
    
})();
