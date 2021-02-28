var express = require('express');
const api = express();

var _ = require('lodash');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const axios = require('axios')


var THPSAPI_BASEURL = process.env.THPSAPI_BASE_URL || "http://api.thmods.com";
var THPSAPI_APIKEY = process.env.THPS_API_KEY || "YKhXLP4rTOkSBWHC+T22FWrV3anj0zOhpSkZmN5gyIKmlaDukP7QDFLp73hhKwZg0rH4EbguSl0+p+HuO3b9+9sMv4V1sWiReFEAzrgsoW4WTAseunELMLrsfOUC474IbRujtkft81p06QZUIvKhJAvqsFKguhrHFK2DECmnvH4n78kVHVfh2BtfgBJrisV5wZwlPAMIF679Zp1TKUCohKt2a6AAN4deXnLeEYI5emK4zB4QP1U7pUJNgjwRgEwYmyXidWXlQ1y4AIeVco2pWruoAuEv51IPhvLx5LuVs9AF7JzaOm6WkxGniu+ThA4lJnXqQt8G3DtyI9Kf1uhj3g==";

var fs = require('fs');
var os = require('os');
const FormData = require('form-data');

var multer  = require('multer')
var upload = multer({ dest: os.tmpdir() });

function isValidObjectId(objectId) {
    var testRegex = /^[0-9a-fA-F]{24}$/;
    return objectId.match(testRegex);
}
function lookupSkater(collection, save_id, path) {
    var path_list = path.split('.');
    return new Promise(function (resolve, reject) {
        collection.findOne({ _id: new mongo.ObjectID(save_id) }, function (err, result) {
            if(err) {
                return reject(err);
            }
            if(!result) {
                return resolve(null);
            }
            var save_data = result.data[path_list[0]];
            for (var i = 1; i < path_list.length; i++) {
                save_data = save_data[path_list[i]];
            }
            resolve(save_data);
        });
    });
}

function fetchDataFromSkater(component_definition, skater_db_record) {
    var only_null = true;
    var skater_data = {};
    if(component_definition.ReturnAllComponentData === true) {
        return skater_db_record;
    }
    for (var i = 0; i < component_definition.options.length; i++) {
        var option = component_definition.options[i];

        if(skater_db_record != null) {
            var path = option.path;
            
            if(skater_db_record[path] !== undefined && skater_db_record[path] !== null) {
                skater_data[path] = skater_db_record[path];
                only_null = false;
            }
        }
            
    }
    if(only_null) {
        skater_data = null;
    }
    return skater_data;
}
function lookupHandler(dbo, req, res) {
    if(!isValidObjectId(req.params.save_id)) {
        return res.status(400).end();
    }
    dbo.collection('components').findOne({ name: req.params.name }, async function (err, result) {
        var skater_data = {};

        var path = req.params.path_override || result.path;

        if (path != null) {
            var data_object = await lookupSkater(dbo.collection("saves"), req.params.save_id, path);

            skater_data = fetchDataFromSkater(result, data_object);
        }
        result.data = skater_data;
        result.structureData = {};
        if(req.params.path_override) {
            var script_structure_name = path.split('.');
            script_structure_name = script_structure_name[script_structure_name.length-1];

            var structure = (await dbo.collection('structures').findOne({name: script_structure_name}));
            if(structure !== null) {
                result.structureData = structure.data;
            } else {
                result.structureData = null;
            }
            
        }

        if(result.dataPaths) {
            if(result.structureData == null) {
                result.structureData= {};
            }
            for(var i=0;i<result.dataPaths.length;i++) {
                var dataKey = result.dataPaths[i];
                result.structureData[dataKey] = (await dbo.collection('structures').findOne({name: dataKey})).data;
            }
        }

        delete result._id;
        res.send(result);
    });
}

