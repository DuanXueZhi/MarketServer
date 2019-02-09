var mongoose = require('mongoose');// 加载 mongoose 工具模块
 // 引入模式文件
var PurchasesSchema = require('../schemas/purchases');
 // 编译生成模型
var Purchases = mongoose.model(
    'purchases',
    PurchasesSchema
);
 // 静态方法
PurchasesSchema.statics.findByPrerequisite = function (prerequisite) {
    switch (prerequisite) {
        case '_id':
            console.log('按_id查询数据');

    }

}
module.exports = Purchases; // 导出此构造函数