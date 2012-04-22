if (typeof require === "undefined") {
   require = IMPORTS.require;
}

var Foundations = IMPORTS.foundations;
var DB = Foundations.Data.DB;
var Future = Foundations.Control.Future;
var PalmCall = Foundations.Comms.PalmCall;
var AjaxCall = Foundations.Comms.AjaxCall;

/**
 * Special Error for webOS JavaScript Services
 * @param {String} msg the error message
 * @param {Object} errorCode the errorCode to be returned from the service
 */
/* Thanks DougReeder! */
function ServiceError(msg, errorCode) {
    this.message = msg;
   this.errorCode = errorCode;
}
ServiceError.prototype = new Error();
ServiceError.prototype.name = "ServiceError";