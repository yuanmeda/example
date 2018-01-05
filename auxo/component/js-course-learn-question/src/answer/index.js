import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;
function ViewModel(params) {
    this.model = {
        question: null,
        answer: null,
        filter: {
            page_no: 0,
            page_size: 5
        },
        answers: {
            items: [],
            total: 0
        },
        state: {
            showAnswerArea: false,
            showAcceptIcon: params.options.showAcceptIcon !== false,
            showAcceptBtn: params.options.showAcceptBtn !== false,
        },
        content: '',
        shouldShowAnswerDialog: false,
        replayContent: '',
        replays: []
    };
    this.parent = params.parent;
    this.model = ko.mapping.fromJS(this.model);
    this.model.question(params.question);
    this.model.answer(params.answer);
    this.display_user = params.answer.display_user;
    this.options = params.options;
    this.userId = params.userId;
    this.actions = this.options.actions || {
            'accept': void 0,
            'delete': void 0,
        };
    this.urls = this.options.urls || {
            'api': '',
            'gateway': ''
        };
    this.store = {
        acceptAnswer: (id, isAccepted) => {
            return $.ajax({
                url: this.urls.api + '/v1/answers/' + id + '/actions/accept/' + isAccepted,
                dataType: "json",
                type: 'PUT'
            })
        },
        toggleLikeAnswer: (id, isLike) =>{
            return $.ajax({
                url: this.urls.gateway + '/v1/answers/' + id + '/like',
                dataType: "json",
                type: isLike ? "POST": "DELETE"  
            }) 
        },
        addReplay: (data) => {
		return $.ajax({
			url: this.urls.gateway + '/v1/replies',
			type: "POST",
			data: JSON.stringify(data),
			contentType: 'application/json',
			dataType: "json"
		});
	    },
        getReplayList: () => {
		return $.ajax({
			url: this.urls.gateway + '/v1/replies/search?answer_to_id='+this.model.answer().id,
			type: "GET",
			contentType: 'application/json',
			dataType: "json"
		});
	}
    };
    this.init();
}

ViewModel.prototype.toggleLikeAnswer = function() {
    var self = this;
    var answer = ko.unwrap(this.model.answer);
    var isLike = answer.is_current_user_like;
    return this.store.toggleLikeAnswer(answer.id, !isLike).done(function(){
        answer.is_current_user_like = !isLike
        answer.like_count += (isLike? -1: 1);
        self.model.answer(answer);
    })
};

ViewModel.prototype.init = function () {
};

ViewModel.prototype.formatTime = function (time) {
    return time && time.split('.')[0].replace('T', ' ');
};

ViewModel.prototype.accept = function () {
    this.store.acceptAnswer(this.model.answer().id, true).done((res) => {
        this.actions.accept && this.actions.accept(this.model.answer());
    });
};
ViewModel.prototype.showAnswerDialog = function () {
    var self=this
    this.model.shouldShowAnswerDialog(true)
	this.store.getReplayList().then(function (res) {
        self.model.replays(res.items)
	})
};
ViewModel.prototype.hideAnswerDialog = function () {
	this.model.shouldShowAnswerDialog(false)
	this.model.replays([])
};
ViewModel.prototype.handleClickAnswer = function () {
	var self=this;
    let replaybody = {
	    content:this.model.replayContent(),
	    answer_to_id: this.model.answer().id
    }
    this.store.addReplay(replaybody).then(function () {
	    self.showAnswerDialog()
	    self.model.replayContent('')
    })
	var as=this.model.answer();
	as.reply_count = as.reply_count+1;
	this.model.answer(as)
};

ko.components.register('x-course-learn-answer', {
    viewModel: ViewModel,
    template: tpl
});