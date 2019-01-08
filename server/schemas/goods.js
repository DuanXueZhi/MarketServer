var mongoose = require('mongoose');

var GoodsSchema = new mongoose.Schema({
    productId: {type: String, required: true}, // 商品货号
    productName: {type: String, required: true}, // 商品名
    productNameAddId: {type: String, required: true}, // 商品名+id
    productNameFirstSpell: {type: String,default: '品名首拼'}, // 品名首拼
    productNameFullSpell: {type: String,default: '品名全拼'}, // 品名全拼
    productSeller: {type: String,default: '厂商'}, // 厂商
    productImage: {type: Array,default: []},//商品图片
    productDetails: {type: String,default: '商品详情'}, // 商品详情
    productColor: {type: String,default: '商品颜色'}, // 商品颜色
    productSpecifications: {type: Array,default: []}, // 商品规格
    productGenre: {type: String,default: ''}, // 商品分类
    productOriginalPrice: {type: Number,default: 0}, // 商品进价
    productBatchPrice: {type: Number,default: 0}, // 商品批量售价
    productSoloPrice: {type: Number,default: 0}, // 商品零售价
    userId: {type: String,default: ''}, // 商品操作者
    productExplain: {type: String,default: ''}, // 商品备注
    exist: {type: Boolean,default: true}, // 是否存在（删除时使用）
    meta: {
        createAt: {type: Date, default: Date.now()},
        updateAt: {type: Date, default: Date.now()}
    },
    ApdatedAt: {type: Date, default: Date.now()}
}
    // {timestamps: true} // 在schema中设置timestamps为true，schema映射的文档document会自动添加createdAt和updatedAt这两个字段，代表创建时间和更新时间
);

//.pre表示每次存储数据之前先调用这个方法
GoodsSchema.pre('save', function (next) {
    var nowTime = new Date(); // 获取时间（格林尼治时间）
    // console.log(nowTime, new Date(nowTime).getTime());
    var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 将当前时间转换为时间戳并减去当前地区时差
    console.log('中国时间', ChinaTime);
    if (this.isNew) {
        console.log('新abc',  'THIS============================', this, 'OBJ==========================', this.meta.createAt);
        this.meta.createAt = this.meta.updateAt = ChinaTime;
    } else {
        console.log('旧', 'THIS============================', this, 'OBJ=========================', this.schema.obj.meta.updateAt);
        this.meta.updateAt = ChinaTime;
    }
    next(); //往下执行
});

// 修改前先更新修改时间
GoodsSchema.pre('update', function() {
    var nowTime = new Date(); // 获取时间（格林尼治时间）
    // console.log(nowTime, new Date(nowTime).getTime());
    var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 将当前时间转换为时间戳并减去当前地区时差
    this.update({},{ $set: { 'meta.updateAt': ChinaTime}});
});

//静态方法
GoodsSchema.statics = {
    /*
    * 增
    * */
    addGoods: function (data, callbackFn) { // 添加单个商品
        console.log('模式内置静态方法---添加单个商品');
        console.log(data);
        return this
            .create({
                productId: data.productId, //商品货号
                productName: data.productName, //商品名
                productNameAddId: data.productNameAddId, // 商品名+id
                productNameFirstSpell: data.productNameFirstSpell, //品名首拼
                productNameFullSpell: data.productNameFullSpell, //品名全拼
                productSeller: data.productSeller, //厂商
                productImage: data.productPicture, //商品图片
                productDetails: data.productDetails, //商品详情
                productColor: data.productColor,//商品颜色
                productSpecifications: data.productSpecifications, //商品规格
                productGenre: data.productGenre, //商品分类
                productOriginalPrice: data.productOriginalPrice, //商品进价
                productBatchPrice: data.productBatchPrice, //商品批量售价
                productSoloPrice: data.productSoloPrice, //商品零售价
                userId: data.userId, //商品操作者
                productExplain: data.productExplain, //商品备注
                exist: data.exist //是否存在（删除时使用）
            }, callbackFn)
    },
    /*
    * 删
    * */
    // 彻底删除某一商品
    removeProduct: function (data, callbackFn) {
        console.log('模式内置静态方法---通过_id删除单个商品');
        return data
            .remove(callbackFn)
    },

    /*
    * 改
    * */
    // 修改商品
    updateGoods: function (_id, data, callbackFn) { // 修改单个商品
        console.log('模式内置静态方法---修改单个商品');
        var nowTime = new Date(); // 获取时间（格林尼治时间）
        var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 将当前时间转换为时间戳并减去当前地区时差
        this.update({_id: _id}, {$set: {'meta.$.updateAt': ChinaTime}})
        return this
            .update({_id: _id}, {$set: data}, {multi: false}, callbackFn)
    },

    /*
    * 查
    * */
    // 标签查询
    // 颜色
    findTitleProductColor: function (cb) {
        return this
            .find({}, {_id: 0, productColor: 1})
            .exec(cb)
    },

    // 分类
    findTitleProductGenre: function (cb) {
        return this
            .find({}, {_id: 0, productGenre: 1})
            // .aggregate([{$group: {_id: '$productGenre'}}])
            .exec(cb)
    },

    // 搜有筛选条件的项
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



module.exports = GoodsSchema;