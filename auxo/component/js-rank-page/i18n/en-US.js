i18n = i18n || {};
i18n.rank_page = {
  main_tab: 'Rank',
  leader_board: 'Leader Board',
  sub_title: {
    hour:{
      all:'Ranking statistics is based on learning minutes',
      single: 'Count and rank according to the students\'s study hours,with the repeating hours of the same course exclusive '
    },
    score:{
      all: 'Ranking statistics is based on score',
      single: 'Ranking statistics is based on score'
    }
  },
  more_dimensions_label: 'More Dim',
  rank_summ_info:{
    hour:'Ranking List is No. <span>{{my_rank}}</span>, totally <span>{{my_minute}}</span> mins and exceed <span>{{my_exceed}}%</span> learners.',
    score: 'Ranking List is No. <span>{{my_rank}}</span>，score <span>{{my_score}}</span>, cost <span>{{my_cost_minutes}} minutes {{my_cost_seconds}} seconds</span>, exceed <span>{{my_exceed}}%</span> learners'
  },
  date_dim:{
    week: 'Week',
    month: 'Month',
    all: 'All'
  },
  time:{
    minutes: 'minutes',
    seconds: 'seconds'
  },
  table_headers:{
    rank: 'Ranking',
    user: 'User',
    cost_time: 'Cost Time',
    score: 'Score',
    learn_time_used: 'Time Used'
  },
  loading: 'Loading',
  load_more: 'Load more data',
  list_empty:{
    no_data: 'Data is Not Found',
    no_config: 'Configuration is Incomplete, Please Finish Configuration in Admin System'
  }
};