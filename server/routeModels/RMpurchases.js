/*
* 对到货信息操作模块 创建于 2019/01/11
* */
var express = require('express');
var router = express.Router(); // 创建模块化、可挂载的路由句柄

// 导入公用函数文件
var jsfn = require('../common/jsfn');

/*
* 引入模型
* */
var Purchases = require('../models/purchases'); // （到货信息）

/*
* 该路由使用的中间件
* */
// 通用
router.use(function timeLog(req, res, next) {
    console.log('/-------------------------RMpurchases(对到货信息操作模块)---------------------------/', Date.now());
    next();
});

/*
* 路由
* */

// 设置nginx拦截参数
const nginxIntercept = '.DXZ'

// （增）
// 添加到货信息
router.post('/add_purchases' + nginxIntercept, function (req, res) {
    console.log('添加添加到货信息');
    Purchases.addPurchasesMsg(req.body.data, function (err) { // 调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
        if (err) {
            console.log('添加到货信息-到货信息存储错误', err);
            return res.json({code: 1, msg: '到货信息存储错误'})
        } else {
            // console.log('添加到货信息-到货信息存储成功');
            return res.json({code: 0, msg: '到货信息存储成功'}); // 返回图片地址（图片预览使用）
        }
    });
});

// （删）
// 彻底删除purchases列表中的某一数据（admin）
router.delete('/delete_purchases' + nginxIntercept, function (req, res) {
    console.log('彻底删除purchases列表中的某一数据（admin）');
    // 进行角色校验
    console.log('角色：', req.query.userId);
    // 先查询到再删除（虽然这没用：数据库中不存在的就不会显示，但是为了以后维护现在还是按规矩办事吧）
    Purchases.findOneBy_id(req.query.purchases_id, function (err, data) {
        if (err) {
            // console.log('查询出错', err);
            return res.json({code: 1, msg: '查询' + req.query.purchases_id + '出错'})
        } else if (data === null) {
            return res.json({code: 1, msg: '查询' + req.query.purchases_id + '为空'})
        } else {
            // console.log('查询' + req.query.productId + '成功', data);
            Purchases.removePurchasesMsg(data, function (err1, doc) {
                if (err1) {
                    console.log('删除出错', err1);
                    return res.json({code: 1, msg: '删除到货信息出错'})
                } else {
                    console.log('删除' + req.query.purchases_id + '成功', doc);
                    return res.json({code: 0, msg: '删除到货信息成功', data: doc})
                }
            })
        }
    })
});

// 假删除：在（改）update_goods_shamDelete

// 彻底批量删除
router.delete('/delete_purchases_batch' + nginxIntercept, function (req, res) {
    console.log('彻底批量删除（admin）');
    // 进行角色校验
    console.log('角色：', req.query.userId);
    var idArray = req.query.idArray
    Purchases.removeBatchPurchasesMsg(idArray, function (err, doc) {
        if (err) {
            console.log('批量删除出错', err);
            return res.json({code: 1, msg: '批量删除到货信息出错'})
        } else {
            console.log('批量删除成功', doc);
            return res.json({code: 0, msg: '删除到货信息成功', data: doc})
        }
    })
});

// （改）
// 修改商品
router.post('/update_purchases' + nginxIntercept, function (req, res) {
    console.log('接收修改的到货信息');
    var userId = req.body.data.userId // 用户Id
    var updateData = req.body.data.updateData
    var _id = req.body.data._id
    Purchases.updatePurchasesMsg(_id, updateData, function (err) { // 调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
        if (err) {
            console.log('修改商品-商品存储错误', err);
            return res.json({code: 1, msg: '商品修改并存储错误'});
        } else {
            // console.log('修改商品-商品存储成功');
            return res.json({code: 0, msg: '商品修改并存储成功'}); // 返回图片地址（图片预览使用）
        }
    });
});

// 假删除（将exist置为false）也就是修改信息了
router.post('/update_purchases_shamDelete' + nginxIntercept, function (req, res) {
    console.log('update_purchases_shamDelete', req.body.data.userId)
    var _id = req.body.data._id
    Purchases.updatePurchasesMsg(_id, {exist: false}, function (err) {
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
// 所有到货日期查询
router.post('/find_allTime' + nginxIntercept, function (req, res) {
    console.log('find_allTime', req.body)
    var userId = req.body.userId // 安全--------------------------------有待开发
    var searchItem = req.body.data.searchItem; // 筛选项
    var searchData = req.body.data.searchData; // 此时的筛选条件
    for (var obj in searchData) { // 剔除空值
        if (searchData[obj] === '') {
            delete searchData[obj]
        }
    }
    if (searchData.inputCondition) { // 将搜索框输入的东西转换为（商品id、商品名、商品id+名、商品名首拼、商品名全拼）字段，并加入模糊查询
        searchData.$or = [
            {productPurchaseSeller: {$regex: searchData.inputCondition}},
            {productPurchaseName: {$regex: searchData.inputCondition}}
        ]
        delete searchData.inputCondition
    }
    var searchAddItem = // 设置find()语句在searchData条件下以searchItem项为分组，得到searchItem在库中有那些不同值
        [
            {$match: searchData},
            {$group: {_id: '$' + searchItem, count: {$sum: 1}}}
        ]
    Purchases.findAllSearchItem (searchAddItem, function (err, data) {
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
    var searchAddItem =
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
// 查询所有未删除的到货信息全部信息（exist = true）（boss可用）
router.get('/complete_purchases' + nginxIntercept, function (req, res) {
    console.log('boss获取所有到货信息全部信息');
    // 此处应进行用户比对（确保安全）
    console.log(req.query.userId);
    Purchases.findExistAll(function (err, data) {
        if (err || data === null) {
            console.log('查询出错');
            console.log(err);
            return res.json({code: 1, msg: '查询出错'})
        } else {
            console.log('查询到所有到货信息');
            return res.json({code: 0, msg: '查询成功', data: data})
        }
    })
});

// 通过筛选条件searchData（包括_id）查询商品的所有信息（皆可用，根据身份返回不同的值）[包括按_id查询]
router.post('/purchases_by_searchData' + nginxIntercept, function (req, res) {
    console.log('通过searchData获取单个到货全部信息');
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
        if (searchData.productPurchaseName && searchData.productPurchaseSeller) {
            console.log('两个选项都存在')
            delete searchData.inputCondition // 直接删除搜索框输入
        }
        if (searchData.productPurchaseName) { // 判断是否使用了‘表头筛选’中的‘到货信息商品名’功能，【有：1.商品名/首拼/全拼——按照表头筛选为准。2.商品id/商品名+id——对productNameAddId模糊查询会查到id。3.】
            searchData.productPurchaseSeller = {$regex: searchData.inputCondition}
        } else{
            searchData.productPurchaseName = {$regex: searchData.inputCondition}
        }
        delete searchData.inputCondition
    }
    if (searchData._id) { // 按照商品_id查询
        Purchases.findOneBy_id(searchData._id, function (err, data) { // 仅传_id
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
        Purchases.findBySearchData(searchData, function (err, data) {
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


module.exports = router
