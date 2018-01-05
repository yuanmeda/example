!function(t){"use strict";t=t&&t.hasOwnProperty("default")?t["default"]:t;!function(){function t(t){this.value=t}function n(n){function e(i,o){try{var r=n[i](o),s=r.value;s instanceof t?Promise.resolve(s.value).then(function(t){e("next",t)},function(t){e("throw",t)}):a(r.done?"return":"normal",r.value)}catch(l){a("throw",l)}}function a(t,n){switch(t){case"return":i.resolve({value:n,done:!0});break;case"throw":i.reject(n);break;default:i.resolve({value:n,done:!1})}(i=i.next)?e(i.key,i.arg):o=null}var i,o;this._invoke=function(t,n){return new Promise(function(a,r){var s={key:t,arg:n,resolve:a,reject:r,next:null};o?o=o.next=s:(i=o=s,e(t,n))})},"function"!=typeof n["return"]&&(this["return"]=undefined)}"function"==typeof Symbol&&Symbol.asyncIterator&&(n.prototype[Symbol.asyncIterator]=function(){return this}),n.prototype.next=function(t){return this._invoke("next",t)},n.prototype["throw"]=function(t){return this._invoke("throw",t)},n.prototype["return"]=function(t){return this._invoke("return",t)}}();var n=function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")},e=function(){function e(a){var i=this;n(this,e),this.model={bannerUrl:bannerPicId?csUrl+"/v0.1/download?dentryId="+bannerPicId:"",filter:{page:t.observable(0),limit:20},sku:{items:t.observableArray(),total:t.observable(0)}},this.model.filter.offset=t.pureComputed(function(){return i.model.filter.limit*i.model.filter.page()}),this.store={getSkuList:function(t){return $.ajax({url:"/v1/sales/"+salesId+"/sku/actions/page_query",dataType:"json",data:t,cache:!1})}},this.init()}return e.prototype.init=function(){this.pageQuery()},e.prototype.pageQuery=function(){var n=this,e=t.mapping.toJS(this.model.filter);e.page=undefined,this.store.getSkuList(e).done(function(t){n.model.sku.items(t.items),n.model.sku.total(t.total),$(".lazy-image:not(.loaded)").lazyload({placeholder:defaultResourceCover,load:function(){$(this).addClass("loaded")}}).trigger("scroll"),n.page()})},e.prototype.page=function(){var t=this,n=this.model.filter;$("#pagination").pagination(this.model.sku.total(),{is_show_first_last:!1,is_show_input:!0,is_show_total:!1,items_per_page:n.limit,num_display_entries:5,current_page:n.page(),prev_text:"common.addins.pagination.prev",next_text:"common.addins.pagination.next",callback:function(e){e!=n.page()&&(n.page(e),t.pageQuery())}})},e}();t.components.register("x-sales-main",{viewModel:e,template:'\x3c!--ko if:model.bannerUrl--\x3e\r\n<div class="banner-container"\r\n     data-bind="visible:model.bannerUrl,style:{ \'background\': \'url(&quot;\' + model.bannerUrl  + \'&quot;) no-repeat center\' }"></div>\r\n\x3c!--/ko--\x3e\r\n<div class="sku-container">\r\n    <div class="sku-wrap clearfix" data-bind="foreach:model.sku.items">\r\n        <a href="javascript:;" class="sku-cell" target="_blank" data-bind="attr:{\'href\':web_link}">\r\n            <div class="sku-img-wrap">\r\n                <img class="lazy-image" data-bind="attr:{\'alt\':name,\'data-original\':photo_url ? photo_url: \'\'}">\r\n            </div>\r\n            <div class="sku-price-badge"\r\n                 data-bind="visible:$data.goods_promotion&&goods_promotion.sales_sub_type === 1,translate:{\'key\':\'salesMain.timeLimit\'}">\r\n                限时抢\r\n            </div>\r\n            <div class="sku-price-badge"\r\n                 data-bind="visible:$data.goods_promotion&&goods_promotion.sales_sub_type === 2,translate:{\'key\':\'salesMain.discount\',\'properties\':{\'discount\':$data.goods_promotion && (goods_promotion.sales_config.discount * 10).toFixed(1)+\' \'}}">\r\n                限时抢\r\n            </div>\r\n            <div class="sku-info-title" data-bind="text:name">班主任工作反思</div>\r\n            <div class="sku-combine-hint"\r\n                 data-bind="visible:$data.combine_promotion, translate:{\'key\':$data.combine_promotion && combine_promotion.sales_sub_type == 1?\'salesMain.combineReduce\':\'salesMain.combineDiscount\'}">\r\n                满减\r\n            </div>\r\n            <div class="sku-btn" data-bind="translate:{\'key\':\'salesMain.getIt\'}">立即抢购</div>\r\n            <div class="sku-foot">\r\n                <div class="sku-foot-price">\r\n                    <span class="o-price"\r\n                          data-bind="text:display_single_promotion_amount && display_amount">￥88.88</span>\r\n                    <span class="n-price"\r\n                          data-bind="text:display_single_promotion_amount ? display_single_promotion_amount : display_amount">￥88.88</span>\r\n                </div>\r\n            </div>\r\n        </a>\r\n    </div>\r\n    <div class="pagination-box" id="pagination"></div>\r\n</div>'})}(ko);