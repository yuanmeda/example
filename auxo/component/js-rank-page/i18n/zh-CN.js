i18n = i18n || {};
i18n.rank_page = {
  main_tab: '排行榜',
  leader_board: '学霸排行',
  sub_title: {
    hour:{
      all:'根据学员的学习时长统计排序',
      single: '根据学员的学习时长统计排序，同一课程重复学习的时长不计入'
    },
    score:{
      all: '根据学员的考试成绩统计排序',
      single: '根据学员的考试成绩统计排序'
    }
  },
  more_dimensions_label: '更多维度',
  rank_summ_info:{
    hour:'我的排名<span>{{my_rank}}</span>，学习时长<span>{{my_minute}}</span>分钟，超过<span>{{my_exceed}}%</span>的同学',
    score: '我的排名<span>{{my_rank}}</span>，测评成绩<span>{{my_score}}</span>分，用时<span>{{my_cost_minutes}}分{{my_cost_seconds}}秒</span>，超过<span>{{my_exceed}}%</span>的同学'
  },
  date_dim:{
    week: '周',
    month: '月',
    all: '总'
  },
  time:{
    minutes: '分',
    seconds: '秒'
  },
  table_headers:{
    rank: '排名',
    user: '用户',
    cost_time: '用时',
    score: '成绩',
    learn_time_used: '学习时长'
  },
  loading: '正在加载',
  load_more:'点击加载更多排名',
  list_empty:{
    no_data: '暂无排行信息',
    no_config: '配置未完成，请到后台进行排行榜配置'
  }
};