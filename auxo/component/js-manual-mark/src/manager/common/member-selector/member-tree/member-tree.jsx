import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './member-tree.scss'
import {injectIntl} from 'react-intl'
import Request from '../../../../service/rest.service'
import config from '../../../../service/request-config'
import Avatar from '../../avatar/avatar'

const tbottom = 'triangle-bottom'
const tright = 'triangle-right'
const branch = 'branch'
const userNodeIdN = 'user_id'
const userNodeNameN = 'org.real_name'

var orgId = ''
var userId = ''

@injectIntl
@CSSModules(styles, {allowMultiple: true})
export default class MemberTree extends React.Component {
  static propTypes = {
    disableChoosedList: React.PropTypes.array,
    onDoubleClickMember: React.PropTypes.func.isRequired,
    onClickMember: React.PropTypes.func.isRequired,
    onClickDepart: React.PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      nodeTreeData: []
    }
    this.openSubChoose = this.openSubChoose.bind(this)
    this.handleClickMember = this.handleClickMember.bind(this)
    this.handleDoubleClickMember = this.handleDoubleClickMember.bind(this)
    this.getNodeChildNodes = this.getNodeChildNodes.bind(this)

    var _this = this
    if (!window.orgId) {
      userId = config.token.user_id
      Request.getUserInfo(userId).then(function (userInfo) {
        orgId = userInfo.org_exinfo.org_id
        _this.getNodeChildNodes(orgId, 0)
        _this.getDepMembers('0children_data', 0)
      })
    }else{
      orgId = window.orgId
      _this.getNodeChildNodes(orgId, 0)
      _this.getDepMembers('0children_data', 0)
    }
  }
  getNodeChildNodes(orgId, nodeId ,node) {
    if (node) {
      if (node.isVisited) {
        return
      }
      node.isVisited = true
    }
    Request.getNodeChildNodes(orgId, nodeId).then(data => {
      if(data.items && data.items.length>0 ){
        if (node) {
          node.children = data.items
        }else{
          this.state.nodeTreeData = data.items
        }
        this.setState({
          nodeTreeData: this.state.nodeTreeData
        })
      }
    })
  }
  getDepMembers(key, nodeId) {
    var _this = this
    Request.getNodeChildUsers(orgId, nodeId).then(data => {
      this.filterDisableMember(data.items)
      _this.setState({
        [key]: data.items
      })
    })
  }
  openSubChoose(e, node) {
    e.stopPropagation()
    e.preventDefault()
    var targetId = e.currentTarget.id
    var iconName = targetId + 'icon'
    var childrenData = targetId + 'children_data'
    var iconClass = this.state[targetId] ? tright : tbottom
    var ulClass = this.state[targetId] ? '' : 'mem-show'
    if (!this.state[childrenData]) {
      this.getDepMembers(childrenData, targetId)
    }
    this.setState({
      currentDepId: targetId,
      currentNode: '',
      [targetId]: ulClass,
      [iconName]: iconClass
    })
    this.getNodeChildNodes(orgId, node.node_id, node)
    this.props.onClickDepart(node)
  }
  handleClickMember(e, node) {
    if (node.disable) {
      return
    }
    this.setState({
      currentDepId: '',
      currentNode: node
    })
    this.props.onClickMember(node)
  }
  handleDoubleClickMember(e, node) {
    if (node.disable) {
      return
    }
    this.setState({
      currentDepId: '',
      currentNode: node
    })
    this.props.onDoubleClickMember(node)
  }
  checkDepIsOn(nodeId) {
    return Number(nodeId) === Number(this.state.currentDepId) ? 'on' : ''
  }
  checkMemIsOn(nodeId) {
    if (this.state.currentNode) {
      return Number(nodeId) === Number(this.state.currentNode[userNodeIdN]) ? 'on' : ''
    }else{
      return ''
    }
  }
  getChirldrenUlHtml(childrenData, parentId) {
    if (childrenData) {
      var tempUlliHtml = []
      for (var i = 0; i < childrenData.length; i++) {
        tempUlliHtml.push(this.getTreeLeafHtml(parentId, childrenData[i]))
      }
      return tempUlliHtml
    } else {
      return ''
    }
  }
  getTreeBranchHtml(node) {
    var html = []
    var iconClass = node.node_id + 'icon'
    var childrenData = node.node_id + 'children_data'
    if (node.children) {
      var tempHtml = []
      this.forGetBranchNode(tempHtml, node.children)
      html.push(<li key={node.node_id + '_li'}>
        <a key={node.node_id + '_a'} href='javascript:;' onClick={(event) => this.openSubChoose(event, node)} id={node.node_id} className='branch' styleName={this.checkDepIsOn(node.node_id)}>
          <i key={node.node_id + '_i'} styleName={this.state[iconClass] ? this.state[iconClass] : tright} />
          <cite key={node.node_id + '_cite'}>{node.node_name + '[' + node.user_amount + ']'}</cite>
        </a>
        <ul key={node.node_id + '_ul'} styleName={this.state[node.node_id]}>
          {tempHtml}
          {this.getChirldrenUlHtml(this.state[childrenData], node.node_id)}
        </ul></li>)
    } else {
      html.push(<li key={node.node_id + '_li'}>
        <a key={node.node_id + '_a'} href='javascript:;' onClick={(event) => this.openSubChoose(event, node)} id={node.node_id} className='leaf' styleName={this.checkDepIsOn(node.node_id)}>
          <i key={node.node_id + '_i'} styleName={this.state[iconClass] ? this.state[iconClass] : tright} />
          <cite key={node.node_id + '_cite'}>{node.node_name + '[' + node.user_amount + ']'}</cite>
        </a><ul key={node.node_id + '_ul'} styleName={this.state[node.node_id]}>
          {this.getChirldrenUlHtml(this.state[childrenData], node.node_id)}</ul></li>)
    }
    return html
  }
  getTreeLeafHtml(parentId, node) {
    const {formatMessage} = this.props.intl
    let paddingLeftStyle = ''
    if (parentId === 0) {
      paddingLeftStyle = 'li-pd'
    }
    var html = []
    html.push(<li styleName={paddingLeftStyle} key={parentId + node[userNodeIdN] + '_li'} title={(node[userNodeNameN] || formatMessage({id: 'manager.common.member_selector.unknowname'}) ) + '(' + node[userNodeIdN]+')'}>
      <Avatar key={parentId + node[userNodeIdN] + '_avatar'} userId={node[userNodeIdN]} />
      <a key={parentId + node[userNodeIdN] + '_a'} href='javascript:;' onClick={(event) => this.handleClickMember(event, node)}
       onDoubleClick={(event) => this.handleDoubleClickMember(event, node)} id={node[userNodeIdN]}
       className='leaf-children' styleName={this.checkMemIsOn(node[userNodeIdN]) + (node.disable ? ' disable':'')}>
        <cite key={parentId + node[userNodeIdN] + '_cite'}>{(node[userNodeNameN] || formatMessage({id: 'manager.common.member_selector.unknowname'}) ) + '(' + node[userNodeIdN]+')'}</cite>
      </a></li>)
    return html
  }
  forGetBranchNode(arr, nodes) {
    for (var i = 0; i < nodes.length; i++) {
      arr.push(this.getTreeBranchHtml(nodes[i]))
    }
  }
  filterDisableMember(nodes){
    if (this.props.disableChoosedList && this.props.disableChoosedList.length > 0) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = 0; j < this.props.disableChoosedList.length; j++) {
          if (this.props.disableChoosedList[j][userNodeIdN]===nodes[i][userNodeIdN]) {
            nodes[i].disable = true
          }
        }
      }
    }
  }
  render() {
    var html = []
    var treeData = this.state.nodeTreeData
    for (let i = 0; i < treeData.length; i++) {
      html.push(this.getTreeBranchHtml(treeData[i]))
    }
    html.push(this.getChirldrenUlHtml(this.state['0children_data'], 0))
    return (
      <div styleName='mem-warp'>
        <ul key='mem_tree' id='demo1' styleName='mem-tree'>
          {html}
        </ul>
      </div>
    )
  }
}
