var crypto = require('crypto');
var NodeRSA = require('node-rsa');

exports.decryptaes = function (key, iv, crypted) {
    try{
        crypted = Buffer.from(crypted, 'hex').toString('binary');
    }catch (err){
        crypted = new Buffer(crypted, 'hex').toString('binary');
    }

    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};
exports.encryptaes = function (key, iv, data) {
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    try{
        crypted = Buffer.from(crypted, 'binary').toString('hex');
    }catch (err){
        crypted = new Buffer(crypted, 'binary').toString('hex');
    }
    return crypted;
};
exports.encryptrsa = function (key, data) {
    key = insert_str(key, '\n', 64);
    key = '-----BEGIN PUBLIC KEY-----\n' + key + '-----END PUBLIC KEY-----';
    key = new NodeRSA(key);
    key.setOptions({encryptionScheme: 'pkcs1'});
    var encrypted = key.encrypt(data, 'hex');
    return encrypted;
};
exports.decryptrsa = function (key, encrypted) {
    key = insert_str(key, '\n', 64);
    key = '-----BEGIN PRIVATE KEY-----\n' + key + '-----END PRIVATE KEY-----' ;
    key = new NodeRSA(key);
    key.setOptions({encryptionScheme: 'pkcs1'});
    try{
        encrypted = Buffer.from(encrypted, 'hex').toString('base64');
    }catch (err){
        encrypted = new Buffer(encrypted, 'hex').toString('base64');
    }

    var decrypted = key.decrypt(encrypted, 'utf8');
    return decrypted;
};
exports.signrsa = function (key,data) {
    key = insert_str(key, '\n', 64);
    key = '-----BEGIN PRIVATE KEY-----\n' + key + '-----END PRIVATE KEY-----';
    var sign = crypto.createSign('RSA-SHA1');
    try{
        sign.update(Buffer.from(data, 'utf-8'));
    }catch (err){
        sign.update(new Buffer(data, 'utf-8'));
    }

    var sig = sign.sign(key, 'hex');
    return(sig);
};
exports.versignrsa = function (src_sign, signature, public_key) {//src_sign 签名前内容  signature 签名后内容
    public_key = insert_str(public_key, '\n', 64);
    public_key = '-----BEGIN PUBLIC KEY-----\n' + public_key + '-----END PUBLIC KEY-----';

    var verifier = crypto.createVerify('RSA-SHA1');
    console.log('验证签名public key:\n' + public_key);
    console.log('验证签名src_sign:' + src_sign);
    try{
        verifier.update(Buffer.from(src_sign, 'utf-8'));
    }catch (err){
        verifier.update(new Buffer(src_sign, 'utf-8'));
    }
    return verifier.verify(public_key, signature, 'hex');
};

function insert_str(str, insert_str, sn) {//string 分行
    var newstr = "";
    for (var i = 0; i < str.length; i += sn) {
        var tmp = str.substring(i, i + sn);
        newstr += tmp + insert_str;
    }
    return newstr;
}
function hexCharCodeToStr(hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr =
        trimedStr.substr(0,2).toLowerCase() === "0x"
            ?
            trimedStr.substr(2)
            :
            trimedStr;
    var len = rawStr.length;
    if(len % 2 !== 0) {
        alert("Illegal Format ASCII Code!");
        return "";
    }
    var curCharCode;
    var resultStr = [];
    for(var i = 0; i < len;i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
        resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join("");
}
function tobase64(data)

{

    var buf = [];

    var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split('');

    var n = data.length;       //总字节数

    var val;                            //中间值

    var i = 0;

    /*

     * 3字节 ==> val ==> 4字符

     */

    while(i < n)

    {

        val = (data[ i ] << 16)       |

            (data[i+1] << 8)       |

            (data[i+2]);

        buf.push(map[val>>18],

            map[val>>12 & 63],

            map[val>>6 & 63],

            map[val & 63]);

        i += 3;

    }

    if(n%3 == 1)                            //凑两个"="

        buf.pop(),buf.pop(),buf.push('=', '=');

    else                                          //凑一个"="

        buf.pop(),buf.push('=');

    return buf.join('');

}
