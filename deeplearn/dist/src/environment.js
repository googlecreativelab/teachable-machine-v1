"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var device_util = require("./device_util");
var util = require("./util");
var Type;
(function (Type) {
    Type[Type["NUMBER"] = 0] = "NUMBER";
    Type[Type["BOOLEAN"] = 1] = "BOOLEAN";
})(Type = exports.Type || (exports.Type = {}));
exports.URL_PROPERTIES = [
    { name: 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED', type: Type.BOOLEAN },
    { name: 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE', type: Type.BOOLEAN },
    { name: 'WEBGL_VERSION', type: Type.NUMBER },
    { name: 'WEBGL_FLOAT_TEXTURE_ENABLED', type: Type.BOOLEAN }
];
function getWebGLRenderingContext(webGLVersion) {
    if (webGLVersion === 0) {
        throw new Error('Cannot get WebGL rendering context, WebGL is disabled.');
    }
    var tempCanvas = document.createElement('canvas');
    if (webGLVersion === 1) {
        return (tempCanvas.getContext('webgl') ||
            tempCanvas.getContext('experimental-webgl'));
    }
    return tempCanvas.getContext('webgl2');
}
function loseContext(gl) {
    if (gl != null) {
        var loseContextExtension = gl.getExtension('WEBGL_lose_context');
        if (loseContextExtension == null) {
            throw new Error('Extension WEBGL_lose_context not supported on this browser.');
        }
        loseContextExtension.loseContext();
    }
}
function isWebGLVersionEnabled(webGLVersion) {
    var gl = getWebGLRenderingContext(webGLVersion);
    if (gl != null) {
        loseContext(gl);
        return true;
    }
    return false;
}
function isWebGLDisjointQueryTimerEnabled(webGLVersion) {
    var gl = getWebGLRenderingContext(webGLVersion);
    var extensionName = webGLVersion === 1 ? 'EXT_disjoint_timer_query' :
        'EXT_disjoint_timer_query_webgl2';
    var ext = gl.getExtension(extensionName);
    var isExtEnabled = ext != null;
    if (gl != null) {
        loseContext(gl);
    }
    return isExtEnabled;
}
function isFloatTextureReadPixelsEnabled(webGLVersion) {
    if (webGLVersion === 0) {
        return false;
    }
    if (webGLVersion === 2) {
        return true;
    }
    var gl = getWebGLRenderingContext(webGLVersion);
    gl.getExtension('OES_texture_float');
    gl.getExtension('WEBGL_color_buffer_float');
    var frameBuffer = gl.createFramebuffer();
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    var frameBufferComplete = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);
    loseContext(gl);
    return frameBufferComplete;
}
var Environment = (function () {
    function Environment(features) {
        this.features = {};
        if (features != null) {
            this.features = features;
        }
    }
    Environment.prototype.get = function (feature) {
        if (feature in this.features) {
            return this.features[feature];
        }
        this.features[feature] = this.evaluateFeature(feature);
        return this.features[feature];
    };
    Environment.prototype.evaluateFeature = function (feature) {
        if (feature === 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED') {
            var webGLVersion = this.get('WEBGL_VERSION');
            if (webGLVersion === 0) {
                return false;
            }
            return isWebGLDisjointQueryTimerEnabled(webGLVersion);
        }
        else if (feature === 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE') {
            return this.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED') &&
                !device_util.isMobile();
        }
        else if (feature === 'WEBGL_VERSION') {
            if (isWebGLVersionEnabled(2)) {
                return 2;
            }
            else if (isWebGLVersionEnabled(1)) {
                return 1;
            }
            return 0;
        }
        else if (feature === 'WEBGL_FLOAT_TEXTURE_ENABLED') {
            return isFloatTextureReadPixelsEnabled(this.get('WEBGL_VERSION'));
        }
        throw new Error("Unknown feature " + feature + ".");
    };
    return Environment;
}());
exports.Environment = Environment;
var DEEPLEARNJS_FLAGS_PREFIX = 'dljsflags';
function getFeaturesFromURLOrKarma() {
    var features = {};
    var paramsStr;
    if (window.__karma__ != null) {
        paramsStr = window.__karma__.config.args[0];
    }
    else {
        var urlParams = util.getQueryParams(window.location.search);
        if (!(DEEPLEARNJS_FLAGS_PREFIX in urlParams)) {
            return features;
        }
        paramsStr = urlParams[DEEPLEARNJS_FLAGS_PREFIX];
    }
    if (paramsStr == null) {
        return features;
    }
    var urlFlags = {};
    var keyValues = paramsStr.split(',');
    keyValues.forEach(function (keyValue) {
        var _a = keyValue.split(':'), key = _a[0], value = _a[1];
        urlFlags[key] = value;
    });
    exports.URL_PROPERTIES.forEach(function (urlProperty) {
        if (urlProperty.name in urlFlags) {
            console.log("Setting feature override from URL " + urlProperty.name + ": " +
                ("" + urlFlags[urlProperty.name]));
            if (urlProperty.type === Type.NUMBER) {
                features[urlProperty.name] = +urlFlags[urlProperty.name];
            }
            else if (urlProperty.type === Type.BOOLEAN) {
                features[urlProperty.name] = urlFlags[urlProperty.name] === 'true';
            }
            else {
                console.warn("Unknown URL param: " + urlProperty.name + ".");
            }
        }
    });
    return features;
}
exports.ENV = new Environment(getFeaturesFromURLOrKarma());
function setEnvironment(environment) {
    exports.ENV = environment;
}
exports.setEnvironment = setEnvironment;
//# sourceMappingURL=environment.js.map