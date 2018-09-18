var express = require('express');
var router = express.Router(); // 创建模块化、可挂载的路由句柄

/*
* 该路由使用的中间件
* */
// 没有挂载路径的中间件，应用的每个请求都会执行该中间件
router.use(function timeLog(req, res, next) {
    console.log('Time：', Date.now());
    next();
});

// 挂载至 /user/:id 的中间件，任何指向 /user/:id 的请求都会执行它
router.use('/user/:id', function (req, res, next) {
    console.log('Request Type: ', req.method, 'Requset params:', req.params);
    next();
});

// 一个中间件栈，对任何指向 /use/:name的HTTP请求打印出相关信息
router.use('/goods/:name', function (req, res, next) {
    console.log('GOODS/NAME Request URL:', req.originalUrl);
    next();
}, function (req, res, next) {
    console.log('Request Type:', req.method);
    next();
});

// 错误处理中间件
router.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

/*
* 路由
* */
// 定义网站主页的路径
router.get('/', function(req, res) {

    res.send('Birds home page');
});

// 定义 about 页面的路由
router.get('/about', function(req, res) {
    res.send('About birds');
});

// 路由和句柄函数（中间件系统），处理指向/user/:id 的GET请求
router.get('/user/:id', function (req, res) {
    res.send('USER/ID');
});

// 访问/goods/:name
router.get('/goods/:name', function (req, res) {
    res.send(['GOODS/NAME', req.params.name]);
});

// 一个中间件栈，处理指向/status/:status的GET请求
router.get('/status/:status', function (req, res, next) {
    // 如果status为asd，调到下一个路由
    if (req.params.status === 'asd') next('route');
    // 否则将控制权交给栈中下一个中间件
    else next();
}, function (req, res, next) {
    // 渲染常规页面
    res.send('regular');
});

// 处理/status/:status,渲染一个特殊页面
router.get('/status/:status', function (req, res, next) {
    res.send('special');
});


module.exports = router;