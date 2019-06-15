/* about:
 * Analyze links on target sites and download pages recursively
 * how to use:
 * 
 */
const TARGET_URL = process.argv[2]; // target url
const LINK_LEVEL = process.argv[3]; // search link level

// modules
var client = require('cheerio-httpcli');
var URL = require('url');
var fs = require('fs');
var path = require('path');

var list = {};

downloadRec(TARGET_URL, 0);

// download target site recursive
function downloadRec(url, level) {
  if (level >= LINK_LEVEL) {
    return;
  }
  // exclude exists url
  if(list[url]) {
    return;
  }
  list[url] = true;
  // exclude other base path　
  if (URL.parse(url).hostname !== URL.parse(TARGET_URL).hostname) {
    return;
  }
  // fetch url
  client.fetch(url, {}, function(err, $, res) {
    if(err) {
      return; // can not access
    }
    $('a').each(function(idx) {
      var src = $(this).attr('href');
      if(!src) {
        return;
      }
      src = URL.resolve(url, src);
      src = src.replace(/\#.+$/, "");
      downloadRec(src, level + 1);
    });

    if (URL.parse(url).path === "/") {
      url += "index.html"; // add index
    } else {
      var fileType = URL.parse(url).path.split('.');
      if(fileType.length < 2) {
        url += ".html"; // has no extensions
      }
    }

    var savepath = url.split("/").splice(2).join("/");
    checkSaveDir(savepath);
    fs.writeFileSync(savepath, $.html());
  });
}

// create recursive directory
function checkSaveDir(fname) {
  var dir = path.dirname(fname);
  var dirlist = dir.split("/");
  var p = "";
  for(var i in dirlist) {
    p += dirlist[i] + "/";
    if(!fs.existsSync(p)) {
      fs.mkdirSync(p);
    }
  }
}
