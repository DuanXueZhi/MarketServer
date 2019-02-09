/*
* 系统公用函数，创建于2018-09-06
* */
var fs = require('fs');

// 图片转码并存储
saveImage = function (base64Image, position) { // 参数：base64Image：图片，position：预定存储位置
    console.log('公用转码并储存图片函数');
    var imageBuffer = new Buffer(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    var imagePath = position + Date.now() + '.png';
    fs.writeFileSync(imagePath, imageBuffer); // 同步写入文件
    return imagePath
};
// 换算为当地时间戳（中国）
localTime = function () {
    // 中国时间戳
    var nowTime = new Date() // 获取时间（格林尼治时间）
    // console.log(nowTime, new Date(nowTime).getTime())
    var ChinaTime = new Date(nowTime).getTime() - nowTime.getTimezoneOffset() * 60 * 1000 // 将当前时间转换为时间戳并减去当前地区时差
    return ChinaTime
}
// crypto-js加密/解密函数
const CryptoJS = require('crypto-js');  //引用AES源码js

const key = CryptoJS.enc.Utf8.parse('1234123412ABCDEF') // 十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412') // 十六位十六进制数作为密钥偏移量

//解密方法
function Decrypt(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

//加密方法
function Encrypt(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}

// 【暴力：待改】operateUser、CookiesUser、sessionUser三者是否相等，【判断当前用户是否被人为修改】[目前考虑此函数使用量较大，故使用固定对比，即不灵活对比，仅适用于用户信息{userName: xxx, identity: xxx}]
userMsgVerify = function (operateUser, CookiesUser, sessionUser) {
    if (operateUser instanceof Object && CookiesUser instanceof Object && sessionUser instanceof Object) {
        if (Object.keys(operateUser).length === Object.keys(CookiesUser).length &&
            Object.keys(operateUser).length === Object.keys(sessionUser).length &&
            Object.keys(CookiesUser).length === Object.keys(sessionUser).length) {
            if (operateUser.userId === CookiesUser.userId &&
                operateUser.userId === sessionUser.userId &&
                CookiesUser.userId === sessionUser.userId) {
                if (operateUser.userName === CookiesUser.userName &&
                    operateUser.userName === sessionUser.userName &&
                    CookiesUser.userName === sessionUser.userName) {
                    if (operateUser.identity === CookiesUser.identity &&
                        operateUser.identity === sessionUser.identity &&
                        CookiesUser.identity === sessionUser.identity) {
                        return true
                    } else {
                        console.log('传入数据identity不一')
                        return false
                    }
                } else {
                    console.log('传入数据userName不一')
                    return false
                }
            } else {
                console.log('传入数据userId不一')
                console.log(operateUser.userId, CookiesUser.userId, sessionUser.userId)
                return false
            }
        } else {
            console.log('传入数据包含长度错误')
            return false
        }
    } else {
        console.log('有非对象类型数据')
        return false
    }
}

module.exports = {saveImage, localTime, Decrypt, Encrypt, userMsgVerify};