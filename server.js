var Express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = Express();
app.use(bodyParser.json());
console.log("I am a server.");
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./Uploads");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: Storage
}).array("imgUploader", 3); // Field name and max count 

app.get("/", function(req, res) {
    //res.send("Welcome to my server !!!");
    res.sendFile(__dirname + "/public/index.html");
});
                
app.post("/api/Upload", function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Something went wrongs!");
        }
        return res.end("File uploaded sucessfully!");
    })
})

app.listen(1234, function(a) {
    console.log("Listening to port 1234");
})

app.use(Express.static('public'));
//app.use(Express.static('node_modules'));
//app.use("/", Express.static('./'));