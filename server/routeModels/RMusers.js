/*
* 对到用户操作模块 创建于 2019/01/23
* */
var express = require('express');
var router = express.Router(); // 创建模块化、可挂载的路由句柄


// 导入公用函数文件
var jsfn = require('../common/jsfn');

/*
* 引入模型
* */
var Users = require('../models/users'); // （用户）

/*
* 该路由使用的中间件
* */
// 通用
router.use(function timeLog(req, res, next) {
    console.log('/-------------------------RMusers(对用户操作模块)---------------------------/', Date.now());
    next();
});

/*
* 路由
* */

// 设置nginx拦截参数
const nginxIntercept = '.DXZ'

// （增）
// 添加用户
router.post('/add_user' + nginxIntercept, function (req, res) {
    console.log('添加添用户');
    var userData = req.body.data.user
    var operateUser = req.body.data.operateUser // 操作者id-------------------------------------------安全
    if (operateUser) { // 有操作者，说明是店员注册
        userData.myBoss = operateUser.userName // 添加myBoss字段
    }
    Users.findOneUser({userName: userData.userName}, function (err, data) {
        if (err) {
            console.log('添加用户-查询错误', err);
            return res.json({code: 2, msg: '用户添加-查询错误'})
        } else if (data === null) {
            console.log('添加用户-用户不存在-添加', data);
            Users.addUser(userData, function (err1) { // 调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
                if (err1) {
                    console.log('添加用户-用户存储错误', err1);
                    return res.json({code: 1, msg: '用户存储错误'})
                } else {
                    console.log('添加用户-用户存储成功');
                    if (operateUser) { // 有操作者，说明是店员注册
                        Users.findOneBy_id(operateUser.userId, function (err2, data2) { // 【查询店长】
                            if (err2) {
                                console.log('添加用户-查询店长出错', err2);
                                return res.json({code: 4, msg: '添加用户-查询店长出错'})
                            } else {
                                console.log('添加用户-查询店长成功');
                                var myAssistant = data2.myAssistant
                                myAssistant.push(userData.userName)
                                Users.updateUserMsg(operateUser.userId, {myAssistant: myAssistant}, function (err3, data3) {
                                    if (err3) {
                                        console.log('添加用户-查询店长-添加店员出错')
                                        return res.json({code: 5, msg: '添加用户-查询店长-添加店员出错'})
                                    } else {
                                        console.log('添加用户-查询店长-添加店员成功')
                                        return res.json({code: 0, msg: '用户注册，并添加店员成功'});
                                    }
                                })
                            }
                        })
                    } else {
                        return res.json({code: 0, msg: '用户注册'});
                    }
                }
            });
        } else {
            console.log('添加用户-用户已存在')
            return res.json({code: 3, msg: '用户已存在'})
        }
    })
});

// （删）
// 彻底删除users列表中的某一用户数据（admin）
router.delete('/delete_users' + nginxIntercept, function (req, res) {
    console.log('彻底删除users列表中的某一数据（admin）');
    var userId = req.query.userId // 要删除的用户_id
    // 进行角色校验
    var operateUser = req.query.operateUser
    console.log('角色：', operateUser);
    // 先查询到再删除（虽然这没用：数据库中不存在的就不会显示，但是为了以后维护现在还是按规矩办事吧）
    Users.findOneBy_id(userId, function (err, data) {
        if (err) {
            // console.log('查询出错', err);
            return res.json({code: 1, msg: '查询' + userId + '出错'})
        } else if (data === null) {
            return res.json({code: 1, msg: '查询' + userId + '为空'})
        } else {
            // console.log('查询' + req.query.productId + '成功', data);
            Users.removeUser(data, function (err1, doc) {
                if (err1) {
                    console.log('删除出错', err1);
                    return res.json({code: 1, msg: '删除用户出错'})
                } else {
                    console.log('删除' + userId + '成功', doc);
                    return res.json({code: 0, msg: '删除用户成功', data: doc})
                }
            })
        }
    })
});

// 假删除：在（改）update_goods_shamDelete

// 彻底批量删除
router.delete('/delete_users_batch' + nginxIntercept, function (req, res) {
    console.log('彻底批量删除（admin）');
    // 进行角色校验
    var operateUser = req.query.operateUser
    console.log('角色：', operateUser);
    var idArray = req.query.idArray
    Users.removeBatchUsers(idArray, function (err, doc) {
        if (err) {
            console.log('批量删除出错', err);
            return res.json({code: 1, msg: '批量删除用户出错'})
        } else {
            console.log('批量删除成功', doc);
            return res.json({code: 0, msg: '删除用户成功', data: doc})
        }
    })
});

