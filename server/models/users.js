var mongoose = require('mongoose');// 加载 mongoose 工具模块
 // 引入模式文件
var UsersSchema = require('../schemas/users');
 // 编译生成模型
var Users = mongoose.model(
    'users',
    UsersSchema
);
 // 静态方法
UsersSchema.statics.findByPrerequisite = function (prerequisite) {
    switch (prerequisite) {
        case '_id':
            console.log('按_id查询数据');

    }

}
module.exports = Users; // 导出此构造函数