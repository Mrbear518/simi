var models = require('../models');
var Share = models.Share;

exports.getOneById = function (id, callback) {
  Share.findById(id, callback);
}

exports.newAndSave = function (json, callback) {
  var share = new Share(json);
  share.create_at = new Date().getTime();
  share.save(callback);
};

exports.updateById = function (shareid, json, callback) {
  Share.update({
    _id: shareid
  }, {
    $set: json
  }, callback);
}

exports.removeOneById = function (_id, callback) {
  Share.findOneAndRemove({
    _id: _id
  }, callback);
}

exports.getAll = function (callback) {
  Share.find({}, null, {
    sort: {
      lastupdate: -1
    }
  }, callback);
}

exports.getByRange = function (limit, callback) {
  Share.find({}, null, {
    limit: limit,
    sort: {
      lastupdate: -1
    }
  }, callback);
}