function updateHandler(dbo, req, res) {
    if(!isValidObjectId(req.params.save_id)) {
        return res.status(400).end();
    }
    dbo.collection('components').findOne({ name: req.params.name }, async function (err, component) {
        var keys = Object.keys(req.body);

        var required_prefix = component.path;
        
        
        var skater_data = await dbo.collection('saves').findOne({ _id: new mongo.ObjectID(req.params.save_id) });

        var path_root = null;

        for(var x=0;x<keys.length;x++) {
            if(keys[x].indexOf(required_prefix) !== 0)  { //trying to edit component out side of root component
                continue;
            }
            var path_list = keys[x].split('.');
            path_root = skater_data.data;
            for(var i=0;i<path_list.length-1;i++) {
                path_root = path_root[path_list[i]];
            }
            path_root[path_list[i]] = req.body[keys[x]]; //assign final path_list index so that the object reference gets changed
            
        }

        if(path_root === null) {
            return res.status(200).end();
        }

        //update db
        var result = await dbo.collection('saves').updateOne({ _id: new mongo.ObjectID(req.params.save_id) }, {$set: {"data": skater_data.data}});

        res.send(result.result).end();
    });
    
}

function downloadSave(dbo, req, res) {
    if(!isValidObjectId(req.params.save_id)) {
        return res.status(400).end();
    }
    dbo.collection('saves').findOne({ _id: new mongo.ObjectID(req.params.save_id) }, function (err, save_data) {
        if(save_data == null) {
            return res.status(404).end();
        }
          var axios_request = {
            'url': "/api/Save/Serialize/0/5/CAS",
            'baseURL': THPSAPI_BASEURL,
            method: "POST",
            headers: {APIKey: THPSAPI_APIKEY},
            responseType: 'stream',
            data: save_data.data
          };
          axios(axios_request)
          .then(function(response) {
              var fileName = save_data.data.summary.Filename;
              res.attachment(fileName + ".SKA");
              response.data.pipe(res);
          }).catch(function(err) {
              console.error(err);
              res.status(500).end();
          });
        
    });
}

function uploadSave(dbo, req, res) {
    var file = req.file;
    var bodyFormData = new FormData();
    bodyFormData.append("save", fs.createReadStream(file.path));
    var headers = bodyFormData.getHeaders();
    headers.APIKey = THPSAPI_APIKEY;
    var axios_request = {
        'url': "/api/Save/Deserialize/0/5",
        'baseURL': THPSAPI_BASEURL,
        method: "POST",
        headers,
        responseType: 'stream',
        data: bodyFormData
      };

      res.set('Content-Type', 'application/json');

      axios(axios_request)
          .then(function(response) {              
              var data = [];
              var totalLength = 0;
              response.data.on('data', (chunk) => {
                totalLength += chunk.length;
                data.push(chunk);
              });
              response.data.on('end', () => {
                if(totalLength == 0) {
                    return res.status(400).end();
                }
                var buffer = Buffer.concat(data, totalLength);
                var json_buffer = buffer.toString('utf8');
                if(json_buffer.length == 0) {
                    return res.status(400).end();
                }
                var saveObject = JSON.parse(json_buffer);
                var insertObj = {type: "SKA", data: saveObject};
                dbo.collection('saves').insertOne(insertObj, function(err, dbResult) {
                    if(err) {
                        console.error(err);
                        return res.status(500).end();
                    }
                    var id = dbResult.insertedId.toString();
                    var resultObj = {_id: id, type: insertObj.type}
                    res.json(resultObj).end();
                });
                
              });
          }, function(error) {
            console.error(error);
            return res.status(500);
          });

}

MongoClient.connect(url, function (err, db) {
    var dbo = db.db('SaveEditor');
    api.get("/downloadSave/:save_id", downloadSave.bind(this, dbo));
    api.post('/uploadSave', upload.single('save'), uploadSave.bind(this, dbo))
    api.get("/component/:name/:save_id", lookupHandler.bind(this, dbo));
    api.get("/component/:name/:save_id/:path_override", lookupHandler.bind(this, dbo));
    api.post("/component/:name/:save_id", updateHandler.bind(this, dbo));
});


module.exports = api;