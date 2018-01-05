;
(function () {

    var GLOBAL = (0, eval)('this');

    var PROJECT_CODE = GLOBAL['projectCode'];

    var CERTIFICATE_ID = GLOBAL['certificateId'];

    var service = {
        /**
         * 查询证书
         * @param certificateId
         * @returns {*}
         */
        getUserCertificate: function (certificateId) {
            return $.ajax({
                url: selfUrl + '/' + PROJECT_CODE + '/certificates/' + certificateId,
                type: 'GET',
                dataType: 'json',
                cache: false
            });
        },
        /**
         * 查询物流信息
         */
        getMaterialInfo: function (no) {
            return $.ajax({
                url: selfUrl + '/' + PROJECT_CODE + '/certificates/materialInfo',
                type: 'GET',
                data: {
                    no: no
                },
                dataType: 'json',
                cache: false
            })
        },
        /**
         * 确认收到证书
         * @param certificateId
         * @returns {*}
         */
        receiveCertificate: function (certificateId) {
            return $.ajax({
                url: selfUrl + '/' + PROJECT_CODE + '/certificates/user_certificates/' + certificateId,
                type: 'PUT'
            });
        }
    };

    var ViewModel = function () {

        this.model = {
            certificate: {
                // 证书标识
                id: '',
                // 证书名称
                name: '',
                // 证书简介
                introduction: '',
                // 是否实体证书
                is_entity: '',
                // 项目标识
                project_id: '',
                // 自定义类型
                custom_type: '',
                // 评价总数
                appraise_total: '',
                // 是否需要上传图片,0：代表不需要，1：代表需要
                need_upload_photo: '',
                // 证书默认图片
                photo_url: '',
                // 证书内容
                html: '',
                // 证书状态（未获取且可申请证书：0，未获取且不可申请证书：1，申请中：2，申请成功：3，申请失败：4，已获取：5）
                status: '',
                // 驳回原因
                rejected_reason: '',
                // 生成时间
                generate_time: '',
                // 快递单号
                express_number: '',
                // 快递名称
                express_name: '',
                // 申请证书条件
                apply_condition_list: [],
                // 评价信息
                appraise_vos: []
            },
            // 评价，互动组件参数
            appraiseInfo: {
                target_id: CERTIFICATE_ID,
                custom_id: CERTIFICATE_ID,
                custom_type: customType,
                study_process: '1'
            },
            goodsInfo: {
                traces: []
            },
            hasInited: false
        };
    };

    ViewModel.prototype = {
        constructor: ViewModel,

        fmt: {
            /**
             * 日期格式化
             * @param date
             * @param fmt
             * @returns {*}
             */
            dateFormat: function (date, fmt) {
                var o = {
                    "M+": date.getMonth() + 1, //月份
                    "d+": date.getDate(), //日
                    "h+": date.getHours(), //小时
                    "m+": date.getMinutes(), //分
                    "s+": date.getSeconds(), //秒
                    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                    "S": date.getMilliseconds() //毫秒
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            },
            /**
             * 格式化日期
             * @param date java时间戳/.net时间戳/mysql字符串/字符串
             * @param fmt 格式化格式，默认: yyyy-MM-dd hh:mm:ss
             * @returns {*}
             */
            date: function (date, fmt) {
                fmt = fmt || "yyyy-MM-dd hh:mm:ss";
                date = ko.unwrap(date);
                if (!date) {
                    return date;
                }
                // java格式的timestamp
                if (/^\d+$/.test(date)) {
                    date = new Date(+date);
                    return !date ? "##" : this.dateFormat(date, fmt);
                }
                // java格式object
                else if (typeof date === "object" && date.time) {
                    date = new Date(+date.time);
                    return !date ? "##" : this.dateFormat(date, fmt);
                }
                // .net格式的timestamp
                else if ((/date/i).test(date)) {
                    date = new Date(+date.match(/\d+/)[0]);
                    return !date ? "##" : this.dateFormat(date, fmt);
                }
                // mysql字符串格式转化
                else if ($.type(date) === "string" && /\.\d$/.test(date)) {
                    date = new Date(date.replace(/\.\d$/, "").replace(/-/g, "/"));
                    return !date ? "##" : this.dateFormat(date, fmt);
                }
                // UNIT格式时间字符串
                else if ($.type(date) === "string" && /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}\..+$/.test(date)) {
                    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\..+$/.exec(date);
                    if (m && m.length > 0) {
                        date = new Date(+m[1], (m[2] - 1) || 0, +m[3] || 0, +m[4] || 0, +m[5] || 0, +m[6] || 0);
                        return this.dateFormat(date, fmt);
                    }
                }
                return date;
            }
        },

        initViewModel: function (element) {
            this.model = ko.mapping.fromJS(this.model);
            this.getCertificate();
            ko.applyBindings(this, element);
        },

        getCertificate: function () {
            var that = this,
                certificate = this.model.certificate;
            service.getUserCertificate(CERTIFICATE_ID).then(function (data) {
                if (data.introduction)
                    data.introduction = data.introduction.replace(/(?:\r\n|\r|\n)/g, '<br />');

                $.each(data, function (k, v) {
                    if (v != null && certificate[k]) {
                        certificate[k](v);
                    }
                });
                that.model.hasInited(true);
                $('img[data-src]').lazyload({
                    data_attribute: 'src',
                    skip_invisible: false
                }).trigger("appear");
            });
        },
        showTraceDialog: function () {
            var that = this;
            service.getMaterialInfo(this.model.certificate.express_number()).then(function (data) {
                if (data && data.length) {
                    that.model.goodsInfo.traces(data[0].traces.reverse());
                }
                $('#traceDialog').show();
            });
        },
        receiveCertificate: function () {
            var that = this;
            service.receiveCertificate(CERTIFICATE_ID).then(function () {
                that.getCertificate();
            });
        },
        formatType: function (type) {
            switch (type) {
                case 'open-course':
                    return i18nHelper.getKeyValue('certificate.detail.opencourse');
                case 'plan':
                    return i18nHelper.getKeyValue('certificate.detail.plan');
                case 'auxo-train':
                    return i18nHelper.getKeyValue('certificate.detail.train');
                default:
                    return '';
            }
        }
    };

    $(function () {
        (function () {
            var loading = null;
            // ajax开始回调
            $(document).ajaxStart(function () {
                loading = layer.load(0, {
                    time: 1000 * 100
                });
            });
            // ajax结束回调
            $(document).ajaxComplete(function () {
                layer.close(loading);
            });
        }());
        new ViewModel().initViewModel($('#bootstrap')[0]);
    });

}());

