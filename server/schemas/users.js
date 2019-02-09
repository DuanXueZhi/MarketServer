var mongoose = require('mongoose');

var UsersSchema = new mongoose.Schema({
    userName: {type: String, required: true}, // 用户名
    userPassword: {type: String, default: '000000'}, // 密码
    identity: {type: String, required: true}, // 用户身份【在线购买者(onlineBuyer)、店长(boss)、店员(assistant)、管理员(admin)】
    userImage: {type: String, default: ''}, // 用户头像
    userSex: {type: String, default: '男'}, // 用户性别
    telephone: {type: Number, default: ''}, // 用户绑定（默认）电话
    shoppingTrolley: {type: Array, default: []}, // 用户购物车【在线购买者、店长、店员】
    addressList: {type: Array, default: []}, // 用户地址列表 [{streetName: '', tel: ''}]【在线购买者、店长、店员】
    lastLoginTime: {type: Date, default: Date.now()}, // 用户最后登录时间
    myAssistant: {type: Array, default: []}, // 我的店员【第一店长使用】
    myBoss: {type: String, default: ''}, // 我的店长【非第一店长、以及店员使用】
    chooseStoreOwner: {type: Number, default: 0}, // 是否已选择店长 【默认为0，-1：(无店长)未选择，0：已有店长，1：(无店长)已选择(待店长审核)】
    exist: {type: Boolean, default: true}, // 是否存在
    meta: {
        createAt: {type: Date, default: Date.now()},
        updateAt: {type: Date, default: Date.now()}
    }
}
    // {timestamps: true} // 在schema中设置timestamps为true，schema映射的文档document会自动添加createdAt和updatedAt这两个字段，代表创建时间和更新时间
);

//.pre表示每次存储数据之前先调用这个方法
UsersSchema.pre('save', function (next) {
    var nowTime = new Date(); // 获取时间（格林尼治时间）
    console.log(nowTime, new Date(nowTime).getTime());
    var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 将当前时间转换为时间戳并减去当前地区时差
    var nowDate = new Date(nowTime.toLocaleDateString()).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 获取当前日期并转换为毫秒再加上当地时差毫秒之后再存入数据库【mongodb数据库存入时间会减8，所以存之前要先加8】
    console.log('中国时间', ChinaTime);
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = ChinaTime;
        this.productPurchaseDate = nowDate;
    } else {
        this.meta.updateAt = ChinaTime;
    }
    next(); //往下执行
});

// 修改前先更新修改时间
UsersSchema.pre('update', function() {
    var nowTime = new Date(); // 获取时间（格林尼治时间）
    console.log('获取时间（格林尼治时间）');
    var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 将当前时间转换为时间戳并减去当前地区时差
    this.update({},{ $set: { 'meta.updateAt': ChinaTime}});
});

//静态方法
UsersSchema.statics = {
    /*
    * 增
    * */
    addUser: function (data, callbackFn) { // 添加用户
        console.log('模式内置静态方法---添加用户');
        console.log(data);
        return this
            .create({
                userName: data.userName, // 用户名
                userPassword: data.userPassword, // 密码
                identity: data.identity, // 用户身份
                userSex: data.userSex, // 用户性别
                telephone: data.telephone, // 用户绑定（默认）电话
                shoppingTrolley: data.shoppingTrolley, // 用户购物车
                addressList: data.addressList, // 用户地址列表 [{streetName: '', tel: ''}]
                lastLoginTime: data.lastLoginTime, // 用户最后登录时间
                myAssistant: data.myAssistant, // 我的店员【第一店长使用】
                myBoss: data.myBoss, // 我的店长【非第一店长、以及店员使用】
                exist: data.exist //是否存在（删除时使用）
            }, callbackFn)
    },

    /*
    * 删
    * */
    // 彻底删除某一条进货信息
    removeUser: function (data, callbackFn) {
        console.log('模式内置静态方法---通过_id删除单个用户');
        return data
            .remove(callbackFn)
    },

    // 彻底批量删除多条进货信息
    removeBatchUsers: function (data, callbackFn) {
        console.log('模式内置静态方法---彻底批量删除多个用户', data)
        return this.remove({_id: {$in: data}}, callbackFn)
    },

    /*
    * 改
    * */
    // 修改单个用户信息
    updateUserMsg: function (_id, data, callbackFn) { // 修改单个用户信息
        console.log('模式内置静态方法---修改单个用户信息', data);
        return this
            .update({_id: _id}, {$set: data}, {multi: false}, callbackFn)
    },

    // 批量修改用户信息
    updateUserMsgBulk: function (searchData, updateData, callbackFn) {
        console.log('模式内置静态方法---批量修改用户信息');
        return this
            .update(searchData, updateData, {multi: true}, callbackFn)
    },

    /*
    * 查
    * */
    // 所有筛选条件的项
    findAllSearchItem: function (data, cb) {
        console.log('findAllSearchItem', data);
        return this
            .aggregate(data)
            .sort({'meta.updateAt': -1}) // 默认按照修改时间倒叙排列
            .exec(cb)
    },

    // 表查询
    // 查到所有（admin）
    findAll: function (cb) {
        return this
            .find({})
            .sort({'meta.updateAt': -1}) // 默认按照修改时间倒叙排列
            .exec(cb)
    },

    // 查到所有存在（exist = true）的（boss）
    findExistAll: function (cb) {
        return this
            .find({exist: true})
            .sort({'meta.updateAt': -1}) // 默认按照修改时间倒叙排列
            .exec(cb)
    },

    // 按条件查：_id
    findOneBy_id: function (data, cb) {
        console.log('findOneBy_id', data);
        return this
            .findById(data) // 如果在查询语句中要使用_id，则需要使用findById语句，而不能使用find或findOne语句
            .exec(cb)
    },

    // 按条件查：searchData
    findBySearchData: function (data, cb) {
        console.log('findBySearchData', data);
        return this
            .find(data)
            // .aggregate([{$group: {_id: '$productGenre'}}])
            .sort({'meta.updateAt': -1}) // 默认按照修改时间倒叙排列
            .exec(cb)
    },

    // 查询一个（用户登录）
    findOneUser: function (data, cb) {
        console.log('findOneUser', data);
        return this
            .findOne(data)
            .exec(cb)
    }
};



module.exports = UsersSchema;