var express = require('express');
var router = express.Router();
const fs = require('fs');
var similarity = require( 'compute-cosine-similarity' );

function runSimilarity(x,y){
  var s = similarity( x, y );
  return s
}

var wordsPoints;

fs.readFile('./public/javascripts/word3dpoint.json', 'utf8', (err, jsonString) => {
  if (err) {
      console.log("File read failed:", err);
      return;
  }
  wordsPoints = JSON.parse(jsonString);
  // console.log(wordsPoints.word3dpoint);
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Word Embeddings', wordsPoints:wordsPoints});
});

router.post('/searchWord', (req, res) => {
  console.log("post")
  var firstWordPosList = req.body.firstWordPosList
  var secondWordPosList = req.body.secondWordPosList
  var similarity = runSimilarity(firstWordPosList, secondWordPosList)
  
  res.contentType('json')
  res.send({"similarity": similarity})
  // console.log(JSON.stringify(req.body))
})

module.exports = router;
