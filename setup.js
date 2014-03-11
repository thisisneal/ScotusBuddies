'use strict'; // somewhat safer js 
var csv = require('csv');
var und = require('underscore'); //_ as a var name is strange
var fs = require('fs');

// map over values of a set, from github
und.mixin({ mapValues: function (obj, f_val) { 
  return und.object(und.keys(obj), und.map(obj, f_val));
}});

function logerr(err) { if(err) console.log(err); }

// utility to make lookup by excel column name easy
function colToLine(column) {
  var offset = 0;
  if(column.length !== 1) {
    offset = (column.charCodeAt(0) - 'A'.charCodeAt(0) + 1) * 26;
  }
  var letter = column.charAt(column.length - 1);
  return offset + (letter.charCodeAt(0) - 'A'.charCodeAt(0));
}

// filter db to keep only rows where search_str is found in the chosen column
function filterDB(DB, col_letter, search_str) {
  function filter_fn(line) {
    return (line[colToLine(col_letter)].indexOf(search_str) !== -1);
  }
  return DB.filter(filter_fn);
}

// Return a list of all justiceNames found in DB
function getJustices(DB) {
  function filter_justiceName(entry) { return entry[colToLine('BC')]; }
  var filtered = und.map(DB, filter_justiceName);
  return und.uniq(und.flatten(filtered));
}

// Parse CSV DB into one big clean object
function parseDB(callback) {
  console.log('Begin parsing CSV database.');
  csv().from.path(__dirname + '/SCDB.csv', {delimiter: ',', escape: '"'})
  .to.array(function(data) {
    var DB = data;
    console.log('Processed CSV database, #entries: ' + DB.length);
    // Filter only Roberts court cases
    var robertsDB = filterDB(DB, 'M', 'Roberts');
    console.log('Working with filtered database, #entries: ' + robertsDB.length);
    // Group the vote-based DB by case_id
    function group_caseid(entry) { return entry[colToLine('A')]; }
    var case_groupedDB = und.groupBy(robertsDB, group_caseid);
    // Condense the case entries from vote DBs into sets 
    function condense(vote_group) {
      function group_majority(entry) { return entry[colToLine('BG')]; }
      var side_grouped_obj = und.groupBy(vote_group, group_majority);
      side_grouped_obj['date'] = vote_group[0][colToLine('E')];
      side_grouped_obj['name'] = vote_group[0][colToLine('O')];
      side_grouped_obj['issue'] = vote_group[0][colToLine('AO')];
      side_grouped_obj['court'] = vote_group[0][colToLine('L')];
      return side_grouped_obj;
    }
    var condensedDB = und.mapValues(case_groupedDB, condense);
    // Remove excess info from cases
    function cleanCase(side_obj) {
      side_obj['dissent'] = getJustices(side_obj['1']);
      side_obj['majority'] = getJustices(side_obj['2']);
      delete side_obj['1']; // renamed
      delete side_obj['2']; // renamed
      delete side_obj['']; // remove recusers
      return side_obj;
    }
    var cleaned_db = und.mapValues(condensedDB, cleanCase);
    callback(cleaned_db);
  });
}

// Prepare JSON db file
function setup(callback) {
  // Pull DB from JSON file if possible, otherwise serialize
  var jsonFilePath = '/public/cleanDB.json';
  fs.readFile(__dirname + jsonFilePath, 'utf8', 
    function (err, data) {
      if (err) {
        parseDB(function(db_obj) {
          console.log('Writing database to JSON file.');
          fs.writeFile(__dirname + jsonFilePath, 
            JSON.stringify(db_obj, null, 4), logerr);
          callback(db_obj);
        });
      } else {
        console.log('Reading database from JSON file.');
        var db_obj = JSON.parse(data);
        callback(db_obj);
      }
    }
  );
}

exports.setup = setup;
