var AWS_ACCESS_KEY_ID = "xxx";
var AWS_SECRET_ACCESS_KEY = "zzz";
var AWS_ASSOCIATE_TAG = "yyy";

function amazonDate() {
  // YYYY-MM-DDThh:mm:ssZ
  // Strip the fractional seconds.
  var ds = (new Date()).toISOString();
  return ds.replace(/([0-9]+)\.([0-9]+)([^0-9])/, "$1$3");
}

function itemLookupUrl(item) {
  item = item || "B00008OE6I";

  var params = 
    "AWSAccessKeyId=" + AWS_ACCESS_KEY_ID + "&" +
    "AssociateTag=" + AWS_ASSOCIATE_TAG + '&' +
    "ItemId=" + item + "&" +
    "Operation=ItemLookup&" +
    "ResponseGroup=ItemAttributes%2COffers%2CImages%2CReviews&" +
    "Service=AWSECommerceService&" +
    "Timestamp=" + encodeURIComponent(amazonDate()) + "&" +
    "Version=2009-01-06"
  
  var sigString =
    "GET\n" +
    "webservices.amazon.com\n" +
    "/onca/xml\n" +
    params;

  var signature1 = CryptoJS.HmacSHA256(sigString, AWS_SECRET_ACCESS_KEY);
  var signature2 = signature1.toString(CryptoJS.enc.Base64);
  var signature3 = encodeURIComponent(signature2);
  
  console.log("Test sig", signature1, signature2, signature3);

  return "http://webservices.amazon.com/onca/xml?"
    + params + "&"     
    + "Signature=" + signature3
}
