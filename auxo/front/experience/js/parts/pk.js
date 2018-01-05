/**
 * Created by Administrator on 2016.12.2.
 */


(function () {

    var store = {
        /**
         * 获取用户PK信息
         * @param data
         * @returns {*}
         */
        getPkinfomation: function (data) {
            return $.ajax({
                url: selfUrl + '/' + projectCode + '/experience/user/study/pk',
                type: 'GET',
                data: data
            });
        }
    };

    var ViewModel = function () {

        this.model = {

            minePk: {
                "user_id": 0,
                "user_name": "",
                "user_code": "",
                "user_photo_url": "",
                "study_duration": 0,
                "course_completed_count": 0,
                "certificate_get_count": 0
            },
            othersPk: {
                "user_id": 0,
                "user_name": "",
                "user_code": "",
                "user_photo_url": "",
                "study_duration": 0,
                "course_completed_count": 0,
                "certificate_get_count": 0
            },
            pkResultList: {
                "loseAlmost": i18nHelper.getKeyValue('experience.pk.winAlmost'),
                "loseLittle": i18nHelper.getKeyValue('experience.pk.winLittle'),
                "tie": i18nHelper.getKeyValue('experience.pk.equal'),
                "winLittle": i18nHelper.getKeyValue('experience.pk.loseLittle'),
                "winAlmost": i18nHelper.getKeyValue('experience.pk.loseAlmost')
            },
            resultNumber: {
                "threeWin": 0,
                "twoWin": 0.33,
                "equal": 0.5,
                "oneWin": 0.67,
                "zeroWin": 1
            },
            lastResult: 0,
            resultIco: '',
            resultWords: '',
            //胜利的光环
            targetWin: false,
            mineWin: false,
            //各项进度条
            studyBar: {
                'red': 100,
                'blue': 100
            },
            courseBar: {
                'red': 100,
                'blue': 100
            },
            certificateBar: {
                'red': 100,
                'blue': 100
            },
            hasInited: false
        };
    };

    ViewModel.prototype = {
        constructor: ViewModel,

        initViewModel: function (element) {
            var that = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, element);
            this.initData();
        },
        /**
         * 初始化数据
         */
        initData: function () {
            var that = this;
            store.getPkinfomation({user_id: parseInt(visitorUserId)}).then(function (data) {
                ko.mapping.fromJS(data.mine, {}, that.model.minePk);
                ko.mapping.fromJS(data.target, {}, that.model.othersPk);
                that.visitorPk();
                that.model.hasInited(true);
                send_resize();
            });
        },
        /**
         * 来访PK
         */
        visitorPk: function () {
            var that = this,
                result = 0;

            //学习时间比较
            if (that.model.othersPk.study_duration() > that.model.minePk.study_duration()) {
                result++;
            } else if (that.model.othersPk.study_duration() < that.model.minePk.study_duration()) {
                result--;
            }
            that.model.studyBar.red(100 - 100 * that.model.minePk.study_duration() / (that.model.minePk.study_duration() + that.model.othersPk.study_duration()));
            that.model.studyBar.blue(100 - 100 * that.model.othersPk.study_duration() / (that.model.minePk.study_duration() + that.model.othersPk.study_duration()));

            //完成课程比较
            if (that.model.othersPk.course_completed_count() > that.model.minePk.course_completed_count()) {
                result++;
            } else if (that.model.othersPk.course_completed_count() < that.model.minePk.course_completed_count()) {
                result--;
            }
            that.model.courseBar.red(100 - 100 * that.model.minePk.course_completed_count() / (that.model.minePk.course_completed_count() + that.model.othersPk.course_completed_count()));
            that.model.courseBar.blue(100 - 100 * that.model.othersPk.course_completed_count() / (that.model.minePk.course_completed_count() + that.model.othersPk.course_completed_count()));

            //获取认证比较
            if (that.model.othersPk.certificate_get_count() > that.model.minePk.certificate_get_count()) {
                result++;
            } else if (that.model.othersPk.certificate_get_count() < that.model.minePk.certificate_get_count()) {
                result--;
            }
            that.model.certificateBar.red(100 - 100 * that.model.minePk.certificate_get_count() / (that.model.othersPk.certificate_get_count() + that.model.minePk.certificate_get_count()));
            that.model.certificateBar.blue(100 - 100 * that.model.othersPk.certificate_get_count() / (that.model.othersPk.certificate_get_count() + that.model.minePk.certificate_get_count()));

            switch (result) {
                case 0:
                    //3平，1胜1负1平
                    that.model.resultIco('ico-pk-tie');
                    that.model.resultWords(that.model.pkResultList.tie());
                    that.model.lastResult(that.model.resultNumber.equal());
                    break;
                case 1:
                    that.model.resultIco('ico-pk-fail');
                    that.model.resultWords(that.model.pkResultList.winLittle());
                    that.model.targetWin(true);
                    //1胜2平，2胜1负
                    var num = 0;
                    if (that.model.othersPk.study_duration() > that.model.minePk.study_duration()) {
                        num++;
                    }
                    if (that.model.othersPk.course_completed_count() > that.model.minePk.course_completed_count()) {
                        num++;
                    }
                    if (that.model.othersPk.certificate_get_count() > that.model.minePk.certificate_get_count()) {
                        num++;
                    }
                    if (num === 1) {
                        that.model.lastResult(that.model.resultNumber.threeWin());
                    } else {
                        that.model.lastResult(that.model.resultNumber.twoWin());
                    }
                    break;
                case 2:
                    //2胜1平
                    that.model.resultIco('ico-pk-fail');
                    that.model.resultWords(that.model.pkResultList.winLittle());
                    that.model.targetWin(true);
                    that.model.lastResult(that.model.resultNumber.threeWin());
                    break;
                case 3:
                    //3胜
                    that.model.resultIco('ico-pk-fail');
                    that.model.resultWords(that.model.pkResultList.winAlmost());
                    that.model.targetWin(true);
                    that.model.lastResult(that.model.resultNumber.threeWin());
                    break;
                case -1:
                    that.model.resultIco('ico-pk-win');
                    that.model.resultWords(that.model.pkResultList.loseLittle());
                    that.model.mineWin(true);
                    //2负1胜，1负2平
                    var num1 = 0;
                    if (that.model.othersPk.study_duration() < that.model.minePk.study_duration()) {
                        num1++;
                    }
                    if (that.model.othersPk.course_completed_count() < that.model.minePk.course_completed_count()) {
                        num1++;
                    }
                    if (that.model.othersPk.certificate_get_count() < that.model.minePk.certificate_get_count()) {
                        num1++;
                    }
                    if (num1 === 1) {
                        that.model.lastResult(that.model.resultNumber.zeroWin());
                    } else {
                        that.model.lastResult(that.model.resultNumber.oneWin());
                    }
                    break;
                case -2:
                    //2负1平
                    that.model.resultIco('ico-pk-win');
                    that.model.resultWords(that.model.pkResultList.loseLittle());
                    that.model.mineWin(true);
                    that.model.lastResult(that.model.resultNumber.zeroWin());
                    break;
                case -3:
                    //3负
                    that.model.resultIco('ico-pk-win');
                    that.model.resultWords(that.model.pkResultList.loseAlmost());
                    that.model.mineWin(true);
                    that.model.lastResult(that.model.resultNumber.zeroWin());
                    break;
            }


            // PK圆环
            // 全胜/全负，保留0.1的环显示
            new Ring($('#pk'), {
                data: Math.min(0.9, Math.max(1 - that.model.lastResult(), 0.1)),
                arcWidth: 15,
                leftColor: 'RGB(255, 92, 96)',
                rightColor: 'RGB(70, 181, 253)'
            }).drawPk();

            that.processBar();
            that.lazyImg('#pk-index img.lazy-image');


        },
        /**
         * 显示各项进度条
         */
        processBar: function () {
            setTimeout(function () {
                // 向左的进度条
                $('.prog.left').each(function () {
                    var $ins = $(this).find('ins:first'),
                        value = $ins.attr('data-value');
                    $ins.empty().show().css('left', value + '%');
                });

                // 向右的进度条
                $('.prog.right').each(function () {
                    var $ins = $(this).find('ins:first'),
                        value = $ins.attr('data-value');
                    $ins.empty().show().css('right', value + '%');
                });
            }, 0);
        },
        lazyImg: function (selector) {
            setTimeout(function () {
                $(selector || 'img.lazy-image').lazyload({
                    data_attribute: 'src',
                    skip_invisible: false
                }).trigger("appear");
            }, 0);
        }
    };
    $(function () {
        new ViewModel().initViewModel(document.getElementById('pk-index'));
    });

  function send_resize(){
    window.parent.postMessage(JSON.stringify({
      "type": '$resize',
      data:{
        "width": window.innerWidth+'px',
        "height": document.documentElement.scrollHeight+'px'
      }
    }), '*');
  }
}());