// （改）
// 修改用户信息
router.post('/update_users' + nginxIntercept, function (req, res) {
    console.log('修改用户信息');
    var operateUser = req.body.data.operateUser // 执行此操作的用户 -------------------------------to-do
    var updateData = req.body.data.updateData
    console.log('/update_users', updateData)
    var _id = req.body.data._id
    for (var obj in updateData) { // 剔除空值
        if (updateData[obj] === '') {
            delete updateData[obj]
        }
    }
    if (updateData.deleteAssistant) { // 判断是否修改了商家用户的店员（user.myAssistant），判断已删除的店员数组是否存在
        Users.updateUserMsgBulk({userName: {$in: updateData.deleteAssistant}}, {$set: {myBoss: '', chooseStoreOwner: -1}}, function (err1) { // 将myBoss(我的店长)字段置为空，chooseStoreOwner(店长选择情况)字段置为-1(未选择店长)
            if (err1) {
                console.log('修改用户信息-修改店员错误', err1);
                return res.json({code: 1, msg: '修改用户信息-修改店员错误'});
            }
        })
        delete updateData.deleteAssistant
    }
    Users.updateUserMsg(_id, updateData, function (err) { // 调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
        if (err) {
            console.log('修改用户信息-存储错误', err);
            return res.json({code: 1, msg: '修改用户信息-存储错误'});
        } else {
            // console.log('修改商品-商品存储成功');
            return res.json({code: 0, msg: '修改用户信息成功'});
        }
    });
});

// 店员选择店长
router.post('/assistant_choose_myBoss' + nginxIntercept, function (req, res) {
    console.log('店员选择店长')
    /* 参数转换 */
    var operateUser = req.body.data.operateUser
    var updateData = req.body.data.updateData
    var bossId = req.body.data.bossId
    /* 参数转换 */
    Users.findOneBy_id(bossId, function (err, data) { // 先查询选择的boss是否存在
        if (err) {
            console.log('店员选择店长-店长查询错误', err);
            return res.json({code: 1, msg: '店员选择店长-店长查询错误'});
        } else { // 店长存在【则修改店员myBoss字段】
            var newMyAssistant = data.myAssistant // 整理店长myBoss字段
            if (newMyAssistant.indexOf(operateUser.userName) === -1) { // 查询是否已存在
                newMyAssistant.push(operateUser.userName)
            } else {
                return res.json({code: 4, msg: '店员选择店长-店员myBoss字段-更新店长myAssistant字段-已存在'});
            }
            Users.updateUserMsg(operateUser.userId, updateData, function (err1) { // 【updateData: {myBoss: userName}】调用模式中静态方法，存储数据 参数1：存储数据， 参数2：回调函数
                if (err1) {
                    console.log('店员选择店长-店员myBoss字段-存储错误', err1);
                    return res.json({code: 2, msg: '店员选择店长-店员myBoss字段-存储错误'});
                } else {
                    Users.updateUserMsg(bossId, {myAssistant: newMyAssistant}, function (err2) {
                        if (err2) {
                            console.log('店员选择店长-店员myBoss字段-更新店长myAssistant字段-存储错误', err2);
                            return res.json({code: 3, msg: '店员选择店长-店员myBoss字段-更新店长myAssistant字段-存储错误'});
                        } else {
                            return res.json({code: 0, msg: '店员选择店长-店员myBoss字段-更新店长myAssistant字段-成功'});
                        }
                    })
                }
            });
        }
    })

});

