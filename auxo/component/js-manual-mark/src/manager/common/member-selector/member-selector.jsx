import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './member-selector.scss'
import { injectIntl } from 'react-intl'
import MemberTree from './member-tree/member-tree'
import Request from '../../../service/rest.service'
import config from '../../../service/request-config'
import Avatar from '../avatar/avatar'

const userNodeIdN = 'user_id'
const userNodeNameN = 'org.real_name'
var timeoutProcess = 0
var serachKw = ''
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class MemberSelector extends React.Component {
  static propTypes = {
    title: React.PropTypes.string,
    max: React.PropTypes.number, //最多可选择人数,最小是1
    preChoosedList: React.PropTypes.array,
    disableChoosedList: React.PropTypes.array,
    onClickClose: React.PropTypes.func.isRequired,
    onClickSubmit: React.PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      addBtnClass: 'disable',
      removeBtnClass: 'disable',
      submitBtnClass: 'disable',
      choosedMembers: this.props.preChoosedList ? this.props.preChoosedList : [],
      getSerachMembers: [],
      nodeTreeData: [],
      disableChoosedList: this.props.disableChoosedList
    }
    this.searchMember = this.searchMember.bind(this)
    this._doSearch = this._doSearch.bind(this)
    this.clickMemberHandler = this.clickMemberHandler.bind(this)
    this.clickDepartHandler = this.clickDepartHandler.bind(this)
    this.addMember = this.addMember.bind(this)
    this.removeMember = this.removeMember.bind(this)
    this.isInChooseArray = this.isInChooseArray.bind(this)
    this.chooseRemoveMember = this.chooseRemoveMember.bind(this)
    this.closeSearchList = this.closeSearchList.bind(this)
    this.pickAndAddMember = this.pickAndAddMember.bind(this)
    this.helpChoose = this.helpChoose.bind(this)
    this.closeHandler = this.closeHandler.bind(this)
    this.submitHandler = this.submitHandler.bind(this)
    this.chooseAndRemoveMember = this.chooseAndRemoveMember.bind(this)
  }
  helpChoose(e) {
    if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) {
      e.stopPropagation()
      e.preventDefault()
    }
    if (e.keyCode === 13 && this.state.searchToAddMemberIndex > -1) {
      if (this.state.getSerachMembers.length > 0) {
        var member = this.state.getSerachMembers[this.state.searchToAddMemberIndex]
        this.pickAndAddMember(member)
      }
      this.closeSearchList()
    }

    if(e.keyCode === 13 && serachKw && (!this.state.getSerachMembers || this.state.getSerachMembers.length === 0)) {
      this.searchMember()
    }
    if (!this.state.getSerachMembers || this.state.getSerachMembers.length === 0) {
      return
    }
    if (e.keyCode === 38 && this.state.searchToAddMemberIndex > 0) {
      this.setState({
        searchToAddMemberIndex: this.state.searchToAddMemberIndex - 1
      })
    } else if (e.keyCode === 40 && this.state.searchToAddMemberIndex < (this.state.getSerachMembers.length - 1)) {
      this.setState({
        searchToAddMemberIndex: this.state.searchToAddMemberIndex + 1
      })
    }
  }
  searchMember(e) {
    if(e) {
      e.stopPropagation()
      e.preventDefault()
      serachKw = e.currentTarget.value
    }

    clearTimeout(timeoutProcess)
    if (serachKw !== '') {
      timeoutProcess = setTimeout(this._doSearch(serachKw), 300)
    }
  }
  _doSearch(kw) {
    var _this = this
    return function () {
      var memberList = []
      Request.searchUsers(window.orgId, kw).then(data => {
        _this.filterDisableMember(data.items)
        _this.setState({
          getSerachMembers: data.items,
          searchListShow: 'show',
          searchToAddMemberIndex: 0
        })
      })
      console.log('qw')
    }
  }
  clickMemberHandler(member) {
    this.setState({
      toAddMember: member
    })
  }
  isSingleMode() {
    const { max } = this.props
    const { choosedMembers } = this.state

    return max && choosedMembers.length >= max
  }
  clickDepartHandler(depart) {
    this.setState({
      toAddMember: ''
    })
  }
  addMember(e) {
    e.stopPropagation()
    e.preventDefault()
    if (this.state.addBtnClass === 'disable' || this.isInChooseArray(this.state.toAddMember)) {
      return
    }
    if (this.props.max > 0 && this.state.choosedMembers.length >= this.props.max) {
      return
    }
    this.state.choosedMembers.push(this.state.toAddMember)
    this.setState({
      choosedMembers: this.state.choosedMembers
    })
  }
  removeMember(e) {
    e.stopPropagation()
    e.preventDefault()
    if (this.state.removeBtnClass === 'disable') {
      return
    }
    this.removeMemberFromArr(this.state.toRemoveMember, this.state.choosedMembers)
    this.removeMemberFromArr(this.state.toRemoveMember, this.state.disableChoosedList)
    this.setState({
      choosedMembers: this.state.choosedMembers,
      removeBtnClass: 'disable',
      toRemoveMember: ''
    })
  }
  isInChooseArray(member) {
    for (var i = 0; i < this.state.choosedMembers.length; i++) {
      var tempMember = this.state.choosedMembers[i]
      if (member[userNodeIdN] === tempMember[userNodeIdN]) {
        return true
      }
    }
    return false
  }
  checkLiIsOn(memberId) {
    return this.state.toRemoveMember && Number(memberId) === Number(this.state.toRemoveMember[userNodeIdN]) ? 'on' : ''
  }
  checkSearchLiIsOn(index) {
    return this.state.searchToAddMemberIndex > -1 && Number(index) === Number(this.state.searchToAddMemberIndex) ? 'on' : ''
  }
  chooseRemoveMember(member) {
    this.setState({
      removeBtnClass: '',
      toRemoveMember: member
    })
  }
  chooseAndRemoveMember(e,member) {
    this.setState({
      removeBtnClass: '',
      toRemoveMember: member
    })
    this.removeMember(e)
  }
  removeMemberFromArr(member, arr) {
    var index = -1
    for (var i = 0; i < arr.length; i++) {
      if (member[userNodeIdN] === arr[i][userNodeIdN]) {
        index = i
      }
    }
    arr.splice(index, 1)
  }
  pickAndAddMember(member) {
    const {formatMessage} = this.props.intl
    if (member.disable) {
      return
    }
    if (!this.isInChooseArray(member)) {
      if (this.props.max > 0 && this.state.choosedMembers.length >= this.props.max) {
        return
      }
      this.state.choosedMembers.push(member)
      this.setState({
        choosedMembers: this.state.choosedMembers
      })
    }
  }
  closeSearchList() {
    var _this = this
    setTimeout(function () {
      _this.setState({
        searchListShow: '',
        getSerachMembers: [],
        searchToAddMemberIndex: -1
      })
    }, 200)
  }
  createChooseMemberHtml(html, member) {
    const {formatMessage} = this.props.intl
    html.push(<li key={member[userNodeIdN] + '_li'} title={(member[userNodeNameN] || formatMessage({id: 'manager.common.member_selector.unknowname'}) ) + '(' + member[userNodeIdN]+')'}
                  onClick={() => this.chooseRemoveMember(member)} onDoubleClick={(event) => this.chooseAndRemoveMember(event,member)} styleName={this.checkLiIsOn(member[userNodeIdN])}>
      <Avatar key={member[userNodeIdN] + '_avatar'} userId={member[userNodeIdN]} />
      <cite key={member[userNodeIdN]}>
        {(member[userNodeNameN] || formatMessage({id: 'manager.common.member_selector.unknowname'}) ) + '(' + member[userNodeIdN]+')'}
      </cite></li>)
  }
  createSearchMemberHtml(html, member, index) {
    const {formatMessage} = this.props.intl
    html.push(<li key={member[userNodeIdN] + '_li'} title={(member[userNodeNameN] || formatMessage({id: 'manager.common.member_selector.unknowname'}) ) + '(' + member[userNodeIdN]+')'}
                  onClick={() => this.pickAndAddMember(member)} styleName={this.checkSearchLiIsOn(index) + (member.disable ? ' disable':'')}>
      <Avatar key={member[userNodeIdN] + '_avatar'} userId={member[userNodeIdN]} />
      <cite key={member[userNodeIdN]}>
        {(member[userNodeNameN] || formatMessage({id: 'manager.common.member_selector.unknowname'}) ) + '(' + member[userNodeIdN]+')'}
      </cite></li>)
  }
  checkSubmitBtnClass() {
    return this.state.choosedMembers && this.state.choosedMembers.length > 0 ? '' : 'disable'
  }
  closeHandler(e) {
    e.stopPropagation()
    e.preventDefault()
    this.props.onClickClose()
  }
  submitHandler(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!this.state.choosedMembers || this.state.choosedMembers.length === 0) {
      return
    }
    this.props.onClickSubmit(this.state.choosedMembers)
  }
  filterDisableMember(nodes) {
    if (this.state.disableChoosedList && this.state.disableChoosedList.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = 0; j < this.state.disableChoosedList.length; j++) {
          if (this.state.disableChoosedList[j][userNodeIdN] === nodes[i][userNodeIdN]) {
            nodes[i].disable = true
          }
        }
      }
    }
  }
  render() {
    const {formatMessage} = this.props.intl
    var choosedMemberHtml = []
    for (var i = 0; i < this.state.choosedMembers.length; i++) {
      this.createChooseMemberHtml(choosedMemberHtml, this.state.choosedMembers[i])
    }
    var serachMemberHtml = []
    if (this.state.getSerachMembers.length === 0) {
      serachMemberHtml.push(<li key='nofound_cite' onClick={this.closeSearchList} styleName='on'>
        <cite key='nofound_cite'>{formatMessage({id: 'manager.common.member_selector.notfound'})}</cite></li>)
    } else {
      for (i = 0; i < this.state.getSerachMembers.length; i++) {
        this.createSearchMemberHtml(serachMemberHtml, this.state.getSerachMembers[i], i)
      }
    }
    //计算当前this.state.addBtnClass
    if (this.isSingleMode() || !this.state.toAddMember ||(this.state.toAddMember && this.isInChooseArray(this.state.toAddMember))) {
      this.state.addBtnClass = 'disable'
    }else{
      this.state.addBtnClass = ''
    }
    return (
      <div styleName='mem-mask'>
        <div styleName='mem-choose'>
          <div styleName='mem-header'><span styleName='title'>{this.props.title ? this.props.title : formatMessage({id: 'manager.common.member_selector.addmember'}) }</span>
            <span styleName='close' onClick={this.closeHandler}>x</span></div>
          <div styleName='mem-body'>
            <div styleName='mem-choosed-title'>
              <input type='text' onChange={this.searchMember} onKeyDown={this.helpChoose} onBlur={this.closeSearchList} placeholder={formatMessage({id: 'manager.common.member_selector.search'})} />
              <span>{formatMessage({id: 'manager.common.member_selector.selected'})}</span>
              <div styleName={'infom ' + (this.state.searchListShow ? this.state.searchListShow : '')}><ul>{serachMemberHtml}</ul></div>
            </div>
            <div styleName='mem-main'>
              <MemberTree onDoubleClickMember={this.pickAndAddMember} onClickMember={this.clickMemberHandler} onClickDepart={this.clickDepartHandler} disableChoosedList={this.state.disableChoosedList} />
              <div styleName='mem-choose-warp'>
                <button styleName={'btn ' + this.state.addBtnClass} onClick={this.addMember}>
                  {formatMessage({id: 'manager.common.member_selector.add'})}
                </button>
                <button styleName={'btn ' + this.state.removeBtnClass} onClick={this.removeMember}>
                  {formatMessage({id: 'manager.common.member_selector.delete'})}
                </button>
              </div>
              <div styleName='mem-choosed-warp'><ul>{choosedMemberHtml}</ul></div>
            </div>
          </div>
          <div styleName='mem-footer'><button onClick={this.submitHandler} styleName={'btn ' + this.checkSubmitBtnClass()} >
            {formatMessage({id: 'manager.common.member_selector.confirm'})}
          </button></div>
        </div>
      </div>
    )
  }
}
