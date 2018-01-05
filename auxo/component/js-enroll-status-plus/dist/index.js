!function(t){"use strict";t=t&&t.hasOwnProperty("default")?t["default"]:t;var e={alert:function(t){($.fn.udialog&&$.fn.udialog.alert||window.alert)(t,{title:i18nHelper.getKeyValue("enroll.hint"),buttons:[{text:i18nHelper.getKeyValue("enroll.confirm"),"class":"ui-btn-primary"}]})},confirm:function(t,e){($.fn.udialog&&$.fn.udialog.confirm||window.confirm)(t,[{text:i18nHelper.getKeyValue("enroll.confirm"),click:function(){e&&e(),$(this).udialog("hide")}},{text:i18nHelper.getKeyValue("enroll.cancel"),click:function(){$(this).udialog("hide")}}],{title:i18nHelper.getKeyValue("enroll.hint")})}},n=(function(){function t(t){this.value=t}function e(e){function n(i,a){try{var o=e[i](a),s=o.value;s instanceof t?Promise.resolve(s.value).then(function(t){n("next",t)},function(t){n("throw",t)}):r(o.done?"return":"normal",o.value)}catch(l){r("throw",l)}}function r(t,e){switch(t){case"return":i.resolve({value:e,done:!0});break;case"throw":i.reject(e);break;default:i.resolve({value:e,done:!1})}(i=i.next)?n(i.key,i.arg):a=null}var i,a;this._invoke=function(t,e){return new Promise(function(r,o){var s={key:t,arg:e,resolve:r,reject:o,next:null};a?a=a.next=s:(i=a=s,n(t,e))})},"function"!=typeof e["return"]&&(this["return"]=undefined)}"function"==typeof Symbol&&Symbol.asyncIterator&&(e.prototype[Symbol.asyncIterator]=function(){return this}),e.prototype.next=function(t){return this._invoke("next",t)},e.prototype["throw"]=function(t){return this._invoke("throw",t)},e.prototype["return"]=function(t){return this._invoke("return",t)}}(),function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}),r=i18nHelper.getKeyValue,i=function(){function i(e){var a=this;n(this,i),this.params=e||{},this.unitId=e.unitId,this.projectCode=e.code||projectCode,this.returnUrl=e.returnUrl,this.hosts=e.hosts,this.contextId="enroll:"+this.unitId+"."+e.contextId,this.statusMap={0:{display:r("enroll.unLogin"),href:"javascript:;"},1:{display:r("enroll.enrolled"),href:"javascript:;"},2:{display:r("enroll.enroll"),href:this.hosts.elearningEnrollGatewayUrl+"/"+this.projectCode+"/enroll/enroll?unit_id="+this.unitId+"&__return_url="+this.returnUrl},3:{display:r("enroll.enrollNotStart"),href:"javascript:;"},4:{display:r("enroll.finished"),href:"javascript:;"},5:{display:r("enroll.audit"),href:"javascript:;"},6:{display:r("enroll.goPay"),href:this.hosts.elearningPayGatewayUrl+"/"+this.projectCode+"/pay/commodity?context_id="+this.contextId+"&unit_id="+this.unitId+"&__return_url="+this.returnUrl},7:{display:r("enroll.quotaFull"),href:"javascript:;"},8:{display:r("enroll.enroll"),href:this.hosts.elearningEnrollGatewayUrl+"/"+this.projectCode+"/enroll/enroll?unit_id="+this.unitId+"&__return_url="+this.returnUrl}},this.displayText=t.observable(""),this.isDisabled=t.observable(!1),this.actionUrl="javascript:;",this.start=t.observable(null),this.end=t.observable(null),this.limit=t.observable(null),this.enrolled_count=t.observable(null),this.payment_strategy=t.observable(null),this.status=t.observable(null),this.displayAmount=t.observable(null),this.blockShow=t.computed(function(){return!!(this.start()||this.end()||this.limit()||this.payment_strategy())},this),this.store={getEnrollStatus:function(){return $.ajax({url:a.hosts.elearningEnrollGatewayUrl+"/v1/user/enroll_entrance_info",data:{unit_id:a.unitId}})}},this._init()}return i.prototype.on_sales_timeout=function(){},i.prototype.on_add_to_cart_success=function(){e.alert(r("enroll.addToCartSuccess"))},i.prototype.on_add_to_cart_fail=function(t){e.alert(t)},i.prototype._init=function(){var t=this;this.unitId&&this.store.getEnrollStatus().done(function(e){var n=t.statusMap[e.status];t.start(e.start),t.end(e.end),t.limit(e.limit),t.enrolled_count(e.enrolled_count),t.payment_strategy(e.payment_strategy),t.status(e.status),t.displayAmount(e.display_amount),~$.inArray(e.status,[3,5,1,4,7,0])&&t.isDisabled(!0),t.displayText(n.display),t.actionUrl=n.href}).always(function(){$(".x-enroll-status").removeClass("hide")})},i.prototype._dateFormat=function(e){if(t.isObservable(e)&&(e=e()),e)return timeZoneTrans?timeZoneTrans(e).slice(0,10):e.replace("T"," ").replace(/\-/g,"/").slice(0,10)},i.prototype._getMacUrl=function(t){var e,n=Nova.getMacToB64(t);return e=/\&/g.test(t)?"&":"?",t+e+"__mac="+n},i.prototype.onClick=function(t,e){if(!this.isDisabled()&&"javascript:;"!==this.actionUrl){var n=this._getMacUrl(this.actionUrl);6===this.status()?window.open(n):window.location.href=n}},i}();t.components.register("x-enroll-status",{viewModel:i,template:'\x3c!-- ko if:status() != 6 --\x3e\r\n<div class="x-enroll-status hide">\r\n    <div class="enroll--info" data-bind="visible:blockShow">\r\n        <div class="table-layout">\r\n            <p data-bind="visible:start()||end()">\r\n                <span data-bind="text:_dateFormat(start)"></span>\r\n                \x3c!--ko translate:{key:\'enroll.to\'}--\x3e\x3c!--/ko--\x3e\r\n                <span data-bind="text:_dateFormat(end)"></span>\r\n            </p>\r\n            <p data-bind="visible:limit">\r\n                <span data-bind="translate:{key:\'enroll.enrollLimit\',properties:{enrolled:enrolled_count,limit:limit}}"></span>\r\n            </p>\r\n            <p data-bind="visible:displayAmount">\r\n                <span data-bind="translate:{\'key\':\'enroll.enrollPay\'}"></span>\r\n                <strong data-bind="text:displayAmount"></strong>\r\n            </p>\r\n        </div>\r\n        <div class="badge"></div>\r\n    </div>\r\n    <div class="default-icon" data-bind="visible:!blockShow()">\r\n        <i class="es-icon-study"></i>\r\n    </div>\r\n    <div class="enroll--button">\r\n        <a href="javascript:;" class="button"\r\n           data-bind="click:onClick,text:displayText,css:{\'button--disabled\':isDisabled,\'button--theme\':!isDisabled()}"></a>\r\n    </div>\r\n</div>\r\n\x3c!--/ko--\x3e\r\n\x3c!-- ko ifnot:status() != 6 --\x3e\r\n<div class="pay-wrap" data-bind="component:{\r\n    name:\'x-sales-shopping-card\',\r\n    params:{\r\n        e_goods_gw_host: hosts.eGoodsGatewayUrl,\r\n        e_sales_gw_host: hosts.eSalesGatewayUrl,\r\n        e_cart_srv_host: hosts.eCartServiceUrl,\r\n        e_cart_gw_host: hosts.eCartGatewayUrl,\r\n        project_code: projectCode,\r\n        learning_unit_id: unitId,\r\n        on_sales_timeout: on_sales_timeout,\r\n        on_add_to_cart_success: on_add_to_cart_success,\r\n        on_add_to_cart_fail: on_add_to_cart_fail\r\n    }\r\n}">\r\n</div>\x3c!--/ko--\x3e\r\n\x3c!--/ko--\x3e'})}(ko);