var gm = require('gm');

exports.resize2stream = function (buffer, width, callback) {
  gm(buffer).resize(width).stream(callback);
}

exports.resize2buffer = function (buffer, width, callback) {
  gm(buffer).resize(width).toBuffer(callback);
}

exports.crop2buffer = function (buffer, width, hight, x, y, callback) {
  gm(buffer).crop(width, hight, x, y).toBuffer('jpg', callback);
}

exports.jpgbuffer = function (buffer, callback) {
  gm(buffer).toBuffer('jpg', callback);
}

exports.watermark = function (buffer, callback) {
  gm(buffer).size(function (err, value) {
    if (err) {
      return callback(err);
    }

    if (value && value.width) {
      var command = 'image Over ';
      var x = value.width - 366;
      command = command + x + ',10 0,0 mark.png'

      console.log(command);
      this.draw(command).stream(callback);
    } else {
      return callback('invalid image');
    }
  });
}
