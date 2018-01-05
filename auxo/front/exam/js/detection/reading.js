(function ($, window) {
    'use strict';
    var store = {
        getOralConfig: function () {
            var url = '/' + window.projectCode + '/v1/exams/' + window.examId + '/oral_config';
            return $.ajax({
                url: url
            });
        },
        getCsPath: function (csFileVo) {
            var url = '/' + window.projectCode + '/v1/m/other/file';
            return $.ajax({
                url: url,
                dataType: "json",
                type: "POST",
                data: JSON.stringify(csFileVo)
            });
        },
        getEditorUrl: function () {
            return $.ajax({
                url: '/' + projectCode + '/exam/v2/courseware_objects/actions/get_editor_url',
                dataType: "json",
                cache: false
            })
        },
        saveAnswer: function (answerData) {
            return $.ajax({
                url:  '/' + window.projectCode + '/v2/m/exams/' + window.examId + '/sessions/' + window.sessionId + '/answers?resource_type=assessment_courseware_object',
                dataType: "json",
                type: "PUT",
                data: JSON.stringify(answerData)
            })
        }
    };

    var viewModel = {
        model: {
            initTime: 0,
            saveAnswerTime: 0,
            examOralConfig: ko.observable(null),
            iframeParamsStr: ko.observable(''),
            token:  ko.observable(''),
            languegeCode: ko.observable('')
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('container'));
            store.getOralConfig().done($.proxy(function (res) {
                this.model.examOralConfig(res);
                this._initParams();
            }, this));
            $(window).off('message').on('message', function (evt) {
                if (evt.originalEvent.data) {
                    var rawData = evt.originalEvent.data;
                    if(rawData.eventType){
                        if(rawData.eventType === 'onSaveRecordFile' && rawData.blob){
                            this._blobToDataUrl(rawData.blob, this._saveRecordFile);
                        }else if(rawData.eventType === 'onAnswerQuestion' && rawData.eventData && window.sessionId){
                            this._saveAnswer(rawData.eventData);
                        }
                    }
                }
            }.bind(this));
            this.model.initTime = new Date().getTime();
        },
        _saveAnswer: function (eventData) {
            this.model.saveAnswerTime = new Date().getTime();
            var cs = Math.floor((this.model.saveAnswerTime - this.model.initTime) / 1000);
            var answerData = [{
                "qti_answer": eventData.answer.answers[eventData.id] || {},
                "id": window.questionId,
                "qv": 0,
                "cs": cs
            }];
            store.saveAnswer(answerData).done($.proxy(function (res) {

            }, this));
        },
        _blobToDataUrl: function (blob, callback) {
            var a = new FileReader();
            a.onload = function (e) { callback(e.target.result); }
            a.readAsDataURL(blob);
        },
        _saveRecordFile: function (result) {
            var fileDataArr = [],
                fileData = result,
                fileTypeArr = [],
                fileType = '';
            if(result.indexOf(';base64,') > -1){
                fileDataArr = result.split(';base64,');
                if(fileDataArr.length>1){
                    fileData = fileDataArr[1];
                    if(fileDataArr[0].indexOf('/')>-1){
                        fileTypeArr = fileDataArr[0].split('/');
                        if(fileTypeArr.length>1){
                            fileType = fileTypeArr[1];
                        }
                    }
                }
            }
            var csFileVo = {
                "file_name": viewModel._randomString(32) + '.' + fileType,
                "file_data": fileData
            }
            store.getCsPath(csFileVo).done($.proxy(function (res) {
                if(res && res.cs_path){
                    var postData = {
                        eventType: 'onSaveRecordFileCallback',
                        cs_path: res.cs_path
                    };
                    window.frames[0].postMessage(postData, '*');
                }
            }, this));
        },
        _randomString: function(len) {
            len = len || 32;
            var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
            var maxPos = $chars.length;
            var pwd = '';
            for (var i = 0; i < len; i++) {
                pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return pwd;
        },
        _initParams: function () {
            var examOralConfig = this.model.examOralConfig();
            var paramsObj = {
                stemPlayCount: examOralConfig.main_audio_play_times || 1,
                showReference: examOralConfig.show_dialog_answer || true,
                ReAnswer: examOralConfig.repeatable_answer || false,
                showTranslation: examOralConfig.show_chinese || true
            };
            this.model.iframeParamsStr(encodeURIComponent(JSON.stringify(paramsObj)));
            this.model.languegeCode(window.languageCode.replace('-', '_'));
            this._initToken();
        },
        _initToken: function () {
            store.getEditorUrl().done($.proxy(function (res) {
                var DES_KEY = "13465c85caab4dfd8b1cb5093131c6d0";
                if(res && res.token_info){
                    this.model.token(encodeURIComponent(window.CryptoJS.TripleDES.encrypt(JSON.stringify(res.token_info), DES_KEY).toString()));
                }
            }, this));
        }
    };
    $(function () {
        viewModel._init();
    });

})(jQuery, window);
