;(function () {
    var _ = ko.utils, store = ['period', 'classes', 'subject', 'edition'];
    var ViewModel = function (params, componentInfo) {
        this.period = {
            inital: ko.observable(false),
            value: params.period,
            options: ko.observableArray(params.tutorialData)
        };
        this.classes = {
            inital: ko.observable(true),
            value: params.classes,
            options: ko.observableArray([])
        };
        this.subject = {
            inital: ko.observable(true),
            value: params.subject,
            options: ko.observableArray([])
        };
        this.edition = {
            inital: ko.observable(true),
            value: params.edition,
            options: ko.observableArray([])
        };

        this.period.value.subscribe(function subPeriod(nv) {
            if(nv){
                this.classes.inital(false);
                var array = _.arrayFilter(params.tutorialData, function (value) {
                    return value.identifier == (nv && nv.identifier);
                });
                this.classes.options([]);
                this.classes.value('');
                if (array.length && array[0].items.length && array[0].items[0].level < 5) {
                    this[store[array[0].items[0].level - 1]].options(array[0].items);
                }
            }else{
                this.classes.inital(true);
                this.classes.options([]);
                this.classes.value('');

                this.subject.inital(true);
                this.subject.value('');
                this.subject.options([]);

                this.edition.inital(true);
                this.edition.value('');
                this.edition.options([]);
            }

        }, this);
        this.classes.value.subscribe(function subClasses(nv) {
            if(nv){
                this.subject.inital(false);
                var options = ko.unwrap(this.classes.options),
                    subjects = _.arrayFilter(options, function (obj) {
                        return obj.identifier == (nv && nv.identifier);
                    });
                this.subject.options([]);
                if (subjects.length && subjects[0].items.length && subjects[0].items[0].level < 5) {
                    this[store[subjects[0].items[0].level - 1]].options(subjects[0].items);
                }
            }else{
                this.subject.inital(true);
                this.subject.value('');
                this.subject.options([]);

                this.edition.inital(true);
                this.edition.value('');
                this.edition.options([]);
            }

        }, this);
        this.subject.value.subscribe(function subSubject(nv) {
            if(nv){
                this.edition.inital(false);
                var options = ko.unwrap(this.subject.options),
                    edition = _.arrayFilter(options, function (obj) {
                        return obj.identifier == (nv && nv.identifier);
                    });
                this.edition.options([]);
                if (edition.length && edition[0].items.length && edition[0].items[0].level < 5) {
                    this[store[edition[0].items[0].level - 1]].options(edition[0].items);
                }
            }else{
                this.edition.inital(true);
                this.edition.value('');
                this.edition.options([]);
            }

        }, this);

        this.period.value.valueHasMutated();
        this.classes.value.valueHasMutated();
        this.subject.value.valueHasMutated();
    };
    var template = function () {
        return '<label>学段：<select class="input-medium" data-bind="value:period.value, options:period.options, optionsText: function(item){return item.target.title}, optionsValue:$data, optionsCaption: \'全部\'"></select></label>\
                <label data-bind="visible: classes.options().length||classes.inital()">年级：<select class="input-small" data-bind="value:classes.value, options:classes.options, optionsText: function(item){return item.target.title}, optionsValue:$data, optionsCaption: \'全部\'"></select></label>\
                <label data-bind="visible: subject.options().length||subject.inital()">学科：<select class="input-medium" data-bind="value:subject.value, options:subject.options, optionsText: function(item){return item.target.title}, optionsValue:$data, optionsCaption: \'全部\'"></select></label>\
                <label data-bind="visible: edition.options().length||edition.inital()">版本：<select class="input-medium" data-bind="value:edition.value, options:edition.options, optionsText: function(item){return item.target.title}, optionsValue:$data, optionsCaption: \'全部\'"></select></label>';
    };
    ko.components.register('tutorial-widget', {
        viewModel: ViewModel,
        template: template(),
        synchronous: true
    });
}());
