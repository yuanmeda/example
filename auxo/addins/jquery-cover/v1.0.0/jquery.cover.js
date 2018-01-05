(function($, window, udfd){
  var template = {
      box: "<div class='cover-box'>" +
      "<div>" +
      "<span class='cover-img'></span>" +
      '<p class="cover-title">'+window.i18nHelper.getKeyValue('ajax_loading_cover.title')+'</p>' +
      "</div>" +
      "</div>",
      fixed: "<div class='cover-fixed'></div>",
      abs: "<div class='cover-abs'></div>"
    };
  var Cover = function($obj){
    var $coverContainer = jQuery("<div class='cover-container'></div>");
    var $coverBox = jQuery(template.box);
    var $coverMask = ( function(){
      if ($obj[0] === document || $obj[0] === window || $obj[0] === document.body) {
        $obj = jQuery(window);
        return jQuery(template.fixed)
      } else {
        return jQuery(template.abs);
      }
    }() );

    $coverContainer.append($coverBox)
      .append($coverMask)
      .appendTo(document.body);
    this.$obj = $obj;
    this.$coverBox = $coverBox;
    this.$coverMask = $coverMask;
    this.$coverContainer = $coverContainer;
  };
  Cover.prototype.show = function(title, time){
    var $coverBox = this.$coverBox;
    var $obj = this.$obj;
    var $coverMask = this.$coverMask;
    var $coverContainer = this.$coverContainer;
    var $div = $coverBox.children("div");
    var ow = $obj.outerWidth();
    var oh = $obj.outerHeight();
    var bw = $coverBox.outerWidth() + $div.outerWidth();
    var bh = $coverBox.outerHeight() + $div.outerHeight();
    if ($coverMask.hasClass("cover-abs")) {
      $coverContainer.css({
        "left": $obj.offset().left,
        "top": $obj.offset().top,
        "width": ow,
        "height": oh
      });
      $coverBox.offset({
        left: ( ow - bw ) / 2,
        top: ( oh - bh ) / 2
      });
    } else {
      $coverBox.css("position", "fixed");
      $coverBox.css({
        left: ( ow - bw ) / 2,
        top: ( oh - bh ) / 2
      });
    }

    if (title) {
      $coverBox.find(".cover-title")
        .text(title);
    }

    $coverContainer.show();
    $coverContainer.animate({opacity:1}, time || 500);
  };
  Cover.prototype.hide = function(time){
    var $coverContainer = this.$coverContainer;
    $coverContainer.animate({opacity:0}, time || 500, function(){
      $coverContainer.hide();
    });
  };

  $.fn.cover = function(opt){
    var $this = $(this);
    var cover = $this.data("cover-container");
    var args = arguments;
    var doCover = function(){
      if (opt === "show") {
        cover.show(args[1]);
      } else if (opt === "hide") {
        cover.hide();
      } else {
        cover.show(opt);
      }
    };
    if (cover) {
      doCover();
    } else {
      cover = new Cover($this);
      $this.data("cover-container", cover);
      doCover();
    }
  };
  $.fn.uncover = function(){
    var $this = $(this);
    var cover = $this.data("cover-container");
    if (cover) {
      cover.hide();
    }
  };

  $(document).ajaxStart(function () {
    $(document.body).cover('show');
  }).ajaxStop(function () {
    $(document.body).cover('hide');
  });

}(jQuery, window) );


