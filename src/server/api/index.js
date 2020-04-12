var express = require('express');
const api = express();

var _ = require('lodash');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

function findChild(data, name) {
    var child = _.find(data, function (o) { return o.name == name; });
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

function lookupHandler(dbo, req, res) {
    dbo.collection('components').findOne({ name: req.params.name }, async function (err, result) {
        var skater_data = {};

        var path = req.params.path_override || result.path;

        if (path != null) {
            var data_object = await lookupSkater(dbo.collection("saves"), req.params.save_id, path);

            var only_null = true;
            
            for (var i = 0; i < result.options.length; i++) {
                var option = result.options[i];

                if(data_object && data_object.value) {
                    var data = findChild(data_object.value, option.path);
                    if(data && data.value) {
                        skater_data[option.path] = data.value;
                        only_null = false;
                    }                        
                } else {
                    skater_data[option.path] = null;
                }
            }
            if(only_null) {
                skater_data = null;
            }
        }
        result.data = skater_data;

        if(req.params.path_override) {
            var script_structure_name = path.split('.');
            script_structure_name = script_structure_name[script_structure_name.length-1];
            result.structureData = (await dbo.collection('structures').findOne({name: script_structure_name})).data;  
        }

        delete result._id;
        res.send(result);
    });
}

MongoClient.connect(url, function (err, db) {
    var dbo = db.db('SaveEditor');
    api.get("/component/:name/:save_id", lookupHandler.bind(this, dbo));
    api.get("/component/:name/:save_id/:path_override", lookupHandler.bind(this, dbo));
});


module.exports = api;