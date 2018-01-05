;(function ($, window) {
    var viewModel = {
        model: {
            iframeUrl: ko.observable(''),
            resourceSource: ko.observable(window.resourceSource || 'new'),
            init: ko.observable(false),
        },
        init: function () {
            this.initMessage();
            this.formatIframeUrl();
            ko.applyBindings(this, document.getElementById('content'));
            this.model.init(!window.hasCreated);
        },
        switchTab: function (resourceSource) {
            this.model.resourceSource(resourceSource);
            this.formatIframeUrl();
        },
        hrefBack: function () {
            location.href = return_url;
        },
        initMessage: function () {
            var callbackList = {
                "RESOURCE_SAVE": $.proxy(function (data) {
                    this.saveSelect(data.items);
                }, this),
                "RESOURCE_CANCEL": $.proxy(function (data) {
                    this.goBack();
                }, this)
            };
            $(window).on('message', function (evt) {
                var rawData = void 0;
                try {
                    rawData = JSON.parse(evt.originalEvent.data)
                } catch (e) {
                }
                if (rawData) callbackList[rawData.action](rawData.data);
            });
        },
        saveSelect: function (items) {
            if (!items || !items.length) {
                location.href = return_url;
                return;
            }
            var ids = items.length ? '&id=' + ($.map(items, function (v) {
                return v.resource_id;
            }).join(',')) : '';
            location.href = return_url + ids;
        },
        goBack: function () {
            location.href = return_url;
        },
        formatIframeUrl: function () {
            if (this.model.resourceSource() == 'new') {
                var href = '';
                switch (window.unitType) {
                    case 'open-course':
                        href = window.opencourseUrl + '/' + projectCode + '/open_course/createforchannel';
                        break;
                    case 'auxo-train':
                        href = window.trainUrl + '/' + projectCode + '/train/createforchannel';
                        break;
                    case 'standard_exam':
                        href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=0';
                        break;
                    case 'custom_exam':
                        href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=1';
                        break;
                    case 'design_methodlogy_exam':
                        href = window.webpageUrl + '/' + projectCode + '/exam_center/offline_exam/createforchannel';
                        break;
                    case 'design_methodlogy_exercise':
                        href = window.webpageUrl + '/' + projectCode + '/exam_center/offline_exam/exercisecfc';
                        break;
                    case 'barrier':
                        href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=2';
                        break;
                    case 'competition':
                        href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=3';
                        break;
                    case 'e-certificate':
                        href = window.certificateUrl + '/' + projectCode + '/certificate/manage/formnew';
                        break;
                    case 'lecturer':
                        href = window.lecturerUrl + '/admin/lecturer/lecturer_manage.html?project_code=' + projectCode;
                        break;
                    case 'pk':
                        href = window.pkGatewayUrl + '/' + projectCode + '/admin/pk/setting';
                        break;
                    case 'plan':
                        href = window.specialtyGatewayUrl + '/' + projectCode + '/specialty_2/newplancreate';
                        break;
                    case 'periodic_exam':
                        href = window.periodicExamgateway + '/' + projectCode + '/admin/periodic_exam/setting';
                        break;
                    case 'website':
                        href = '/' + projectCode + '/website/edit';
                        break;
                    default:
                        href = '';
                }
                if (href) {
                    href += (~href.indexOf("?") ? "&" : "?") + "context_id=" + window.contextId + "&return_url=" + encodeURIComponent(location.href.replace(/#(?!.+)/, '') + '&action=create');
                    if (window.unitType !== 'website') {
                        href += '&__mac=' + Nova.getMacToB64(href);
                    }
                    this.model.iframeUrl(href);
                }
            } else if (this.model.resourceSource() == 'resource-pool') {
                this.model.iframeUrl('/' + projectCode + '/resource/manage?mode=select&unit_type=' + window.unitType);
            }
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);