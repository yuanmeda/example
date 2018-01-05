define(["require", "exports"], function (require, exports, player) {
    var store = {
        getchapter: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/catalogs';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        getPercent: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/progress';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        //获取用户课程解锁情况
        getUserUnlock: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/unlock_infos';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //获取用户章节解锁情况
        getUserChapterUnlock: function (resourceId) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/resources/' + resourceId + '/lock_status';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //获取课程可用优惠券
        getCoinCertificates: function (ids, limit_object_type) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/v1/users/limit_object_id/' + ids + '/coin_certificates';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                data: {
                    "limit_object_type": limit_object_type
                },
                cache: false
            });
        },
        //使用兑换券
        useCoin: function (couponId, data) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/v1/users/coin_certificates/' + couponId + '/use_status';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'JSON',
                contentType: 'application/json;charset=utf8'
            });
        }
    };
    var first = true;
    var viewModel = {
        model: {
            init: false,
            chapterList: [],
            chapterArray: [],
            resourceUuid: resourceUuid,
            resourceType: resourceType,
            location: null,
            resourceTitle: '',
            currentIndex: 0,
            currentChapterTitle: '',
            currentStatus: 0,
            currentSectionTitle: '',
            percent: '0%',
            lastIndex: -1, //用于判断上下切换的方向
            url: '',
            statusCode: statusCode,
            coin: {
                showCoinModal: false,
                coinItems: [],
                selectedCoinIndex: -1
            },
            exp_config: null,
            attachmentList: [],
            finishTip: {
                nextResourceTitle: "办公好手",
                countdown: 10
            }
        },
        init: function (video, doc, question, chapter, url, note) {
            $('body').css({
                'overflow-x': 'hidden'
            });
            this.video = video;
            this.document = doc;
            this.chapter = chapter;
            this.url = url;
            this.bindReportSucessEvent();
            this.model.question = ko.observable(question);
            this.model.note = ko.observable(note);
            this.model.video = ko.observable(video);
            this.model.doc = ko.observable(doc);
            //this.model.question = ko.mapping.fromJS(question);
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.model.currentChapterTitle.subscribe($.proxy(function (val) {
                currentChapterTitle = val;
            }, this));
            var hash = window.location.hash;
            if (hash == "#/" || hash == "") {
                first = false;
                this.autoClick();
            }
            this.getchapterlist();
            this.getChapterSectionId();

            $("#playerContainer").resize(this.resizeFinisheTip);
        },
        getChapterSectionId: function () {
            var chapterList = this.model.chapterList(), flag1 = false, flag2 = false, flag3 = false;
            if (chapterList.resource_list.length > 0) {
                $.each(chapterList.resource_list, function (index, item) {
                    if (item.resource_id == resourceUuid) {
                        flag1 = true;
                        chapterId = '';
                        sectionId = '';
                        return false;
                    }
                });
            }
            if (!flag1) {
                //章节
                if (chapterList.children.length > 0) {
                    $.each(chapterList.children, function (index1, item1) {
                        //章节中的资源列表
                        if (item1.resource_list.length > 0) {
                            $.each(item1.resource_list, function (index2, item2) {
                                if (item2.resource_id == resourceUuid) {
                                    flag2 = true;
                                    chapterId = item1.id;
                                    sectionId = '';
                                    return false;
                                }
                            });
                        }
                        //章节下的小节
                        if (!flag2) {
                            if (item1.children.length > 0) {
                                $.each(item1.children, function (index3, item3) {
                                    //小节中的资源列表
                                    if (item3.resource_list.length > 0) {
                                        $.each(item3.resource_list, function (index4, item4) {
                                            if (item4.resource_id == resourceUuid) {
                                                flag3 = true;
                                                chapterId = item1.id;
                                                sectionId = item3.id;
                                                return false;
                                            }
                                        });
                                    }
                                    //最底层的资源列表
                                    if (item3.children.length > 0) {
                                        $.each(item3.children, function (index5, item5) {
                                            if (item5.resource_id == resourceUuid) {
                                                chapterId = item1.id;
                                                sectionId = item3.id;
                                                return false;
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        },
        closeCoinModal: function () {
            this.model.coin.showCoinModal(false);
        },
        selectCoin: function ($index) {
            this.model.coin.selectedCoinIndex($index);
        },
        bindReportSucessEvent: function () {
            this.video.viewModel.success = $.proxy(this.success, this);
            this.document.viewModel.success = $.proxy(this.success, this);
            this.chapter.viewModel.success = $.proxy(this.success, this);
            this.url.viewModel.success = $.proxy(this.success, this);
        },
        success: function (data) {
            var ary = this.model.chapterArray(),
                t = this,
                index = this.model.currentIndex();
            switch (data.status) {
                case 1:
                    if (ary[index].status == 0) {
                        ary[index].status = 1;
                        $(".catalog-list.catalog-mlist div[resourceid='" + data.id + "']").addClass('half');
                    }
                    break;
                case 2:
                    if (ary[index].status != 2) {
                        ary[index].status = 2;
                        $(".catalog-list.catalog-mlist div[resourceid='" + data.id + "']").addClass('full');
                        // if (index < ary.length - 1) {
                        //     ary[index + 1].locked = false;
                        //     $(".catalog-list.catalog-mlist div[resourceid='" + ary[index + 1].resource_id + "']").removeClass('locked');
                        // }
                    }
                    break;
            }
            if (data.status == 2 && t.model.currentStatus() != 2) {
                store.getchapter().done(function (data) {
                    t.model.chapterList(data);
                    t.initChapterArray(data);
                    $("div[resourceid='" + t.model.resourceUuid() + "']").addClass('active');
                    t.model.currentStatus(2);
                })
            }
        },
        getLockedStatusByResourceId: function (rid) {
            var ary = this.model.chapterArray();
            for (var i = 0; i < ary.length; i++) {
                if (rid == ary[i].resource_id) {
                    return ary[i].locked;
                }
            }
        },
        autoClick: function () {
            var t = this;

            function x() {
                var el = $(".catalog-list.catalog-mlist div[resourceid='" + viewModel.model.resourceUuid() + "']");
                if (el.length > 0)
                    el.click();
                else
                    t.timerId = setTimeout(x, 200);
            }

            x();
        },
        quizContent: function () {
            var lh = $("#quizContent").val().length;
            $("#quizwordcount").html(lh);
            if (lh > 100) {
                $("#quizwordcount").addClass("overnum");
            } else {
                $("#quizwordcount").removeClass("overnum");
            }
        },
        checkvalid: function (rid) {
            if (viewModel.model.statusCode() != 20 || (viewModel.model.statusCode() == 20 && !userLogined)) return false;
            var _self = this;
            var nowId = _self.selectedSelectedChapter ? _self.selectedSelectedChapter.id : _self.selectedResource.resource_id;
            if (viewModel.getLockedStatusByResourceId(rid)) {
                store.getUserChapterUnlock(rid).done(function (lockData) {
                    if (lockData.locked) {
                        store.getCoinCertificates(customId + '_' + courseId + '_' + nowId, 'chapter').done(function (data) {
                            if (data.length > 0) {
                                _self.model.coin.selectedCoinIndex(-1);
                                _self.model.coin.coinItems(data);
                                $.fn.udialog.confirm(i18nHelper.getKeyValue('courseComponent.coin.unlockChapterTwoWays'), [{
                                    text: i18nHelper.getKeyValue('courseComponent.coin.useCoin'),
                                    click: function () {
                                        _self.model.coin.showCoinModal(true);
                                        $(this).udialog("hide");
                                    }
                                }, {
                                    text: i18nHelper.getKeyValue('courseComponent.coin.aware'),
                                    click: function () {
                                        $(this).udialog("hide");
                                    }
                                }], {
                                    width: 368,
                                    title: i18nHelper.getKeyValue('courseComponent.coin.hint')
                                });
                            } else {
                                $.fn.udialog.alert(i18nHelper.getKeyValue('courseComponent.coin.unlockChapterFirst'), {
                                    width: 368,
                                    icon: '',
                                    //closeTimes: 2000,
                                    title: i18nHelper.getKeyValue('courseComponent.coin.hint'),
                                    buttons: [{
                                        "class": "ui-btn-default",
                                        text: i18nHelper.getKeyValue('courseComponent.coin.aware'),
                                        click: function () {
                                            $(this).udialog("hide");
                                        }
                                    }]
                                });
                            }
                        });
                    } else {
                        window.location.href = (window.selfUrl || '') + "/" + projectCode + "/course/" + courseId + "/learn?resource_uuid=" + _self.selectedResource.uuid + "&resource_type=" + _self.selectedResource.resource_type + "#/"
                    }
                });
                return true;
            }
        },
        findChapter: function (resourceId) {
            var _self = this,
                catalog = ko.mapping.toJS(this.model.chapterList),
                result = null;
            $.each(catalog.resource_list, function (index, value) {
                if (value.resource_id == resourceId) {
                    result = catalog;
                    return false
                }
            });
            if (!result) {
                var chapterflag = false;
                $.each(catalog.children, function (index1, chapter) {
                    $.each(chapter.resource_list, function (index2, chapterResource) {
                        if (chapterResource.resource_id == resourceId) {
                            result = chapter;
                            chapterflag = true;
                            return false
                        }
                        if (chapter.children.length > 0) {
                            $.each(chapter.children, function (index3, chapterChildren) {
                                $.each(chapterChildren.resource_list, function (index4, chapterChildrenResource) {
                                    if (chapterChildrenResource.resource_id == resourceId) {
                                        result = chapter;
                                        chapterflag = true;
                                        return false
                                    }
                                });
                                if (chapterflag) return false;
                            });
                        }
                        if (chapterflag) return false;
                    });
                    if (chapterflag) return false;
                });
            }
            return result ? {
                id: result.id,
                title: result.title
            } : null;
        },
        prev: function () {
            var index = this.model.currentIndex(),
                ary = this.model.chapterArray();
            viewModel.selectedSelectedChapter = this.findChapter(ary[index - 1].resource_id);
            viewModel.selectedResource = ary[index - 1];
            if (viewModel.selectedResource.resource_type == 4 || viewModel.selectedResource.resource_type == 6) {
                viewModel.showBanVRdialog();
                return;
            }
            if (this.checkvalid(ary[index - 1].resource_id)) {
                return;
            }
            this.model.currentIndex(--index);
            this.updateCurrentResource();
            this.autoClick();
            //this.route();
        },
        next: function () {
            var index = this.model.currentIndex(),
                ary = this.model.chapterArray();
            viewModel.selectedSelectedChapter = this.findChapter(ary[index + 1].resource_id);
            viewModel.selectedResource = ary[index + 1];
            if (viewModel.selectedResource.resource_type == 4 || viewModel.selectedResource.resource_type == 6) {
                viewModel.showBanVRdialog();
                return;
            }
            if (this.checkvalid(ary[index + 1].resource_id)) {
                return;
            }
            this.model.currentIndex(++index);
            this.updateCurrentResource();
            this.autoClick();
            //this.route();

            this.hideFinishTip();
        },
        replay: function () {
            this._stop();
            viewModel.document.viewModel.countdownTimer && viewModel.document.viewModel.countdownTimer.close();
            this.startPlay();
            // $(".catalog-list.catalog-mlist div[resourceid='" + viewModel.model.resourceUuid() + "']").removeClass('active');
            // this.autoClick();
        },
        confirmUseCoin: function () {
            var coupon = this.model.coin.coinItems()[this.model.coin.selectedCoinIndex()],
                _self = this;
            if (this.model.coin.coinItems().length == 0 || this.model.coin.selectedCoinIndex() == -1) {
                return;
            }
            $.fn.udialog.confirm(i18nHelper.getKeyValue("courseComponent.coin.confirmUseCoin") + "<br>“" + coupon.coin_certificate_vo.name + "”？", [{
                text: i18nHelper.getKeyValue("courseComponent.coin.confirm"),
                click: function () {
                    store.useCoin(coupon.coin_certificate_vo.id, {
                        "use_object_type": 'chapter',
                        "use_object_id": customId + '_' + courseId + '_' + (_self.selectedSelectedChapter ? _self.selectedSelectedChapter.id : _self.selectedResource.resource_id),
                        "use_object_name": _self.selectedSelectedChapter ? _self.selectedSelectedChapter.title : _self.selectedResource.name
                    }).done(function () {
                        window.location.reload();
                    });
                    $(this).udialog("hide");
                }
            }, {
                text: i18nHelper.getKeyValue("courseComponent.coin.cancel"),
                click: function () {
                    $(this).udialog("hide");
                }
            }], {
                width: 368,
                title: i18nHelper.getKeyValue("courseComponent.coin.systemInfo")
            });
        },
        showBanVRdialog: function () {
            $.fn.udialog.alert(i18nHelper.getKeyValue('courseComponent.front.learn.resourceNotSupportYet'), {
                width: 368,
                icon: '',
                title: i18nHelper.getKeyValue('courseComponent.coin.hint'),
                buttons: [{
                    text: i18nHelper.getKeyValue('courseComponent.coin.aware'),
                    click: function () {
                        $(this).udialog("hide");
                    }
                }]
            });
        },
        clickresource: function (chapter, $data, evt) {
            this.hideFinishTip();

            if (viewModel.isAnimating || $(evt.currentTarget).hasClass('active')) {
                return;
            }
            viewModel.model.currentStatus($data.status);
            var data = ko.contextFor(evt.target);
            var cIndex = data.$parentContext.$index(),
                sIndex = data.$index();
            if (data.$data.resource_type == 4 || data.$data.resource_type == 6) {
                if (!viewModel.model.init()) {
                    viewModel.model.currentChapterTitle(cIndex != -1 ? (i18nHelper.getKeyValue('courseComponent.front.learn.catalog') + (cIndex + 1)) : i18nHelper.getKeyValue('courseComponent.front.learn.course'));
                    viewModel.model.currentSectionTitle(sIndex + 1);
                    viewModel.model.init(true);
                }
                viewModel.showBanVRdialog();
                return;
            }
            viewModel.selectedSelectedChapter = chapter;
            viewModel.selectedResource = $data;
            if (viewModel.checkvalid($data.resource_id)) {
                return;
            }
            //设计不好 解决正在播放的资源不可再次播放
            $(evt.currentTarget).addClass('active').siblings().removeClass('active');
            if (viewModel.isInRootChapterResourceList(data.$data.resource_id)) {
                cIndex = -1;
            }
            viewModel.model.init(true);
            viewModel.model.currentChapterTitle(cIndex != -1 ? (i18nHelper.getKeyValue('courseComponent.front.learn.catalog') + (cIndex + 1)) : i18nHelper.getKeyValue('courseComponent.front.learn.course'));
            viewModel.model.currentSectionTitle(sIndex + 1);
            viewModel.model.resourceType(data.$data.resource_type);
            viewModel.model.resourceUuid(data.$data.resource_id);
            viewModel.initCurrentIndex();
            viewModel.updateCurrentResource();
            viewModel.route();
            viewModel._stop();
            //viewModel.scroll();
            resourceUuid = viewModel.model.resourceUuid();
            viewModel.model.note().viewModel.model.createBuildNote.biz_param.resource_id(data.$data.resource_id);
            viewModel.model.note().viewModel.model.createBuildNote.biz_param.resource_type(data.$data.resource_type);
            if (viewModel.model.statusCode() == 20 && viewModel.model.lastIndex() != -1) {
                viewModel.getPercent();
                viewModel.animateStart();
            } else
                viewModel.animateCallback();
            viewModel.model.lastIndex(viewModel.model.currentIndex());
            this.getChapterSectionId();
        },
        animateStart: function () {
            viewModel.isAnimating = true;
            var box = $(".learning-box"),
                pro = $(".learning-pro"),
                location = box.height();
            if (viewModel.model.currentIndex() > viewModel.model.lastIndex())
                location = -location;
            var left = location;
            var right = -location;
            box.css({
                top: 0,
                bottom: 0
            });
            pro.stop(true, true);
            pro.css({
                top: right,
                bottom: left
            });
            box.animate({
                top: String(left),
                bottom: String(right)
            }, 1000, function () {
                $(this).css({
                    top: right,
                    bottom: left
                });
                setTimeout(function () {
                    box.animate({
                        top: '0',
                        bottom: '0'
                    }, 1000, function () {
                        viewModel.animateCallback();
                    });
                }, 1000)
            });
            pro.show();
            pro.animate({
                top: "0",
                bottom: "0"
            }, 1000, function () {
                $(this).css({
                    top: "0",
                    bottom: "0"
                });
                setTimeout(function () {
                    $('.learning-pro').animate({
                        top: String(left),
                        bottom: String(right)
                    }, 1000, function () {
                        $('.learning-pro').hide();
                    });
                }, 1000)
            });
        },
        animateCallback: function () {
            viewModel.isAnimating = false;
            viewModel.startPlay();
        },
        getPercent: function () {
            var t = this;
            store.getPercent().done(function (data) {
                if (data) {
                    t.model.percent(data.progress_percent + '%');
                } else {
                    t.model.percent('0%');
                }
            });
        },
        isInRootChapterResourceList: function (uuid) {
            var resources = this.model.chapterList().resource_list;
            for (var i = 0; i < resources.length; i++) {
                if (resources[i].resource_id == uuid)
                    return true;
            }
            return false;
        },
        //章节处理--开始
        getchapterlist: function () {
            var t = this,
                catalogs = JSON.parse(window.catalogInfoJson);
            t.initChapterArray(catalogs);
            t.model.chapterList(catalogs);
            t.initCurrentIndex();
            t.valid();
        },
        valid: function () {
            var ary = this.model.chapterArray(),
                uuid = this.model.resourceUuid(),
                isExist = false;
            for (var i = 0; i < ary.length; i++) {
                if (ary[i].resource_id == uuid) {
                    isExist = true
                    break;
                }
            }
            if (!isExist) {
                window.clearTimeout(this.timerId);
                Utils.alertTip('该资源不存在，请切换其它资源播放。');
            }
        },
        initChapterArray: function (data) {
            var ary = [];

            function x(resource) {
                if (resource.resource_list.length > 0)
                    ary = ary.concat(resource.resource_list);
                for (var i = 0; i < resource.children.length; i++) {
                    x(resource.children[i]);
                }
            }

            x(data);
            this.model.chapterArray(ary);
        },
        initCurrentIndex: function () {
            var ary = this.model.chapterArray(),
                uuid = this.model.resourceUuid(),
                type = this.model.resourceType();
            for (var i = 0; i < ary.length; i++) {
                if (ary[i].resource_id == uuid && ary[i].resource_type == type) {
                    this.model.currentIndex(i);
                    this.model.resourceTitle(ary[i].name);
                    resourceTitle = ary[i].name;
                    break;
                }
            }
        },
        route: function () {
            if (this.model.location()) {
                app.setLocation('#/' + this.model.resourceUuid() + '/' + this.model.resourceType() + '/' + this.model.location());
            } else {
                app.setLocation('#/' + this.model.resourceUuid() + '/' + this.model.resourceType());
            }
        },
        startPlay: function () {
            this.hideFinishTip();

            if (this.model.statusCode() != 20 && (this.model.exp_config() == null || this.model.exp_config().exp_type == 0)) {
                // 这里做不允许体验的操作
                $('#exp').show();
                $('#playerContainer').hide();
                return;
            } else {
                $('#exp').hide();
                $('#playerContainer').show();
            }
            if (this.model.statusCode() != 20 && this.model.exp_config() != null && this.model.exp_config().exp_type == 1)
                $('.buy-tip').show();
            else
                $('.buy-tip').hide();
            switch (this.model.resourceType()) {
                case '0':
                    $("#player").show().siblings("div").hide();
                    this.video.viewModel.video(this.model.resourceUuid(), this.model.exp_config(), this);
                    break;
                case '1':
                    $("#documentViewer").show().siblings("div").hide();
                    this.document.viewModel.doc(this.model.resourceUuid(), null, null, this.model.exp_config(), this);
                    break;
                case "2":
                    $("#chapter").show().siblings("div").hide();
                    this.chapter.viewModel.play(this.model.resourceUuid());
                    break;
                case "3":
                    $("#url").show().siblings("div").hide();
                    this.url.viewModel.open(this.model.resourceUuid(), $.proxy(this.urlcallback, this));
                    break;
                case '101':
                    $("#player").show().siblings("div").hide();
                    this.video.viewModel.video(this.model.resourceUuid(), this.model.exp_config(), this);
                    break;
                case '102':
                    $("#documentViewer").show().siblings("div").hide();
                    this.document.viewModel.doc(this.model.resourceUuid(), null, null, this.model.exp_config(), this);
                    break;
                case "103":
                    $("#chapter").show().siblings("div").hide();
                    this.chapter.viewModel.play(this.model.resourceUuid());
                    break;
            }
        },
        urlcallback: function (url) {
            this.model.url(url);
        },
        openUrl: function () {
            this.url.viewModel.reportProgress();
            window.open(this.model.url());
        },
        scroll: function () {
            function innerScroll() {
                var e = $(".catalog-list.catalog-mlist div[resourceid='" + viewModel.model.resourceUuid() + "']");
                if (e.length > 0) {
                    $(".catalog-box").scrollTop(e.offset().top);
                } else {
                    window.setTimeout(innerScroll, 200);
                }
            }

            innerScroll();
        },
        addIconClass: function (resource) {
            var iconclass = ["resource"];
            switch (resource.resource_type) {
                case '0':
                    iconclass.push("video");
                    break;
                case '1':
                    iconclass.push("doc");
                    break;
                case '2':
                    iconclass.push("test");
                    break;
                case '3':
                    iconclass.push('url');
                    break;
                case '4':
                    iconclass.push('vr');
                    break;
                case '6':
                    iconclass.push('vr');
                    break;
                case '101':
                    iconclass.push("video");
                    break;
                case '102':
                    iconclass.push("doc");
                    break;
                case '103':
                    iconclass.push("test");
                    break;
                case '104':
                    iconclass.push('url');
                    break;
                case '105':
                    iconclass.push('video');
                    break;
                default:
                    iconclass.push("doc");
                    break;
            }
            if (resource.locked) {
                if (this.model.statusCode() == 20) {
                    iconclass.push("locked");
                } else if (((resource.experience_config != null && resource.experience_config.experience_type == 0) || resource.experience_config == null)) {
                    iconclass.push("locked");
                } else {
                    switch (resource.status) {
                        case 1:
                            iconclass.push("half");
                            break;
                        case 2:
                            iconclass.push("full");
                            break;
                    }
                }
            } else {
                switch (resource.status) {
                    case 1:
                        iconclass.push("half");
                        break;
                    case 2:
                        iconclass.push("full");
                        break;
                }
            }
            return iconclass.join(' ');
        },
        showtooltip: function (title) {
            var length = typeof title == 'string' && title.replace(/[^x00-xFF]/g, '**').length;
            return length > 26;
        },
        _stop: function () {
            viewModel.document.viewModel.docfinish();
            viewModel.video.viewModel.finish();
            $("#chapter").empty();
        },
        panelanimate: function (obj, evt) {
            var txt = evt.currentTarget.innerText,
                target = $(evt.currentTarget).parent();
            if (txt) {
                txt = $.trim(txt);
            }
            var flag = target.siblings().hasClass('active');
            target.toggleClass('active').siblings().removeClass('active');
            switch (txt) {
                case '目录':
                    $("#catalog-box").show().siblings().hide();
                    break;
                case '答疑':
                    $("#quiz-box").show().siblings().hide();
                    //this.model.question().viewModel.model.isShow(true);
                    this.model.question().viewModel.getMyQuestion.call(this.model.question().viewModel);
                    break;
                case '附件':
                    $("#attachment-box").show().siblings().hide();
                    break;
                case '笔记':
                    $("#note-box").show().siblings().hide();
                    this.model.note().viewModel.getMyNotes.call(this.model.note().viewModel);
                    break;
            }
            if (!flag) {
                if (target.hasClass('active')) {
                    viewModel.hidePanel();
                } else {
                    viewModel.showPanel();
                }
            }
        },
        hidePanel: function () {
            $(".learning-side").animate({
                width: '365'
            }, 500).css("overflow", "visible");
            $(".learning-con").animate({
                right: '359'
            }, 500, function () {
                window.setTimeout(function () {
                    $(".learning-con").css("right", "360px");
                }, 200);
                viewModel.resizePlayer();
            });
        },
        showPanel: function () {
            $(".learning-side").animate({
                width: '0'
            }, 500).css("overflow", "visible");
            $(".learning-con").animate({
                right: '1'
            }, 500, function () {
                window.setTimeout(function () {
                    $(".learning-con").css("right", "0px");
                }, 200);
                viewModel.resizePlayer();
            });
        },
        resizeFinisheTip: function () {
            var pWidth = $("#playerContainer").width(),
                pHeight = $("#playerContainer").height();

            var tWidth = $(".finish-tip").width(),
                tHeight = $(".finish-tip").height();

            $(".finish-tip").css("left", (pWidth - tWidth) / 2 + "px");
            $(".finish-tip").css("top", (pHeight - tHeight) / 2 + "px");
        },
        resizePlayer: function () {
            switch (viewModel.model.resourceType()) {
                case '0':
                case '101':
                    viewModel.video.viewModel.resize();
                    break;
                case '1':
                case '102':
                    viewModel.document.viewModel.resize();
                    break;
            }
        },
        updateCurrentResource: function () {
            $('.buy-tip').hide();
            var index = this.model.currentIndex(),
                resource = this.model.chapterArray()[index];
            this.model.resourceUuid(resource.resource_id);
            resourceUuid = resource.resource_id;
            this.model.resourceType(resource.resource_type);
            this.model.resourceTitle(resource.name);
            resourceTitle = resource.name;
            this.model.exp_config(resource.experience_config);

            if (this.hasNext()) {
                var nextResource = this.model.chapterArray()[index + 1];
                this.model.finishTip.nextResourceTitle(nextResource.name);
            }
            //更新当前笔记
            //this.model.note().viewModel.getCurrentNote(resource.resource_id);
        },
        diff: function (a, b) {
            if (typeof Array.prototype.filter != "function") {
                Array.prototype.filter = function (fn, context) {
                    var arr = [];
                    if (typeof fn === "function") {
                        for (var k = 0, length = this.length; k < length; k++) {
                            fn.call(context, this[k], k, this) && arr.push(this[k]);
                        }
                    }
                    return arr;
                };
            }
            return a.filter(function (i) {
                return b.indexOf(i) < 0;
            });
        },
        showFinishTip: function () {
            this.resizeFinisheTip();
            $(".finish-tip").show();
            $("#finish-tip-modal").show();
            var resourceType = this.model.resourceType();
            if (resourceType != "1" && resourceType != "102") {
                if (this.hasNext())
                    this.startCountdown();
            } else if (!this.hasNext()) {
                this.startCountdown();
            }
        },
        hideFinishTip: function () {
            $(".finish-tip").hide();
            $("#finish-tip-modal").hide();
            this.clearCountdown();
        },
        clearCountdown: function () {
            clearTimeout(this.model.finishTip.countdownHandler);
            this.model.finishTip.countdown(10);
        },
        startCountdown: function () {
            this.model.finishTip.countdownHandler = setTimeout($.proxy(function () {
                var ccd = this.model.finishTip.countdown();
                if (ccd > 1) {
                    this.model.finishTip.countdown(ccd - 1);
                    this.startCountdown();
                } else {
                    this.hideFinishTip();
                    this.next();
                }
            }, this), 1000);
        },
        hasNext: function () {
            return (this.model.currentIndex() != this.model.chapterArray().length - 1) && (this.model.chapterArray().length != 1);
        }
    };
    var app;
    exports.init = function (video, document, question, chapter, url, note) {
        viewModel.init(video, document, question, chapter, url, note);
        app = $.sammy(function () {
            this.get("#/", function () {
            });
            this.get('#/:resourceId/:resourceType', function () {
                window.resourceType = this.params['resourceType'];
                $('#countdownArea').hide();
                viewModel.document.viewModel.countdownTimer && viewModel.document.viewModel.countdownTimer.close();
                if (first) {
                    first = false;
                    if (this.params['resourceType'] == 4 || this.params['resourceType'] == 6) {
                        viewModel.showBanVRdialog();
                        return;
                    }
                    viewModel.model.resourceUuid(this.params['resourceId']);
                    resourceUuid = this.params['resourceId'];
                    viewModel.model.resourceType(this.params['resourceType']);
                    viewModel.autoClick();
                }
            });
            /*笔记跳转路由*/
            this.get('#/:resourceId/:resourceType/:location', function () {
                window.resourceType = this.params['resourceType'];
                $('#countdownArea').hide();
                viewModel.document.viewModel.countdownTimer && viewModel.document.viewModel.countdownTimer.close();
                if (first) {
                    first = false;
                    if (this.params['resourceType'] == 4 || this.params['resourceType'] == 6) {
                        viewModel.showBanVRdialog();
                        return;
                    }
                    viewModel.model.resourceUuid(this.params['resourceId']);
                    resourceUuid = this.params['resourceId'];
                    viewModel.model.resourceType(this.params['resourceType']);
                    viewModel.model.location(+this.params['location']);
                    switch (viewModel.model.resourceType()) {
                        case '0':
                        case '101':
                            viewModel.model.video().viewModel.location = viewModel.model.location();
                            break;
                        case '1':
                        case '102':
                            viewModel.model.doc().viewModel.location = viewModel.model.location();
                            break;
                    }
                    viewModel.autoClick();
                }
            });
            this.after(function () {
                //this.redirect('#/');
            });
        });
        app.run("#/");
    };
});