// 假删除（将exist置为false）也就是修改信息了
router.post('/update_users_shamDelete' + nginxIntercept, function (req, res) {
    console.log('update_users_shamDelete', req.body.data.userId)
    var _id = req.body.data._id
    Users.updateUserMsg(_id, {exist: false}, function (err) {
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
// 查询所有未删除的用户全部信息（exist = true）（admin查询现有用户）
router.get('/complete_users' + nginxIntercept, function (req, res) {
    console.log('complete_users，admin查询现有用户获取所有存在用户全部信息');
    // 此处应进行用户比对（确保安全）
    console.log(req.query.operateUser);
    Users.findExistAll(function (err, data) {
        if (err || data === null) {
            console.log('查询出错');
            console.log(err);
            return res.json({code: 1, msg: '查询出错'})
        } else {
            console.log('查询到所有用户');
            return res.json({code: 0, msg: '查询成功', data: data})
        }
    })
});

// 通过筛选条件searchData（包括_id）查询商品的所有信息（皆可用，根据身份返回不同的值）[包括按_id查询]
router.post('/users_by_searchData' + nginxIntercept, function (req, res) {
    console.log('通过users_by_searchData获取用户全部信息');
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
        Users.findOneBy_id(searchData._id, function (err, data) { // 仅传_id
            console.log('按照商品_id查询');
            if (err) {
                console.log('查询出错');
                console.log(err);
                return res.json({code: 1, msg: '查询出错'})
            } else {
                console.log('查询到用户');
                return res.json({code: 0, msg: '查询成功', data: data})
            }
        })
    } else { // 多条件筛选
        Users.findBySearchData(searchData, function (err, data) {
            if (err) {
                console.log('查询出错');
                console.log(err);
                return res.json({code: 1, msg: '查询出错'})
            } else {
                console.log('查询到用户s');
                return res.json({code: 0, msg: '查询成功', data: data})
            }
        })
    }
});

// 用户登录
router.post('/user_login' + nginxIntercept, function (req, res) {
    var _this = this
    console.log('user_login', req.body)
    var user = req.body.data.user
    Users.findOneUser({userName: user.userName}, function (err, data) {
        if (err) {
            console.log('查询出错');
            console.log(err);
            return res.json({code: 1, msg: '查询出错'})
        } else {
            if (data !== null) {
                console.log('查询到用户', data);
                if (data.userPassword === user.userPassword) {
                    console.log('查询成功，且密码正确，允许登录，返回用户名和身份')
                    res.cookie('userId', jsfn.Encrypt(data._id), { // 存储用户_id
                        path: '/', // 存在根目录下
                        maxAge: 1000 * 60 * 60,
                        httpOnly: false // httpOnly 当这个选项为true时候，表明这个cookie只能有服务器修改，也就是说不能使用js修改他，这个有助于防范xss攻击
                    })
                    res.cookie('userName', jsfn.Encrypt(data.userName), { // 存储用户名
                        path: '/', // 存在根目录下
                        maxAge: 1000 * 60 * 60,
                        httpOnly: false // 【若为true，前端document.cookie不能获取Cookies值】httpOnly 当这个选项为true时候，表明这个cookie只能有服务器修改，也就是说不能使用js修改他，这个有助于防范xss攻击
                    })
                    res.cookie('identity', jsfn.Encrypt(data.identity), { // 存储用户身份
                        path: '/', // 存在根目录下
                        maxAge: 1000 * 60 * 60,
                        httpOnly: false // httpOnly 当这个选项为true时候，表明这个cookie只能有服务器修改，也就是说不能使用js修改他，这个有助于防范xss攻击
                    })
                    req.session.sessionUser = data // 存储用户详细信息
                    // 更新users表中lastLoginTime（最后登录时间）字段
                    Users.updateUserMsg(data._id, {lastLoginTime: jsfn.localTime()}, function (err1, data1) {
                        if (err1) {
                            console.log('登录成功，但修改lastLoginTime失败', err1)
                            return res.json({code: 4, msg: '登录成功，但修改登录时间失败'})
                        } else {
                            console.log('登录成功，修改lastLoginTime成功')
                            return res.json({code: 0, msg: '用户查询成功，且密码正确，并修改登录时间，允许登录', data: {userId: data._id, userName: data.userName, identity: data.identity, myBoss: data.myBoss, chooseStoreOwner: data.chooseStoreOwner}})
                        }
                    })
                } else {
                    console.log('密码不正确')
                    return res.json({code: 3, msg: '用户名或密码错误（**不正确）'})
                }
            } else {
                console.log('用户不存在！')
                return res.json(({code: 2, msg: '用户不存在', data}))
            }
        }
    })
});

// 用户退出
router.get('/user_logout' + nginxIntercept, function (req, res) {
    console.log('user_logout')
    var {userId, userName, identity} = req.query
    var operateUser = {userId: userId, userName: userName, identity: identity} // 执行此操作的用户
    if (req.cookies && req.session.sessionUser) {
        var cookiesUser = {userId: jsfn.Decrypt(req.cookies.userId), userName: jsfn.Decrypt(req.cookies.userName), identity: jsfn.Decrypt(req.cookies.identity)}
        var sessionUser = {userId: req.session.sessionUser._id, userName: req.session.sessionUser.userName, identity: req.session.sessionUser.identity}
        res.clearCookie('userId') // 清除Cookies
        res.clearCookie('userName') // 清除Cookies
        res.clearCookie('identity') // 清除Cookies
        res.clearCookie('sessionUser') // 清除Cookies
        delete req.session.sessionUser // 删除delete
        if (jsfn.userMsgVerify(operateUser, cookiesUser, sessionUser)) { // 使用公用函数判断用户信息是否被篡改
            console.log('操作用户 === cookies用户 === session用户，用户身份正确，且未认为修改用户，允许退出')
            res.clearCookie('userId') // 清除Cookies
            res.clearCookie('userName') // 清除Cookies
            res.clearCookie('identity') // 清除Cookies
            res.clearCookie('sessionUser') // 清除Cookies
            delete req.session.sessionUser // 删除delete
            return res.json(({code: 0, msg: '退出成功'}))
        } else {
            console.log('数据可能被篡改')
            return res.json(({code: 2, msg: '浏览器数据被篡改，请刷新重试'}))
        }
    } else {
        console.log('用户未登录，或登录身份过期，请重新登录')
        return res.json(({code: 1, msg: '用户未登录，或登录身份过期，请重新登录'}))
    }
});

module.exports = router
