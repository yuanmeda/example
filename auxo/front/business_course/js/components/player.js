;(function ($, window) {
    var store = {
        getCatalogs: function () {
            return $.ajax({
                url: (window.selfUrl || '') + +'/' + projectCode + '/courses/' + courseId + '/catalogs',
                dataType: 'json',
                cache: false
            });
        },
        getResources: function (lessonId) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/resources',
                dataType: 'json',
                cache: false
            });
        }
    };

    function ViewModel(params) {
        this.model = {
            chapterList: [],
            cata_type: 0
        }
    }

    ko.registerComponent('x-course-learn-player', {
        viewModel: ViewModel,
        template: tpl
    })
})(jQuery, window);
