function scrapeReddit(subreddit, limitToAmazon, after, before) {
  var url = 'https://www.reddit.com/r/' + subreddit + '/search/.json?limit=100&q=site:amazon.com&restrict_sr=true&sort=new&type=link';
  if (after) url = url + '&after=' + after;
  if (before) url = url + '&before=' + before;
  
  var response = UrlFetchApp.fetch(url);    
  var body = response.getContentText(); 
  var json = JSON.parse(body);
  var data = [];
    
  for (var i=0; i<json.data.children.length; i++) {
    // Extract post date, title, description and link from Reddit
    var item = json.data.children[i].data;
    var fullname = item.name;
    var url = item.url;
    var updated = item.created;
    var title = item.title;

    var hostname = '';
    try {
      hostname = extractHostname(url);
    } catch(ex) {
    }

    var asin = '';
    try {
      var match = /\/([A-Za-z0-9]{10})(\/|$)/.exec(url);
      if (match) {
        asin = match[1];
      }
    } catch(ex) {
    }

    if (limitToAmazon === true) {
      if (asin) {
        data.push([asin, fullname, hostname, url, title, updated])      
      }
    } else {
      data.push([asin, fullname, hostname, url, title, updated])
    }
  }

  return [data, json.data.after];
}

// From: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function extractHostname(url) {
  var hostname;
  // find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("://") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }

  // find & remove port number
  hostname = hostname.split(':')[0];
  // find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}