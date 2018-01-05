void function () {
    var viewModel = {
        url: ko.observable(barrierUrl + '/#/project-award-config?barrier_project_id=' + examId + '&__mac=' + Nova.getMacToB64(barrierUrl + '/#/project-award-config?barrier_project_id=' + examId))
    };
    ko.applyBindings(viewModel);
}(jQuery);