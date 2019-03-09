var mongoose = require('mongoose');

var PurchasesSchema = new mongoose.Schema({
    productPurchaseDate: {type: Date, default: Date.now()}, // 商品到货日期
    productPurchaseSeller: {type: String, required: true}, // 商品进货厂商
    productPurchaseName: {type: String, required: true}, // 商品进货名
    productPurchaseSpecificationMsg: {type: Array, default: []}, // 商品到货规格信息
    belongStore: {type: String, default: ''}, // 信息所属店铺
    productPurchaseFreight: {type: Number, default: 0}, // 商品到货运费
    productPurchaseShortage: {type: String, default: false}, // 商品是否缺少
    productPurchaseSpecificAttention: {type: String, default: false}, // 特别注意
    productPurchaseExplain: {type: String, default: ''}, // 进货商品备注
    operateUser: {type: String, default: ''}, // 操作者
    exist: {type: Boolean, default: true}, // 是否存在
    meta: {
        createAt: {type: Date, default: Date.now()},
        updateAt: {type: Date, default: Date.now()}
    }
}
    // {timestamps: true} // 在schema中设置timestamps为true，schema映射的文档document会自动添加createdAt和updatedAt这两个字段，代表创建时间和更新时间
);

//.pre表示每次存储数据之前先调用这个方法
PurchasesSchema.pre('save', function (next) {
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
PurchasesSchema.pre('update', function() {
    var nowTime = new Date(); // 获取时间（格林尼治时间）
    console.log('获取时间（格林尼治时间）');
    var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 将当前时间转换为时间戳并减去当前地区时差
    this.update({},{ $set: { 'meta.updateAt': ChinaTime}});
});

//静态方法
PurchasesSchema.statics = {
    /*
    * 增
    * */
    addPurchasesMsg: function (data, callbackFn) { // 添加商品到货信息
        console.log('模式内置静态方法---添加单个商品');
        console.log(data);
        return this
            .create({
                productPurchaseSeller: data.productPurchaseSeller, // 商品进货厂商
                productPurchaseName: data.productPurchaseName, // 商品进货名
                productPurchaseSpecificationMsg: data.productPurchaseSpecificationMsg, // 商品到货规格信息
                belongStore: data.belongStore, // 信息所属店铺
                productPurchaseFreight: data.productPurchaseFreight, // 商品到货运费
                productPurchaseShortage: data.productPurchaseShortage, // 商品是否缺少
                productPurchaseSpecificAttention: data.productPurchaseSpecificAttention, // 特别注意
                productPurchaseExplain: data.productPurchaseExplain, // 进货商品备注
                operateUser: data.operateUser, // 操作者
                exist: data.exist //是否存在（删除时使用）
            }, callbackFn)
    },
    /*
    * 删
    * */
    // 彻底删除某一条进货信息
    removePurchasesMsg: function (data, callbackFn) {
        console.log('模式内置静态方法---通过_id删除单个进货信息');
        return data
            .remove(callbackFn)
    },

    // 彻底批量删除多条进货信息
    removeBatchPurchasesMsg: function (data, callbackFn) {
        console.log('模式内置静态方法---彻底批量删除多条进货信息', data)
        return this.remove({_id: {$in: data}}, callbackFn)
    },

    /*
    * 改
    * */
    // 修改单个到货信息
    updatePurchasesMsg: function (_id, data, callbackFn) { // 修改单个到货信息
        console.log('模式内置静态方法---修改单个到货信息', data);
        return this
            .update({_id: _id}, {$set: data}, {multi: false}, callbackFn)
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
    }
};



module.exports = PurchasesSchema;