var mongoose = require('mongoose');// 加载 mongoose 工具模块
// 引入模式文件
var GoodsSchema = require('../schemas/goods');
// 编译生成模型
var Goods = mongoose.model(
    'goods',
    GoodsSchema
);


module.exports = Goods; // 导出此构造函数