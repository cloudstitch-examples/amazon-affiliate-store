var MAX_TRIES = 5;
var SUBREDDIT = "shutupandtakemymoney";

function doScrape() {
  var allData = [];
  var validData = []; // only includes products w/ price
  var quota = 9;
  var tries = 0;
  var page = undefined;
  while ((allData.length < quota) && (tries < MAX_TRIES)) {
    var tuple = scrapeReddit(SUBREDDIT, true, page);
    var data = tuple[0];
    page = tuple[1];
    for (var i = 0; i < data.length; i++) {
      allData.push(data[i]);
    }  
    tries += 1;
  }

  // Now get the amazon data
  for (var i = 0; i < allData.length; i++) {
    if (allData[i].length) {
      var asin = allData[i][0];
      if (asin) {
        var amazonData = lookupAsin(asin);
        if (!amazonData[2]) { // no price
          continue;
        }
        for (var j = 0; j < amazonData.length; j++) {
          allData[i].push(amazonData[j]);
        }
        validData.push(allData[i]);
      }      
    }
  }

  console.log(validData);
  writeData_(validData);  
}

function run() {
   deleteTriggers_();
  /* Fetch Reddit posts every 5 minutes to avoid hitting 
     the reddit and Google Script quotas */
  ScriptApp.newTrigger("doScrape")
           .timeBased().everyMinutes(5).create();  
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  return sheet;
}

/* Write the scrapped data in a batch to the 
   Google Spreadsheet since this is more efficient */
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
      
  var range = sheet.getRange(row+1, 1, data.length, maxLength);
  try {
    range.setValues(data);
  } catch (e) {
    Logger.log(e.toString());
  }
}

/* Posts Extracted, Delete the Triggers */
function deleteTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}