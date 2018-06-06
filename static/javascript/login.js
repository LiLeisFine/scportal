var verifyCode = new GVerify("login_codebox");
layui.use('form', function(){
    var form = layui.form
        ,$ = layui.$;

    //监听提交
    form.on('submit(login_btn)', function(data){
        if(verifyCode.validate(data.field.vercode)){
            layer.open({type:3});
            var field = data.field;
            $.post("/login",
                {
                    "logon_id": field.logon_id,
                    "query_password": field.query_password
                },
                function (data) {
                    if (data == '00') {
                        $.post("/userget",
                            {},
                            function (data) {
                                var result_code = data.yumei_user_get_response.result_code;
                                if(result_code == "00"){
                                    location.href = '/index';
                                }else{
                                    location.href = '/systemmistake';
                                }

                            });

                    } else if (data == "999") {
                        location.href = "/wrongmsg?wrongmsg=系统错误";
                    } else {
                        verifyCode.refresh();
                        $('.login_vcode').val('');
                        layer.msg('登录号或密码错误');
                    }

                });
        }else {
            layer.msg('验证码错误');
            $('.login_vcode').val('');
        }
        return false;
    });
    $(document).keydown(function (event) {

        if (event.keyCode == 13) {
            $(".login_btn").click();
        }

    });
});/**
 * Created by Administrator on 2018/6/5.
 */
