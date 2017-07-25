/* Reddit Scraper written by Amit Agarwal */
/* January 9, 2013 */

/* Replace LifeProTips with the Subreddit Name */
var REDDIT = "shutupandtakemymoney";
var ATOM = XmlService.getNamespace('http://www.w3.org/2005/Atom');

function scrapeReddit(lastId) {  
  // Process 20 Reddit posts in a batch
  var url = "http://www.reddit.com/r/" 
            + REDDIT + "/new.xml?limit=20" + lastId; 

  // Reddit API returns the results in XML format  
  var response = UrlFetchApp.fetch(url);    
  var doc = XmlService.parse(response.getContentText()); 
  var root = doc.getRootElement();
  var entries = doc.getRootElement().getChildren('entry', ATOM)
  
  var data = [];
    
  for (var i=0; i<entries.length; i++) {
    /* Extract post date, title, description and link from Reddit */

    var updated = getValue(entries[i], 'updated');
    var title = getValue(entries[i], 'title');
    var url = getLink(entries[i], 'content');

    var hostname = '';
    try {
      hostname = extractHostname(url);
    } catch(ex) {
    }
    
    var asin = '';
    try {
      var myRegexp = /\/dp\/([^\/]+)\//g;
      var match = myRegexp.exec(url);
      if (match) {
        asin = match[1];
      }
    } catch(ex) {
    }
    
    var aurl = asin ? itemLookupUrl(asin) : '';

    if (true || asin) {
      data.push([asin, hostname, url, title, updated, aurl]);
    }                
  }
 
  return data;
}

function getValue(entry, name) {
  try {
    var child = entry.getChild(name, ATOM);
    var val = child.getText();
    return val;
  } catch(ex) {
    console.log(ex);
    return '';
  }
}


// Looks for the link in the HTML
function getLink(entry, name) {
  var html = getValue(entry, name);
  var myRegexp = /a href="([^"]+)">\[link\]/g;
  var match = myRegexp.exec(html);
  if (match) {
    return match[1];
  } else {
    return '';
  }
}

// From: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}
