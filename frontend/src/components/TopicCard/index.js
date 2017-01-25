/* global $, CanvasLoader, Countable, Hogan, embedly */
import React, { PropTypes, Component } from 'react'
import { RIETextArea } from 'riek'

import Title from './Title'
import Links from './Links'
import Desc from './Desc'
import Attachments from './Attachments'

const bindShowCardListeners = (topic, ActiveMapper) => {
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
  }

  var hidePermissionSelect = function() {
    selectingPermission = false
    $('.showcard .yourTopic .mapPerm').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
    $('.showcard .permissionSelect').remove()
  }

  var permissionLiClick = function(event) {
    selectingPermission = false
    var permission = $(this).attr('class')
    topic.save({
      permission: permission,
      defer_to_map_id: null
    })
    $('.showcard .mapPerm').removeClass('co pu pr').addClass(permission.substring(0, 2))
    hidePermissionSelect()
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
    }
  )
}

class ReactTopicCard extends Component {
  componentDidMount = () => {
    const { topic, ActiveMapper } = this.props
    bindShowCardListeners(topic, ActiveMapper)
  }

  render = () => {
    const { topic, ActiveMapper } = this.props
    var authorizedToEdit = topic.authorizeToEdit(ActiveMapper)

    let classname = 'permission'
    if (authorizedToEdit) {
      classname += ' canEdit'
    } else {
      classname += ' cannotEdit'
    }

    if (topic.authorizePermissionChange(ActiveMapper)) classname += ' yourTopic'
    const hasAttachment = topic.get('link') && topic.get('link') !== ''

    const topicId = topic.isNew() ? topic.cid : topic.id // TODO should we be using cid here???
    return (
      <div className={classname}>
        <div className={`CardOnGraph ${hasAttachment ? 'hasAttachment' : ''}`} id={`topic_${topicId}`}>
          <Title name={topic.get('name')} onChange={this.props.updateTopic} />
          <Links topic={topic} />
          <Desc desc={topic.get('desc')}
            authorizedToEdit={topic.authorizeToEdit(ActiveMapper)}
            onChange={this.props.updateTopic}
          />
          <Attachments topic={this.props.topic}
            ActiveMapper={this.props.ActiveMapper}
            updateTopic={this.props.updateTopic}
          />
          <div className="clearfloat"></div>
        </div>
      </div>
    )
  }
}

ReactTopicCard.propTypes = {
  topic: PropTypes.object,
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func
}

export default ReactTopicCard
