/*
 *获取、引用
 */
var express = require('express');
var path = require('path'); // 引入处理路径的工具
var mongoose = require('mongoose'); // 引入mongoose工具模块
var cookieParser = require('cookie-parser'); // 引入cookie-parser包
var bodyParser = require('body-parser'); // 获取body-parser模块（解析请求后，解析值放入req.body属性中）

/*
* 引入模型
* */
var Goods = require('./models/goods'); // （商品）

var app = express();

app.use(cookieParser()); // 加载用于解析cookie的中间件
app.use(bodyParser.urlencoded({ extended: false })); // 创建 application/x-www-form-urlencoded 解析
app.use(bodyParser.json()); // 创建 application/json 解析
app.use('/public', express.static('public')); // 设置文件直接访问到图片，静态资源获取
// app.use(express.static('public')); // 上等于（要去掉public访问）

/*
// 创建 application/json 解析
var jsonParser = bodyParser.json();
// 创建 application/x-www-form-urlencoded 解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
*/

// 设置跨域请求
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", ' 3.2.1');
    if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
    else
        next();
});

/*
* 连接Market数据库
* */
mongoose.connect('mongodb://localhost:27017/Market', { useNewUrlParser: true }, function (err) {
    if(err) {
        console.log('MongoDB connection failed!',err);
    }else{
        console.log('MongoDB connection success!');
    }
});

/*
* 导入自定义路由模块
* */
var birds = require('./routeModels/birds'); // 引入birds文件（实验性）
var RMgoods = require('./routeModels/RMgoods'); // 引入RMgoods（操作商品）模块
var RMuploadImage = require('./routeModels/RMuploadImage'); // 引入RMuploadImage（上传图片）模块

// app.set('view engine', 'jade'); // view engine，模板引擎
app.set('port', 3000);

/*
 *通过app调用express的各种方法
 * */
// 主页（未使用）
app.get('/', function (req, res) {
    res.send('Hello World!');
});


// 操作商品模块
app.use('/rm_goods', RMgoods); // 在routeModels-RMgoods.js中
// 添加商品 '/add_goods'

/*
* 实验
* */
// 加载/birds，将路由挂载至应用，处理访问birds.js文件中路径的请求
app.use('/birds', birds);

app.get('/image', function (req, res) {
    // res.json({image: 'http://localhost:3000/public/image/1536476788706.png'});
});



var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://localhost:', port);
});