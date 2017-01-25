import React, { PropTypes, Component } from 'react'

const inmaps = (topic) => {
  const inmapsArray = topic.get('inmaps') || []
  const inmapsLinks = topic.get('inmapsLinks') || []

  let html = ''
  if (inmapsArray.length < 6) {
    for (let i = 0; i < inmapsArray.length; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
    const extra = inmapsArray.length - 5
    html += '<li><span class="showMore">See ' + extra + ' more...</span></li>'
    for (let i = 5; i < inmapsArray.length; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li class="hideExtra extraText"><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
  }

  return html
}

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

class Links extends Component {
  componentDidMount = () => {
    bindShowCardListeners(this.props.topic, this.props.ActiveMapper)
  }

  render = () => {
    const { topic } = this.props
    const topicId = topic.isNew() ? topic.cid : topic.id // TODO should we really be using cid here?!?
    const permission = topic.get('permission')
    // the code for this is stored in /views/main/_metacodeOptions.html.erb
    const metacodeSelectHTML = $('#metacodeOptions').html()

    return (
      <div className="links">
        <div className="linkItem icon">
          <div className={`metacodeTitle mbg${topic.get('metacode_id')}`}>
            {topic.getMetacode().get('name')}
            <div className="expandMetacodeSelect"></div>
          </div>
          <div className="metacodeImage" style={{backgroundImage: `url(${topic.getMetacode().get('icon')})`}} title="click and drag to move card"></div>
          <div className="metacodeSelect" dangerouslySetInnerHTML={{ __html: metacodeSelectHTML }} />
        </div>
        <div className="linkItem contributor">
          <a href={`/explore/mapper/${topic.get('user_id')}`} target="_blank"><img src={topic.get('user_image')} className="contributorIcon" width="32" height="32" /></a>
          <div className="contributorName">{topic.get('user_name')}</div>
        </div>
        <div className="linkItem mapCount">
          <div className="mapCountIcon"></div>
          {topic.get('map_count').toString()}
          <div className="hoverTip">Click to see which maps topic appears on</div>
          <div className="tip"><ul>{inmaps(this.props.topic)}</ul></div>
        </div>
        <a href={`/topics/${topicId}`} target="_blank" className="linkItem synapseCount">
          <div className="synapseCountIcon"></div>
          {topic.get('synapse_count').toString()}
          <div className="tip">Click to see this topics synapses</div>
        </a>
        <div className={`linkItem mapPerm ${permission.substring(0, 2)}`} title={permission}></div>
        <div className="clearfloat"></div>
      </div>
    )
  }
}

Links.propTypes = {
  topic: PropTypes.object, // backbone object
  ActiveMapper: PropTypes.object
}

export default Links
