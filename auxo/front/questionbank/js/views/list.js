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
        search: function (filter) {
            var url = '/v1/user_questions/search';
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'post',
                data: JSON.stringify(filter) || null,
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
            items: [],
            filter: {
                user_id: user_id,
                user_question_tags: [],
                question_tags: [],
                sort_params: [],
                page_no: 0,
                page_size: 10
            },
            qtiItems: [],
            processStatus: i18nHelper.getKeyValue('questionbank.list.loading'),
            currentSimilarLink: ''
        },
        autonomic_url: autonomic_url,
        keyWrongQuestions: [],
        questionIds: [],
        _init: function () {
            if (user_question_tags) {
                var userQuestionTags = decodeURI(user_question_tags);
                this.model.filter.user_question_tags = this._splitToArray(userQuestionTags, 'tag');
            }
            if (question_tags) {
                var questionTags = decodeURI(question_tags);
                this.model.filter.question_tags = this._splitToArray(questionTags, 'tag');
            }
            if (sort_params) {
                var sortParams = decodeURI(sort_params);
                this.model.filter.sort_params = this._splitToArray(sortParams, 'sort');
            }
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this._searchList();
        },
        _splitToArray: function (originalString, type) {
            var result = [];
            if (originalString) {
                var originalStringArray = originalString.split(',');
                var originalStringArray = originalString.split(',');
                $.each(originalStringArray, function (index, originalStringMap) {
                    var originalStringMapArray = originalStringMap.split(':');
                    if (type == 'tag') {
                        result.push({
                            'type': originalStringMapArray[0],
                            'value': originalStringMapArray[1]
                        })
                    } else if (type == 'sort') {
                        result.push({
                            'sort_property': originalStringMapArray[0],
                            'sort_direction': originalStringMapArray[1]
                        })
                    }

                });
            }
            return result;
        },
        _searchList: function () {
            var self = this;
            self.model.qtiItems([]);
            self.model.processStatus(i18nHelper.getKeyValue('questionbank.list.loading'));
            var filter = ko.mapping.toJS(self.model.filter);
            self.questionIds = [];
            store.search(filter)
                .done(function (data) {
                    if (data && data.items && data.items.length > 0) {
                        self.model.processStatus('');
                        $.each(data.items, function (index, item) {
                            if (item.user_question_vo && item.user_question_vo.id) {
                                self.questionIds.push(item.user_question_vo.id);
                            }
                            if (item.question_content) {
                                if (item.question_content.items != undefined) {
                                    item.type = 'question';
                                    item.identifier = item.question_content.identifier;
                                } else {
                                    item.type = 'courseware';
                                    item.identifier = item.question_content.id;
                                    item.typeName = NDRTYPEMAP[item.question_content.res_type] || i18nHelper.getKeyValue('questionbank.questionType.default');
                                    item.tabLink = front_domain + '/' + projectCode + '/exam/icplayer/index?_lang_=zn_CN&inject=answerFlow&question_id=' + item.question_content.id;
                                }
                            }
                        })
                        var tagFilter = {
                            "user_question_ids": self.questionIds,
                            "tag_types": ["key_wrong_question"]
                        };
                        store.searchTags(tagFilter)
                            .done(function (status) {
                                self.keyWrongQuestions = (status || []);
                                $.each(data.items, function (index, item) {
                                    item.keyWrong = false;
                                    if (item.user_question_vo) {
                                        $.each(status, function (i, s) {
                                            if (s.user_question_id == item.user_question_vo.id) {
                                                item.keyWrong = true;
                                            }
                                        })
                                    }

                                });
                                self.model.items(data.items);
                                self.loadPlayer();
                                self.initPagination(data.total, filter.page_no, filter.page_size);
                            });
                    } else {
                        self.model.processStatus(i18nHelper.getKeyValue('questionbank.list.nodata'));
                    }
                })

        },
        initPagination: function (totalCount, currentPage, pageSize) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: pageSize,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                items_per: [10, 20, 30, 50],
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        self.model.filter.page_no(page_id);
                        self._searchList();
                    }
                },
                perCallback: $.proxy(function (size) {
                    this.model.filter.page_no(0);
                    this.model.filter.page_size(size);
                    this._searchList();
                }, this)
            });

        },
        loadPlayer: function () {
            var self = this;
            this.model.qtiItems(_.arrayMap(self.model.items(), function (item) {
                if (item.question_content) {
                    if (item.question_content.items != undefined) {
                        item.qtiplayer = QtiPlayer.createPlayer({
                            'swfHost': static_url + 'auxo/addins/flowplayer/v1.0.0/',
                            'unifyTextEntry': true,
                            'refPath': ref_path
                        });
                    }
                    return item;
                } else {
                    item.type = 'other';
                    return item;
                }

            }));
            _.arrayForEach(this.model.qtiItems(), function (item, index) {
                if (item.type == 'question') {
                    item.qtiplayer.on('error', function (ex) {
                        self.showQtiError(index, item, ex)
                    });
                    item.qtiplayer.load(item.question_content, function () {
                        var renderOption = {
                            'skin': 'elearning',
                            'showQuestionName': true,
                            'showNum': true,
                            'showLock': true,
                            'showHint': false,
                            'showSubSequence': true,
                            'sequenceNumber': index + 1
                        };
                        // if (item.user_question_vo && item.user_question_vo.wrong_times) {
                        //     renderOption.sequenceNumber = index+1 + ("答错"+item.user_question_vo.wrong_times+"题")
                        // }
                        // if (self.options.showUserAnswer && item.userAnswer) {
                        //     renderOption.showAnswer = true;
                        //     item.qtiplayer.setAnswer(item.userAnswer);
                        // }
                        item.qtiplayer.render('qti-' + item.question_content.identifier, renderOption, function () {
                            //maybe todo later
                        });
                    });
                }
            })
        },
        _searchTagsByQuestionIds: function () {
            var self = this;
            var filter = {
                "user_question_ids": self.questionIds,
                "tag_types": ["key_wrong_question"]
            }
            store.searchTags(filter)
                .done(function (data) {
                    self.keyWrongQuestions = (data || []);
                })
        },
        showQtiError: function (index, item, error) {
            $('#qti-' + item.identifier).html('<div class="error-question">' + (this.options.showSequence ? index + 1 + "、" : '') + '<strong style="color: #ff0000;font-size: 20px;margin-right: 20px;">QTIplayer报错，无法渲染此题</strong><a href="javascript:;" class="btn btn-danger" onclick="$(\'#qti-error-' + item.identifier + '\').toggleClass(\'hide\')">显示错题</a><div class="error-question-body"><textarea class="hide" id="qti-error-' + item.identifier + '" style="width: 400px;height: 200px;">' + JSON.stringify(item.questionItem) + '</textarea></div></div>');
        },
        showExtras: function ($data) {
            var extrasOption = {
                showHint: true,//显示提示
                showUserAnswer: this.options.showUserAnswer,//显示用户作答
                showCorrectAnswer: true,//显示正确答案
                showAnalyse: true//显示解析
            };
            $data.qtiplayer.showDefaultExtras(extrasOption);
        },
        goDetail: function (data) {
            if (data && data.user_question_vo && data.user_question_vo.id) {
                var paramsExtra = '&user_question_tags=' + encodeURIComponent(user_question_tags) + '&question_tags=' + encodeURIComponent(question_tags) + '&sort_params=' + encodeURIComponent(sort_params);
                location.href = '/' + projectCode + '/question_bank/detail?user_question_id=' + data.user_question_vo.id + '&user_id=' + user_id + paramsExtra;
            }
        },
        goSimilarExercise: function (data) {
            var autonomic_url = this.autonomic_url || '';
            if (!autonomic_url) {
                this._selfAlert('error', 'info');
                return;
            }
            if (!(data && data.question_vo && data.question_vo.source_id)) {
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
        goToLearn: function (item) {
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
        goSubmitQuestion: function(item){
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
        },
        closePopWin: function () {
            $(".pop-overlay").hide();
            $(".pop-win").hide();
        }
    };
    $(function () {
        viewModel._init();
    });

}(jQuery);
