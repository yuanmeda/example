import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './pagerBank.scss'
import { injectIntl } from 'react-intl'

@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class PagerBank extends React.Component {
  static propTypes = {
    total: React.PropTypes.number.isRequired, // 数据总数
    currentPage: React.PropTypes.number.isRequired, // 当前页码
    pageSize: React.PropTypes.number, // 当前页码大小
    onChange: React.PropTypes.func.isRequired // 当前页码or分页尺寸发生变化-回调
  }

  constructor(props) {
    super(props)
    let pageSize = props.pageSize || 10
    let totalPage = parseInt(props.total / pageSize)
    if (totalPage < props.total / pageSize) {
      totalPage = totalPage + 1
    }
    this.state = {
      totalPage: totalPage, // 总页数
      pageSize: pageSize,
      inputNum: props.currentPage, // 输入页码 (只能输入大于等于1的数字)
      isShowPager: props.total > 0 // 是否显示分页组件（当total小于1的时候不显示）
    }

    this.onChange = this.onChange.bind(this)
    this.onPageClick = this.onPageClick.bind(this)
    this.prevClick = this.prevClick.bind(this)
    this.nextClick = this.nextClick.bind(this)
    this.jumpClick = this.jumpClick.bind(this)
  }

  onChange(...args) {
    this.props.onChange(args[0], args[1])
  }

  onPageClick(e) {
    const pageNum = +e.target.getAttribute('data-page')
    if (pageNum !== this.props.currentPage) {
      this.onChange(pageNum, this.state.pageSize)
    }
  }

  prevClick() {
    this.onChange(this.props.currentPage - 1, this.state.pageSize)
  }

  nextClick() {
    this.onChange(this.props.currentPage + 1, this.state.pageSize)
  }

  jumpClick() {
    let value = parseInt(this.refs['pageNum'].value)
    if (typeof value !== 'number' || isNaN(value)) {
      this.refs['pageNum'].value = this.props.currentPage
      return
    }
    if (value <= 0) {
      value = 1
    } else if (value > this.state.totalPage) {
      value = this.state.totalPage
    }
    this.refs['pageNum'].value = value
    if (value !== this.props.currentPage) {
      this.onChange(value, this.state.pageSize)
    }
  }

  componentWillReceiveProps(props) {
    let pageSize = props.pageSize || 10
    let totalPage = parseInt(props.total / pageSize)
    if (totalPage < props.total / pageSize) {
      totalPage = totalPage + 1
    }
    this.setState({
      totalPage: totalPage, // 总页数
      pageSize: pageSize,
      inputNum: props.currentPage, // 输入页码 (只能输入大于等于1的数字)
      isShowPager: props.total > 0 // 是否显示分页组件（当total小于1的时候不显示）
    })
    if (this.refs['pageNum']) {
      this.refs['pageNum'].value = props.currentPage
    }
  }

  render() {
    const {formatMessage} = this.props.intl
    if (!this.state.isShowPager) {
      return
    }

    const prevEl = <li styleName='pager-arrow'>{this.props.currentPage > 1 ? <i onClick={this.prevClick} styleName='pager-bank-prev' /> : <i styleName='pager-bank-prev disabled' />}</li>
    const nextEl = <li styleName='pager-arrow'>{this.props.currentPage < this.state.totalPage ? <i onClick={this.nextClick} styleName='pager-bank-next' /> : <i styleName='pager-bank-next disabled' />}</li>
    const totalPage = this.state.totalPage
    const currentPage = this.props.currentPage
    let pagers = []

    let isEllipsis = false
    for (let i = 1; i <= totalPage; i++) {
      if (totalPage < 6) {
        pagers.push(<li data-page={i} styleName={currentPage === i ? 'pager-selected' : ''} key={i} onClick={this.onPageClick}>{i}</li>)
      } else {
        if (currentPage < 4 || currentPage > totalPage - 2) {
          if (i < 4 || i > totalPage - 2) {
            pagers.push(<li data-page={i} styleName={currentPage === i ? 'pager-selected' : ''} key={i} onClick={this.onPageClick}>{i}</li>)
            isEllipsis = true
          } else {
            if (isEllipsis) {
              pagers.push(<li data-page='elli' styleName='pager-elli' key={i}>{'...'}</li>)
              isEllipsis = false
            }
          }
        } else {
          if (i < 2 || i > (totalPage - 1) || (i > (currentPage - 2) && i < (currentPage + 2))) {
            pagers.push(<li data-page={i} styleName={currentPage === i ? 'pager-selected' : ''} key={i} onClick={this.onPageClick}>{i}</li>)
            isEllipsis = true
          } else {
            if (isEllipsis) {
              pagers.push(<li data-page='elli' styleName='pager-elli' key={i}>{'...'}</li>)
              isEllipsis = false
            }
          }
        }
      }
    }

    return (
      <div styleName='pager-bank-wrapper'>
        <div styleName='pager-bank-container'>
          <ul>
            {prevEl}
            {pagers}
            {nextEl}
            {/* 跳转到 */}
            <li styleName='pager-jump-tips'>{formatMessage({id: 'pager.jumpTo'})}:</li>
            <li styleName='pager-bank-input'><input ref='pageNum' defaultValue={this.state.inputNum} /></li>
            <li styleName='pager-bank-jump' onClick={this.jumpClick}>Go</li>
          </ul>
        </div>
      </div>
    )
  }
}
