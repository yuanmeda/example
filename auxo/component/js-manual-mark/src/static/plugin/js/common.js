/*加减输入框 样式控制*/
$(function(){
    $(".jj-input").keyup(function(){
        if(isNaN($(this).val()) || parseInt($(this).val())<1){
            $(this).val("0");
            return;
        }
    })
    $('.jia').on('click', function() {
        numAdd()
    });
    $('.jian').on('click', function() {
        numDec()
    });
})
/*商品数量+1*/
function numAdd(){
    var $addInput = $(".jj-input input");
    var num_add = parseInt($addInput.val())+1;
        if($addInput.val()==""){
        num_add = 1;
    }
    $addInput.val(num_add);
}
/*商品数量-1*/
function numDec(){
    var $addInput = $(".jj-input input");
    var num_dec = parseInt($addInput.val())-1;

    if($addInput.val()<1||$addInput.val()==""){
        //购买数量必须大于或等于0
        num_dec = 0
        $addInput.val(num_dec);
    }else{
        $addInput.val(num_dec);
    }
}

/*对错按钮*/
$(function() {
    $('.correct-wrong-btns').find('button').on('click', function() {
        $(this).addClass('active').siblings('button').removeClass('active');
    })
})
/*评语按钮*/
$(function() {
    $('.comments-btns').find('button').on('click', function() {
        $(this).toggleClass('active');
    })
})
