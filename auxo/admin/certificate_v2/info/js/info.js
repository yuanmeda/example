(function(){
  var certificate_id = window.certificate_id;
  var user_id = window.user_id;
  var certificate_business_host = window.certificate_business_host;
  var auto_print = window.auto_print === 'yes';
  var content_ifm = document.getElementById('content');
  var content_win = content_ifm.contentWindow;
  var content_doc = content_win.document;
  var store = {
    get_cert_view: function(){
      return $.ajax({
        url: certificate_business_host + '/v1/user_certificates/view?' + $.param({
          user_id: user_id,
          certificate_id: certificate_id
        }),
        type: 'POST'
      })
    }
  };

  content_ifm.onload = function(){
    window.setTimeout(function(){
      content_ifm.style.height = Math.max(content_win.innerHeight, content_doc.body.scrollHeight, content_doc.documentElement.scrollHeight) + 'px';
    }, 300);
  };

  store.get_cert_view()
    .then(function(res){
      var content = res.content;
      if(content === ''){
        content = '<h1>证书模板内容为空，请重新上传</h1>';
      }
      content_ifm.src = 'javascript:void(0);';
      content_doc.open();
      content_doc.write(content);
      content_doc.close();
    });

})();