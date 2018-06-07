layui.use('element',function () {
    var element = layui.element
        ,$ = layui.$;
    element.on('nav(pub_navside)', function (elem) {
        var pagename = elem.attr('id');
        $.post('/'+pagename+'page',{},
            function (data) {
                $('.pub_content').html(data);
            })
    });
    $('#mcquery').click();
    $('.pub_logoutbtn').click(function () {
        layer.open({type:3});
        $.post("/logout",
            {},
            function(data){
                if(data) {
                    location.href = '/';
                }
            }
        )
    })
});
/**
 * Created by Administrator on 2018/6/7.
 */
