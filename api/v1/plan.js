var validator = require('validator');
var eventproxy = require('eventproxy');
var User = require('../../proxy').User;
var Plan = require('../../proxy').Plan;
var Requirement = require('../../proxy').Requirement;
var Designer = require('../../proxy').Designer;
var tools = require('../../common/tools');
var _ = require('lodash');
var config = require('../../config');
var async = require('async');
var ApiUtil = require('../../common/api_util');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var type = require('../../type');

exports.add = function (req, res, next) {
  var plan = ApiUtil.buildPlan(req);
  var designerid = ApiUtil.getUserid(req);
  var userid = tools.trim(req.body.userid);
  var ep = eventproxy();

  ep.fail(next);
  ep.on('requirement', function (requirement) {
    //如果已经对需求提交过
    Plan.getStatus2PlanByUseridDesigneridRequirementid(userid, designerid,
      requirement._id,
      function (err, plan_indb) {
        if (err) {
          return next(err);
        }

        if (plan_indb) {
          //有已响应但是没上传的方案，直接上传方案到这里
          plan.status = type.plan_status_desinger_upload; //修改status为已上传
          plan.last_status_update_time = new Date().getTime();
          var query = {
            userid: userid,
            designerid: designerid,
            requirementid: requirement._id,
            status: type.plan_status_designer_respond,
          };

          Plan.updateByQuery(query, plan, function (err) {
            if (err) {
              return next(err);
            }

            res.sendSuccessMsg();
          });
        } else {
          //创建新的方案
          plan.status = type.plan_status_desinger_upload;
          plan.designerid = new ObjectId(designerid);
          plan.userid = new ObjectId(userid);
          plan.requirementid = requirement._id;
          Plan.newAndSave(plan, function (err) {
            if (err) {
              return next(err);
            }

            res.sendSuccessMsg();
          });
        }
      });
  });

  Requirement.setOne({
    userid: userid,
    status: {
      $in: [type.requirement_status_respond_no_plan, type.requirement_status_plan_not_final]
    },
  }, {
    status: type.requirement_status_plan_not_final
  }, null, function (err, requirement) {
    if (err) {
      return next(err);
    }

    if (requirement) {
      ep.emit('requirement', requirement);
    } else {
      return res.sendErrMsg('需求不完整');
    }
  });
};

exports.update = function (req, res, next) {
  var plan = ApiUtil.buildPlan(req);
  var oid = tools.trim(req.body._id);
  var designerid = ApiUtil.getUserid(req);

  if (oid === '') {
    res.sendErrMsg('信息不完全');
    return;
  }

  Plan.updateByQuery({
    _id: oid,
    designerid: designerid
  }, plan, function (err) {
    if (err) {
      return next(err);
    }

    res.sendSuccessMsg();
  });
}

exports.delete = function (req, res, next) {
  var user = req.user || req.session.user;
  var oid = tools.trim(req.body._id);
  var designerid = ApiUtil.getUserid(req);

  if (oid === '') {
    res.sendErrMsg('信息不完全');
    return;
  }

  Plan.removeOneByQuery({
    _id: oid,
    designerid: designerid
  }, function (err) {
    if (err) {
      return next(err);
    }

    res.sendSuccessMsg();
  });
}

exports.userMyPlan = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);

  Plan.getPlansByQueryAndProject({
    userid: userid,
    status: {
      $in: [type.plan_status_user_final, type.plan_status_user_not_final,
        type.plan_status_desinger_upload
      ]
    }
  }, function (err, plans) {
    if (err) {
      return next(err);
    }

    async.mapLimit(plans, 3, function (plan, callback) {
      Designer.findOne({
        _id: plan.designerid
      }, {
        username: 1
      }, function (err, designer) {
        plan = plan.toObject();
        plan.designer = designer;
        callback(err, plan);
      });
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      res.sendData(results);
    });
  });
}

exports.finalPlan = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var planid = tools.trim(req.body.planid);
  var designerid = new ObjectId(req.body.designerid);

  Requirement.setOne({
    userid: userid,
    // status: type.requirement_status_plan_not_final,
  }, {
    final_designerid: designerid,
    final_planid: planid,
    status: type.requirement_status_final_plan,
  }, null, function (err, requirement) {
    if (err) {
      return next(err);
    }

    if (requirement) {
      //标记方案为中标
      Plan.setOne({
        _id: planid,
        userid: userid
      }, {
        status: type.plan_status_user_final,
        last_status_update_time: new Date().getTime(),
      }, {}, function (err, plan) {
        if (err) {
          return next(err);
        }

        if (plan) {
          Designer.incOne({
            _id: designerid
          }, {
            deal_done_count: 1
          }, {});
        }

        res.sendSuccessMsg();
      });

      Plan.update({
        requirementid: requirement._id,
        _id: {
          $ne: planid
        },
      }, {
        status: type.plan_status_user_not_final,
        last_status_update_time: new Date().getTime(),
      }, {
        multi: true
      }, function (err, plan) {

      });
    }
  });
}

exports.designerMyPlan = function (req, res, next) {
  var designerid = ApiUtil.getUserid(req);

  Plan.getPlansByQueryAndProject({
    designerid: designerid,
    status: {
      $in: [type.plan_status_user_final, type.plan_status_user_not_final,
        type.plan_status_desinger_upload
      ]
    }
  }, function (err, plans) {
    if (err) {
      return next(err);
    }

    async.mapLimit(plans, 3, function (plan, callback) {
      User.findOne({
        _id: plan.userid
      }, {
        username: 1
      }, function (err, user) {
        plan = plan.toObject();
        plan.user = user;
        callback(err, plan);
      });
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      res.sendData(results);
    });
  });
}

exports.addCommentForPlan = function (req, res, next) {
  var userid = ApiUtil.getUserid(req);
  var planid = tools.trim(req.body.planid);
  var comment = ApiUtil.buildComment(req);
  comment.by = userid;
  comment.usertype = ApiUtil.getUsertype(req);
  comment.date = new Date().getTime();

  Plan.addComment(planid, comment, function (err) {
    if (err) {
      return next(err);
    }

    res.sendSuccessMsg();
  });
}

exports.getOne = function (req, res, next) {
  var _id = req.params._id;

  Plan.getOneById(_id, function (err, plan) {
    if (err) {
      return next(err);
    }

    res.sendData(plan);
  });
}
