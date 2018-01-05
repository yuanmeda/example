(function(){
  var Model;
  var template = '<div class="x-rank-web-course" style="background:#fff;">\
    <!--ko if:mac-->\
    <iframe id="rank-web-course-frame" frameborder="0" width="100%" height="500"  data-bind="attr:{src:rank_uri}"></iframe>\
    <!--/ko-->\
    <!--ko if:!mac-->\
    <div style="padding-top:100px;padding-bottom:100px;text-align:center;"><img data-bind="attr:{src:empty_img}" style="margin-bottom:10px;"/><span style="display:block;font-size:18px;">您还没有登录</span></div>\
    <!--/ko-->\
    </div>';

  Model = function(params){
    var vm = this;
    var project_code = params.project_domain;
    var assist_gw_host = params.assist_gw_host;
    var static_host = window.staticUrl;
    var custom_type = window.customType;
    var custom_id = window.customId;
    var uri = assist_gw_host + '/' + project_code + '/rank/display?rank_range=single&custom_type='+custom_type+'&custom_id='+custom_id;
    var mac = Nova.getMacToB64(uri);

    vm.empty_img = static_host + '/auxo/component/js-course-detail-note/css/images/icon-none.png';
    vm.mac = mac;
    vm.rank_uri = uri += ('&__mac='+mac);
    vm.dispost = dispose;

    // iframe重置高度
    if(window.addEventListener){
      window.addEventListener('message', on_post_message);
    }else{
      window.attachEvent('onmessage', on_post_message);
    }

    /*组件销毁*/
    function dispose(){
      if(window.removeEventListener){
        window.removeEventListener('message', on_post_message);
      }else{
        window.detachEvent('onmessage', on_post_message);
      }
    }

    /*调整iframe高度*/
    function on_post_message(event){
      var data;
      try{
        data = JSON.parse(event.data);
        if(data.type === '$resize'){
          $('#rank-web-course-frame').css('height', window.parseInt(data.data.height, 10) + 'px');
        }
      }catch(e){}
    }
  };

  ko.components.register("x-rank-web-course", {
    viewModel: Model,
    template: template
  });
})();