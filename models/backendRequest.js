exports.backendRequest = function (data, request, response,cb,resname) {
    var https = require('https');
    var str = "";
    var req = https.request(data.data, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on("end",function(){
            var datasss;
            try{
                 datasss = JSON.parse(str);

            }catch (err){
                console.log(err);
                console.log(str);
                datasss = new Object();
                if(resname){
                    datasss[resname] = {
                        result_code_msg: '系统错误，请稍后重试',
                        sub_msg: '系统错误，请稍后重试'
                    };
                }
            }
            if(typeof (cb) == 'function'){
                cb(datasss);
            }
        })

    });
    req.write(data.content);
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();

};

