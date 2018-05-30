
exports.getDatas = function(inputDatas) {
    var qs = require("querystring");
    var crypto = require("crypto");
    //var config = require("config.js");
    var objKeySort = require("./objKeySort.js").objKeySort;
    var base_path = process.env.base_path||'/home/yumei/cashier/';
    var config_name = process.env.config_name||'cashier_config.js';
    var configdata = require(base_path+config_name);
    var key2 = configdata.cashier_rsaprisecret;
    var biz_content = inputDatas;//'{"login_id":lg_id,"query_password":qr_pswd}';
    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };
    var time = new Date();
    var timeStr = time.format("yyyy-MM-dd hh:mm:ss");
    console.log('++++++time'+timeStr+'++++++++++++++');
    var partner_id = configdata.partnerID;
    var post_data = {
        "charset": "utf-8",
        "format": "json",
        "sign_method": "rsa",
        "timestamp": timeStr,
        "v": "1.1",
        "partner_id":partner_id
    };
    for(var keyName in biz_content){
        if(keyName == ""){
            continue;
        }
        post_data[keyName] = biz_content[keyName];
    };
    post_data = objKeySort(post_data);
    var datastr = "" ;
    for (var keyname in post_data) {
        if (keyname == "") {
            continue;
        }
        datastr = datastr + keyname + post_data[keyname];
    }
    console.log("sign:"+datastr);
    var sign = crypto.createSign('RSA-SHA1');
    sign.update(new Buffer(datastr, 'utf-8'));
    key2 = insert_str(key2, '\n', 64);
    key2 = '-----BEGIN PRIVATE KEY-----\n' + key2 + '-----END PRIVATE KEY-----';
    var hasher = sign.sign(key2, 'hex');
    post_data["sign"] = hasher;
    var content = qs.stringify(post_data); console.log(content);
    var data = configdata.system_parameter;
    var returnData ={
        "data":data,
        "content":content
    };
    return returnData;
};
function insert_str(str, insert_str, sn) {
    var newstr = "";
    for (var i = 0; i < str.length; i += sn) {
        var tmp = str.substring(i, i + sn);
        newstr += tmp + insert_str;
    }
    return newstr;
}
