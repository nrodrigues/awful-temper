module.exports = BadRequestError;

function BadRequestError(message) {
    this.name = "BadRequestError";
    this.message = (message || "");
    
    this.getError = getError;
    
    function getError() {
      return { message: this.message };
    }
}
BadRequestError.prototype = Error.prototype;
