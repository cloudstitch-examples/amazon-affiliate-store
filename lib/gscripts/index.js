// Configuration variables -- edit these first!
var SUBREDDIT = 'foo';
var AWS_ACCESS_KEY_ID = 'bar';
var AWS_ASSOCIATE_TAG = 'baz';
var AWS_SECRET_ACCESS_KEY = 'qux';

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Reddit Scraper')
      .addItem('Scrape!', 'doScrape')
      .addToUi();
}

function doScrape() {
  var productAsin = {};
  var productData = []; // only includes products w/ price
  
  var LINK_QUOTA = 100;
  var MAX_TRIES = 5;
  
  var links = 0;
  var tries = 0;
  var after = undefined;
  var before = undefined;
  
  var sheet = SpreadsheetApp.getActiveSheet();
  var fullnames = sheet.getRange('B2:B' + sheet.getLastRow()).getDisplayValues();
  for (var i = 0; i < fullnames.length; i++) {
    if (fullnames[i][0]) {
      before = fullnames[i][0];
      break;
    }
  }

  while ((links <= LINK_QUOTA) && (tries < MAX_TRIES)) {
    var tuple = scrapeReddit(SUBREDDIT, true, after, before);
    var data = tuple[0];
    links += data.length;
    after = tuple[1];
    
    for (var i = 0; i < data.length; i++) {
      var asin = data[i][0];
      // if new asin, lookup Amazon data
      if (asin && !(asin in productAsin)) {
        productAsin[asin] = true;
        var amazonData = lookupAsin(asin, AWS_ACCESS_KEY_ID, AWS_ASSOCIATE_TAG, AWS_SECRET_ACCESS_KEY);
        if (!amazonData[2]) { // no price
          continue;
        }
        for (var j = 0; j < amazonData.length; j++) {
          data[i].push(amazonData[j]);
        }
        productData.push(data[i]);
      }
    }
    
    if (data.length < 100) { // pagination not needed for <100 results
      break;
    }
    tries += 1;
  }
  
  writeData_(productData);  
}

function run() {
  deleteTriggers_();
  // Fetch posts every 5 minutes to avoid hitting the Reddit and Google Script quotas
  ScriptApp.newTrigger('doScrape')
           .timeBased().everyMinutes(5).create();  
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  return sheet;
}

// Write the scrapped data in a batch to the Google Spreadsheet since this is more efficient
function writeData_(data) {
  if (data.length === 0) {
    return;
  } 

  var maxLength = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].length > maxLength) {
      maxLength = data[i].length;
    }
  }

  var sheet = getSheet();
  var row = sheet.getLastRow();
  var col = sheet.getLastColumn();
      
  // var range = sheet.getRange(row+1, 1, data.length, maxLength);
  var range = sheet.getRange(2, 1, data.length, maxLength);
  try {
    sheet.insertRows(2, data.length);
    range.setValues(data);
  } catch(e) {
    Logger.log(e.toString());
  }
}

// Posts extracted, delete the triggers
function deleteTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}