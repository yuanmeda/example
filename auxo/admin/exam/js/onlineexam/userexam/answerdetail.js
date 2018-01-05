(function ($, window) {
    var store = {
        getAnswerDetails: function () {
            var url = '/' + projectCode + '/v1/m/exams/' + examId + '/sessions/' + sessionId + '/answers/details';
            return commonJS._ajaxHandler(url);
        },
		getExam: function () {
			var url = '/' + projectCode + '/v1/exams/' + examId;
			return commonJS._ajaxHandler(url);
		},
    };
    var viewModel = {
        model: {
	        exam: {
	            title: ""
	        },
            items: [],
            selectedIds: [],
            enabled: false,//考试是否上线
            userId: "",
            nextSessionId: "",
            style:'table'//列表显示风格
        },
        items: [],
        init: function () {
            var self = viewModel;
            $.extend(self, commonJS);
            self.model = ko.mapping.fromJS(self.model);
            ko.applyBindings(self);

            this.list();
        },
        list: function () {
        	var self = this;
            store.getAnswerDetails()
            .done(function (data) {
                if (data instanceof Array) {
                    self.items = data || [];
                    self.model.items(self.items);
                    for (var i = 0; i < data.length; i++) {
                    	if (data[i].user_id) {
                    		self.model.userId(data[i].user_id);
                    		break;
                    	}
                    }
                };
				self.getExam();
            });
        },
		getExam: function () {
			var self = this;
			store.getExam()
				.done(function (data) {
					self.model.exam.title(data.title);
				});
		},
		formatQuestionType: function(data) {
			var s = "";
			switch (data) {
				case 10:
					s += "单选题";
					break;
				case 15:
					s += "多选题";
					break;
				case 18:
					s += "不定项选择题";
					break;
				case 20:
					s += "填空题";
					break;
				case 25:
					s += "主观题";
					break;
				case 30:
					s += "判断题";
					break;
				case 40:
					s += "连线题";
					break;
				case 50:
					s += "套题";
					break;
				default:
					break;
			}
			return s;
		},
        formatAnswer: function(s) {
        	if (!s) return '';
        	var preWrapper = "<pre style='background-color: #FFF; border-width: 0'>";
        	var postWrapper = "</pre>";
        	try {
        		var obj = JSON.parse(s);
        		var resultArr = [];
        		for (var i = 0; i < obj.length; i++) {
        			var idx = "";
        			for (var j = 0; j < obj[i].index.length; j++) {
        				idx += "【" + obj[i].index[j] + "】";
        			}
        			resultArr.push(idx + preWrapper + obj[i].value.join("，") + postWrapper);
        		}
        		return resultArr.join("<br/>");
        	} catch (e) {
        		return preWrapper + s + postWrapper;
        	}
        },
        formatImageAnswer: function (s, index) {
            if (!s) {
                return "";
            }
            var obj = JSON.parse(s);
            var result = "";

            if (obj.data.length > 0) {
                for (var i = 0; i < obj.data.length; i++) {
                    if (obj.data[i].q == index) {
                        if (obj.data[i].sub_data && obj.data[i].sub_data.length > 0) {
                            $.each(obj.data[i].sub_data, function (index, item) {
                                result += "<a href='" + item.url +'&attachment=true' + "'style='color:#0302DF' target='_blank'>";
                                result += "点击下载附件";
                                result += "</a>";
                            });
                        }
                    }
                }
            }

            // if (obj.type == "cs_sub_image" && obj.data.length > 0) {
            //     for (var i = 0; i < obj.data.length; i++) {
            //         if (obj.data[i].q == index) {
            //             if (obj.data[i].sub_data && obj.data[i].sub_data.length > 0) {
            //                 $.each(obj.data[i].sub_data, function (index, item) {
            //                     result += "<a href='" + item.url + "' target='_blank'>";
            //                     result += "<img src='" + item.url + "&size=120" + "'/>";
            //                     result += "</a>";
            //                 });
            //             }
            //         }
            //     }
            // }
            if (result)
                result = "<div class='box' style='border-top: 1px solid #ddd;'><div style='font-weight: bold'>考生上传附件：</div>" + result + "</div>"
            return result;
        },
		//格式化简答题
		formatAnswer25: function(s) {
			if (!s) return '';
			var preWrapper = "<pre style='background-color: #FFF; border-width: 0'>";
			var postWrapper = "</pre>";
			return preWrapper + s + postWrapper;
		},
        getData: function() {
            var self = viewModel,
                temp = [];
            $.each(viewModel.items, function(indx, elem) {
				var it = {session_id:sessionId,question_id:elem.question_id,question_version:elem.question_version};
				it.marking_remark = null;
				it.marking_user_id = userId;
				var totalScore = 0;
				var totalUserScore = 0;
				it.subs = [];
				$.each(elem.subs, function(i, e) {
					var userScore = e.user_score;
					var qas = e.question_answer_status;
					if (e.question_type == 20 || e.question_type == 25) {
	            		var qid = elem.question_id + "_" + i;
			            var elementId = "q_" + qid;
			            userScore = parseFloat($("#" + elementId).val());
			            if (isNaN(userScore)) {
			            	userScore = 0;
			            }
			            qas = (userScore < e.score) ? 7 : 5;
					}
					it.subs.push({score:userScore,question_answer_status:qas});
					totalScore += e.score;
					totalUserScore += userScore;
				});
				it.score = totalUserScore;
				it.question_answer_status = (totalUserScore < totalScore) ? 7 : 5;
            	temp.push(it);
        	});
            return temp;
        }
    }

    $(function () {
        viewModel.init();
    });

})(jQuery, window)