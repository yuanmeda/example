import React, {Component} from 'react'
import {connect} from 'react-redux'
import PreviewList from './components/preview/previewList'
import {push} from 'react-router-redux/lib/actions'
// import axios from 'axios'
import {defineMessages, intlShape, injectIntl} from 'react-intl'
import {articleGet} from './actions'

const messages = defineMessages({
  'articleAdd': {
    id: 'articleAdd',
    defaultMessage: '添加文章'
  }
})

@injectIntl
@connect(state => {
  return {
    articleList: state.articleList.items
  }
}, {
  articleGet,
  push
})
export default class List extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    push: React.PropTypes.func.isRequired
  }

  render() {
    const {formatMessage} = this.props.intl
    return (
      <div>
        <button onClick={() => this.props.push('/add')}>{formatMessage(messages.articleAdd)}</button>
        <PreviewList {...this.props} />
      </div>
    )
  }
}
