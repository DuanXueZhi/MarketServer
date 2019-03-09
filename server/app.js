/*
 *获取、引用
 */
var express = require('express');
var path = require('path'); // 引入处理路径的工具
var mongoose = require('mongoose'); // 引入mongoose工具模块
var cookieParser = require('cookie-parser'); // 引入cookie-parser包
var bodyParser = require('body-parser'); // 获取body-parser模块（解析请求后，解析值放入req.body属性中）
var session = require('express-session'); // 引入express-session中间件
var crypto = require('crypto'); // 引入crypto模块
var md5 = crypto.createHash('md5');

/*
* 引入模型（没用到，在各自的句柄中有导入）
* */
var Goods = require('./models/goods'); // （商品）
var Purchases = require('./models/purchases'); // （到货信息）

var app = express();

app.use(cookieParser()); // 加载用于解析cookie的中间件
app.use(bodyParser.urlencoded({ extended: false})); // 创建 application/x-www-form-urlencoded 解析，返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(bodyParser.json({'limit': '10240kb'})); // 创建 application/json 解析 'limit': '10240kb'，设置参数大小小于20MB
app.use('/public', express.static('public')); // 设置文件直接访问到图片，静态资源获取
// app.use(express.static('public')); // 上等于（要去掉public访问）
// app.use(express.static(path.join(__dirname, 'dist'))); // 前端代码存放处，可直接访问到【上线打开】


/*
// 创建 application/json 解析
var jsonParser = bodyParser.json();
// 创建 application/x-www-form-urlencoded 解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
*/

// 设置跨域请求
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1789");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true); // 解决跨域请求node无法操作cookie存入Application的cookies库
    res.header("X-Powered-By", ' 3.2.1');
    if (req.method == "OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
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
var RMpurchases = require('./routeModels/RMpurchases'); // 引入RMpurchases（操作商品）模块
var RMusers = require('./routeModels/RMusers'); // 引入RMusers（操作用户）模块

// app.set('view engine', 'jade'); // view engine，模板引擎
app.set('port', 3000);

/*
* 设置session
* */
app.use(session({ // 重启服务器sessionID失效，所以原来存在cookie中的sessionID在重启之后会失效（关闭浏览器不失效）
    // secret: config.get('secret.sessionSecret'),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    name: 'sessionUser',
    cookie: {maxAge: 1000 * 60 * 60}
}));

/*
 *通过app调用express的各种方法
 * */
// 主页（未使用）
app.get('/', function (req, res) {
    var md5 = crypto.createHash('md5');
    console.log('md5加密', md5.update('123').digest('hex'));
    // res.send('Hello World!');
});

// 操作商品模块
app.use('/rm_goods', RMgoods); // 在routeModels-RMgoods.js中
// 添加商品 '/add_goods'
// 彻底删除 '/delete_goods'

// 操作商品模块
app.use('/rm_purchases', RMpurchases); // 在routeModels-RMpurchases.js中

// 操作用户模块
app.use('/rm_users', RMusers); // 在routeModels-RMusers.js中
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