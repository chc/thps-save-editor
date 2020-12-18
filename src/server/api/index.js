var express = require('express');
const api = express();

var _ = require('lodash');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";
const axios = require('axios')

function findChild(data, name) {
    var child = _.filter(data, function (o) { return o.name == name; });
    if(child.length == 1 && name != 0) child = child[0];
    return child;
}

function lookupSkater(collection, save_id, path) {
    var path_list = path.split('.');
    return new Promise(function (resolve, reject) {
        collection.findOne({ _id: new mongo.ObjectID(save_id) }, function (err, result) {
            var save_data = result.data[path_list[0]];
            for (var i = 1; i < path_list.length; i++) {
                if (_.isArray(save_data)) {
                    save_data = findChild(save_data, path_list[i]);
                } else {
                    save_data = findChild(save_data.value, path_list[i]);
                }
            }
            resolve(save_data);
        });
    });
}

function fetchDataFromSkater(component_definition, skater_db_record) {
    var only_null = true;
    var skater_data = {};
    for (var i = 0; i < component_definition.options.length; i++) {
        var option = component_definition.options[i];

        if(skater_db_record && skater_db_record.value) {
            var path = option.path;
            if(option.UI_Options.type == "flags") {
                path = 0;
            }
            var data = findChild(skater_db_record.value, path);
            if(data && data.value && path != 0) {
                skater_data[option.path] = data.value;
                only_null = false;
            } else {
                if(data.length > 0) {
                    only_null = false;
                    skater_data[option.path] = {};
                    for(var x=0;x<data.length;x++) {
                        skater_data[option.path][data[x].value] = true;
                    }
                }
                
            }                     
        } else {
            skater_data[option.path] = null;
        }
    }
    if(only_null) {
        skater_data = null;
    }
    return skater_data;
}
function lookupHandler(dbo, req, res) {
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
            result.structureData = (await dbo.collection('structures').findOne({name: script_structure_name})).data;
        }

        if(result.dataPaths) {
            for(var i=0;i<result.dataPaths.length;i++) {
                var dataKey = result.dataPaths[i];
                result.structureData[dataKey] = (await dbo.collection('structures').findOne({name: dataKey})).data;
            }
        }

        delete result._id;
        res.send(result);
    });
}

