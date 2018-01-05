import React from 'react'
import moment from 'moment'
import {hashHistory, Link} from 'react-router'
import Request from '../service/rest.service'
import PagerBank from './common/pagerBank/pagerBank'
import {regCheckNumber, regCheckInput} from './common/computeDeal'
import DataNone from './common/dataNone/dataNone'
import {injectIntl} from 'react-intl'

// import CSSModules from 'react-css-modules'
// import styles from '../../styles/css/typeInputNumber.scss'
// @CSSModules(styles, {allowMultiple: true})

@injectIntl
export default class AnswerList extends React.Component {
  static propTypes = {
    params: React.PropTypes.object
  }

  constructor(props) {
    super(props)
    this.state = {
      dataList: [],
      searchInputValue: '',
      userIds: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      minScore: '',
      maxScore: ''
    }
    this.searchNameNode = null
    this.refresh = this.refresh.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
    this.onMinScoreChange = this.onMinScoreChange.bind(this)
    this.onMaxScoreChange = this.onMaxScoreChange.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.searchList = this.searchList.bind(this)
    this.searchUserIdsByUC = this.searchUserIdsByUC.bind(this)
    this.loadList = this.loadList.bind(this)
    this.submitPaper = this.submitPaper.bind(this)
    this.createLastTD = this.createLastTD.bind(this)
  }

  componentDidMount() {
    this.loadList()
  }

  refresh() {
    this.setState({
      searchInputValue: '',
      userIds: '',
      currentPage: 1,
      minScore: '',
      maxScore: ''
    }, this.loadList)
  }

  onSearchChange(e) {
    const val = e.target.value
    if(regCheckInput({value: val, maxLength: 10, noSymbol: true})) {
      this.setState({
        searchInputValue: val
      })
    }else{
      this.searchNameNode.value = this.state.searchInputValue
    }
  }

  searchUserIdsByUC(callback) {
    Request.searchUsers(window.orgId, this.state.searchInputValue).then(data => {
      const idList = data.items.map(item => {
        return item.user_id
      })
      if(idList.length) {
        this.state.userIds = idList.join(',')
        if (typeof callback === 'function') callback()
      }else{
        this.setState({
          dataList: [],
          total: 0
        })
      }
    }, () => {
      this.state.userIds = ''
      if(typeof callback === 'function') callback()
    })
  }

  onMinScoreChange(e) {
    let val = regCheckNumber(e.target.value)
    this.setState({minScore: val})
  }

  onMaxScoreChange(e) {
    let val = regCheckNumber(e.target.value)
    this.setState({maxScore: val})
  }

  onPageChange(currentPage) {
    this.setState({currentPage}, this.loadList)
  }

  searchList() {
    let {minScore, maxScore, searchInputValue} = this.state
    if(maxScore === '' || (minScore !== '' && minScore > maxScore)) {
      minScore = maxScore
    } else if(maxScore !== '' && minScore === '') {
      minScore = 0
    }
    this.setState({minScore, maxScore}, () => {
      if (searchInputValue) {
        this.searchUserIdsByUC(this.loadList)
      }else{
        this.state.userIds = ''
        this.loadList()
      }
    })
  }

  loadList() {
    const params = {
      exam_id: this.props.params.exam_id,
      user_ids: this.state.userIds,
      min_score: this.state.minScore,
      max_score: this.state.maxScore,
      page_no: this.state.currentPage - 1,
      page_size: this.state.pageSize
    }
    Request.getAnswerList(params).then(data => {
      this.setState({
        dataList: data.items,
        total: data.total
      })
    })
  }

  submitPaper(id) {
    Request.submitUserPaperMarks(id).then(() => {
      this.loadList()
    })
  }

  createLastTD(status, progress, userPaperManualMarkId) {
    const {formatMessage} = this.props.intl

    let goCorrect = null
    let doSubmit = null
    let goReview = null
    if (status === 0 || (status === 1 && progress < 100)) {
      // goCorrect = <a className='btn-operate' onClick={() => { hashHistory.push('/correctByStudent/' + userPaperManualMarkId + '/correct') }}>批改</a>
      // 批改
      goCorrect = <Link className='btn-operate color-blue' to={'/correctByStudent/' + userPaperManualMarkId + '/correct'}>{formatMessage({id: 'common.correct'})}</Link>
    } else if (status === 1 && progress >= 100) {
      // 提交成绩
      doSubmit = <a className='btn-operate color-blue' onClick={() => { this.submitPaper(userPaperManualMarkId) }}>{formatMessage({id: 'common.submitPaper'})}</a>
      // goReview = <a className='btn-operate' onClick={() => { hashHistory.push('/correctByStudent/' + userPaperManualMarkId + '/review') }}>查看</a>
      // 查看
      goReview = <Link className='btn-operate color-blue' to={'/correctByStudent/' + userPaperManualMarkId + '/review'}>{formatMessage({id: 'common.check'})}</Link>
    } else if (status === 2) {
      // goReview = <a className='btn-operate' onClick={() => { hashHistory.push('/correctByStudent/' + userPaperManualMarkId + '/review') }}>查看</a>
      // 查看
      goReview = <Link className='btn-operate' to={'/correctByStudent/' + userPaperManualMarkId + '/review'}>{formatMessage({id: 'common.check'})}</Link>
    }
    return <td>{goCorrect} {doSubmit} {goReview}</td>
  }

