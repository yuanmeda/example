void function () {
    var NDRTYPEMAP = {
        '$RE0421': i18nHelper.getKeyValue('questionbank.questionType.nd_fillblank'),
        '$RE0415': i18nHelper.getKeyValue('questionbank.questionType.nd_classified'),
        '$RE0408': i18nHelper.getKeyValue('questionbank.questionType.nd_arithmetic'),
        '$RE0407': i18nHelper.getKeyValue('questionbank.questionType.nd_memorycard'),
        '$RE0410': i18nHelper.getKeyValue('questionbank.questionType.nd_guessword'),
        '$RE0416': i18nHelper.getKeyValue('questionbank.questionType.nd_fraction'),
        '$RE0414': i18nHelper.getKeyValue('questionbank.questionType.nd_textselect'),
        '$RE0411': i18nHelper.getKeyValue('questionbank.questionType.nd_magicbox'),
        '$RE0402': i18nHelper.getKeyValue('questionbank.questionType.nd_order'),
        '$RE0406': i18nHelper.getKeyValue('questionbank.questionType.nd_wordpuzzle'),
        '$RE0418': i18nHelper.getKeyValue('questionbank.questionType.nd_pointsequencing'),
        '$RE0417': i18nHelper.getKeyValue('questionbank.questionType.nd_lable'),
        '$RE0424': i18nHelper.getKeyValue('questionbank.questionType.nd_imagemark'),
        '$RE0426': i18nHelper.getKeyValue('questionbank.questionType.nd_probabilitycard'),
        '$RE0427': i18nHelper.getKeyValue('questionbank.questionType.nd_catchball'),
        '$RE0401': i18nHelper.getKeyValue('questionbank.questionType.nd_linkup_old'),
        '$RE0409': i18nHelper.getKeyValue('questionbank.questionType.nd_compare_old'),
        '$RE0445': i18nHelper.getKeyValue('questionbank.questionType.nd_handwritequestion'),
        '$RE0403': i18nHelper.getKeyValue('questionbank.questionType.nd_table'),
        '$RE0449': i18nHelper.getKeyValue('questionbank.questionType.nd_makeword'),
        '$RE0443': i18nHelper.getKeyValue('questionbank.questionType.nd_section_evaluating'),
        '$RE0434': i18nHelper.getKeyValue('questionbank.questionType.nd_sentence_evaluat'),
        '$RE0432': i18nHelper.getKeyValue('questionbank.questionType.nd_lego'),
        '$RE0454': i18nHelper.getKeyValue('questionbank.questionType.nd_openshapetool'),
        '$RE0450': i18nHelper.getKeyValue('questionbank.questionType.nd_mark_point'),
        '$RE0452': i18nHelper.getKeyValue('questionbank.questionType.nd_intervalproblem'),
        '$RE0447': i18nHelper.getKeyValue('questionbank.questionType.nd_mathaxi'),
    };
    var _ = ko.utils;
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.udialog.alert(i18nHelper.getKeyValue('questionbank.common.connectError'));
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.udialog.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.udialog.alert(txt.message);
                }
            }
        },
        getQuestionInfo: function () {
            var url = '/v1/user_questions/' + user_question_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                error: store.errorCallback
            });
        },
        searchTags: function (data) {
            var url = service_domain + '/v1/user_question/tags/search';
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'post',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        //搜索用户标签
        searchUserQuestionTags: function (data) {
            var url = service_domain + '/v1/user_question_tags/search';
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'post',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        createUserQuestionTags: function (data) {
            var url = service_domain + '/v1/user_question_tags';
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'post',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        //删除指定用户题目的标签
        deleteTagRelations: function (data) {
            var url = '/v1.0/user_questions/' + user_question_id + '/tag/relations?tag_type=' + data.tag_type + '&tag_value=' + data.tag_value;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'delete',
                error: store.errorCallback
            });
        },
        //删除用户题目标签
        deleteUserTag: function (data) {
            var url = service_domain + '/v1/user_question_tags?tag_type=' + data.tag_type + '&tag_value=' + data.tag_value;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'delete',
                error: store.errorCallback
            });
        },
        // 更新用户题目标签
        eidtUserQuestionTag: function (data, user_question_tag_id) {
            var url = service_domain + '/v1/user_question_tags/' + user_question_tag_id;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'put',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        //更新指定用户题目的某类标签
        updateQuestionWrongReasonTags: function (data, tagType) {
            var url = service_domain + '/v1/user_questions/' + user_question_id + '/tags?tag_type=' + tagType;
            return $.ajax({
                url: url,
                cache: false,
                type: 'put',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        postQuestionWrongReasonTags: function (data) {
            var url = service_domain + '/v1/user_questions/' + user_question_id + '/tags';
            return $.ajax({
                url: url,
                cache: false,
                type: 'post',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        createNote: function (data) {
            var url = '/' + projectCode + '/v1/notes';
            return $.ajax({
                url: url,
                cache: false,
                type: 'post',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        searchNote: function (filter) {
            var url = '/' + projectCode + '/v1/notes/search?$filter=' + filter;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                error: store.errorCallback
            });
        },
        editNote: function (data, type, noteId) {
            var url = '/' + projectCode + '/v1/notes/' + noteId;
            return $.ajax({
                url: url,
                cache: false,
                type: type,
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        },
        getSimilarInfo: function (data) {
            var url = '/v1/user_exercises/actions/answer_similar';
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'post',
                data: JSON.stringify(data) || null,
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            keyWrong: false,
            userQuestionContentVo: null,
            qtiQuestion: null,
            analysisVisible: false,
            allWrongReasonTags: [],
            wrongReasonTags: [],
            newUserQuestionTag: '',
            showPopUpWin: false,
            note: '',
            note_id: ''
        },
        autonomic_url: autonomic_url,
        originalNote: '',
        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this._getInitData();
        },
        _getInitData: function () {
            store.getQuestionInfo()
                .done($.proxy(function (data) {
                    if (data && data.question_content) {
                        if (data.question_content.items != undefined) {
                            data.type = 'question';
                            data.identifier = data.question_content.identifier;
                        } else {
                            data.type = 'courseware';
                            data.identifier = item.question_content.id;
                            data.typeName = NDRTYPEMAP[data.question_content.res_type] || i18nHelper.getKeyValue('questionbank.questionType.default');
                            item.tabLink = front_domain + '/' + projectCode + '/exam/prepare/' + item.question_content.id;
                        }
                    } else {
                        data.type = 'other';
                    }
                    this.model.userQuestionContentVo(data);
                    if (data.type == 'question') {
                        this._loadPlayer(data);
                    }
                }, this));


            //所有错因
            var userQuestionTagQueryParam = {tag_types: ["wrong_reason"]};
            var tagFilter = {
                "user_question_ids": [user_question_id],
                "tag_types": ["key_wrong_question", "wrong_reason", "wrong_question"]
            };
            $.when(store.searchTags(tagFilter), store.searchUserQuestionTags(userQuestionTagQueryParam))
                .done($.proxy(function (userQuestionTagRelationVos, userQuestionTagVos) {
                    var userQuestionTagRelationVo = userQuestionTagRelationVos[0];
                    var userQuestionTagVo = userQuestionTagVos[0];
                    var wrongReasonTags = [];
                    if (userQuestionTagRelationVo && userQuestionTagRelationVo.length > 0) {
                        $.each(userQuestionTagRelationVo, $.proxy(function (index, userQuestionTagRelation) {
                            if (userQuestionTagRelation.type == 'wrong_reason' && userQuestionTagRelation.user_question_tag_id != 'f0000000-0000-0000-0000-000000000001') {
                                wrongReasonTags.push(userQuestionTagRelation);
                            } else if (userQuestionTagRelation.type == 'key_wrong_question') {
                                this.model.keyWrong(true);
                            }
                        }, this));
                    }
                    this.model.wrongReasonTags(wrongReasonTags);
                    $.each(userQuestionTagVo, function (index, tag) {
                        tag.selected = false;
                        $.each(wrongReasonTags, function (index, wrongReseasonTag) {
                            if (wrongReseasonTag.user_question_tag_id == tag.id) {
                                tag.selected = true;
                            }
                        })
                    });
                    this.model.allWrongReasonTags(userQuestionTagVo);
                }, this));
            this._getNotes();
        },
        _getNotes: function () {
            var self = this;
            var filter = "(target_id eq 'questionbank:" + user_question_id + "') and (user_id eq " + user_id + ")";
            store.searchNote(filter)
                .done(function (resData) {
                    if (resData && resData.items && $.isArray(resData.items) && resData.items.length > 0) {
                        $.proxy(self._refreshNoteInfo(resData.items[0] && resData.items[0].content || '', resData.items[0] && resData.items[0].id || ''), self);
                    }
                });
        },
        displayEditNote: function (flag, context, evt) {
            var self = this;
            var contextEl = $(evt.target).closest('.cont');
            if (flag) {
                var callBack = function () {
                    contextEl.find('.edit-block').hide();
                    contextEl.find('.display-block').show();
                };
                var currentNote = $.trim(self.model.note());
                if (currentNote.length > 400) {
                    this._selfAlert(i18nHelper.getKeyValue('questionbank.detail.maxLength') + '400', 'info');
                    return;
                }
                if (currentNote == self.originalNote) {
                    callBack();
                    return;
                } else {
                    var sendData = {
                        content: currentNote,
                        target_id: 'questionbank:' + user_question_id,
                        is_open: false
                    };
                    var note_id = self.model.note_id();
                    if (currentNote && self.originalNote && note_id) {
                        //编辑
                        store.editNote(sendData, 'put', note_id)
                            .done(function (resData) {
                                if (resData) {
                                    $.proxy(self._refreshNoteInfo(resData.content, resData.id), self);
                                    callBack();
                                }
                            });
                    } else if (currentNote && !note_id) {
                        //新增
                        store.createNote(sendData)
                            .done(function (resData) {
                                $.proxy(self._refreshNoteInfo(resData.content, resData.id), self);
                                callBack();
                            });
                    } else if (!currentNote && note_id) {
                        //删除
                        store.editNote(null, 'delete', note_id)
                            .done(function (resData) {
                                $.proxy(self._refreshNoteInfo('', ''), self);
                                callBack();
                            });
                    }
                }


            } else {
                contextEl.find('.edit-block').show();
                contextEl.find('.display-block').hide();
            }
        },
        _refreshNoteInfo: function (content, nodeId) {
            this.model.note(content || '');
            this.originalNote = content || '';
            this.model.note_id(nodeId || '');
        },
        _loadPlayer: function (data) {
            var self = this;
            data.qtiplayer = QtiPlayer.createPlayer({
                'swfHost': static_url + 'auxo/addins/flowplayer/v1.0.0/',
                'unifyTextEntry': true,
                'refPath': ref_path
            });
            self.model.qtiQuestion(data);
            $('.detail-container').show();
            self.model.qtiQuestion().qtiplayer.on('error', function (ex) {
                self.showQtiError(self.model.qtiQuestion, ex)
            });
            self.model.qtiQuestion().qtiplayer.load(data.question_content, function () {
                var renderOption = {
                    'skin': 'elearning',
                    'showQuestionName': true,
                    // 'showNum': true,
                    'showLock': true,
                    'showHint': false,
                    'showSubSequence': true
                };
                // if (data.user_answer) {
                //     renderOption.showAnswer = true;
                //     data.qtiplayer.setAnswer(data.user_answer[0].qti_answer);
                // }
                data.qtiplayer.render('qti-' + data.identifier, renderOption, function () {
                    // self.showExtras(data);
                });
            });
        },
        getCorrectAnswer: function () {
            var result = i18nHelper.getKeyValue('questionbank.detail.noCorrectAnswer');
            var question_content = this.model.qtiQuestion().question_content;
            if (question_content && question_content.responses && question_content.responses.length > 0) {
                var responses = question_content.responses;
                switch (question_content.res_type) {
                    case '$RE0208'://套题
                        var temp = '';
                        $.each(responses, function (index, response) {
                            if (temp) {
                                temp = temp + ' ; ' + (index + 1) + ', ' + response.corrects.join("");
                            } else {
                                temp = temp + (index + 1) + ', ' + response.corrects.join("");
                            }
                        });
                        result = temp;
                        break;
                    case '$RE0201'://单选
                    case '$RE0202'://多选
                    case '$RE0203'://判断题
                    case '$RE0206'://问答题
                    case '$RE0209'://填空题
                        var temp = '';
                        $.each(responses, function (index, response) {
                            if (temp) {
                                temp = temp + ' , ' + response.corrects.join("");
                            } else {
                                temp = temp + response.corrects.join("");
                            }
                        });
                        result = temp;
                        break;
                }

            }
            return result;
        },
        getAnswerStatus: function () {
            var userAnswer = this.model.qtiQuestion().user_answer;
            if ($.isArray(userAnswer) && userAnswer.length > 0) {
                var answerStatus = userAnswer[0].question_answer_status;
                if (answerStatus && answerStatus == 5) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        getUserAnswer: function () {
            var result = i18nHelper.getKeyValue('questionbank.detail.noUserAnswer');
            var userAnswers = this.model.qtiQuestion().user_answer;
            if ($.isArray(userAnswers) && userAnswers.length > 0) {
                var user_answer = this.model.qtiQuestion().user_answer[0].qti_answer;//get last answer
                var temp = '';
                if (user_answer) {
                    switch (this.model.qtiQuestion().question_content.res_type) {
                        case '$RE0208'://套题
                            var index = 1;
                            for (var k in user_answer) {
                                if (temp) {
                                    temp = temp + ' ; ' + index + ', ' + user_answer[k].value.join("");
                                } else {
                                    temp = temp + index + ', ' + user_answer[k].value.join("");
                                }
                                index++;
                            }
                            break;
                        case '$RE0201'://单选
                        case '$RE0202'://多选
                        case '$RE0203'://判断题
                        case '$RE0206'://问答题
                        case '$RE0209'://填空题
                            for (var k in user_answer) {
                                if (temp) {
                                    temp = temp + ' , ' + user_answer[k].value.join("");
                                } else {
                                    temp = temp + user_answer[k].value.join("");
                                }
                            }
                            break;
                    }

                    if (temp)
                        result = temp;
                }
            }
            return result;
        },
        getAnalysis: function () {
            var result = i18nHelper.getKeyValue('questionbank.detail.noAnalysis');
            var question_content = this.model.qtiQuestion().question_content;
            if (question_content && question_content.feedbacks && question_content.feedbacks.length > 0) {
                var feedbacks = question_content.feedbacks;
                $.each(feedbacks, function (index, feedback) {
                    if (feedback.identifier == 'showAnswer') {
                        result = feedback.content;
                    }
                })
            }
            return result;
        },
        showQtiError: function (item, error) {
            $('#qti-' + item.identifier).html('<div class="error-question"><strong style="color: #ff0000;font-size: 20px;margin-right: 20px;">' + i18nHelper.getKeyValue('questionbank.detail.qtiText1') + '</strong><a href="javascript:;" class="btn btn-danger" onclick="$(\'#qti-error-' + item.identifier + '\').toggleClass(\'hide\')">' + i18nHelper.getKeyValue('questionbank.detail.qtiText2') + '</a><div class="error-question-body"><textarea class="hide" id="qti-error-' + item.identifier + '" style="width: 400px;height: 200px;">' + JSON.stringify(item.questionItem) + '</textarea></div></div>');
        },
        // showExtras: function($data) {
        //     var extrasOption = {
        //         showHint: false,//显示提示
        //         showUserAnswer: false,//显示用户作答
        //         showCorrectAnswer: true,//显示正确答案
        //         showAnalyse: true//显示解析
        //     };
        //     $data.qtiplayer.showDefaultExtras(extrasOption);
        // },
        slideAnalysisSection: function (context, evt) {
            var contextEl = $(evt.target).closest('.answer-analysis-box');
            var analysisEl = contextEl.find('.analysis-box');
            if ($(evt.target).hasClass('icon-min')) {
                $(evt.target).removeClass('icon-min').addClass('icon-add');
                analysisEl.hide();
            } else {
                $(evt.target).removeClass('icon-add').addClass('icon-min');
                if (analysisEl.data('display') != 'none') {
                    contextEl.find('.analysis-box').show();
                }
            }
        },
        onWrongReasonTagClick: function (data, evt) {
            data.selected = !data.selected;
            var disable = $(evt.target).hasClass('disable');
            if (data.selected) {
                $(evt.target).addClass('disable');
            } else {
                $(evt.target).removeClass('disable');
            }
            // var disable = $(evt.target).data('disable');
        },
        createUserQuestionTag: function (data, evt) {
            var newUserQuestionTag = this.model.newUserQuestionTag();
            var value = $.trim(newUserQuestionTag);
            if (!value) {
                this._selfAlert(i18nHelper.getKeyValue('questionbank.detail.cannotEmpty'), 'info');
                return;
            } else if (value.length > 15) {
                this._selfAlert(i18nHelper.getKeyValue('questionbank.detail.maxLength') + '15', 'info');
                return;
            }
            var data = {
                type: 'wrong_reason',
                value: value
            };
            store.createUserQuestionTags(data)
                .done($.proxy(function (data) {
                    this.model.newUserQuestionTag('');
                    this._selfAlert(i18nHelper.getKeyValue('questionbank.common.sucess'), 'right');
                    data.selected = false;
                    this.model.allWrongReasonTags.push(data);
                }, this))
        },
        deleteUserQuestionTag: function (data, evt) {
            var self = this;
            $.fn.udialog.alert(i18nHelper.getKeyValue('questionbank.detail.confirmDelete'), {
                icon: 'info',
                title: i18nHelper.getKeyValue('questionbank.common.hint'),
                buttons: [{
                    text: i18nHelper.getKeyValue('questionbank.common.confirm'),
                    click: function () {
                        $(this).udialog("hide");
                        var params = {
                            tag_type: data.type,
                            tag_value: encodeURIComponent(data.value)
                        };
                        store.deleteUserTag(params)
                            .done(function (resData) {
                                self.model.allWrongReasonTags.remove(data);
                            })
                    },
                    'class': 'ui-btn-confirm'
                }, {
                    text: i18nHelper.getKeyValue('questionbank.common.cancel'),
                    'class': 'ui-btn-primary',
                    click: function () {
                        $(this).udialog("hide");
                    }
                }]
            });

        },
        updateUserWrongReasonTags: function (data, evt) {
            $(evt.target).closest('.popup-win').find('.tag-group').find('.li-label').show();
            $(evt.target).closest('.popup-win').find('.tag-group').find('.input-group-small').hide();
            var allWrongReasonTags = this.model.allWrongReasonTags();
            var selectedIds = [];
            $.each(allWrongReasonTags, function (index, tag) {
                if (tag.selected) {
                    selectedIds.push(tag.id);
                }
            });
            store.updateQuestionWrongReasonTags(selectedIds, 'wrong_reason')
                .done(function (data) {
                    this.model.wrongReasonTags([]);
                    $.each(data, $.proxy(function (index, item) {
                        if (item.user_question_tag_id && item.user_question_tag_id != 'f0000000-0000-0000-0000-000000000001') {
                            this.model.wrongReasonTags.push(item);
                        }
                    }, this));
                    this.model.showPopUpWin(false);
                }.bind(this));
        },
        goEditWrongReason: function (context, evt) {
            var parentTop = $(evt.target).closest('.answer-analysis-box').find('.label-group').position().top;
            $(window).scrollTop(parentTop - 108);
        },
        goEditNote: function (context, evt) {
            var parentTop = $(evt.target).closest('.answer-analysis-box').find('.label-group').position().top;
            $(window).scrollTop(parentTop - 108);
        },
        resetKeyWrongStatus: function (keyWrong) {
            if (keyWrong) {
                this.model.keyWrong(true);
                var data = {
                    type: 'key_wrong_question',
                    value: 'true'
                };
                store.postQuestionWrongReasonTags(data);
            } else {
                var data = {
                    tag_type: 'key_wrong_question',
                    tag_value: false
                };
                this.model.keyWrong(false);
                store.deleteTagRelations(data);
            }
        },
        updateUserQuestionTag: function (data, evt) {
            var value = $.trim(data.value);
            if (!value) {
                this._selfAlert(i18nHelper.getKeyValue('questionbank.detail.cannotEmpty'), 'info');
                return;
            } else if (value.length > 15) {
                this._selfAlert(i18nHelper.getKeyValue('questionbank.detail.maxLength') + '15', 'info');
                return;
            }
            var newData = {
                type: data.type,
                value: data.value
            };
            store.eidtUserQuestionTag(newData, data.id);

            $(evt.target).closest('li').find('.li-label').show();
            $(evt.target).closest('li').find('.li-label').find('a.ana-btn').html(data.value);
            inputGroup = $(evt.target).closest('li').find('.input-group-small').hide();
        },
        editUserQuestionTag: function (data, evt) {
            $(evt.target).closest('li').find('.li-label').hide();
            var txt = $(evt.target).closest('li').find('.li-label').find('a.ana-btn').text();
            $(evt.target).closest('li').find('.input-group-small').find('input').val(txt);
            inputGroup = $(evt.target).closest('li').find('.input-group-small').show();
        },
        goBack: function () {
            var paramsExtra = '&user_question_tags=' + encodeURIComponent(user_question_tags) + '&question_tags=' + encodeURIComponent(question_tags) + '&sort_params=' + encodeURIComponent(sort_params);
            location.href = '/' + projectCode + '/question_bank/list?user_id=' + user_id + paramsExtra;
        },
        goSimilarExercise: function () {
            var data = this.model.userQuestionContentVo();
            var autonomic_url = this.autonomic_url || '';
            if (!autonomic_url) {
                this._selfAlert('error', 'info');
                return;
            }
            var sendData = {
                user_id: +user_id,
                title: i18nHelper.getKeyValue('questionbank.list.similar'),
                question_tag_type: 'instructional_objective',
                question_ids: [data && data.question_vo && data.question_vo.source_id || ''],
                count: 3
            };
            store.getSimilarInfo(sendData)
                .done($.proxy(function (examVo) {
                    if (examVo && examVo.id) {
                        //postMessage抛出examVo.id
                        var z = window.parent;
                        var n = new Nova.Notification(z, "*");
                        var message_key = "question.bank.gateway";
                        var message_data = {
                            event_type: "question_bank_gateway",
                            data: {
                                exam_id: examVo.id
                            }
                        };
                        n.dispatchEvent("message:" + message_key, message_data);
                    }
                }, this));

        },
        goToLearn: function () {
            var item = this.model.userQuestionContentVo();
            //postMessage抛出
            var z = window.parent;
            var n = new Nova.Notification(z, "*");
            var message_key = "question.bank.gateway.learn";
            var message_data = {
                event_type: "question_bank_gateway_learn",
                data: {
                    question_content_id: item.question_content && item.question_content.identifier || "",
                    question_vo_id: item.question_vo && item.question_vo.id || "",
                    user_question_vo_id: item.user_question_vo && item.user_question_vo.id || ""
                }
            };
            n.dispatchEvent("message:" + message_key, message_data);
        },
        goSubmitQuestion: function(){
            var item = this.model.userQuestionContentVo();
            //postMessage抛出
            var z = window.parent;
            var n = new Nova.Notification(z, "*");
            var message_key = "question.bank.gateway.question";
            var message_data = {
                event_type: "question_bank_gateway_question",
                data: {
                    question_content_id: item.question_content && item.question_content.identifier || "",
                    question_vo_id: item.question_vo && item.question_vo.id || "",
                    user_question_vo_id: item.user_question_vo && item.user_question_vo.id || ""
                }
            };
            n.dispatchEvent("message:" + message_key, message_data);
        },
        // 弹窗
        _selfAlert: function (text, icon) {
            $.fn.udialog.alert(text, {
                icon: icon || '',
                title: i18nHelper.getKeyValue('questionbank.common.hint'),
                buttons: [{
                    text: i18nHelper.getKeyValue('questionbank.common.confirm'),
                    click: function () {
                        $(this).udialog("hide");
                    },
                    'class': 'ui-btn-confirm'
                }]
            });
        }
    };
    $(function () {
        viewModel._init();
    });

}(jQuery);