function detectQScriptType(QItem, option) {
    switch(option.UI_Options.type) {
        case 'name':
            return "ESYMBOLTYPE_NAME";
        case 'string':
            return "ESYMBOLTYPE_STRING";
        case 'float':
            return "ESYMBOLTYPE_FLOAT";
        case 'integer':
            if(QItem.value == 0) {
                return "ESYMBOLTYPE_ZERO_INTEGER";
            } else if(QItem.value > 0 && QItem.value <= 255) {
                return "ESYMBOLTYPE_UNSIGNED_INTEGER_ONE_BYTE";
            } else if(QItem.value > 0 && QItem.value <= 65535) {
                return "ESYMBOLTYPE_UNSIGNED_INTEGER_TWO_BYTE";
            } else {
                return "ESYMBOLTYPE_INTEGER";
            }
    }
    return "ESYMBOLTYPE_NAME"; //xxx: error
}
async function convertComponentsToQScript(component_definition, body, dbo, append_root) {
    var path_list = component_definition.path.split('.');
    var path_name = path_list[path_list.length-1];

    var subtypes ={};
    var response = {name: path_name, type: "ESYMBOLTYPE_STRUCTURE", value: []};

    for(var i=0;i<component_definition.options.length;i++) {
        var option = component_definition.options[i];
        var root = component_definition.path + ".";
        if(append_root === false) root = "";
        var expected_key = root + option.path;
        if(body[expected_key] !== undefined) {
            if(option.UI_Options.type == 'component') {
                var subtype = null;
                if(subtypes[option.UI_Options.subtype] === undefined) {
                    subtype = await dbo.collection('components').findOne({ name: option.UI_Options.subtype });
                    subtypes[option.UI_Options.subtype] = subtype;
                }
                
                subtype = subtypes[option.UI_Options.subtype];
                subtype.path = expected_key;

                response.value.push(await convertComponentsToQScript(subtype, body[expected_key], dbo, false));
            } else {
                var item = {name: option.path, value: body[expected_key]};
                item.type = detectQScriptType(item, option);
                response.value.push(item);
            }
        }
    }
    return response;
}
function updateHandler(dbo, req, res) {
    dbo.collection('components').findOne({ name: req.params.name }, async function (err, component) {
        var p = [];
        var keys = Object.keys(req.body);
        
        
        var skater_data = await dbo.collection('saves').findOne({ _id: new mongo.ObjectID(req.params.save_id) });

        var path_root = null;

        for(var x=0;x<keys.length;x++) {
            var path_list = keys[x].split('.');
            if(path_list.length == 1) {
                path_root = path_list[0];
                if (_.isArray(path_root)) {
                    path_root = findChild(path_root, path_list[i]);
                } else {
                    path_root = findChild(path_root.value, path_list[i]);
                }
            } else {
                for(var i=1;i<path_list.length-1;i++) {
                    path_root = skater_data.data[path_list[0]];
                    for (var i = 1; i < path_list.length-1; i++) {
                        if (_.isArray(path_root)) {
                            path_root = findChild(path_root, path_list[i]);
                        } else {
                            path_root = findChild(path_root.value, path_list[i]);
                        }
                    }
                }
            }
        }

        if(path_root === null) {
            return res.status(200).end();
        }


        var all_component_names = _.map(component.options, 'path');

        var final_components = _.filter(path_root.value, function(o) { return all_component_names.indexOf(o.name) == -1});


        var insert_components = await convertComponentsToQScript(component, req.body, dbo, true);
        path_root.value = insert_components.value.concat(final_components);
        
        //update db
        var result = await dbo.collection('saves').updateOne({ _id: new mongo.ObjectID(req.params.save_id) }, {$set: {"data": skater_data.data}});

        res.send(result.result).end();
    });
    
}

function downloadSave(dbo, req, res) {
    dbo.collection('saves').findOne({ _id: new mongo.ObjectID(req.params.save_id) }, function (err, save_data) {
        if(save_data == null) {
            return res.status(404).end();
        }
          var axios_request = {
            'url': "/api/Save/Serialize/0/5/CAS",
            'baseURL': 'http://api.thmods.com',
            method: "POST",
            headers: {APIKey: "Z4FEaCrj5CPW8jg7T6icNglN5ekj+jkS91QeaARnM4bUSQdGpCg3S5JK/D7x6QzkHUt8+uQftjhXtPo++IjGDPHkIfF+EXd2qLCO/apaS7i0Hi2YGw8pUTFfZ1kTBgHRM2ZA0kl96PaZ4ancMPRWFT4QjbXMKVU2M18CZqMiD4a4rf0nezI76X/1f3epR85NcAdxRxawYYlW2tmetaAEDREPkuhS1XyyPV9asQuanaGXCm1v4Sye29Hgtv+UYlczx52zTe/zK5hVKQq6OTnGGwthIpqoTJeCrNSU6G4tqgtSPAIf+pSGlptl3C596iCbrI/giC1BFRyAS0dCjlik5A=="},
            responseType: 'stream',
            data: save_data.data
          };
          axios(axios_request)
          .then(function(response) {
              var fileName = save_data.data.summary[6].value; //XXX: get a better lookup
              res.attachment(fileName + ".SKA");
              response.data.pipe(res);
          });
        
    });
}

MongoClient.connect(url, function (err, db) {
    var dbo = db.db('SaveEditor');
    api.get("/downloadSave/:save_id", downloadSave.bind(this, dbo));
    api.get("/component/:name/:save_id", lookupHandler.bind(this, dbo));
    api.get("/component/:name/:save_id/:path_override", lookupHandler.bind(this, dbo));
    api.post("/component/:name/:save_id", updateHandler.bind(this, dbo));
});


module.exports = api;