/**
 * Created by NoManReady on 2016/1/5.
 */
;(function(window,$){
    $.fn.dropsort=function(options,viewModel,urls){
        var _this=$(this),
            opts= $.extend({},$.fn.dropsort.defaults,options||{},$.fn.dropsort.setStore(urls));
        _this.data('model',viewModel);
        try{
            _this.sortable('refresh');
        }catch(e){
            _this.sortable(opts);
        }
    };
    $.fn.dropsort.defaults={
        containment:'body',
        placeholder: "ui-state-highlight",
        cursor: "move",
        tolerance: "pointer",
        scrollSensitivity: 10,
        distance: 10,
        //排序开始时
        start: function (event, ui) {
            var _this=$(this),
                _type=_this.data('type');
            if(_type==='item'){
                ui.placeholder.css("height", (ui.item.height()+24)+'px');
            }else if(_type=='list'){
                ui.placeholder.append('<td colspan="9"></td>').css("height", (ui.item.height()+10)+'px');
            }
            $.fn.dropsort.filter(ui.item.attr('id'),_this);
        },
        //排序结束前
        beforeStop:function(event,ui){
            var _this=$(this),
                _item_filter=_this.data('filter'),
                _item_target=_this.data('target');
            _item_filter.splice(ui.placeholder.index()-1,0,_item_target);
        },
        //排序结束时
        stop: function (event, ui) {
            //var _this=$(this),
            //    _model=_this.data('model'),
            //    _item_filter=_this.data('filter',_item_filter),
            //    _isCancel=_this.data('cancel');
            //if(_isCancel){
            //    _this.sortable( "cancel" );
            //}else{
            //    _model.model.items([]);
            //    _model.model.items(_item_filter);
            //}
        }
    };
    $.fn.dropsort.setStore=function(urls){
        return {
            //排序更新时
            update: function (event, ui) {
                var _this=$(this),
                    _cancel=true;
                _this.sortable('disable');
                _this.data('cancel',null);
                commonJS._ajaxHandler(urls,null,'GET')
                    .done(function(){
                        _cancel=false;
                    })
                    .always(function(){
                        _this.data('cancel',_cancel);
                        _this.sortable('enable');
                        $.fn.dropsort.sort(_this);
                    })
            }
        }
    };
    $.fn.dropsort.filter=function(id,_this){
        var _model=_this.data('model'),
            _items=_model.model.items(),
            _item_filter=_items.filter(function(item,index){
                if(item.id==id){
                    _this.data('target',item);
                }
                return item.id!=id;
            });
        _this.data('filter',_item_filter);
    };
    $.fn.dropsort.sort=function(_this){
        var _model=_this.data('model'),
            _item_filter=_this.data('filter',_item_filter),
            _isCancel=_this.data('cancel');
        if(_isCancel){
            _this.sortable( "cancel" );
        }else{
            _model.model.items([]);
            _model.model.items(_item_filter);
        }
    }
})(window,jQuery)