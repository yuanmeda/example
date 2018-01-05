import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './pagerBank.scss'

@CSSModules(styles, {allowMultiple: true})
export default class PagerBank extends React.Component {
  static propTypes = {
    total: React.PropTypes.number.isRequired, // 数据总数
    currentPage: React.PropTypes.number.isRequired, // 当前页码
    pageSizes: React.PropTypes.arrayOf(React.PropTypes.number), // 页码大小选择区间
    pageSize: React.PropTypes.number, // 当前页码大小
    onChange: React.PropTypes.func.isRequired // 当前页码or分页尺寸发生变化-回调
  }

  constructor(props) {
    super(props)
    let pageSizes = props.pageSizes || []
    let pageSize = props.pageSize || 10
    let totalPage = parseInt(props.total / pageSize)
    if (totalPage < props.total / pageSize) {
      totalPage = totalPage + 1
    }
    this.state = {
      totalPage: totalPage, // 总页数
      pageSizes: pageSizes,
      pageSize: pageSize,
      inputNum: props.currentPage, // 输入页码 (只能输入大于等于1的数字)
      isShowPager: props.total > 0 // 是否显示分页组件（当total小于1的时候不显示）
    }
    this.onChange = this.props.onChange
    /**
    * 选择分页尺寸变化
    */
    this.selectChange = (e) => {
      this.onChange(1, parseInt(e.target.value))
    }
    /**
    * start页面
    */
    this.startClick = () => {
      this.onChange(1, this.state.pageSize)
    }
    /**
    * prev页面
    */
    this.prevClick = () => {
      this.onChange(this.props.currentPage - 1, this.state.pageSize)
    }
    /**
    * next页面
    */
    this.nextClick = () => {
      this.onChange(this.props.currentPage + 1, this.state.pageSize)
    }
    /**
    * end页面
    */
    this.endClick = () => {
      this.onChange(this.state.totalPage, this.state.pageSize)
    }
    /**
    * 跳转
    */
    this.jumpClick = () => {
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
      this.onChange(value, this.state.pageSize)
    }
    /**
    * select选择
    */
    this.selects = () => {
      if (this.state.pageSizes.length > 0) {
        return <select styleName="pager-bank-select" value={this.state.pageSize}
          onChange={this.selectChange}>{
          this.state.pageSizes.map((item, i) => {
            return (
              <option key={item} value={item}>{item}</option>
            )
          })
        }
        </select>
      }
    }
    /**
    * start跳转
    */
    this.startBtn = () => {
      if (this.props.currentPage > 1) {
        return (<i styleName="pager-bank-start" onClick={this.startClick} />)
      } else {
        return (<i styleName="pager-bank-start disabled" />)
      }
    }
    /**
    * prev跳转
    */
    this.prevBtn = () => {
      if (this.props.currentPage > 1) {
        return (<i styleName="pager-bank-prev" onClick={this.prevClick} />)
      } else {
        return (<i styleName="pager-bank-prev disabled" />)
      }
    }
    /**
    * next跳转
    */
    this.nextBtn = () => {
      if (this.props.currentPage < this.state.totalPage) {
        return (<i styleName="pager-bank-next" onClick={this.nextClick} />)
      } else {
        return (<i styleName="pager-bank-next disabled" />)
      }
    }
    /**
    * end跳转
    */
    this.endBtn = () => {
      if (this.props.currentPage < this.state.totalPage) {
        return (<i styleName="pager-bank-end" onClick={this.endClick} />)
      } else {
        return (<i styleName="pager-bank-end disabled" />)
      }
    }
  }

  componentWillReceiveProps(props) {
    let pageSizes = props.pageSizes || []
    let pageSize = props.pageSize || 10
    let totalPage = parseInt(props.total / pageSize)
    if (totalPage < props.total / pageSize) {
      totalPage = totalPage + 1
    }
    this.setState({
      totalPage: totalPage, // 总页数
      pageSizes: pageSizes,
      pageSize: pageSize,
      inputNum: props.currentPage, // 输入页码 (只能输入大于等于1的数字)
      isShowPager: props.total > 0 // 是否显示分页组件（当total小于1的时候不显示）
    })
    this.onChange = props.onChange
  }

  render() {
    if (!this.state.isShowPager) {
      return
    }
    return (
      <div styleName="pager-bank-wrapper">
        <div styleName="pager-bank-container">
          <span>共{this.props.total}条记录</span>
          {this.selects()}
          {this.startBtn()}
          {this.prevBtn()}
          <span> 第</span>
          <input ref="pageNum" defaultValue={this.state.inputNum} styleName="pager-bank-input" />
          <span>页</span>
          <span> 共{this.state.totalPage}页 </span>
          {this.nextBtn()}
          {this.endBtn()}
          <span styleName="pager-bank-jump"
            onClick={this.jumpClick}>跳转</span>
        </div>
      </div>
    )
  }
}
