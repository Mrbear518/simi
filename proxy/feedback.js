var models = require('../models');
var Feedback = models.Feedback;

exports.newAndSave = function (json, callback) {
  var feedback = new Feedback(json);
  feedback.create_at = new Date().getTime();

  feedback.save(callback);
};

exports.find = function (query, project, option, callback) {
  Feedback.find(query, project, option, callback);
}
