/*
* 上传图片（上传、删除）模块 创建于 2018/8/8
* */
var express = require('express');
var router = express.Router(); // 创建模块化、可挂载的路由句柄
/*
* 该路由使用的中间件
* */
// 通用
router.use(function timeLog(req, res, next) {
    console.log('/-------------------------RMuploadImage(上传图片模块)---------------------------/', Date.now());
    next();
});

/*
* 路由
* */

// 添加商品
router.post('/upload', function (req, res) {
    console.log('上传');
    console.log(req.body);
});

module.exports = router;