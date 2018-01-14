/* app.js */

const app = require('express')()
var mongojs = require('mongojs')
var body_parser = require('body-parser');
app.use(body_parser.urlencoded({extended:true}));

var url ='mongodb://dstorres:dstorres@ds247587.mlab.com:47587/practica_mvc';
var origenes ; 
var destinos ; 

var db = mongojs(url, ['routes']);
var mysort = { name: -1 };
db.on('error', function (err) {
  console.log('database error', err)
})

db.on('connect', function () {
  console.log('database connected')
})

db.routes.distinct('sAirport', {} , function (err, docs) {
  if (err) throw err;
  origenes = docs.sort(mysort);
});

db.routes.distinct('dAirport', {} , function (err, docs) {
  if (err) throw err;
  destinos = docs.sort(mysort);
});


app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('formulario', { origenes: origenes, destinos: destinos,tipo: "inicial" })
});


app.post('/find', (req, res) => {
   response = {
      sAirport:req.body.origen ,
      dAirport:req.body.destino,
      stops: parseInt(req.body.tipo)
   };
  console.log('daniel');  
  
  var size ;
  var rutas ;   
  db.routes.find(response,function(err, items) {
    size = items.length; 
    console.log("message "+ size);    
    if (size == 0) {
      res.render('formulario', { origenes: origenes, destinos: destinos,tipo: "vacio" })
    }else{

    db.routes.aggregate([
        {"$match": {'sAirport':response.sAirport,'dAirport':response.dAirport}},
        {"$lookup":{"from":"airlines","localField":"airlineID","foreignField":"airlineID","as":"extra"}
        }],function(err, items2) {
            console.log( items2); 
            res.render('resultados', { origenes: origenes, destinos: destinos, rutas:items2, tipo: "resultados" })
        });

    
     
    }
       
  });
  
});

app.listen(8080);