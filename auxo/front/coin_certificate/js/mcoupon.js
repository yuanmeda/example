/**
 * 兑换优惠券h5页面
 */
(function ($, window) {
	'use strict';
	var store={
		//查询兑换券配置
		getCoinInfo:function(){
			var url='/' + projectCode + '/coin_certificates/'+ coinCertificateId;
			return $.ajax({
				url:url
			});
		},
		// 领取兑换券
		updateCoinInfo:function(data){
			var url='/' + projectCode + '/coin_certificates/'+ coinCertificateId +'/use_situations';
			return $.ajax({
				url:url,
				type:'POST',
				data: JSON.stringify(data),
                dataType: 'JSON',
                contentType: 'application/json;charset=utf8'
			});
		},
		// 查询用户信息
		getUserInfo:function(mobile){
			var url='/' + projectCode + '/uc/users/actions/third_query';
			return $.ajax({
				url:url,
				data:mobile
			});
		},
	};
	var viewModel={
			model:{
				coinInfo:{
					id: coinCertificateId,
				    name: '',
				    allow_receive_start_time: '',
				    allow_receive_end_time: '',
				    allow_receive_number: 0,
				    allow_use_start_time: '',
				    allow_use_end_time: '',
				    remark: '',
				    receive_status: 0,
				    use_status: 0,
				    limit_object_type:'',
				    limit_object_name:''
				},
				user:{
				    user_id: 0,
				    user_name: '',
				    nick_name: ''
				},
				mobileNum:'',
				receiveUserIid: '',
				boxDisplay:false,
				boxMessage:''
			},
			/**
			 * 初始化入口
			 */
			_init:function(){				
            	document.title = i18nHelper.getKeyValue('coin.mobile.pageTitle');
				//ko监听数据
				this.model = ko.mapping.fromJS(this.model);
				//ko绑定作用域
				ko.applyBindings(this, document.getElementById('container'));
				this._getCoinInfo();
				this._eventHandle();
				this._getRegCoupon();
			},
			_eventHandle:function(){
				var _self = this;
				$(document).ajaxError(function(e, response, request, errType) {
	                var error = response.responseJSON || JSON.parse(response.responseText);
	                if(response.status===401){
	                    return;
	                }
	                if (error.cause) {
	                	_self._popBox(error.cause.message);
	                } else {
	                	_self._popBox(error.message);
	                }
	            });
			},
			//判断是否为注册跳回的并是否进行领取动作
			_getRegCoupon:function(){
				var _self = this,
				userId = _self.getUrlParam('user_id');
				if(userId){
					store.updateCoinInfo({
						receive_user_id: userId
					}).done(function(returnData){
	    				_self._popBox(i18n.coin.mobile.congratulation);
	    			})
				}
			},
			_getCoinInfo:function(){
				var _self=this;
				store.getCoinInfo().done(function(data){
					if(data){
						data.allow_receive_start_time=_self._toJSTime(data.allow_receive_start_time);
						data.allow_receive_end_time=_self._toJSTime(data.allow_receive_end_time);
						data.allow_use_start_time=_self._toJSTime(data.allow_use_start_time);
						data.allow_use_end_time=_self._toJSTime(data.allow_use_end_time);
						ko.mapping.fromJS(data,{}, _self.model.coinInfo);
					}
				})
			},
			/**
			 * 获取优惠券
			 * @type {[type]}
			 */
			_getCoupon:function(){
				var _self = this,
				    patt = new RegExp(/^[0-9]*$/),
				    mobileNum = _self.model.mobileNum(),postData,getData,
				    coin = _self.model.coinInfo;
				    getData = {mobile:mobileNum};
				    if(patt.test(mobileNum)&& +mobileNum){
				    	store.getUserInfo(getData).done(function(data){
				    		if(data.user_id){
				    			postData = {
							    	receive_user_id: data.user_id
							    };
				    			store.updateCoinInfo(postData).done(function(returnData){
				    				_self._popBox(i18n.coin.mobile.congratulation);
				    			})
				    		}else if(!regType){
				    			_self._popBox(i18n.coin.mobile.regClosed);
				    		}else{
				    			window.location.href='/' + projectCode + '/account/m/register?returnurl=' + encodeURIComponent(window.location.href.replace(/&?user_id=.+/g,'')) + '&mobile=' + _self.model.mobileNum();
				    		}
				    	})
				    }else{
				    	_self._popBox(i18n.coin.mobile.inputNumber);
				    }
			},
			/**
			 * 将2016-03-25T14:33:00转成2016-03-25 14:33
			 * @type {[type]}
			 */
			_toJSTime:function (dt) {
				if(dt){
			   		return dt.substring(0,10);
			   }
			},
			/**
			 * 关闭弹窗
			 * @return {[type]} [description]
			 */
			_close:function(){
				var _self = this;
				_self.model.boxDisplay(false);
				$('#mask .pop-outer').removeClass('bounceIn');
			},
			/**
			 * 弹窗
			 * @param  {[type]} html [提示语句以html格式]
			 */
			_popBox:function(html){
				var _self = this;
				_self.model.boxMessage(html);
				_self.model.boxDisplay(true);
				$('#mask .pop-outer').addClass('bounceIn');
			},
			/**
			 * 获取urlparam
			 */
			getUrlParam:function(name) {
	            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	            var r = window.location.search.substr(1).match(reg); 
	            if (r != null) return unescape(r[2]); return null;
	        }

	};
	viewModel._init();
})(jQuery, window);