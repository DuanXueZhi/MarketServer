var mongoose = require('mongoose');// 加载 mongoose 工具模块
 // 引入模式文件
var GoodsSchema = require('../schemas/goods');
 // 编译生成模型
var Goods = mongoose.model(
    'goods',
    GoodsSchema
);
 // 静态方法
GoodsSchema.statics.findByPrerequisite = function (prerequisite) {
    switch (prerequisite) {
        case '_id':
            console.log('按_id查询数据');

    }

}


module.exports = Goods; // 导出此构造函数