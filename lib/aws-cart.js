/* 
 * cart:
 *   AWSAccessKeyId: string
 *   AssociateTag: string
 *   Items: []
 * 
 */
var AWSCart = {
  createCart: function(AWSAccessKeyId, AssociateTag) {
    // Operation=CartCreate
    return {
      AWSAccessKeyId: AWSAccessKeyId,
      AssociateTag: AssociateTag,
      Items: []
    }
  },
  addItem: function(cart) {

  },
  removeItem: function(cart) {

  },
  checkout: function(cart) {

  },
  _createCart: function() {

  },
  _amznDate: function() {
    // YYYY-MM-DDThh:mm:ssZ
    // Strip the fractional seconds.
    var ds = (new Date()).toISOString();
    return ds.replace(/([0-9]+)\.([0-9]+)([^0-9])/, "$1$3");
  }
}