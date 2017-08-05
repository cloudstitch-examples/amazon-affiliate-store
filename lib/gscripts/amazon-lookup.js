var AMZN = XmlService.getNamespace('http://webservices.amazon.com/AWSECommerceService/2011-08-01');

function amazonDate() {
  // YYYY-MM-DDThh:mm:ssZ
  // Strip the fractional seconds.
  var ds = (new Date()).toISOString();
  return ds.replace(/([0-9]+)\.([0-9]+)([^0-9])/, '$1$3');
}

function itemLookupUrl(item, accessKeyId, associateTag, secretAccessKey) {
  item = item || 'B00008OE6I';

  var params = 
    'AWSAccessKeyId=' + accessKeyId + '&' +
    'AssociateTag=' + associateTag + '&' +
    'ItemId=' + item + '&' +
    'Operation=ItemLookup&' +
    'ResponseGroup=ItemAttributes%2COffers%2CImages%2CReviews&' +
    'Service=AWSECommerceService&' +
    'Timestamp=' + encodeURIComponent(amazonDate()) + '&' +
    'Version=2009-01-06'
  
  var sigString =
    'GET\n' +
    'webservices.amazon.com\n' +
    '/onca/xml\n' +
    params;

  var signature1 = CryptoJS.HmacSHA256(sigString, secretAccessKey);
  var signature2 = signature1.toString(CryptoJS.enc.Base64);
  var signature3 = encodeURIComponent(signature2);

  return 'http://webservices.amazon.com/onca/xml?'
    + params + '&'
    + 'Signature=' + signature3
}

function lookupItem(url) {
  // Reddit API returns the results in XML format
  var response = UrlFetchApp.fetch(url);
  var doc = XmlService.parse(response.getContentText()); 

  var root = doc.getRootElement();

  var Items = root.getChild('Items', AMZN);
  var Item = Items.getChild('Item', AMZN);
  var formattedPrice = '';
  var imageUrl = '';
  var title = 'Unknown';

  if (Item) {
    var OfferSummary = Item.getChild('OfferSummary', AMZN);
    if (OfferSummary) {
      var LowestNewPrice = OfferSummary.getChild('LowestNewPrice', AMZN);
      if (LowestNewPrice) {
        var formattedPrice = LowestNewPrice.getChild('FormattedPrice', AMZN).getText();
      }
    }

    var MediumImages = Item.getChildren('LargeImage', AMZN);
    if (MediumImages.length) {
      imageUrl = MediumImages[0].getChild('URL', AMZN).getText();
    }

    title = Item.getChild('ItemAttributes', AMZN).getChild('Title', AMZN).getText();
  }

  return [title, imageUrl, formattedPrice];
}

function lookupAsin(asin, accessKeyId, associateTag, secretAccessKey) {
  var url = itemLookupUrl(asin, accessKeyId, associateTag, secretAccessKey);
  Utilities.sleep(1000); // avoid Amazon rate limit
  var obj = lookupItem(url);
  return obj;
}