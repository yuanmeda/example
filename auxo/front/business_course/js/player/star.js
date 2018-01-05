; (function (window, $) {

    window.Star = function (options) {
        this.options = $.extend({}, Star.defaults, options);
        this.value = this.options.value;
        this.init();
        this._setScore();
    };
    Star.prototype = {
        init: function () {
            this._display();
            this._event();
        },
        _display: function () {
            var _self = this,
                _options = _self.options,
                _temp = [],
                _fragment = _options.target,
                _after=[];
            if (!_fragment.length) {
                throw new Error(i18n.common.addins.star.noSpecialElement);
            }
            if (!_fragment.hasClass(_options.className)) {
                _fragment.addClass(_options.className).data('uid', _options.uid);
            }
            if (_options.hasHover) {
                _fragment.addClass('star-hover');
            }
            for (var i = 0; i < _options.starNumber; i++) {
                _temp.push('<i class="' + _options.starClass +'"></i>');
            }
            _fragment.html(_temp.join(''));
            _options.hasScore && _after.push('<span class="star-score ' + _options.scoreClass + '"></span>');
            _options.hasLabel && _after.push('<span class="star-label ' + _options.labelClass + '"></span>');
            _fragment.next('.star-score').remove();
            _fragment.next('.star-lebal').remove();
            _fragment.after(_after.join(''));
        },
        _event: function () {
            var _self = this,
                _options = _self.options,
                _target = _options.target,
                _child = _target.children();
            _options.hasHover && _child.hover(function () {
                var _this = $(this);
                _self._setScore(_self.options.starNumber-_this.index());
            }, function () {
                _self._setScore(_self.value);
            });
            _options.onclick && _child.on('click', function () {
                var _this = $(this),
                    _index = _this.index(),
                    _value = _self.options.starNumber - _index;
                _self.value = _value;
                _self._setScore(_value);
            })
        },
        _setScore: function (_s) {
            var _self = this,
                _options = _self.options,
                _target = _options.target;
            $.each(_target, function (i, e) {
                var _this = $(e),
                    _dataScore = _this.data('score'),
                    _score = _this.next(),
                    _label = _score.next(),
                    _temp,
                    _stars = _this.children();
                _temp = _s || _dataScore;
                _options.hasScore && _score.text(_temp > 0 ? _temp : '');
                _options.hasLabel && _label.text(_self.options.labels[Math.floor(_temp)]);
                _stars.removeClass(_options.selectedClassName);
                _stars.eq(_options.starNumber - Math.floor(_temp)).addClass(_options.selectedClassName);
            })
        },
        _getScore: function () {
            return this.value;
        },
        _setOptions: function (option) {
            this.options = $.extend({}, this.options, option || {});
        }
    };
    Star.defaults = {
        uid: 'range-star',
        starNumber: 5,
        className: 'star-box',
        target: $('.star-box'),
        starClass: 'icon-star1',
        labelClass: 'blue',
        scoreClass:'blue',
        hasScore: false,
        hasLabel:false,
        scorePer: 1,
        hasHover: false,
        onclick: null,
        selectedClassName: 'on',
        value: 0,
        labels: ['', i18n.common.addins.star.low, i18n.common.addins.star.normal, i18n.common.addins.star.better, i18n.common.addins.star.good, i18n.common.addins.star.perfect]
    };
})(window, jQuery)