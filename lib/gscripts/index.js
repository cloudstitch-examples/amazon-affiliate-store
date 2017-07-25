function doScrape() {
  var lastId = getLastID_();
  var data = scrapeReddit(lastId);
  console.log(data);
  writeData_(data);  
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
  var sheet = ss.getSheets()[1];
}

/* Write the scrapped data in a batch to the 
   Google Spreadsheet since this is more efficient */
function writeData_(data) {
  
  if (data.length === 0) {
    return;
  } 

  var sheet = getSheet();
  var row = sheet.getLastRow();
  var col = sheet.getLastColumn();
      
  var range = sheet.getRange(row+1, 1, data.length, 6);
  try {
    range.setValues(data);
  } catch (e) {
    Logger.log(e.toString());
  }
}


/* Use the ID of the last processed post from Reddit as token */
function getLastID_() {
  var sheet = getSheet();
  var row = sheet.getLastRow();
  var col = sheet.getLastColumn();
  
  var url = sheet.getRange(row, col).getValue().toString();
  var pattern = /.*comments\/([^\/]*).*/; 
  var id = url.match(pattern);
  
  return id ? "&after=t3_" + id[1] : "";
}

/* Posts Extracted, Delete the Triggers */
function deleteTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}