import tpl from './template.html'
import ko from 'knockout'
import $ from 'jquery'

// const DEFAULT_AVATAR = 'images/chat_system_icon_personal_placeholder_square.png'
ko.components.register('x-course-lecturers', {
    viewModel: function (params = {}) {
        const csVer = 'v0.1' // 默认版本号 v0.1
        this.host = params.host || 'http://lecturer-gateway.dev.web.nd'
        this.csHost = params.csHost || `https://betacs.101.com/${csVer}`
        if (!/\/v/.test(this.csHost)) {
          if (/\/$/.test(this.csHost)) {
            this.csHost += csVer
          } else {
            this.csHost += `/${csVer}`
          }
        }
        this.avatavClickHandler = params.handler
        // all items from server
        this.items = ko.observableArray([])
        // show more or not
        this.showMore = ko.observable(false)
        // is fetching
        this.fetching = ko.observable(true)
        // current page
        this.page = 0
        // total num
        this.total = ko.observable(0)

        const {
          // id = '0399d77e-fab8-47ce-8015-4c895c31403a',
          id,
          csCDN = 'http://cdncs.101.com/v0.1/static/cscommon/avatar/2000336579/2000336579.jpg?size=80&defaultImage=1'
        } = params

        /**
         * get avatar src from dentryId
         * @method getSrcFromId
         * @param  {String}     dentryId dentryId
         * @return {String}              src
         */
        const getSrcFromId = (dentryId) => `${this.csHost}/download?dentryId=${dentryId}`

        /**
         * data handler
         * @method handleItem
         * @param  {Object}   item data
         * @return {Object}        data
         */
        const handleItem = item => {
            if (!item.photo_id) {
                item.photo_id = csCDN
            } else {
                item.photo_id = getSrcFromId(item.photo_id) + '&size=80'
            }
            if (!item.nick_name) {
                item.nick_name = ''
            }
            return item
        }

        this.getCourse = () => {
          if (id) {
              $.ajax(`${this.host}/v1/lecturers/search?course_id=${id}&page_no=${this.page}&page_size=3&enable=1`, {
                  success: res => {
                      this.total(res.total)
                      this.fetching(false)
                      const items  = res.items || []
                      items.map(item => {
                          this.items.push(handleItem(item))
                      })
                  },
                  error: err => {
                      this.fetching(false)
                      err.global = false;
                      //console.log(err)
                  }
              })
          }
        }

        this.getCourse()

        this.handleAvatarError = (data, e) => {
            if (e.target.src !== csCDN) {
                e.target.src = csCDN
            }
        }
        this.handleAvatarClick = (data, e) => {
            // TODO: go to lecturer home with id
            //console.log(`%cgo to lecturer: %c${data.id}`, 'color: orange', 'color: #38adff; font-weight: bold')
            if (typeof this.avatavClickHandler === 'function') {
                this.avatavClickHandler(data, e)
            }
        }

        this.showMoreItems = () => {
          if (this.items().length < this.total()) {
            this.page = this.page + 1
            this.getCourse()
            this.fetching(true)
            this.showMore(true)
          }
        }

        this.hideMoreItems = () => {
          while (this.items().length !== 3) {
            this.items.pop()
          }
          this.page = 0
          this.showMore(false)
        }
    },
    template: tpl
})
