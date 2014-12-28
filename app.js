var app = require('express')(),
    http = require('http');

var data_url = 'http://storage.googleapis.com/structure.rollout.io/development/53ff41229a15ba0000000004/540d70434d9cbc6b82000f43/i386/412c2c19f8336ea14aae8ad1a32944ce';

var data_source, data;

http.get(data_url, function(res) {
  data_source = '';

  res.on('data', function(chunk) {
      data_source += chunk;
  });

  res.on('end', function() {
    data = JSON.parse(data_source)
    console.log('JSON loaded.');

    web( data );
  });
}).on('error', function(e) {
  console.log("Got error: ", e);
});

// Define web shell.
var web = function( data ) {
  app.get('/search', function(req, res) {
    console.log('A new query!');

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify( search( req.query.q ) ));
  })

  var server = app.listen(3000, function() {
   console.log('Web server started.');
  })
}

// Define function that search string value in data.
var search = function( search_value ) {
  var result = [];

  for (arr in data) {
    // Hardcode: in [[]] always only one object.
    var classSchema = data[arr][0],
        testAllChildren = false; 

    if (typeof classSchema === 'undefined') continue;

    var className = classSchema.symbol;
    if (className.indexOf( search_value ) != -1) {
      testAllChildren = true;
    }

    for (index in classSchema.children) {
      var functionSchema = classSchema.children[index],
          functionName = functionSchema.symbol;

      if (testAllChildren || functionName.indexOf( search_value ) != -1) {
        result.push( 
          { 
            className: className, 
            functionName: functionName,
            title: '[' + className + ' ' + functionName + ']',
            url: '/' + className + '/' + functionName,
          }
        );
      } 
    } 
  }

  return result;
}

