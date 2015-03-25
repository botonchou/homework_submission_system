var path = require('path');
var exec = require('child_process').exec;
var sprintf = require("sprintf-js").sprintf;
var fs = require('fs');

var db = require('mongoose');

var express = require('express');
var multer  = require('multer');
var router = express.Router();

var HomeworkSchema = new db.Schema({
  id: String,
  proj_name: String,
  description: String,
  fb_link: String,
  file: {path: String, name: String},
  image: {path: String, name: String},
  created: Date
});

var Homework = db.model('Homework', HomeworkSchema);

router.use(multer({
  dest: './public/homeworks/hw1/',
  limits: {
    fileSize: 5 * 1000 * 1000  // 5 MB limits
  },
  onFileSizeLimit: function (file) {
    console.log('\33[31m[Error]\33[0m File \33[34m' + file.originalname + '\33[0m is too large.');
    fs.unlink('./' + file.path); // delete the partially written file 
  },
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + '.' + Date.now();
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file, next) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
  },
  changeDest: function(dest, req, res) {
    var id = dest + req.body.id;

    var stat = null;
    try {
      stat = fs.statSync(id);
    } catch (err) {
      fs.mkdirSync(id);
    }

    if (stat && !stat.isDirectory())
      throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');

    return id
  }
}));

// Settup up 
router.post('/', createSymLink, onImageUploaded);

function createSymLink(req, res, next) {
  var file = req.files.file.path;
  var image = req.files.image.path;
  var cmd = sprintf('ln -sf %s %s && ln -sf %s %s',
    basename(file),  file.replace(/\/[^/]*$/g, '')  + '/code-latest',
    basename(image), image.replace(/\/[^/]*$/g, '') + '/image-latest'
  );
  exec(cmd, function (err, stdout, stderr) {
    if (err) throw err;
    next();
  });
}

function onImageUploaded(req, res) {
  console.log(req.body);	// Other data in HTTP POST
  console.log(req.files.file);

  var data = {
    id: req.body.id,
    proj_name: req.body.proj_name || "None.",
    description: req.body.description || "None.",
    fb_link: req.body.fb_link,
    file: {
      path: req.files.file.path.replace(/public\/homeworks\//g, ''),
      name: req.files.file.originalname
    },
    image: {
      path: req.files.image.path.replace(/public\/homeworks\//g, ''),
      name: req.files.image.originalname
    },
    created: new Date()
  };

  var hw = new Homework(data);

  hw.save(onSubmitted);

  function onSubmitted(err) {
    if (err) throw err; 
    res.redirect('/homeworks?success=1');
  }
}

function basename(str) {
  return str.replace(/.*\//g, '');
}

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../views/homework-submission.html'));
});

/*router.get('/:hw/:id/:fn', function (req, res) {
  var params = req.params;
  var p = '/../homeworks/' + params.hw + '/' + params.id + '/' + params.fn;
  res.sendFile(path.join(__dirname + p));
});*/

/* GET list of instances.. */
router.get('/all', function (req, res) {

  /*Homework.aggregate([{"$group" : {_id: "$id"}}], function (err, results) {
    console.log(results);
  });*/

  Homework.find({}, 'id proj_name description fb_link file image created').sort('-created').exec(function (err, homeworks) {
    if (err) throw err;

    // homeworks = homeworks.splice(0, 10);

    if (!homeworks)
      res.status(404).send('Not found');
    else
      res.send(JSON.stringify(homeworks));

    res.end();
  });
});

module.exports = {
  router: router
};
