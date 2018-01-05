/**
 * $.ajax请求发生错误时自动提示
 *
 * 组件相关：
 *  auxo/addins/jquery-udialog/v1.0.0/style/css/theme/${project.language.code!'zh-CN'}/${project.style!'white'}/udialog-common.css
 *  auxo/addins/jquery-ajaxerror-elearning/v1.1.0/i18n/${project.language.code!'zh-CN'}.js
 *
 * 依赖：
 *  jquery
 *  auxo/addins/jquery-ui/v1.9.1/jquery.ui.core.js
 *  auxo/addins/jquery-ui/v1.9.1/jquery.ui.widget.js
 *  auxo/addins/jquery-ui/v1.9.1/jquery.ui.position.js
 *  auxo/addins/jquery-ui/v1.9.1/jquery.ui.dialog.js
 *  auxo/addins/jquery-udialog/v1.0.0/js/udialog-common.js
 */
(function(){
  var i18nGetKeyValue = window.i18nHelper.getKeyValue;

  $(document).ajaxError(function(e, response, request, errType){
    var error;
    var message;
    try {
      error = response.responseJSON || (response.responseText && JSON.parse(response.responseText));
    } catch (e) {}
    message = (error.cause ? error.cause.message : error.message) || i18nGetKeyValue('ajax_error_common.error_message');
    if (error) {
      alert_dialog(message);
    }
  });

  function alert_dialog(msg){
    if ($.fn.udialog) {
      $.fn.udialog.alert(msg, {
        icon: 'error',
        title: i18nGetKeyValue('ajax_error_common.title'),
        buttons: [{
          text: i18nGetKeyValue('ajax_error_common.confirm'),
          click: function(){
            $(this).udialog('hide');
            return_back();
          },
          'class': 'ui-btn-confirm'
        }]
      }, function(){
        return_back();
      });
    } else {
      window.alert(msg);
    }
  }

  function return_back(){
    var return_url = window.__return_url;
    if (return_url) {
      window.location.href = return_url;
    }
  }
})();