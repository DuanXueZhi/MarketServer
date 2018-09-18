var mongoose = require('mongoose');

var GoodsSchema = new mongoose.Schema({
    productId: {type: String, required: true}, // 商品货号
    productName: {type: String, required: true}, // 商品名
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
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});

//.pre表示每次存储数据之前先调用这个方法
GoodsSchema.pre('save', function (next) {
    var nowTime = new Date(); // 获取当前时间
    // console.log(nowTime, new Date(nowTime).getTime());
    var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000; // 将当前时间转换为时间戳并减去当前地区时差
    // console.log('中国时间', ChinaTime);
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = ChinaTime;
    } else {
        this.meta.updateAt = ChinaTime;
    }
    next(); //往下执行
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
    /*
    * 改
    * */
    /*
    * 查
    * */
    // 标签查询
    findTitleProductColor: function (cb) { // 颜色
        return this
            .find({}, {_id: 0, productColor: 1})
            .exec(cb)
    },
    findTitleProductSpecifications: function (cb) { // 规格
        return this
            .find({}, {_id: 0, productSpecifications: 1})
            .exec(cb)
    },
    findTitleProductGenre: function (cb) { // 分类
        return this
            .find({}, {_id: 0, productGenre: 1})
            .exec(cb)
    },
    // 表查询
    findAll: function (cb) { // 查到所有（admin）
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findExistAll: function (cb) { // 查到所有存在（exist = true）的（boss）
        return this
            .find({exist: true})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findByPrerequisite: function (prerequisite, value, cb) { // 按条件查
        var key = prerequisite;
        return this
            .findOne({key: value})
            .exec(cb)
    }
};



module.exports = GoodsSchema;