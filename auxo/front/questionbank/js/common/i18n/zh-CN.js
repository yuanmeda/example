/*!
 * 错题本组件语言包
 * @type {Object}
 */
var i18n = {
    common: {
        addins: {
            pagination: {
                first: '首页',
                last: '尾页',
                prev: '上一页',
                next: '下一页',
                jumpTo: '到',
                page: '页',
                jump: '跳转',
                overview: '当前第 {{currentPage}} 页/共 {{totalPage}} 页，共有 {{totalCount}} 条记录',
                eachPage: '每页',
                record: '记录',
                minOverview: '第{{currentPage}}页，共{{totalCount}}条'

            }
        }
    },
    questionbank: {
        common: {
            sucess: '成功',
            hint: '提示信息',
            confirm: '确认',
            cancel: '取消',
            finish:'完成',
            create:'创建',
            confirm2:'确定',
            connectError:'网络出错，请稍后再试',
            'edit':'编辑',
            'goToLearn':'去学习',
            'goSubmitQuestion':'提问'
        },
        detail: {
            noCorrectAnswer: '没有标准答案',
            noAnalysis:'没有解析',
            confirmDelete:'确认删除？',
            qtiText1:'QTIplayer报错，无法渲染此题',
            qitText2:'显示错题',
            cannotEmpty:'不可为空',

            showAnalysis: '查看答案&解析',
            addErrorReason: '添加错因',
            setKeyError: '标为重点',
            cancelKeyError: '取消标为重点',
            correctAnswer: '正确答案：',
            //'做过'+model.qtiQuestion().user_question_vo.answer_times+'次，做错<i class=\'fc-tips\'>'+model.qtiQuestion().user_question_vo.wrong_times+'</i>次'
            answerHistory:"做过{{answer_times}}次，做错<i class=\'fc-tips\'>{{wrong_times}}</i>次",
            analysis: '解析',
            errorReason:'错因',
            editErrorReason:'编辑错因',
            inputTip: '请输入错误原因',
            back:'返回',
            maxLength:'最大长度不能超过',
            userAnswer:'您的答案：',
            noUserAnswer:'尚未作答',
            note:'笔记',
            textareaTips: '写下对这道题的心得感想吧'
        },
        list:{
            similar:'类似题',
            wrongTimes: '错{{wrongTimes}}次',
            keyWrong: '重点错题',
            noQuestionContent: '无题目信息',
            clickToView: '点击查看题目',
            nodata:'没有数据',
            loading:'加载中...'
        },
        questionType: {
            'nd_fillblank': '选词填空',
            'nd_classified': '分类题型',
            'nd_arithmetic': '竖式计算题',
            'nd_memorycard': '记忆卡片题',
            'nd_guessword': '猜词题',
            'nd_fraction': '分式加减',
            'nd_textselect': '文本选择',
            'nd_magicbox': '魔方盒题型',
            'nd_order': '排序题',
            'nd_wordpuzzle': '字谜游戏题',
            'nd_pointsequencing': '点排序',
            'nd_lable': '标签题',
            'nd_imagemark': '图片标签题',
            'nd_probabilitycard': '概率卡牌',
            'nd_catchball': '摸球工具',
            'nd_linkup_old': '连连看',
            'nd_compare_old': '比大小题',
            'nd_handwritequestion': '手写题',
            'nd_table': '表格题',
            'nd_makeword': '组词题',
            'nd_section_evaluating': '英语篇章发音评测',
            'nd_sentence_evaluat': '英语句子发音评测',
            'nd_lego': '方块塔',
            'nd_openshapetool': '立体展开还原',
            'nd_mark_point': '标点题',
            'nd_intervalproblem': '区间题',
            'nd_mathaxi': '数轴题',
            'default': '互动题型'
        }
    }
};