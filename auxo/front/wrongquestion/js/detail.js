(function ($, window) {
    var NDRTYPEMAP = {
        '421': i18nHelper.getKeyValue('questionbank.questionType.nd_fillblank'),
        '415': i18nHelper.getKeyValue('questionbank.questionType.nd_classified'),
        '408': i18nHelper.getKeyValue('questionbank.questionType.nd_arithmetic'),
        '407': i18nHelper.getKeyValue('questionbank.questionType.nd_memorycard'),
        '410': i18nHelper.getKeyValue('questionbank.questionType.nd_guessword'),
        '416': i18nHelper.getKeyValue('questionbank.questionType.nd_fraction'),
        '414': i18nHelper.getKeyValue('questionbank.questionType.nd_textselect'),
        '411': i18nHelper.getKeyValue('questionbank.questionType.nd_magicbox'),
        '402': i18nHelper.getKeyValue('questionbank.questionType.nd_order'),
        '406': i18nHelper.getKeyValue('questionbank.questionType.nd_wordpuzzle'),
        '418': i18nHelper.getKeyValue('questionbank.questionType.nd_pointsequencing'),
        '417': i18nHelper.getKeyValue('questionbank.questionType.nd_lable'),
        '424': i18nHelper.getKeyValue('questionbank.questionType.nd_imagemark'),
        '426': i18nHelper.getKeyValue('questionbank.questionType.nd_probabilitycard'),
        '427': i18nHelper.getKeyValue('questionbank.questionType.nd_catchball'),
        '401': i18nHelper.getKeyValue('questionbank.questionType.nd_linkup_old'),
        '409': i18nHelper.getKeyValue('questionbank.questionType.nd_compare_old'),
        '445': i18nHelper.getKeyValue('questionbank.questionType.nd_handwritequestion'),
        '403': i18nHelper.getKeyValue('questionbank.questionType.nd_table'),
        '449': i18nHelper.getKeyValue('questionbank.questionType.nd_makeword'),
        '443': i18nHelper.getKeyValue('questionbank.questionType.nd_section_evaluating'),
        '434': i18nHelper.getKeyValue('questionbank.questionType.nd_sentence_evaluat'),
        '432': i18nHelper.getKeyValue('questionbank.questionType.nd_lego'),
        '454': i18nHelper.getKeyValue('questionbank.questionType.nd_openshapetool'),
        '450': i18nHelper.getKeyValue('questionbank.questionType.nd_mark_point'),
        '452': i18nHelper.getKeyValue('questionbank.questionType.nd_intervalproblem'),
        '447': i18nHelper.getKeyValue('questionbank.questionType.nd_mathaxi'),
    };

    var _ = ko.utils;

    var store = {
        getWrongQuestions: function (filter) {
            return $.ajax({
                url: selfUrl + '/v1/wrong_questions/search',
                type: 'POST',
                dataType: 'JSON',
                data: JSON.stringify(filter)
            })
        },
        getQuestionInfo: function () {
            var url = selfUrl + '/v1/wrong_questions/' + wrong_question_id;
            return $.ajax({
                url: url,
                data: {component: component},
                cache: false
            });
        },
        updateMarkKey: function (is_mark_key) {
            var url = wrongQuestionUrl + '/v1/wrong_questions/' + wrong_question_id + '/mark_key/' + is_mark_key;
            return $.ajax({
                url: url,
                type: 'put',
                data: {component: component},
                cache: false
            });
        },
        updateMaster: function (is_mastered) {
            var url = wrongQuestionUrl + '/v1/wrong_questions/' + wrong_question_id + '/mastered/' + is_mastered;
            return $.ajax({
                url: url,
                type: 'put',
                data: {component: component},
                cache: false
            });
        },
        // getNote: function () {
        //     var data = {
        //         "filter": "user_id eq " + userId + " and target_id eq 'wrongquestion:" + wrong_question_id + "'",
        //         "limit": 1
        //     };
        //     return $.ajax({
        //         url: noteUrl + '/v1/notes/search',
        //         data: JSON.stringify(data),
        //         type: "POST"
        //     })
        // },
        addNote: function (content) {
            var data = {
                content: content,
                target_id: 'wrongquestion:' + wrong_question_id,
                is_open: false
            };

            return $.ajax({
                url: noteUrl + '/v1/notes',
                data: JSON.stringify(data),
                type: 'POST'
            })
        },
        updateNote: function (noteId, content) {
            var data = {
                content: content,
                target_id: 'wrongquestion:' + wrong_question_id,
                is_open: false
            };

            return $.ajax({
                url: noteUrl + '/v1/notes/' + noteId,
                data: JSON.stringify(data),
                type: 'PUT'
            })
        },
        // 获取错因
        getUserTags: function () {
            var url = wrongQuestionUrl + '/v1/user_tags/search?user_id=' + userId + '&tag_type=wrong_reason';
            return $.ajax({
                url: url,
                type: 'post',
                cache: false
            });
        },
        // 新增错因
        addUserTag: function (tag_value) {
            var url = wrongQuestionUrl + '/v1/user_tags';
            var data = {
                component: component,
                tag_type: 'wrong_reason',
                tag_value: tag_value
            }
            return $.ajax({
                url: url,
                type: 'post',
                data: JSON.stringify(data),
                cache: false
            });
        },
        // 修改错因
        editUserTag: function (user_tag_id, tag_value) {
            var url = wrongQuestionUrl + '/v1/user_tags/' + user_tag_id;
            var data = {
                tag_value: tag_value
            }
            return $.ajax({
                url: url,
                type: 'put',
                data: JSON.stringify(data),
                cache: false
            });
        },
        delUserTag: function (user_tag_id) {
            var url = wrongQuestionUrl + '/v1/user_tags/' + user_tag_id;
            return $.ajax({
                url: url,
                type: 'delete',
                data: {component: component},
                cache: false
            });
        },

        // getQuestionUserTags: function () {
        //     var url = wrongQuestionUrl + '/v1/wrong_questions/' + wrong_question_id + '/user_tags';
        //     var data = {
        //         tag_type: 'wrong_reason'
        //     }
        //     return $.ajax({
        //         url: url,
        //         data: data,
        //         cache: false
        //     });
        // },

        updateQuestionUserTags: function (userTagsIds) {
            var url = wrongQuestionUrl + '/v1/wrong_questions/' + wrong_question_id + '/user_tags?tag_type=wrong_reason';
            return $.ajax({
                url: url,
                type: 'put',
                data: JSON.stringify(userTagsIds),
                cache: false
            });

        },
    };
    var timerId = 0;
    var viewModel = {
        model: {
            returnUrl: ko.observable(returnUrl),
            component: component,
            userQuestionContentVo: null,
            qtiQuestion: null,
            questionTags: ko.observableArray([]),
            userTags: [],
            selectedUserTags: [],
            userTagValue: '',
            editUserTag: ko.observable({}),
            isUserTagsModelShow: false,
            note: {
                id: '',
                content: ''
            },
            user_tags_noreason: {
                create_time: "2017-05-19T18:17:24.000+0800",
                tag_type: "wrong_reason",
                tag_value: "未知错因",
                update_time: "2017-05-19T18:17:27.000+0800",
                user_id: 0,
                user_tag_id: "f0000000-0000-0000-0000-000000000001"
            },
            previous_id: ko.observable(''),
            next_id: ko.observable('')
        },
        init: function () {
            if (!returnUrl) {
                returnUrl = _self_url + '/' + project.domain + '/wrong_question/' + component;
                this.model.returnUrl(decodeURIComponent(returnUrl));
            }
            this._getQuestionInfo();
            this.setNextAndPreID();
        },
        setNextAndPreID: function () {
            var that = this;
            var filter = JSON.parse(decodeURIComponent($.cookie('wrong_question_filter')));
            // 获取前一题id
            index = Number(index);
            if (index != 0) {
             filter.page_no = index - 1;
             filter.page_size = 1;
             store.getWrongQuestions(filter).done(function (d) {
                 if (d.items && d.items.length > 0) {
                     that.model.previous_id(d.items[0].wrong_question_id);
                 }
             });
            }
            // 获取下一题id
            filter.page_no = index + 1;
            filter.page_size = 1;
            store.getWrongQuestions(filter).done(function (d) {
                if (d.items && d.items.length > 0) {
                    that.model.next_id(d.items[0].wrong_question_id);
                }
            });
        },
        clickNext: function (data, event) {
            if ($(event.target).hasClass('disabled')) {
                return;
            }
            location.href = window.selfUrl + '/' + projectCode + '/wrong_question/detail?wrong_question_id=' + this.model.next_id() + '&component=' + component + '&index=' + (index+1) + '&__return_url=' + encodeURIComponent(returnUrl);
        },
        clickPrevious: function (data, event) {
            if ($(event.target).hasClass('disabled')) {
                return;
            }
            location.href = window.selfUrl + '/' + projectCode + '/wrong_question/detail?wrong_question_id=' + this.model.previous_id() + '&component=' + component + '&index=' + (index-1) + '&__return_url=' + encodeURIComponent(returnUrl);
        },
        saveNote: function () {
            var t = this;
            var content = this.model.note.content(),
                id = this.model.note.id();
            if ($.trim(content) == "") {
                t.showTip('笔记内容不能为空');
                return;
            }

            if (id) {
                store.updateNote(id, content).done(function () {
                    t.showTip('保存成功');
                });
            } else {
                store.addNote(content).done(function () {
                    t.showTip('保存成功');
                });
            }
        },
        updateMarkKey: function () {
            var t = this;
            var is_mark_key = !this.model.userQuestionContentVo.wrong_question.mark_key();
            store.updateMarkKey(is_mark_key).done(function (data) {
                t.model.userQuestionContentVo.wrong_question.mark_key(data.mark_key);
            });
        },
        updateMaster: function () {
            var t = this;
            var is_mastered = !this.model.userQuestionContentVo.wrong_question.mastered();
            store.updateMaster(is_mastered).done(function (data) {
                t.model.userQuestionContentVo.wrong_question.mastered(data.mastered);
            });
        },
        getUserTags: function () {
            var t = this;
            store.getUserTags().done(function (data) {
                t.model.userTags = ko.mapping.fromJS(data, {}, t.model.userTags)
            })
        },
        showUserTagsModel: function () {
            this.getUserTags();
            this.model.isUserTagsModelShow(true);
        },
        selectUserTag: function (item) {
            var arr = [],
                item = ko.mapping.toJS(item),
                tags = ko.mapping.toJS(this.model.selectedUserTags)
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].user_tag_id != item.user_tag_id) {
                    arr.push(tags[i])
                }
            }
            !this.isSelected(item.user_tag_id) && arr.push(item)

            this.model.selectedUserTags = ko.mapping.fromJS(arr, {}, this.model.selectedUserTags)
        },
        isSelected: function (id) {
            var id = ko.mapping.toJS(id)
            var tags = ko.mapping.toJS(this.model.selectedUserTags)
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].user_tag_id == id) {
                    return true;
                }
            }
            return false;
        },
        addUserTag: function () {
            var t = this;
            var value = $.trim(this.model.userTagValue());
            if (value.length > 0) {
                store.addUserTag(value).done(function (data) {
                    t.model.userTags.push(ko.mapping.fromJS(data));
                    t.model.userTagValue('');
                }).fail(function (data) {
                    alert(JSON.parse(data.responseText).message)
                })
            } else {
                alert('不能为空！')
            }
        },
        editUserTag: function (item) {
            var t = this;
            t.model.editUserTag(ko.mapping.toJS(item))
        },
        isEdit: function (id) {
            var userTag = this.model.editUserTag()
            return userTag && (userTag.user_tag_id == id())
        },
        saveEdit: function (item) {
            var t = this;
            var value = item.tag_value();
            var id = item.user_tag_id();
            if (value.length > 0) {
                store.editUserTag(id, value).done(function (data) {
                    t.model.editUserTag({})
                }).fail(function (data) {
                    item.tag_value(t.model.editUserTag().tag_value)
                    alert(JSON.parse(data.responseText).message)
                    t.model.editUserTag({})
                })
            }
        },
        delUserTag: function (item) {
            var t = this;
            var id = item.user_tag_id();
            if (confirm("确定删除吗？")) {
                store.delUserTag(id).done(function () {
                    t.model.userTags.remove(item);
                    t.model.selectedUserTags.remove(item);
                }).fail(function (data) {
                    alert(JSON.parse(data.responseText).message)
                })
            }
        },
        closeReasonPop: function () {
            var tags = ko.mapping.toJS(this.model.questionTags)
            this.model.selectedUserTags(tags)
            this.model.isUserTagsModelShow(false);
        },
        updateQuesitonUserTags: function () {
            var t = this, ids = [],
                arr = ko.mapping.toJS(this.model.selectedUserTags());
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].user_tag_id) {
                    ids.push(arr[i].user_tag_id)
                }
            }
            store.updateQuestionUserTags(ids).done(function (data) {
                arr.length > 0 ?
                    t.getQuestionUserTags(arr) :
                    t.getQuestionUserTags(t.model.user_tags_noreason)

                t.model.isUserTagsModelShow(false)
            })
        },
        getQuestionUserTags: function (data) {
            var t = this;
            t.model.questionTags(data)
            var arr = []
            for (var i = 0; i < data.length; i++) {
                if (data[i].user_tag_id != 'f0000000-0000-0000-0000-000000000001') {
                    arr.push(data[i])
                }
            }
            t.model.selectedUserTags = ko.mapping.fromJS(arr, {}, t.model.selectedUserTags)
        },
        getSource: function (source) {
            return source.component == 'homework' ? ('作业 > ' + source.label) : source.label;
        },
        _getQuestionInfo: function () {
            var t = this;
            store.getQuestionInfo().done(function (data) {
                if (data && data.question_content.content) {
                    if (data.question_content.content.items != undefined) {
                        data.type = 'question';
                        data.identifier = data.question_content.content.identifier;
                    } else {
                        data.type = 'courseware';
                        data.identifier = data.question_content.id;
                        data.typeName = NDRTYPEMAP[data.question_content.type + ''] || i18nHelper.getKeyValue('questionbank.questionType.default');
                        var tablinkUrl = webFrontUrl + '/' + projectCode + '/exam/prepare/' + data.question_content.id;
                        var mac = Nova.getMacToB64(tablinkUrl);
                        data.tabLink = tablinkUrl + '?__mac=' + mac;
                    }
                } else {
                    data.type = 'other';
                }
                t.model.userQuestionContentVo = data;

                t.model = ko.mapping.fromJS(t.model);
                ko.applyBindings(t);

                //笔记数据绑定
                if (data.note) {
                    t.model.note.id(data.note.id);
                    t.model.note.content(data.note.content);
                }

                if (data.type == 'question') {
                    t._loadPlayer(data);
                }

                t.getQuestionUserTags(data.user_tags)
            });
        },
        _loadPlayer: function (data) {
            var self = this;
            data.qtiplayer = QtiPlayer.createPlayer({
                'swfHost': staticUrl + 'auxo/addins/flowplayer/v1.0.0/',
                'unifyTextEntry': true,
                'refPath': ref_path
            });
            self.model.qtiQuestion(data);
            $('.main').show();
            self.model.qtiQuestion().qtiplayer.on('error', function (ex) {
                self.showQtiError(self.model.qtiQuestion, ex)
            });
            self.model.qtiQuestion().qtiplayer.load(data.question_content.content, function () {
                var renderOption = {
                    'skin': 'elearning',
                    'showQuestionName': true,
                    'showLock': true,
                    'showHint': false,
                    'showSubSequence': true
                };

                data.qtiplayer.render('qti-' + data.identifier, renderOption, function () {
                    // self.showExtras(data);
                });
            });
        },
        showQtiError: function (item, error) {
            $('#qti-' + item.identifier).html('<div class="error-question"><strong style="color: #ff0000;font-size: 20px;margin-right: 20px;">' + i18nHelper.getKeyValue('questionbank.detail.qtiText1') + '</strong><a href="javascript:;" class="btn btn-danger" onclick="$(\'#qti-error-' + item.identifier + '\').toggleClass(\'hide\')">' + i18nHelper.getKeyValue('questionbank.detail.qitText2') + '</a><div class="error-question-body"><textarea class="hide" id="qti-error-' + item.identifier + '" style="width: 400px;height: 200px;">' + JSON.stringify(item.questionItem) + '</textarea></div></div>');
        },
        getAnalysis: function () {
            var result = i18nHelper.getKeyValue('questionbank.detail.noAnalysis');
            var question_content = this.model.qtiQuestion().question_content.content;
            if (question_content && question_content.feedbacks && question_content.feedbacks.length > 0) {
                var feedbacks = question_content.feedbacks;
                $.each(feedbacks, function (index, feedback) {
                    if (feedback.identifier == 'showAnswer') {
                        result = feedback.content.replace('${ref-path}', ref_path);
                    }
                })
            }
            return result;
        },
        getCorrectAnswer: function () {
            var result = i18nHelper.getKeyValue('questionbank.detail.noCorrectAnswer');
            var question_content = this.model.qtiQuestion().question_content.content;
            if (question_content && question_content.responses && question_content.responses.length > 0) {
                var responses = question_content.responses;
                switch (this.model.qtiQuestion().question_content.type + '') {
                    case '208'://套题
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
                    case '201'://单选
                    case '202'://多选
                    case '203'://判断题
                    case '206'://问答题
                    case '209'://填空题
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
        isInteractiveQuestion: function () {

            return false;
        },
        getUserAnswer: function () {
            var result = i18nHelper.getKeyValue('questionbank.detail.noUserAnswer');
            var user_question_answer = this.model.qtiQuestion().user_question_answer;
            if (user_question_answer && user_question_answer.subs && user_question_answer.subs.length > 0) {
                var subs = user_question_answer.subs;
                switch (this.model.qtiQuestion().question_content.type + '') {
                    case '208'://套题
                        var temp = '';
                        $.each(subs, function (index, sub) {
                            var answer = JSON.parse(sub.answer)
                            if (temp) {
                                temp = temp + ' ; ' + (index + 1);
                            } else {
                                temp = temp + (index + 1);
                            }
                            for (var key in answer) {
                                temp = temp + ' , ' + answer[key].value.join(" ");
                            }
                        });
                        result = temp;
                        break;
                    case '201'://单选
                    case '202'://多选
                    case '203'://判断题
                    case '206'://问答题
                    case '209'://填空题
                        var temp = '';
                        $.each(subs, function (index, sub) {
                            var answer = JSON.parse(sub.answer)
                            for (var key in answer) {
                                if (temp) {
                                    temp = temp + ' , ' + answer[key].value.join(",");
                                } else {
                                    temp = temp + answer[key].value.join(",");
                                }
                            }
                        });
                        result = temp;
                        break;
                }
            }
            return result;
        },
        showTip: function (message) {
            $('#js_tip').html(message);
            $('#js_tip').show();
            window.clearTimeout(timerId);
            timerId = window.setTimeout(function () {
                $('#js_tip').hide();
                $('#js_tip').html('');
            }, 1000);
        },
        formatTime: function (t) {
            if (!t)
                return '';

            return $.format.date(t, 'yyyy-MM-dd HH:mm');
        }
    };

    $(function () {
        $(document).on('click', '.see-d-answer a', function () {
            $(this).toggleClass('active');
            $('.answer-reason').toggleClass('show');
        });
        setInterval(function () {
            window.iframeResizePostMessage && iframeResizePostMessage('wrongquestion');
        }, 200);
        viewModel.init();
    })

})(jQuery, window);