  render() {
    const {dataList, minScore, maxScore, currentPage, pageSize, total} = this.state
    const {formatMessage} = this.props.intl
    return (
      <div className='main-correcting wrapper clearfix'>
        <div className='main-r fr'>
          <div className='main-header clearfix'>
            {/* 作答列表 */}
            <h2 className='main-header-tit fl'>{formatMessage({id: 'answer.list'})}</h2>
            {/* 返回 */}
            <Link className='btn-back fr' href='javascript:' to={'/correct-list'}>{formatMessage({id: 'common.goBack'})}</Link>
            {/* 刷新 */}
            <a className='btn-back fr' href='javascript:' onClick={this.refresh} style={{marginRight: '10px'}}>{formatMessage({id: 'common.refresh'})}</a>
          </div>
          <div className='main-content'>
            <div className='filter-bar clearfix'>
              <div className='filter-bar-l fl'>
                {
                  // 输入考生姓名搜索
                  this.props.params.showName === 'true' ?
                    <input type='text' maxLength='10' value={this.state.searchInputValue} placeholder={formatMessage({id: 'answer.enterStdName'})} onChange={this.onSearchChange}  ref={searchNameNode => { this.searchNameNode = searchNameNode }}/>
                    : null
                }
                {/* 分数段 */}
                <label>{formatMessage({id: 'answer.scoreRange'})}：</label>
                {/* 全部 */}
                <input className='score-input' type='text' placeholder={formatMessage({id: 'common.all'})} value={minScore} onChange={this.onMinScoreChange} />
                <label className='connect-line'>-</label>
                <input className='score-input' type='text' placeholder={formatMessage({id: 'common.all'})} value={maxScore} onChange={this.onMaxScoreChange} />
                <button className='btn-search' onClick={this.searchList}/>
              </div>
            </div>
            {
              dataList && dataList.length
              ? <table className='correct-table'>
                <thead>
                <tr>
                  {/* 考生姓名 */}
                  <th width='20%'>{formatMessage({id: 'answer.stdName'})}</th>
                  {/* 交卷时间 */}
                  <th width='20%'>{formatMessage({id: 'answer.finishTime'})}</th>
                  {/* 批改进度 */}
                  <th width='20%'>{formatMessage({id: 'answer.correctionProgress'})}</th>
                  {/* 总分 */}
                  <th width='20%'>{formatMessage({id: 'question.totalScore'})}</th>
                  {/* 操作 */}
                  <th width='20%'>{formatMessage({id: 'common.operate'})}</th>
                </tr>
                </thead>
                <tbody>
                {
                  dataList.map((item, index) => {
                    const {
                      name,
                      user_paper_manual_mark: {
                        id,
                        user_id,
                        judge_id,
                        exam_id,
                        session_id,
                        paper_id,
                        progress,
                        user_question_count,
                        status,
                        score,
                        mark_time,
                        project_id,
                        context_id,
                        create_time
                      }
                    } = item
                    return <tr key={index}>
                      <td>{name !== null && name !== undefined && name !== '' ? name : '——'}</td>
                      <td>{moment(create_time).format('YYYY-MM-DD HH:mm:ss')}</td>
                      <td>{progress + '%'}</td>
                       {/* 待批改   '已批改,成绩未提交' : '批改中' */}
                      <td>
                        {
                          status === 2 ?
                            score :
                            (status === 0 ?
                              formatMessage({ id: 'manager.correct.progress.pending' }) :
                              (progress === 100 ? formatMessage({ id: 'manager.correct.progress.markedNoSubmit' }) : formatMessage({ id: 'manager.correct.progress.processing' })))
                        }
                      </td>
                      {this.createLastTD(status, progress, id)}
                    </tr>
                  })
                }
                </tbody>
              </table>
              : < DataNone text={formatMessage({id: 'answer.nop'})}/>
              // 暂无作答数据
            }
          </div>
          <div style={{padding: '0px 16px'}}>
            <PagerBank currentPage={currentPage} pageSize={pageSize} total={total} onChange={this.onPageChange} />
          </div>
        </div>
      </div>
    )
  }
}
