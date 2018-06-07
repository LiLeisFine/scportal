layui.use(['element', 'laydate', 'laypage','form'], function () {
    var   form = layui.form
        , laypage = layui.laypage
        , laydate = layui.laydate
        , $ = layui.$
        ,now = new Date();

    //监听导航点击
    form.render('select');
    laydate.render({
        elem: '#gmt_create_start'
        ,type:'datetime'
        ,value: now.format("yyyy-MM-dd")+' 00:00:00'
        ,format:'yyyy-MM-dd HH:mm:ss'
    });
    laydate.render({
        elem: '#gmt_create_end'
        ,type:'datetime'
        ,value: now.format("yyyy-MM-dd")+' 23:59:59'
        ,format:'yyyy-MM-dd HH:mm:ss'
    })
    laypage.render({
        elem: 'pub_page'
        , count: 0
        , theme: '#347ebc'
        , layout: ['count', 'prev', 'page', 'next', 'skip']
    });
    form.on('submit(trade_qbtn)', function(data){
        query(1,data.field);
    });
    function query(num,datas) {
        var subobj = datas;
        subobj['current_page'] = num;
        console.log(subobj);
        $.post("/trquery",
            subobj,
            function (data) {
                console.log(data);
                var result = data.yumei_partner_trade_record_query_paging_response
                    ,result_code = result.result_code
                    ,result_code_msg = result.result_code_msg;
                if (result_code == '00') {
                    $('.pub_tbody').empty();
                    var list = result.list
                        ,paginator = result.paginator;
                    for (var record in list) {
                        var records = list[record]
                            ,fee = records["service_fee"]? records["service_fee"]["amount"]:"0.00"
                            ,amount = records["total_fee"]["amount"]
                            ,currency = records["currency"]
                            ,out_trade_no = records["out_trade_no"]
                            ,gmt_create = records["gmt_create"]
                            ,handle_status = records["status"]
                            ,channel_type = records["channel_type"]||' '
                            ,summary = records["summary"]||' '
                            ,product = records["sub_product"]||' ';
                        if(currency == "CNY"){
                            currency = "人民币";
                        }
                        if(channel_type == "ALIPAY_SCAN"){
                            channel_type = "支付宝商家扫";
                        }else if(channel_type == "WECHAT_SCAN"){
                            channel_type = "微信商家扫";
                        }else if(channel_type == "CARD"){
                            channel_type = "刷卡支付";
                        }else if(channel_type == "CREDIT_EXPRESS"){
                            channel_type = "信用卡快捷支付";
                        }else if(channel_type == "DEBIT_EXPRESS"){
                            channel_type = "借记卡快捷支付";
                        }else if(channel_type == "MIXEDCARD_DEBIT_GATEWAY"){
                            channel_type = "混合借记卡网关支付";
                        }else if(channel_type == "MIXEDCARD_CREDIT_GATEWAY"){
                            channel_type = "混合信用卡网关支付";
                        }else if(channel_type == "DEBIT_DEDUCT"){
                            channel_type = "借记卡代扣";
                        }else if(channel_type == "CREDIT_DEDUCT"){
                            channel_type = "信用卡代扣";
                        }else if(channel_type == "DEBIT_CARD"){
                            channel_type = "借记卡刷卡";
                        }else if(channel_type == "WECHAT_NATIVE"){
                            channel_type = "微信用户扫";
                        }else if(channel_type == "CREDIT_CARD"){
                            channel_type = "信用卡刷卡";
                        }else if(channel_type == "ALIPAY_NATIVE"){
                            channel_type = "支付宝用户扫";
                        }
                        if (handle_status == 'TRADE_WAIT_PAY') {
                            handle_status = '等待买家付款';
                        } else if (handle_status == 'TRADE_PAY_PROCESS') {
                            handle_status = '处理中';
                        } else if (handle_status == 'TRADE_FINISHED') {
                            handle_status = '交易成功';
                        }else if (handle_status == 'TRADE_CLOSED_BY_SYS') {
                            handle_status = '超时关闭';
                        }else if (handle_status == 'TRADE_CLOSED') {
                            handle_status = '关闭';
                        }
                        if (product == 'TRADE_SC_EXPRESS_001') {
                            product = '快捷';
                        } else if (product == 'TRADE_SPOS') {
                            product = '智能POS';
                        } else if (product == 'TRADE_WC') {
                            product = '无卡聚合';
                        }else if (product == 'TRADE_DEDUCT') {
                            product = '代扣';
                        }else if (product == 'TRADE_SC_ALIPAY_H5_001') {
                            product = '支付宝H5';
                        }

                        $('.pub_tbody').append("<tr>" +
                            "<td>" + product + "</td>" +
                            "<td>" + out_trade_no + "</td>" +
                            "<td>" + summary + "</td>" +
                            "<td>" + currency + "</td>" +
                            "<td>" + amount + "</td>" +
                            "<td>" + fee + "</td>" +
                            "<td>" + gmt_create + "</td>" +
                            "<td>" + channel_type + "</td>" +
                            "<td>" + handle_status + "</td>" +
                            "</tr>");
                    }
                    laypage.render({
                        elem: 'pub_page'
                        , count: paginator.items
                        , theme: '#347ebc'
                        , curr: paginator.page
                        , layout: ['count', 'prev', 'page', 'next', 'skip']
                        , jump: function (obj,first) {
                            if(!first){
                                console.log(obj.curr);
                                query(obj.curr,datas);
                            }
                        }
                    });
                } else if (result_code == '999') {
                    location.href = "/wrongmsg?wrongmsg=系统错误";
                } else if(result_code == '10'){
                    $('.pub_tbody').empty().append('<tr><td colspan="9">未找到相关记录</td></tr>');
                    layer.msg(result_code_msg);
                    laypage.render({
                        elem: 'pub_page'
                        , count: 0
                        , theme: '#347ebc'
                        , layout: ['count', 'prev', 'page', 'next', 'skip']
                    });
                }

            });
    }

});

/**
 * Created by Administrator on 2018/6/7.
 */
