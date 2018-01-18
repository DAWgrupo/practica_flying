/* app.js */
var express  = require('express');
var app      = express();
var mongojs = require('mongojs')
var body_parser = require('body-parser');
app.use(body_parser.urlencoded({extended:true}));

//var url ='mongodb://dstorres:dstorres@ds247587.mlab.com:47587/practica_mvc';
var url ='mongodb://localhost:27017/flying';
var origenes ; 
var destinos ; 
var size ;
 var aerolineas_d={}, aerolineas_s={};   
var arreglo_ciudad_d=[] , arreglo_ciudad_o=[];
var db = mongojs(url);
var c_rpoutes=db.collection('routes');
var mysort = { name: -1 };
db.on('error', function (err) {
  console.log('database error', err)
})

db.on('connect', function () {
  console.log('database connected')
})

db.airports.distinct('country', {} , function (err, docs) {
  if (err) throw err;
  origenes = docs.sort(mysort);
});

db.airports.distinct('country', {} , function (err, docs) {
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
    //console.log(response);  
  

    db.airports.find( {
      country:response.sAirport //"United States"
    } , function (err, docs) {
      if (err) throw err;
      aerolineas_s = docs;
      //console.log(aerolineas_s);
      size = docs.length; 
      //console.log("message1 "+ size);    
      if (size == 0) {
        res.render('formulario', { origenes: origenes, destinos: destinos,tipo: "vacio" })
      }else{
         db.airports.find( {
            country:response.dAirport //"United States"
          } , function (err, docs2) {
              if (err) throw err;
              aerolineas_d = docs2;
              size = docs2.length;  
              if (size == 0) {
                res.render('formulario', { origenes: origenes, destinos: destinos,tipo: "vacio" })
               }else{
                arreglo_ciudad_d=[];
                arreglo_ciudad_o=[];
                for (var i=0 ; i<aerolineas_d.length ; i++ ){
                    arreglo_ciudad_d[i]=aerolineas_d[i].airportID;
                }
                for (var i=0 ; i<aerolineas_s.length ; i++ ){
                    arreglo_ciudad_o[i]=aerolineas_s[i].airportID;
                }
                db.routes.aggregate([
                  // {"$match": {sAirportID:{$in:docs2.airportID},dAirportID:{$in:docs.airportID}}},
                  // {dAirportID:{$in:[3316,331]}, sAirportID:507}
                  //{"$match": {dAirportID:{$in:aerolineas_d[4].airportID}, sAirportID:507 }},
                  {"$match": {dAirportID:{$in: arreglo_ciudad_d }, sAirportID: {$in: arreglo_ciudad_o } , stops : response.stops}},
                  {"$lookup":{"from":"airlines","localField":"airlineID","foreignField":"airlineID","as":"extra"}}
                  ],function(err, items2) {
                    var tamanio = items2.length;
                      if (tamanio == 0){
                         res.render('formulario', { origenes: origenes, destinos: destinos,tipo: "vacio" }) ;
                      }else{
                        res.render('resultados', { origenes: origenes, destinos: destinos, rutas:items2, tipo: "resultados" });
                      }
                      
                  });


              }

          });


      }});
  
});

app.listen(8080);