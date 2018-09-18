/*
* 系统公用函数，创建于2018-09-06
* */
var fs = require('fs');

// 图片转码并存储
saveImage = function (base64Image, position) { // 参数：base64Image：图片，position：预定存储位置
    console.log('公用转码并储存图片函数');
    var imageBuffer = new Buffer(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    var imagePath = position + Date.now() + '.png';
    fs.writeFileSync(imagePath, imageBuffer); // 同步写入文件
    return imagePath
};

module.exports = {saveImage};