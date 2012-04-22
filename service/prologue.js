if (typeof require === "undefined") {
   require = IMPORTS.require;
}

var Foundations = IMPORTS.foundations;
var DB = Foundations.Data.DB;
var Future = Foundations.Control.Future;
var PalmCall = Foundations.Comms.PalmCall;
var AjaxCall = Foundations.Comms.AjaxCall;
var _ = IMPORTS.underscore._;
var ContactsLib = IMPORTS.contacts;
var Messaging = IMPORTS['messaging.library'].Messaging;
var Class = Foundations.Class;
var Activity = Foundations.Control.Activity;
var mapReduce = Foundations.Control.mapReduce;
var MojoDB = Foundations.Data.DB;
var TempDB = Foundations.Data.TempDB;
var Person = ContactsLib.Person;


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
