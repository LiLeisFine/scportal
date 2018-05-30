var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var crypto = require('crypto');
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(bodyParser.json({limit: '10mb'}));//设置post body数据的大小
app.set('view engine', 'ejs');
app.set('views', __dirname + "/ejs");
//app.use('/cashier',express.static('./static'));
app.use(express.static('./'));
app.use('/cashier/images', express.static('./static/images'));
app.use('/cashier/javascript', express.static('./static/javascript'));
app.use('/cashier/stylesheet', express.static('./static/stylesheet'));
app.use(session({
    secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
    cookie: {maxAge: 1800 * 1000},
    rolling: true
}));
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
var base_path = process.env.base_path || '/home/yumei/cashier/';
var config_name = process.env.config_name || 'cashier_config.js';
var configdata = require(base_path + config_name);
var sendTokenReq = require('./models/sendTokenReq.js').sendTokenReq;
var backendRequest = require('./models/backendRequest.js').backendRequest;
var api = require('./models/api.js').getDatas;
var decryptmod = require('./models/decryptmod.js');
var objKeySort = require("./models/objKeySort.js").objKeySort;
var wrongmsg = '非法请求';
app.get('/cashier/wechatoapay', function (req, res) {
    var code = req.query.code;
    console.log('------code:' + code);
    sendTokenReq(configdata.app_id, configdata.app_secret, code, req, res, function (openid) {
        console.log("------openid" + openid);
        req.session.openid = openid;
        res.render('wechat_oapay');
    });
});
//老收银台微信公众号支付
app.get('/cashier/gateway/wechatOpenIdRequest.htm', function (req, res) {
    if (req.query.redirect_uri) {
        var redirectUrl = getredirecturi(req.query, 13);
        console.log('***********getquery======');
        console.log(req.query);
        console.log('***********redirect_uri======' + redirectUrl);
        req.session.redirect_uri = redirectUrl;
        console.log('***********req.session.redirect_uri======' + req.session.redirect_uri);
        console.log('***********WECHAT_CODE======https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + configdata.app_id + '&redirect_uri=' + configdata.redirct_uri + '/cashier/gateway/wechatOpenIdRequest&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect');
        res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + configdata.app_id + '&redirect_uri=' + configdata.redirct_uri + '/cashier/gateway/wechatOpenIdRequest&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect');
    } else {
        console.log("err_1");
        res.redirect('/cashier/wrong');
    }
});

app.get('*', function (req, res) {
    res.render('wrong_page', {
        wrongmsg: '页面不存在'
    });
});
app.post('/cashier/', urlencodedParser, function (req, res) {
    try {
        var sign = JSON.parse(req.body.data).sign || ' ',
            str = '',
            dataobj = JSON.parse(req.body.data);
        delete dataobj.sign;
        var datastr = p_tostr(str, dataobj),
            pk = configdata.open_rsapubsecret,
            verifyresult = decryptmod.versignrsa(datastr, sign, pk);
        if (verifyresult) {
            req.session.orderobj = JSON.parse(req.body.data);
            res.render('cashier', {
                orderUser: dataobj.seller_name,
                orderMsg: dataobj.goods_clause.summary,
                orderAmount: dataobj.fee_clause.total_fee.amount
            });
        } else {
            console.log('verify err!');
            wrongmsg = '验签失败';
            res.redirect('/cashier/wrong');
        }
    } catch (err) {
        console.log(' /cashier parser err!');
        res.redirect('/cashier/wrong');
    }


});

function p_tostr(str, obj) {
    for (var key in obj) {
        if (typeof (obj[key]) != 'object') {
            str = str + key + obj[key];
        } else {
            str = p_tostr(str, obj[key]);
        }
    }
    return str;
}
function getredirecturi(queryobj, index) {
    if (typeof (queryobj) == 'object' && index) {
        var uri = '';
        for (var i in queryobj) {
            uri = uri + i + '=' + queryobj[i] + '&';
        }
        uri = uri.slice(index);
        uri = uri.substr(0, uri.length - 1);
        return uri;
    } else {
        return 'wrong';
    }

}
function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlkmnopqrstuvwxyz123456789';
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
app.listen(configdata.port);