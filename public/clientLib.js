'use strict';

function getJSON(url, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.setRequestHeader("Content-Type",
    "application/json");

  request.onreadystatechange = function() {
    var done = 4, ok = 200;
    if (request.readyState == done && request.status == ok) {
      if (request.responseText) {
        var db_obj = JSON.parse(request.responseText);
        callback(db_obj);
      }
    }
  };
  request.send();
}

getJSON("cleanDB.json", function(db_obj) {
  console.log(db_obj);
});
