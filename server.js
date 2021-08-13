var http = require('http');

var connection = http.createServer(function (request, response) {
    console.log("DONE");
    var post='';
    if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
//-------------parsing data from json to string-------------------------
            post = JSON.parse(body);
            var data = post.replace(/^data:image\/\w+;base64,/, "");
            var buf = Buffer.from(data, 'base64');
            writeFileToSystem(buf);
        });
    }

//----------saving image to server side folder------------------
    function writeFileToSystem(buf)
    {
        fs.writeFile("images/image.png", buf, function(err) {
            console.log("The file was saved!");
        });
    }

})


