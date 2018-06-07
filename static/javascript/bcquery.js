layui.use(['element', 'laydate', 'laypage', 'form'], function () {
    var form = layui.form
        , laypage = layui.laypage
        , laydate = layui.laydate
        , $ = layui.$
        , now = new Date();

    //监听导航点击
    form.render('select');
    laydate.render({
        elem: '#gmt_create_start'
        , type: 'date'
        , theme: '#347ebc'
        , value: now.format("yyyy-MM-dd") + ' 00:00:00'
        , format: 'yyyy-MM-dd HH:mm:ss'
        , showBottom:false
    });
    laydate.render({
        elem: '#gmt_create_end'
        , type: 'date'
        , theme: '#347ebc'
        , value: now.format("yyyy-MM-dd") + ' 23:59:59'
        , format: 'yyyy-MM-dd HH:mm:ss'
        ,showBottom:false
    });
    laypage.render({
        elem: 'pub_page'
        , count: 0
        , theme: '#347ebc'
        , layout: ['count', 'prev', 'page', 'next', 'skip']
    });
    form.on('submit(trade_qbtn)', function (data) {
        query(1, data.field);
    });
    function query(num, datas) {
        var subobj = datas;
        subobj['current_page'] = num;
        console.log(subobj);
        $.post("/bcquery",
            subobj,
            function (data) {
                var result = data.yumei_partner_agentpay_record_query_paging_response
                    , result_code = result.result_code
                    , result_code_msg = result.result_code_msg;
                if (result_code == '00') {
                    $('.pub_tbody').empty();
                    var list = result.list
                        , paginator = result.paginator;
                    for (var record in list) {
                        var records = list[record]
                            , fee = records["service_fee"] ? records["service_fee"]["amount"] : "0.00"
                            , amount = records["amount"]["amount"]
                            , memo = records["memo"]
                            , out_trade_no = records["out_trade_no"]
                            , inst_card_no = records["inst_card_no"] || ' '
                            , inst_card_holder_name = records["inst_card_holder_name"] || ' '
                            , gmt_create = records["gmt_create"] || ' '
                            , product = records["product"] || ' '
                            , status = records["status"] || ' '
                            , sub_merchant_id = records["sub_merchant_id"] || ' ';
                        if (status == 'WAIT_PAY') {
                            status = '待付款';
                        } else if (status == 'PAY_SUCCESS') {
                            status = '付款成功';
                        } else if (status == 'STATUS_APPLYED') {
                            status = '已申请';
                        } else if (status == 'STATUS_SUCCESS') {
                            status = '成功';
                        } else if (status == 'STATUS_FAIL') {
                            status = '失败';
                        } else if (status == 'STATUS_CHARGE_BACK') {
                            status = '银行退票';
                        }
                        if (product == 'withdraw.sc.express.001') {
                            product = '快捷';
                        } else if (product == 'trade.sc.express.001') {
                            product = '提现';
                        }

                        $('.pub_tbody').append("<tr>" +
                            "<td>" + product + "</td>" +
                            "<td>" + out_trade_no + "</td>" +
                            "<td>" + fadenum(4, 4, inst_card_no) +"</td>" +
                            "<td>" + inst_card_holder_name + "</td>" +
                            "<td>" + amount + "</td>" +
                            "<td>" + fee + "</td>" +
                            "<td>" + gmt_create + "</td>" +
                            "<td>" + memo + "</td>" +
                            "<td>" + status + "</td>" +
                            "</tr>");
                    }
                    laypage.render({
                        elem: 'pub_page'
                        , count: paginator.items
                        , theme: '#347ebc'
                        , curr: paginator.page
                        , layout: ['count', 'prev', 'page', 'next', 'skip']
                        , jump: function (obj, first) {
                            if (!first) {
                                query(obj.curr, datas);
                            }
                        }
                    });
                } else if (result_code == '999') {
                    location.href = "/wrongmsg?wrongmsg=系统错误";
                } else if (result_code == '942') {
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
