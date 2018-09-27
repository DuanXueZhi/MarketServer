/*
* 对商品操作商品模块 创建于 2018/8/8
* */
var express = require('express');
var router = express.Router(); // 创建模块化、可挂载的路由句柄

// 导入公用文件
var jsfn = require('../common/jsfn');

/*
* 引入模型
* */
var Goods = require('../models/goods'); // （商品）

/*
* 该路由使用的中间件
* */
// 通用
router.use(function timeLog(req, res, next) {
    console.log('/-------------------------RMgoods(对商品操作商品模块)---------------------------/', Date.now());
    next();
});

/*
* 路由
* */

// （增）
// 添加商品
router.post('/add_goods', function (req, res) {
    console.log('添加商品');
    var productPicture = [];
    req.body.data.productImage.forEach(e => {
        productPicture.push(jsfn.saveImage(e, 'public/image/').replace('public/', 'http://localhost:3000/public/')); // 接收图片转码并存储（写在RMuploadImage.js文件中公用）
    });
    req.body.data.productPicture = productPicture; // 将转换完图片存储的地址写入body.data中
    req.body.data.productImage = []; // 清空一下原来的base64串，减少数据大小
    Goods.addGoods(req.body.data, function (err) { // 调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
        if (err) {
            console.log('添加商品-商品存储错误', err);
            return res.json({code: 1, msg: '商品存储错误'})
        } else {
            // console.log('添加商品-商品存储成功');
            return res.json({code: 0, msg: '商品存储成功', image: productPicture}); // 返回图片地址（图片预览使用）
        }
    });
});

// （删）
// 彻底删除goods列表中的某一数据（admin）
router.delete('/delete_goods', function (req, res) {
    console.log('彻底删除goods列表中的某一数据（admin）');
    // 进行角色校验
    console.log('角色：', req.query.userId);
    // 先查询到再删除（虽然这没用：数据库中不存在的就不会显示，但是为了以后维护现在还是按规矩办事吧）
    Goods.findOneBy_id(req.query.productId, function (err, data) {
        if (err) {
            // console.log('查询出错', err);
            return res.json({code: 1, msg: '查询' + req.query.productId + '出错'})
        } else if (data === null) {
            return res.json({code: 1, msg: '查询' + req.query.productId + '为空'})
        } else {
            // console.log('查询' + req.query.productId + '成功', data);
            Goods.removeProduct(data, function (err1, doc) {
                if (err1) {
                    console.log('删除出错', err1);
                    return res.json({code: 1, msg: '删除商品出错'})
                } else {
                    console.log('删除' + req.query.productId + '成功', doc);
                    return res.json({code: 0, msg: '删除商品成功', data: doc})
                }
            })
        }
    })


})

// （改）

// （查）
// 标签查询
router.get('/find_title', function (req, res) {
    console.log('添加商品时颜色、规格、分类字段在数据库中已存在的值的获取');
    console.log(req.query.userId);
    let colorData = []; // 颜色
    let genreData = []; // 分类
    const findColor = function () {
        Goods.findTitleProductColor(function (err, data) { // 颜色字段
            if (err || data === null) {
                console.log('查询颜色出错');
                return res.json({code: 1, msg: '查询颜色出错'})
            } else {
                // console.log('查询到数据库中所有颜色字段的值', data, typeof data);
                data.forEach(e => {
                    if (colorData.indexOf(e.productColor) === -1) {
                        // console.log('正常写入');
                        colorData.push(e.productColor);
                    }
                });
                findGenre();
            }
        });
    };
    const findGenre = function () {
        Goods.findTitleProductGenre(function (err, data) { // 分类字段
            if (err || data === null) {
                console.log('查询分类出错');
                return res.json({code: 1, msg: '查询分类出错'})
            } else {
                // console.log('查询到数据库中所有分类字段的值', data);
                data.forEach(e => {
                    if (genreData.indexOf(e.productGenre) === -1) {
                        // console.log('正常写入');
                        genreData.push(e.productGenre);
                    }
                });
                return res.json({code: 0, data: {colorData: colorData, genreData: genreData}})
            }
        });
    };
    findColor();
});

// 表查询
// 查询数据库中所有商品及全部商品信息（权限最高，仅admin身份可用）  需要前端传来user_id，与后台保存登录的_id相比较（总之怎么安全怎么弄）。
router.get('/admin_goods', function (req, res) {
   console.log('admin获取所有商品全部信息');
   // 此处应进行用户比对（确保安全）
   console.log(req.query.userId);
   Goods.findAll(function (err, data) {
       if (err || data === null) {
           console.log('查询出错');
           return res.json({code: 1, msg: '查询出错'})
       } else {
           console.log('查询到所有商品');
           return res.json({code: 0, msg: '查询成功', data: data})
       }
   })
});

// 查询所有未删除的商品（exist = true）（boss可用）
router.get('/complete_goods', function (req, res) {
    console.log('boss获取所有商品全部信息');
    // 此处应进行用户比对（确保安全）
    console.log(req.query.userId);
    Goods.findExistAll(function (err, data) {
        if (err || data === null) {
            console.log('查询出错');
            console.log(err);
            return res.json({code: 1, msg: '查询出错'})
        } else {
            console.log('查询到所有商品');
            return res.json({code: 0, msg: '查询成功', data: data})
        }
    })
});




module.exports = router;