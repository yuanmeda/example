(function ($, window) {
    'use strict';
    const TRUE = 'ooo'
    const FALSE = 'xxx'
    var store = {
        getConfig: function () {
            return $.ajax({
                url: '/' + projectCode + '/v1/exams/' + examId + '/oral_config',
                type: "GET",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                cache: false
            });
        },
        setConfig: function (config) {
            return $.ajax({
                url: '/' + projectCode + '/v1/exams/' + examId + '/oral_config',
	            cache: false,
	            type: 'put',
	            data: JSON.stringify(config) || null,
	            contentType: 'application/json;charset=utf8'
            });
        }
    }
    var viewModel = {
        model: {
            mainAudioPlayTimes:1,
            playTitle:TRUE,
            showDialogAnswer:1,
            repeatableAnswer: true,
            showChinese: 1,
            testAudioDevice:true,
	        showErrorTip: false,
	        inputEnable: true
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model)
	        this.model.inputEnable=ko.computed({read:function () {
		        return this.model.playTitle() === TRUE
	        },write:function () {}},this)
            this.koBind()
            store.getConfig().done($.proxy(function (data) {
                if (data) {
	                this.model.mainAudioPlayTimes(data.main_audio_play_times === -1 ? '1' : data.main_audio_play_times)
	                this.model.playTitle(data.main_audio_play_times<0 ? FALSE: TRUE)
	                this.model.showDialogAnswer(data.show_dialog_answer ? TRUE: FALSE)
	                this.model.repeatableAnswer(data.repeatable_answer)
	                this.model.showChinese(data.show_chinese ? TRUE:FALSE)
	                this.model.testAudioDevice(data.test_audio_device)
	                this.model.inputEnable(data.main_audio_play_times !== -1)


                } else {
	                this.model.mainAudioPlayTimes(1)
	                this.model.playTitle(TRUE)
	                this.model.showDialogAnswer(TRUE)
	                this.model.repeatableAnswer(true)
	                this.model.showChinese(TRUE)
	                this.model.testAudioDevice(true)
	                this.model.inputEnable(true)
                }
            },this))
        },
	    koBind: function () {
		    var $content = $('#js-content');
		    ko.applyBindings(this, $content[0]);
		    $content.show();
        },
	    clickSave:function () {
            var opConfig=ko.toJS(this.model)
            var config={
	            main_audio_play_times: opConfig.playTitle === TRUE ? opConfig.mainAudioPlayTimes : -1,
	            show_dialog_answer:opConfig.showDialogAnswer === TRUE,
	            repeatable_answer:opConfig.repeatableAnswer,
	            show_chinese:opConfig.showChinese === TRUE ,
	            test_audio_device:opConfig.testAudioDevice
            }
			if(this.model.showErrorTip() === true){
				$.fn.dialog2.helpers.alert('输入格式有误');
			}else {
				store.setConfig(config).done(function () {
					$.fn.dialog2.helpers.alert('保存成功');
				}).fail(function () {
					$.fn.dialog2.helpers.alert('保存失败，请重试');
				})
			}
	    },
	    handleInputChange:function () {
		    var val=$('#input-vedio-times').val();
		    if (val === ''){
			    this.model.showErrorTip(false);
		    }else {
			    var pat = /^\d+$/;
			    this.model.showErrorTip(!pat.test(val));
		    }
	    }

    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);