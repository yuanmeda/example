/**
 * Created by Administrator on 2017/6/17.
 */


var showMsg = function (text, clb, param) {
  var hipPanel;
  var closeMsg = function () {
    hipPanel.remove();
    if (typeof clb == "function") {
      clb(param);
    }
  };

  function htmlEncode(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var htmlText = '<div class="pop-tip" id="hip_panel">' + htmlEncode(text) + '</div>';
  hipPanel = $(htmlText);
  $("body").append(hipPanel);
  window.setTimeout(function () {
    closeMsg();
  }, 1500);
};

export default {
  showMsg: showMsg,
}

