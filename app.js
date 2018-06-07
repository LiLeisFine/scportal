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
app.use('/static/img', express.static('./static/img'));
app.use('/static/javascript', express.static('./static/javascript'));
app.use('/static/css', express.static('./static/css'));
app.use('/static/layui', express.static('./static/layui'));
app.use(session({
    secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
    cookie: {maxAge: 1800 * 1000},
    rolling: true
}));
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
var base_path = process.env.base_path || '/home/yumei/scportal/';
var config_name = process.env.config_name || 'scportal_config.js';
var configdata = require(base_path + config_name);
//var sendTokenReq = require('./models/sendTokenReq.js').sendTokenReq;
var backendRequest = require('./models/backendRequest.js').backendRequest;
var api = require('./models/api.js').getDatas;
//var decryptmod = require('./models/decryptmod.js');
var objKeySort = require("./models/objKeySort.js").objKeySort;
var wrongmsg = '非法请求';
app.get('/', function (req, res) {
        res.render('login');
});
app.get('/index', function(request, response) {
    if(request.session.token){
        response.render('../ejs/index',{
            user_name:request.session.infoobj.user_name
        });
    }else{
        response.redirect('/');
    }
});
app.get('/wrong_page', function (req, res) {
    if(req.query.wrongmsg){
        wrongmsg = req.query.wrongmsg;
        res.render('wrong_page', {
            wrongmsg: wrongmsg
        });
    }else{
        res.render('wrong_page', {
            wrongmsg: '页面不存在'
        });
    }

});
app.get('*', function (req, res) {
    res.redirect('/wrong_page');
});
app.post('/login', urlencodedParser, function (req, res) {
    var loginDatas = req.body;
    loginDatas.method = "yumei.user.login";
    var data = api(loginDatas);//组成接口
    backendRequest(data, req, res,function (data) {
        var result = data.yumei_user_login_response,
            result_code = result.result_code;
        if(result_code == '00'){
            req.session.token = result.token_response.token;
        }
        res.json(result_code);
    });
});
app.post('/logout', urlencodedParser,function (req, res) {
    var loginDatas = req.body;
    loginDatas.method = "yumei.user.logout";
    loginDatas.access_token = req.session.token;
    var data = api(loginDatas);//组成接口
    backendRequest(data, req, res,function (data) {
        if(req.session.token){
            delete req.session.token;
            delete req.session.infoobj;
            res.json(data);
        }
    });
});
app.post('/userGet', urlencodedParser, function (req, res) {
    var token = req.session.token || ' ';
    var loginDatas = {
        method:"yumei.user.get",
        access_token:token
    };
    var data = api(loginDatas);//组成接口
    backendRequest(data, req, res,function (data) {
        var result = data.yumei_user_get_response,
            result_code = result.result_code;
        if(result_code == '00'){
            var user_info = result["user_info"],
                cert_status = user_info["cert_status"],
                user_name = user_info["user_name"],
                logon_id = user_info["logon_id"],
                cert_no = user_info["cert_no"],
                cert_type = user_info["cert_type"];
                infoobj =  req.session.infoobj = new Object();

            infoobj.verStatus = cert_status ||'获取失败';
            infoobj.user_name = user_name||logon_id;
            infoobj.logon_id = logon_id||'获取失败';
            infoobj.cert_no = cert_no||'获取失败';
            infoobj.cert_type = cert_type||'获取失败';
        }
        res.json(data);
    });
});

app.post('/mcquerypage', urlencodedParser, function (req, res) {
    if(req.session.token){
        res.render('merchartquery');
    }else{
        res.render('wrong_page',{
            wrongmsg:'发生了错误'
        });
    }
});
app.post('/mcquery', urlencodedParser, function (req, res) {
    var signDatas = req.body;
    signDatas.access_token = req.session.token;
    signDatas.page_size = "10";
    signDatas.method = "yumei.partner.merchant.query.paging";
    signDatas.type = "SC_SUB_MERCHANT";
    signDatas.cert_type = "LICENSE";
    var data = api(signDatas);//组成接口
    backendRequest(data, req, res);
});
app.post('/mcactget', urlencodedParser, function (req, res) {
    var signDatas = req.body
        ,actindex = signDatas.actindex;
    delete signDatas.actindex;
    signDatas.access_token = req.session.token;
    signDatas.method = "yumei.partner.user.account.get";
    var data = api(signDatas);//组成接口
    backendRequest(data, req, res,function (data) {
        data.actindex = actindex;
        res.json(data);
    });
});
app.post('/trquerypage', urlencodedParser, function (req, res) {
    if(req.session.token){
        res.render('tradequery');
    }else{
        res.render('wrong_page',{
            wrongmsg:'发生了错误'
        });
    }
});
app.post('/trquery', urlencodedParser, function (req, res) {
    var signDatas = req.body;
    signDatas.access_token = req.session.token;
    signDatas.page_size = "10";
    signDatas.product = "TRADE_SC";
    signDatas.method = "yumei.partner.trade.record.query.paging";
    var data = api(signDatas);//组成接口
    backendRequest(data, req, res);
});
app.post('/bcquerypage', urlencodedParser, function (req, res) {
    if(req.session.token){
        res.render('batchpayquery');
    }else{
        res.render('wrong_page',{
            wrongmsg:'发生了错误'
        });
    }
});
app.post('/bcquery', urlencodedParser, function (req, res) {
    var signDatas = req.body;
    signDatas.access_token = req.session.token;
    signDatas.method = "yumei.partner.agentpay.record.query.paging";
    signDatas.page_size = "10";
    var data = api(signDatas);//组成接口
    backendRequest(data, req, res);
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