/* global $, CanvasLoader, Countable, Hogan, embedly */
import React, { PropTypes, Component } from 'react'

import Util from '../Metamaps/Util'

var funcs = {
  buildObject: function(topic, ActiveMapper) {
    var nodeValues = {}
    var authorized = topic.authorizeToEdit(ActiveMapper)
    var inmapsAr = topic.get('inmaps') || []
    var inmapsLinks = topic.get('inmapsLinks') || []
    nodeValues.inmaps = ''
    if (inmapsAr.length < 6) {
      for (let i = 0; i < inmapsAr.length; i++) {
        const url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
      const extra = inmapsAr.length - 5
      nodeValues.inmaps += '<li><span class="showMore">See ' + extra + ' more...</span></li>'
      for (let i = 5; i < inmapsAr.length; i++) {
        const url = '/maps/' + inmapsLinks[i]
        nodeValues.inmaps += '<li class="hideExtra extraText"><a href="' + url + '">' + inmapsAr[i] + '</a></li>'
      }
    }
    nodeValues.permission = topic.get('permission')
    nodeValues.mk_permission = topic.get('permission').substring(0, 2)
    nodeValues.map_count = topic.get('map_count').toString()
    nodeValues.synapse_count = topic.get('synapse_count').toString()
    nodeValues.id = topic.isNew() ? topic.cid : topic.id
    nodeValues.metacode = topic.getMetacode().get('name')
    nodeValues.metacode_class = 'mbg' + topic.get('metacode_id')
    nodeValues.imgsrc = topic.getMetacode().get('icon')
    nodeValues.name = topic.get('name')
    nodeValues.userid = topic.get('user_id')
    nodeValues.username = topic.get('user_name')
    nodeValues.userimage = topic.get('user_image')
    nodeValues.date = topic.getDate()
    // the code for this is stored in /views/main/_metacodeOptions.html.erb
    nodeValues.metacode_select = $('#metacodeOptions').html()
    nodeValues.desc_nil = 'Click to add description...'
    nodeValues.desc_markdown = (topic.get('desc') === '' && authorized)
    ? nodeValues.desc_nil
    : topic.get('desc')
    nodeValues.desc_html = Util.mdToHTML(nodeValues.desc_markdown)
    return nodeValues
  },
  bindShowCardListeners: function(topic, ActiveMapper) {
    var authorized = topic.authorizeToEdit(ActiveMapper)
    var selectingMetacode = false
    // attach the listener that shows the metacode title when you hover over the image
    $('.showcard .metacodeImage').mouseenter(function() {
      $('.showcard .icon').css('z-index', '4')
      $('.showcard .metacodeTitle').show()
    })
    $('.showcard .linkItem.icon').mouseleave(function() {
      if (!selectingMetacode) {
        $('.showcard .metacodeTitle').hide()
        $('.showcard .icon').css('z-index', '1')
      }
    })

    var metacodeLiClick = function() {
      selectingMetacode = false
      var metacodeId = parseInt($(this).attr('data-id'))
      var metacode = DataModel.Metacodes.get(metacodeId)
      $('.CardOnGraph').find('.metacodeTitle').html(metacode.get('name'))
      .append('<div class="expandMetacodeSelect"></div>')
      .attr('class', 'metacodeTitle mbg' + metacode.id)
      $('.CardOnGraph').find('.metacodeImage').css('background-image', 'url(' + metacode.get('icon') + ')')
      topic.save({
        metacode_id: metacode.id
      })
      Visualize.mGraph.plot()
      $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
      $('.metacodeTitle').hide()
      $('.showcard .icon').css('z-index', '1')
    }

    var openMetacodeSelect = function(event) {
      var TOPICCARD_WIDTH = 300
      var METACODESELECT_WIDTH = 404
      var MAX_METACODELIST_HEIGHT = 270

      if (!selectingMetacode) {
        selectingMetacode = true

        // this is to make sure the metacode
        // select is accessible onscreen, when opened
        // while topic card is close to the right
        // edge of the screen
        var windowWidth = $(window).width()
        var showcardLeft = parseInt($('.showcard').css('left'))
        var distanceFromEdge = windowWidth - (showcardLeft + TOPICCARD_WIDTH)
        if (distanceFromEdge < METACODESELECT_WIDTH) {
          $('.metacodeSelect').addClass('onRightEdge')
        }

        // this is to make sure the metacode
        // select is accessible onscreen, when opened
        // while topic card is close to the bottom
        // edge of the screen
        var windowHeight = $(window).height()
        var showcardTop = parseInt($('.showcard').css('top'))
        var topicTitleHeight = $('.showcard .title').height() + parseInt($('.showcard .title').css('padding-top')) + parseInt($('.showcard .title').css('padding-bottom'))
        var distanceFromBottom = windowHeight - (showcardTop + topicTitleHeight)
        if (distanceFromBottom < MAX_METACODELIST_HEIGHT) {
          $('.metacodeSelect').addClass('onBottomEdge')
        }

        $('.metacodeSelect').show()
        event.stopPropagation()
      }
    }

    var hideMetacodeSelect = function() {
      selectingMetacode = false
      $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
      $('.metacodeTitle').hide()
      $('.showcard .icon').css('z-index', '1')
    }

    if (authorized) {
      $('.showcard .metacodeTitle').click(openMetacodeSelect)
      $('.showcard').click(hideMetacodeSelect)
      $('.metacodeSelect > ul > li').click(function(event) {
        event.stopPropagation()
      })
      $('.metacodeSelect li li').click(metacodeLiClick)

      var bipName = $('.showcard').find('.best_in_place_name')
      bipName.bind('best_in_place:activate', function() {
        var $el = bipName.find('textarea')
        var el = $el[0]

        $el.attr('maxlength', '140')

        $('.showcard .title').append('<div class="nameCounter forTopic"></div>')

        var callback = function(data) {
          $('.nameCounter.forTopic').html(data.all + '/140')
        }
        Countable.live(el, callback)
      })
      bipName.bind('best_in_place:deactivate', function() {
        $('.nameCounter.forTopic').remove()
      })
      bipName.keypress(function(e) {
        const ENTER = 13
        if (e.which === ENTER) { // enter
          $(this).data('bestInPlaceEditor').update()
        }
      })

      // bind best_in_place ajax callbacks
      bipName.bind('ajax:success', function() {
        var name = Util.decodeEntities($(this).html())
        topic.set('name', name)
        topic.trigger('saved')
      })

      // this is for all subsequent renders after in-place editing the desc field
      const bipDesc = $('.showcard').find('.best_in_place_desc')
      bipDesc.bind('ajax:success', function() {
        var desc = $(this).html() === $(this).data('bip-nil')
        ? ''
        : $(this).text()
        topic.set('desc', desc)
        $(this).data('bip-value', desc)
        this.innerHTML = Util.mdToHTML(desc)
        topic.trigger('saved')
      })
      bipDesc.keypress(function(e) {
        // allow typing Enter with Shift+Enter
        const ENTER = 13
        if (e.shiftKey === false && e.which === ENTER) {
          $(this).data('bestInPlaceEditor').update()
        }
      })
    }

    var permissionLiClick = function(event) {
      selectingPermission = false
      var permission = $(this).attr('class')
      topic.save({
        permission: permission,
        defer_to_map_id: null
      })
      $('.showcard .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2))
      $('.showcard .permissionSelect').remove()
    }

    var openPermissionSelect = function(event) {
      if (!selectingPermission) {
        selectingPermission = true
        $(this).addClass('minimize') // this line flips the drop down arrow to a pull up arrow
        if ($(this).hasClass('co')) {
          $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>')
        } else if ($(this).hasClass('pu')) {
          $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>')
        } else if ($(this).hasClass('pr')) {
          $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>')
        }
        $('.showcard .permissionSelect li').click(permissionLiClick)
        event.stopPropagation()
      }
    }

    var hidePermissionSelect = function() {
      selectingPermission = false
      $('.showcard .yourTopic .mapPerm').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
      $('.showcard .permissionSelect').remove()
    }
    // ability to change permission
    var selectingPermission = false
    if (topic.authorizePermissionChange(ActiveMapper)) {
      $('.showcard .yourTopic .mapPerm').click(openPermissionSelect)
      $('.showcard').click(hidePermissionSelect)
    }

    $('.links .mapCount').unbind().click(function(event) {
      $('.mapCount .tip').toggle()
      $('.showcard .hoverTip').toggleClass('hide')
    })
    $('.showcard').unbind('.hideTip').bind('click.hideTip', function() {
      $('.mapCount .tip').hide()
      $('.showcard .hoverTip').removeClass('hide')
    })

    var originalText = $('.showMore').html()
    $('.mapCount .tip .showMore').unbind().toggle(
      function(event) {
        $('.extraText').toggleClass('hideExtra')
        $('.showMore').html('Show less...')
      },
      function(event) {
        $('.extraText').toggleClass('hideExtra')
        $('.showMore').html(originalText)
      })
    }
}

class ReactTopicCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nameEdit: '',
      descEdit: '',
      linkEdit: '',
      embedlyLinkError: false,
      embedlyLinkStarted: false,
      embedlyLinkLoaded: false
    }
  }

  componentDidMount = () => {
    const { topic, ActiveMapper } = this.props
    embedly('on', 'card.rendered', this.embedlyCardRendered)
    topic.get('link') && topic.get('link') !== '' && this.loadLink()
    funcs.bindShowCardListeners(topic, ActiveMapper)
  }

  componentWillUnmount = () => {
    embedly('off')
  }

  componentDidUpdate = () => {
    const { topic } = this.props
    const { embedlyLinkStarted } = this.state
    !embedlyLinkStarted && topic.get('link') && topic.get('link') !== '' && this.loadLink()
  }

  embedlyCardRendered = (iframe, test) => {
    this.setState({embedlyLinkLoaded: true, embedlyLinkError: false})
  }

  resetLinkInput = () => {
    this.setState({linkEdit: ''})
    this.linkInput.focus()
  }

  onLinkChangeHandler = e => {
    this.setState({linkEdit: e.target.value})
  }

  onLinkKeyUpHandler = e => {
    const { addLink } = this.props
    const { linkEdit } = this.state
    let finalLink
    const ENTER_KEY = 13
    if (e.which === ENTER_KEY) {
      // TODO evaluate converting this to '//' no matter what (infer protocol)
      if (linkEdit.slice(0, 7) !== 'http://' &&
      linkEdit.slice(0, 8) !== 'https://' &&
      linkEdit.slice(0, 2) !== '//') {
        finalLink = '//' + linkEdit
      }
      this.setState({linkEdit: ''})
      addLink(finalLink)
    }
  }

  loadLink = () => {
    this.setState({embedlyLinkStarted: true})
    var e = embedly('card', document.getElementById('embedlyLink'))
    if (e.type === 'error') this.setState({embedlyLinkError: true})
  }

  removeLink = () => {
    const { removeLink } = this.props
    this.setState({
      embedlyLinkStarted: false,
      embedlyLinkLoaded: false,
      embedlyLinkError: false
    })
    removeLink()
  }

  render = () => {
    const { topic, ActiveMapper, removeLink } = this.props
    const { linkEdit, embedlyLinkLoaded, embedlyLinkStarted, embedlyLinkError } = this.state
    const values = funcs.buildObject(topic, ActiveMapper)
    var authorizedToEdit = topic.authorizeToEdit(ActiveMapper)

    let classname = 'permission'
    if (authorizedToEdit) {
      classname += ' canEdit'
    } else {
      classname += ' cannotEdit'
    }

    if (topic.authorizePermissionChange(ActiveMapper)) classname += ' yourTopic'
    const hasAttachment = topic.get('link') && topic.get('link') !== ''

    return (
      <div className={classname}>
        <div className={`CardOnGraph ${hasAttachment ? 'hasAttachment' : ''}`} id={`topic_${values.id}`}>
          <span className="title">
            <div className="titleWrapper" id="titleActivator">
              <span className="best_in_place best_in_place_name">
                {values.name}
              </span>
            </div>
          </span>
          <div className="links">
            <div className="linkItem icon">
              <div className={`metacodeTitle ${values.metacode_class}`}>
                {values.metacode}
                <div className="expandMetacodeSelect"></div>
              </div>
              <div className="metacodeImage" style={{backgroundImage: `url(${values.imgsrc})`}} title="click and drag to move card"></div>
              <div className="metacodeSelect" dangerouslySetInnerHTML={{ __html: values.metacode_select }} />
            </div>
            <div className="linkItem contributor">
              <a href={`/explore/mapper/${values.userid}`} target="_blank"><img src={values.userimage} className="contributorIcon" width="32" height="32" /></a>
              <div className="contributorName">{values.username}</div>
            </div>
            <div className="linkItem mapCount">
              <div className="mapCountIcon"></div>
              {values.map_count}
              <div className="hoverTip">Click to see which maps topic appears on</div>
              <div className="tip"><ul>{values.inmaps}</ul></div>
            </div>
            <a href={`/topics/${values.id}`} target="_blank" className="linkItem synapseCount">
              <div className="synapseCountIcon"></div>
              {values.synapse_count}
              <div className="tip">Click to see this topics synapses</div>
            </a>
            <div className={`linkItem mapPerm ${values.mk_permission}`} title={values.permission}></div>
            <div className="clearfloat"></div>
          </div>
          <div className="scroll">
            <div className="desc">
              <span className="best_in_place best_in_place_desc"
                dangerouslySetInnerHTML={{__html: values.desc_html}}
                >
              </span>
              <div className="clearfloat"></div>
            </div>
          </div>
          {hasAttachment && <div className={`embeds ${embedlyLinkLoaded ? '' : 'nonEmbedlyLink'}`}>
            <a href={topic.get('link')} id="embedlyLink" target="_blank" data-card-description="0">
              {topic.get('link')}
            </a>
            {embedlyLinkStarted && !embedlyLinkLoaded && !embedlyLinkError && <div id="embedlyLinkLoader">loading...</div>}
            {authorizedToEdit && <div id="linkremove" onClick={this.removeLink}></div>}
          </div>}
          {authorizedToEdit && !hasAttachment && <div className='attachments'>
            <div className="addLink">
              <div id="addLinkIcon"></div>
              <div id="addLinkInput">
                <input ref={input => this.linkInput = input}
                  placeholder="Enter or paste a link"
                  value={linkEdit}
                  onChange={this.onLinkChangeHandler}
                  onKeyUp={this.onLinkKeyUpHandler}></input>
                {linkEdit && <div id="addLinkReset"></div>}
              </div>
            </div>
          </div>}
          <div className="clearfloat"></div>
        </div>
      </div>)
  }
}

ReactTopicCard.propTypes = {
  topic: PropTypes.object,
  ActiveMapper: PropTypes.object,
  removeLink: PropTypes.func,
  addLink: PropTypes.func
}

export default ReactTopicCard

