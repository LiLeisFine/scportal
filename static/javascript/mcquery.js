layui.use(['element', 'laypage','form'], function () {
    var   form = layui.form
        , laypage = layui.laypage
        , $ = layui.$;
    //监听导航点击
    laypage.render({
        elem: 'pub_page'
        , count: 0
        , theme: '#347ebc'
        , layout: ['count', 'prev', 'page', 'next', 'skip']
    });
    form.on('submit(mechart_qbtn)', function(data){
        query(1,data.field);
    });
    function query(num,datas) {
        var subobj = datas;
        subobj['current_page'] = num;
        console.log(subobj);
        $.post("/mcquery",
            subobj,
            function (data) {
                var result = data.yumei_partner_merchant_query_paging_response
                    ,result_code = result.result_code
                    ,result_code_msg = result.result_code_msg;
                if (result_code == '00') {
                    $('.pub_tbody').empty();
                    var list = result.records
                        ,paginator = result.paginator;
                    for (var record in list) {
                        var records = list[record]
                            ,out_user_id = records["out_user_id"] || ' '
                            ,user_id = records["user_id"] || ' '
                            ,merchant_name = records["merchant_name"]
                            ,merchant_type = records["merchant_type"] || ' '
                            ,account_type = records["account_type"] || ' '
                            ,cert_type = records["cert_type"] || ' '
                            ,gmt_create = records["gmt_create"]
                            ,cert_no = records["cert_no"] || ' '
                            ,merchant_status = records["merchant_status"]
                            ,summary = records["summary"] || ' ';
                        switch (merchant_type) {
                            case "SUB_MERCHANT":
                                merchant_type = "子商户";
                                break;
                            case "PURVEYOR":
                                merchant_type = "平台商";
                                break;
                            case "MERCHANT":
                                merchant_type = "商户";
                                break;
                            case "SHOP":
                                merchant_type = "门店";
                                break;
                        }
                        switch (account_type) {
                            case "CORPORATE_ACCOUNT":
                                account_type = "公司";
                                break;
                            case "PRIVATE_ACCOUNT":
                                account_type = "个人";
                                break;
                        }
                        switch (cert_type) {
                            case "LICENSE":
                                cert_type = "营业执照";
                                break;
                            case "LICENSE_ALL_IN_ONE":
                                cert_type = "多合一营业执照";
                                break;
                            case "IDCARD":
                                cert_type = "身份证";
                                break;
                        }
                        switch (merchant_status) {
                            case "NOT_APPROVED":
                                merchant_status = "未审批";
                                break;
                            case "APPROVED_FAIL":
                                merchant_status = "审批失败";
                                break;
                            case "NORMAL":
                                merchant_status = "正常";
                                break;
                            case "BE_RESTRICTED":
                                merchant_status = "受限中";
                                break;
                            case "CANCEL":
                                merchant_status = "注销";
                                break;
                        }
                        $('.pub_tbody').append("<tr>" +
                            "<td>" + user_id + "</td>" +
                            "<td>" + merchant_name + "</td>" +
                            "<td>" + account_type + "</td>" +
                            "<td>" + cert_type + "</td>" +
                            "<td>" + fadenum(4, 4, cert_no) + "</td>" +
                            "<td>" + gmt_create + "</td>" +
                            "<td class='merchart_bact'>-.--</td>" +
                            "<td class='merchart_aact'>-.--</td>" +
                            "<td class='record_td'>" + merchant_status + "</td>" +
                            "</tr>");
                        $.post('/mcactget',
                            {
                                account_no: user_id + '0156'
                                ,actindex:record
                            }, function (data) {
                                var result = data.yumei_partner_user_account_get_response
                                    , result_code = result.result_code;
                                if (result_code == '00') {
                                    var mcaaccount = result.account.available_amount.amount
                                        ,mcbaccount = result.account.balance_amount.amount
                                        ,actindex = data.actindex;
                                    $('.merchart_aact').eq(parseInt(actindex)).text(mcaaccount);
                                    $('.merchart_bact').eq(parseInt(actindex)).text(mcbaccount);
                                }
                            });
                    }
                    laypage.render({
                        elem: 'pub_page'
                        , count: paginator.items
                        , theme: '#347ebc'
                        , curr: paginator.page
                        , layout: ['count', 'prev', 'page', 'next', 'skip']
                        , jump: function (obj,first) {
                            if(!first){
                                query(obj.curr,datas);
                            }
                        }
                    });
                } else if (result_code == '999') {
                    location.href = "/wrongmsg?wrongmsg=系统错误";
                } else if(result_code == '100'){
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
