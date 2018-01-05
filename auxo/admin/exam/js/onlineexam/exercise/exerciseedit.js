void function () {
    var store = {
        get: function () {
            var url = '/' + projectCode + '/v1/exams/' + exerciseId;
            return $.ajax({
                url: url,
                type: 'get',
                cache: false,
                contentType: 'application/json;charset=utf8'
            });
        },
        create: function (data) {
            var url = '/' + projectCode + '/v1/exercises';
            return $.ajax({
                url: url,
                type: 'post',
                cache: false,
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8'
            });
        },
        update: function (data) {
            var url = '/' + projectCode + '/v1/exercises/' + exerciseId;
            return $.ajax({
                url: url,
                type: 'put',
                cache: false,
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8'
            });
        }
    };
    var viewModel = {
        model: {
            exercise: {
                id: exerciseId || null,
                title: "",
                duration: 60,
                description: ""
            }
        },
        init: function () {
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(viewModel);
            if (exerciseId) {
                var self = this;
                store.get()
                    .done(function (data) {
                        if (data && data.duration) {
                            data.duration = data.duration / 60;
                        } else {
                            data.duration = 0;
                        }
                        ko.mapping.fromJS(data, {}, self.model.exercise);
                    });
            }
        },
        clearEndTime: function () {
            $('#endTime').val('').datetimepicker('reset');
        },
        //保存或则修改课程信息
        doSave: function (callback) {
            if (!$("form").valid()) {
                return;
            }
            var data = ko.mapping.toJS(viewModel.model.exercise);

            data.duration = data.duration? data.duration * 60 : null;

            if (exerciseId) {
                store.update(data)
                    .done(function (data) {
                        callback();
                        return;
                    })
            } else {
                delete data.id;
                store.create(data)
                    .done(function (data) {
                        viewModel.model.exercise.id(data.id);
                        exerciseId = data.id;
                        callback();
                        return;
                    })
            }
        },
        cancel: function () {
            location.href = '/' + projectCode + "/exam/exercise";
        },
        save: function () {
            this.doSave(this.cancel);
        },
        toNext: function () {
            location.href = '/' + projectCode + "/exam/paper?exam_id=" + exerciseId + "&sub_type=0&is_exercise=true";
        },
        saveThenNext: function () {
            this.doSave(this.toNext);
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);