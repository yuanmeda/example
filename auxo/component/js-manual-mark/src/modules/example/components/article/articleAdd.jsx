import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './articleAdd.css'
import {defineMessages, intlShape, injectIntl} from 'react-intl'

const messages = defineMessages({
  'articleTitle': {
    id: 'articleTitle',
    defaultMessage: '文章标题'
  },
  'articleContent': {
    id: 'articleContent',
    defaultMessage: '文章内容'
  },
  'articleAdd': {
    id: 'articleAdd',
    defaultMessage: '添加文章'
  },
  'articleAddSuccess': {
    id: 'articleAddSuccess',
    defaultMessage: '文章添加成功'
  },
  'save': {
    id: 'save',
    defaultMessage: '保存'
  }
})

@injectIntl
@CSSModules(styles, {allowMultiple: true})
export default class Preview extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    articleAdd: React.PropTypes.func.isRequired,
    push: React.PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      description: '',
      date: '2017-05-12'
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  handleSubmit() {
    const {formatMessage} = this.props.intl
    this.props.articleAdd(this.state).then(() => {
      window.alert(formatMessage(messages.articleAddSuccess))
      this.props.push('/')
    })
  }
  render() {
    const {formatMessage} = this.props.intl
    return (
      <form styleName='smart-green'>
        <h1>{formatMessage(messages.articleAdd)}</h1>
        <label>
          <span>{formatMessage(messages.articleTitle)}:</span>
          <input id='title' type='text' name='title' placeholder={formatMessage(messages.articleTitle)} onChange={this.handleChange} />
        </label>
        <label>
          <span>{formatMessage(messages.articleContent)}:</span>
          <textarea id='description' name='description' placeholder={formatMessage(messages.articleContent)} onChange={this.handleChange} />
        </label>
        <label>
          <span>&nbsp;</span>
          <input type='button' styleName='button' value={formatMessage(messages.save)} onClick={this.handleSubmit} />
        </label>
      </form>
    )
  }
}
