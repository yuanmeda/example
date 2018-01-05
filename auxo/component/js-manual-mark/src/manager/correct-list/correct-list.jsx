import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { Link } from 'react-router'
import { injectIntl } from 'react-intl'
import $ from 'jquery'
import classnames from 'classnames'

import styles from './correct-list.css'
import { getCorrectList } from '../../service/rest.service'
import Table from './table'
import PageBank from '../../correct/common/pagerBank/pagerBank'
import config from '../../service/request-config'
import DataNone from '../../correct/common/dataNone/dataNone'
import '../../static/plugin/js/jquery.selectlist'
import Selection from './selection'

@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class CorrectList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: {
        status: '0',
        name: undefined
      },
      page: {
        currentPage: 1,
        total: undefined,
        pageSize: 10
      },
      list: [],
      markStatus: '0',
      publishStatus: ''
    }

    this.setQuery = this.setQuery.bind(this)
    this.fetchCorrectList = this.fetchCorrectList.bind(this)
    this.clickPageHandler = this.clickPageHandler.bind(this)
    this.searchCorrectList = this.searchCorrectList.bind(this)
    this.renderQueryForm = this.renderQueryForm.bind(this)
    this.changeSelect = this.changeSelect.bind(this)
  }

  componentDidMount() {
    const self = this
    this.fetchCorrectList()
  }

  fetchCorrectList() {
    const { query, page } = this.state
    const { user_id } = config.token
    const queryPage = {
      page_no: page.currentPage - 1,
      page_size: page.pageSize
    }

    getCorrectList({ ...query, ...queryPage, user_id })
      .then(result => {
        const { page } = this.state
        const realItems = result.items.map(item => ({
          ...item.exam_manual_mark_vo,
          progress: item.judge_vo.progress
        }))

        page.total = result.total
        this.setState({ list: realItems, ...page })
      })
  }

  searchCorrectList() {
    const { page } = this.state

    page.currentPage = 1
    this.setState({ page }, this.fetchCorrectList)
  }

  clickPageHandler(pageIndex) {
    const { page } = this.state

    page.currentPage = pageIndex
    this.setState({ page }, this.fetchCorrectList)
  }

  setQuery(event) {
    const self = this
    const { name, value } = event.target
    let newState = {
      query: { ...this.state.query }
    };

    newState.query[name] = value
    this.setState(newState, () => {
      self.fetchCorrectList()
    })
  }

  changeSelect(selectedItem) {
    function getStatus(markStatus, publishStatus) {
        let status = undefined;

        if(markStatus !== '1') {
          status = markStatus || publishStatus
        } else if(!publishStatus) {
          status = ['1', '2']
        } else {
          status = publishStatus
        }

        //全部，未批改时，传0,1
        if(markStatus != '1' && publishStatus == '1') {
          status = ['0', '1']
        }

        return status
    }

    this.setState({
      [selectedItem.id]: selectedItem.value
    }, () => {
      const {markStatus, publishStatus} = this.state

      const status = getStatus(markStatus, publishStatus)
      this.setQuery({ target: {name: 'status', value: status} })
    });
  }

  // 发布状态
  renderPublishQuery() {
    const { markStatus, publishStatus, query } = this.state
    const { correctState } = query
    const { formatMessage } = this.props.intl
    const cls = classnames({
      hide: markStatus === '0'
    })
    const msg = {
      desc: { id: 'manager.correct.publishStatus.desc' },
      all: { id: 'manager.correct.publishStatus.all' },
      published: { id: 'manager.correct.publishStatus.published' },
      unPublish: { id: 'manager.correct.publishStatus.unPublish' },
    }
    const opts = [
      {value: '', text: formatMessage(msg.all)},
      {value: '1', text: formatMessage(msg.unPublish)},
      {value: '2', text: formatMessage(msg.published)}
    ]


    return (
      <span styleName={cls}>
        <span>{formatMessage(msg.desc)}：</span>
        <Selection id="publishStatus" options={opts} value={publishStatus} placeholder={formatMessage(msg.desc)} onChange={this.changeSelect } />
      </span>
    )
  }

  // 批改进度
  renderQueryForm() {
    const {markStatus, query} = this.state
    const { name } = query
    const { formatMessage } = this.props.intl
    const msg = {
      desc: { id: 'manager.correct.progress.desc' },
      all: { id: 'manager.correct.progress.all' },
      pending: { id: 'manager.correct.progress.pending' },
      processing: { id: 'manager.correct.progress.processing' },
      modified: { id: 'manager.correct.progress.modified' },
      examName: { id: 'manager.correct.examName' }
    }
    const opts = [
      { value: '', text: formatMessage(msg.all) },
      { value: '0', text: formatMessage(msg.pending) },
      { value: '1', text: formatMessage(msg.modified) }
    ]

    return (
        <div className="filter-bar clearfix">
          <div className="filter-bar-l fl">
            <span>{formatMessage(msg.desc)}：</span>
            <Selection id="markStatus" options={opts} value={markStatus} placeholder={formatMessage(msg.desc)} onChange={this.changeSelect} />
            {this.renderPublishQuery()}
          </div>

          <div className="filter-bar-r fr">
            <div className="search-box search-correct-list">
              <input onInput={this.setQuery} name="name" value={name} type="text" placeholder={formatMessage(msg.examName)} />
              <button></button>
            </div>
          </div>
        </div>
    )
  }

  renderTable() {
    const { list, page } = this.state
    const { formatMessage, formatDate } = this.props.intl
    const msg = {
      examName: { id: 'manager.correct.examName' },
      examTime: { id: 'manager.correct.examTime' },
      gradingProgress: { id: 'manager.correct.progress.desc' },
      publishStatus: { id: 'manager.correct.publishStatus.desc' },
      operations: { id: 'manager.correct.operations' },
      unCorrected: { id: 'manager.correct.publishStatus.unPublish' },
      corrected: { id: 'manager.correct.publishStatus.unPublish' },
      published: { id: 'manager.correct.publishStatus.published' },
      unknown: { id: 'manager.common.unknown' },
      detail: {id: 'manager.correct.detail'},
      noData: {id: 'manager.correct.noData'}
    }

    const tableCfg = {
      rowKey: 'exam_id',
      columns: [
        { text: formatMessage(msg.examName), key: 'name' },
        { text: formatMessage(msg.examTime), key: 'start_time', render(value, row, index, items) { return `${moment(value).format('YYYY-MM-DD HH:mm:ss')} - ${moment(row['end_time']).format('YYYY-MM-DD HH:mm:ss')}` } },
        { text: formatMessage(msg.gradingProgress), key: 'progress', render(value) { return `${value}%` } },
        { text: formatMessage(msg.publishStatus), key: 'status', render(value) { return [formatMessage(msg.unCorrected), formatMessage(msg.corrected), formatMessage(msg.published)][value] || formatMessage(msg.unknown) } },
        { text: formatMessage(msg.operations), key: 'exam_id', render(value, row) { return (<Link to={`/answerList/${value}/${row.mark_strategy.is_show_examinee_name}`}>{formatMessage(msg.detail)}</Link>) } },
      ]
    }

    if (list.length) {
      return (
        <div>
          <Table className="correct-table" config={tableCfg} items={list} />
          <PageBank {...page} onChange={this.clickPageHandler} />
        </div>
      )
    } else {
      return (
        <DataNone text={formatMessage(msg.noData)} />
      )
    }
  }

  render() {
    const {formatMessage} = this.props.intl

    return (
      <div className="main">
        <div className="main-correcting wrapper clearfix">
          <div className="main-r" styleName="marginAuto">
            <div className="main-header clearfix">
              <h2 className="main-header-tit fl">{formatMessage({id: 'manager.correct.title'})}</h2>
            </div>
            <div className="main-content">
              {
                this.renderQueryForm()
              }
              {
                this.renderTable()
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
