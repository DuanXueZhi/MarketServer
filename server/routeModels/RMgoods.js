/*
* 对商品操作商品模块 创建于 2018/8/8
* */
var express = require('express');
var router = express.Router(); // 创建模块化、可挂载的路由句柄

// 导入公用函数文件
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
    console.log('/-------------------------RMgoods(对商品操作模块)---------------------------/', Date.now());
    next();
});

/*
* 路由
* */

const nginxIntercept = '.DXZ' // 设置nginx拦截参数
// const commonIP = '60.205.179.224' // 公网IP
const commonIP = 'localhost:3000' // 本地地址

// （增）
// 添加商品
router.post('/add_goods' + nginxIntercept, function (req, res) {
    console.log('添加商品');
    var productData = req.body.data.productData
    var operateUser = req.body.data.operateUser
    console.log(productData, operateUser)
    var productPicture = [];
    productData.productImage.forEach(e => {
        productPicture.push(jsfn.saveImage(e, 'public/image/goodsPicture/').replace('public/', 'http://' + commonIP + '/public/')); // 接收图片转码并存储（写在RMuploadImage.js文件中公用），并添加请求端口
    });
    productData.productPicture = productPicture; // 将转换完图片存储的地址写入body.data中
    productData.productImage = []; // 清空一下原来的base64串，减少数据大小
    Goods.addGoods(productData, function (err) { // 调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
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
router.delete('/delete_goods' + nginxIntercept, function (req, res) {
    console.log('彻底删除goods列表中的某一数据（admin）');
    // 进行角色校验
    console.log('角色：', req.query.userId);
    // 先查询到再删除（虽然这没用：数据库中不存在的就不会显示，但是为了以后维护现在还是按规矩办事吧）
    Goods.findOneBy_id(req.query.product_id, function (err, data) {
        if (err) {
            // console.log('查询出错', err);
            return res.json({code: 1, msg: '查询' + req.query.product_id + '出错'})
        } else if (data === null) {
            return res.json({code: 1, msg: '查询' + req.query.product_id + '为空'})
        } else {
            // console.log('查询' + req.query.productId + '成功', data);
            Goods.removeProduct(data, function (err1, doc) {
                if (err1) {
                    console.log('删除出错', err1);
                    return res.json({code: 1, msg: '删除商品出错'})
                } else {
                    console.log('删除' + req.query.product_id + '成功', doc);
                    return res.json({code: 0, msg: '删除商品成功', data: doc})
                }
            })
        }
    })
});

// 假删除：在（改）update_goods_shamDelete

// （改）
// 修改商品
router.post('/update_goods' + nginxIntercept, function (req, res) {
    console.log('接收修改的商品');
    var operateUser = req.body.data.operateUser // 操作用户
    var updateData = req.body.data.updateData
    var _id = req.body.data._id
    updateData.operateUser = operateUser.userName
    if (updateData.productImage) {
        console.log('图片改变');
        var productPicture = [];
        updateData.productImage.forEach(e => {
            if (e.substring(0, 4) === 'data') {
                productPicture.push(jsfn.saveImage(e, 'public/image/goodsPicture/').replace('public/', 'http://' + commonIP + '/public/')); // 接收图片转码并存储（写在RMuploadImage.js文件中公用）
            }else if (e.substring(0, 4) === 'http') {
                productPicture.push(e)
            }
        });
        updateData.productImage = []; // 清空一下原来的base64
        updateData.productImage = productPicture; // 将转换完图片存储的地址写入body.data中
    }
    console.log('update_goods', updateData)
    Goods.updateGoods(_id, updateData, function (err) { // 调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
        if (err) {
            console.log('修改商品-商品存储错误', err);
            return res.json({code: 1, msg: '商品修改并存储错误'});
        } else {
            // console.log('修改商品-商品存储成功');
            return res.json({code: 0, msg: '商品修改并存储成功', image: productPicture}); // 返回图片地址（图片预览使用）
        }
    });
});

// 假删除（将exist置为false）也就是修改信息了
router.post('/update_goods_shamDelete' + nginxIntercept, function (req, res) {
    console.log('update_goods_shamDelete', req.body.data.userId)
    var _id = req.body.data._id
    Goods.updateGoods(_id, {exist: false}, function (err) {
        if (err) {
            console.log('修改商品exist: false-商品存储错误', err);
            return res.json({code: 1, msg: '商品修改exist: false（假删除）并存储错误'});
        } else {
            // console.log('修改商品-商品存储成功');
            return res.json({code: 0, msg: '商品修改（假删除）并存储成功'}); // 返回图片地址（图片预览使用）
        }
    })
});


// （查）
// 标签查询
router.get('/find_title' + nginxIntercept, function (req, res) {
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
                console.log('查询分类出错', err);
                return res.json({code: 1, msg: '查询分类出错'})
            } else {
                console.log('查询到数据库中所有分类字段的值', data);
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

// 商品列表展示中表头筛选中选项菜单查询
router.post('/find_searchItem' + nginxIntercept, function (req, res) {
    console.log('find_searchItem', req.body.data);
    var searchItem = req.body.data.searchItem; // 筛选项
    var searchData = req.body.data.searchData; // 此时的筛选条件
    for (var obj in searchData) { // 剔除空值
        if (searchData[obj] === '') {
            delete searchData[obj]
        }
    }
    if (searchData.inputCondition) { // 将搜索框输入的东西转换为（商品id、商品名、商品id+名、商品名首拼、商品名全拼）字段，并加入模糊查询
        searchData.$or = [
            {productId: {$regex: searchData.inputCondition}},
            {productName: {$regex: searchData.inputCondition}},
            {productNameFirstSpell: {$regex: searchData.inputCondition}},
            {productNameFullSpell: {$regex: searchData.inputCondition}},
            {productNameAddId: {$regex: searchData.inputCondition}},
            {productGenre: {$regex: searchData.inputCondition}}
        ]
        delete searchData.inputCondition
    }
    var searchAddItem = // 设置find()语句在searchData条件下以searchItem项为分组，得到searchItem在库中有那些不同值
        [
            {$match: searchData},
            {$group: {_id: '$' + searchItem, count: {$sum: 1}}}
        ]
    Goods.findAllSearchItem (searchAddItem, function (err, data) {
        if (err) {
            console.log('查询出错');
            console.log(err);
            return res.json({code: 1, msg: '查询出错'})
        } else {
            console.log('查询到所有条件的选项', data);
            return res.json({code: 0, msg: '查询成功', data: data})
        }
    })
});

// 表查询
// 查询数据库中所有商品及全部商品信息（权限最高，仅admin身份可用）  需要前端传来user_id，与后台保存登录的_id相比较（总之怎么安全怎么弄）。
router.get('/admin_goods' + nginxIntercept, function (req, res) {
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

// 查询所有未删除的商品全部信息（exist = true）（boss可用）
router.get('/complete_goods' + nginxIntercept, function (req, res) {
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

// 通过筛选条件searchData（包括_id）查询商品的所有信息（皆可用，根据身份返回不同的值）[包括按_id查询]
router.post('/goods_by_searchData' + nginxIntercept, function (req, res) {
    console.log('通过searchData获取单个商品全部信息');
    // 此处应进行用户比对（确保安全）
    console.log(req.body, req.body.data.userId); /* -----------------------安全有待开发----------------------- */
    var searchData = req.body.data.searchData;
    for (var obj in searchData) { // 剔除空值
        if (searchData[obj] === '') {
            delete searchData[obj]
        }
    }
    if (searchData.inputCondition) { // 将搜索框输入的东西转换为（商品id、商品名、名首拼、名全拼、商品id+名）字段，并加入模糊查询 [分类、操作者就不需要输入搜索了，点击表头筛选即可，否则输入搜索的结果会有很多无关的]
        console.log('商品搜索输入不为空')
        if (searchData.productName) { // 判断是否使用了‘表头筛选’中的‘商品名’功能，【有：1.商品名/首拼/全拼——按照表头筛选为准。2.商品id/商品名+id——对productNameAddId模糊查询会查到id。3.】
            searchData.productNameAddId = {$regex: searchData.inputCondition}
        } else {
            searchData.$or = [
                {productNameFirstSpell: {$regex: searchData.inputCondition}},
                {productNameFullSpell: {$regex: searchData.inputCondition}},
                {productNameAddId: {$regex: searchData.inputCondition}}
            ]
        }
        delete searchData.inputCondition
    }
    if (searchData._id) { // 按照商品_id查询
        Goods.findOneBy_id(searchData._id, function (err, data) { // 仅传_id
            console.log('按照商品_id查询');
            if (err) {
                console.log('查询出错');
                console.log(err);
                return res.json({code: 1, msg: '查询出错'})
            } else {
                console.log('查询到商品');
                return res.json({code: 0, msg: '查询成功', data: data})
            }
        })
    } else { // 多条件筛选
        Goods.findBySearchData(searchData, function (err, data) {
            if (err) {
                console.log('查询出错');
                console.log(err);
                return res.json({code: 1, msg: '查询出错'})
            } else {
                console.log('查询到商品s');
                return res.json({code: 0, msg: '查询成功', data: data})
            }
        })
    }
});


module.exports = router;