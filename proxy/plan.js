var models = require('../models');
var Plan = models.Plan;
var uuid = require('node-uuid');

exports.getOneById = function (id, callback) {
  Plan.findById(id, callback);
}

exports.getPlansByDesignerid = function (designerid, callback) {
  Plan.find({
    'designerid': designerid
  }, callback);
};

exports.getPlansByQueryAndProject = function (query, project, callback) {
  Plan.find(query, project, callback);
};

exports.getPlansByUserid = function (userid, callback) {
  Plan.find({
    'userid': userid
  }, callback);
};

exports.getPlansByDesigneridAndUserid = function (designerid, userid, project,
  callback) {
  Plan.find({
    'designerid': designerid,
    'userid': userid
  }, project, callback);
};

exports.newAndSave = function (json, callback) {
  var plan = new Plan(json);
  plan.request_date = new Date().getTime();
  plan.last_status_update_time = new Date().getTime();
  plan.save(callback);
};

exports.findOneByQuery = function (query, callback) {
  Plan.findOne(query, callback);
}

exports.updateByQuery = function (query, json, callback) {
  Plan.update(query, {
    $set: json
  }, callback);
}

exports.removeOneByQuery = function (_id, callback) {
  Plan.findOneAndRemove({
    _id: _id
  }, {
    $set: {
      is_deleted: true
    }
  }, callback);
}

exports.getStatus2PlanByUseridDesigneridRequirementid = function (userid,
  designerid, requirementid, callback) {
  Plan.findOne({
    userid: userid,
    designerid: designerid,
    requirementid: requirementid,
    status: '2',
  }, callback);
}

exports.addComment = function (planid, json, callback) {
  Plan.findOneAndUpdate({
    _id: planid
  }, {
    '$push': {
      comments: json
    }
  }, callback);
}

exports.setOne = function (query, update, option, callback) {
  Plan.findOneAndUpdate(query, {
    $set: update
  }, option, callback);
}

exports.update = function (query, update, option, callback) {
  Plan.update(query, {
    $set: update
  }, option, callback);
}

exports.find = function (query, project, option, callback) {
  Plan.find(query, project, option, callback);
}

exports.paginate = function (query, project, option, callback) {
  Plan.count(query, function (err, count) {
    if (err) {
      return callback(err, null);
    }

    exports.find(query, project, option, function (err, designers) {
      callback(err, designers, count);
    });
  });
}
