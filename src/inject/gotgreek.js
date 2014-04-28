var gotGreek = function(){
	var	config = {
			googleApiKey:'AIzaSyAICISSmAHfsclKJ4eu5UtbhhtWMLUqxcY',
			googleTranslateUrl:'https://www.googleapis.com/language/translate/v2',
			source: '',
			target: '',
  };

  var currentJob = {
    text: '',
    translation: '',
    range: null,
    x:0,
    y:0
  };

  var cache = {};

	var init = function(){
		rangy.init();

    // support alt-clicking on links to translate them
    jQuery('a').click(function(event){
      if (event.altKey) {
        // holding ALT while clicking on a link will prevent navigation
        event.preventDefault();
        // but it's still desirable to clear the previous selection
        rangy.getSelection().removeAllRanges();
      }
    });

    // clear result box on any click (mousedown)
    jQuery('body').mousedown(function(){
      hideTooltip();
    });

    // display translation of selection (mouseup)
    jQuery('body').mouseup(function(event){
      // Due to race condition triggered by re-clicking on existing selection,
      // we need to add a tiny timeout; see https://code.google.com/p/rangy/issues/detail?id=175
      window.setTimeout(function(){translateListener(event)}, 10);
    });

    jQuery('body').trigger({ type: 'mouseup', button: 0 });
	};

	var translateListener = function(event){
    // only pay attention to left-clicks
		if (event.button!==0) {
      return;
    }

    // no text is selected
    if (rangy.getSelection().isCollapsed){
      if (event.altKey && event.target.nodeName == 'A') {
        // manually select alt-clicked link's text; see http://stackoverflow.com/a/14295222/9621
        var r = rangy.createRange(),
            sel = rangy.getSelection();
        r.selectNodeContents(event.target);
        sel.removeAllRanges();
        sel.addRange(r);
        currentJob.range = r;
      }
      else {
        return;
      }
		}
		// if there is a selection, push it to its bounding limits
		else {
      var r = rangy.getSelection().getRangeAt(0);
			expandToWordBoundary(r);
			currentJob.range = r;
		}

		if(currentJob.range===null){
			rangy.getSelection().removeAllRanges();
			return;
		}

		//TODO instead of toString, go through the range and jump over script tags
		// if what you found is not garbage translate it
		var selection = currentJob.range.toString();
		if (typeof selection !== 'undefined' && /\S/.test(selection) && /\D/.test(selection)){
			currentJob.text = selection;
      var selectionXY = rangy.getSelection().getRangeAt(0).nativeRange.getClientRects()[0];
      currentJob.x = event.clientX || selectionXY.left;
      currentJob.y = event.clientY || selectionXY.bottom - 10;

			rangy.getSelection().setSingleRange(currentJob.range);

			if (cache[currentJob.text]){
				currentJob.translation = cache[currentJob.text];
				showTooltip(currentJob.text, currentJob.translation, currentJob.x, currentJob.y);
        return;
			}

			//send request to Google
			jQuery.ajax({
				url: config.googleTranslateUrl,
				type: 'GET',
				dataType: 'jsonp',
				success: function(response){
          if (response.data && response.data.translations) {
            currentJob.translation = response.data.translations[0].translatedText;
            cache[currentJob.text]=currentJob.translation;
          }
          else if (response.error){
            currentJob.translation = 'Google Translate Error ' + response.error.code + ': <br/>' + response.error.message;
          }
          else {
            currentJob.translation = 'Google Translate: Unknown problem';
          }
				  showTooltip(currentJob.text, currentJob.translation, currentJob.x, currentJob.y);
        },
        error: function(xhr, status){
          currentJob.translation = "Google Translate XHR error";
				  showTooltip(currentJob.text, currentJob.translation, currentJob.x, currentJob.y);
          console.log(xhr);
        },
				data: {
					key: config.googleApiKey,
					source: config.source,
					target: config.target,
					q: currentJob.text,
				}
			});
		}
	};

  var showTooltip = function(text, translation, x, y){
    hideTooltip();
    jQuery('<div id="gotGreek-box" class="gotGreek-box">')
      .html('<p class="translation">' + translation + '</p><hr><p class="text" style="color: LightGray">' + text + '</p>')
      .css('top',(jQuery(document).scrollTop() + y + 10)+'px')
      .css('left',(jQuery(document).scrollLeft() + x + 10)+'px')
      .css( { 'font-family' : 'Arial',
              'z-index': '2147483647',
              'background-color': '#000000',
              'color': ' #e3ce63', /* yellow */
              'position': 'absolute',
              'font-size': '14px',
              'padding': ' 10px',
              'min-width': '10em',
              'max-width': '30em',
              'white-space': ' pre-line',
      })
      .appendTo('body');
  };

  var hideTooltip = function() {
    jQuery('#gotGreek-box').remove();
  }

  var showMessage = function(message) {
    showTooltip(message, 'Got Greek', 0, 0);
    jQuery('.gotGreek-box').fadeOut(3000 || 0, function(){
      jQuery(this).remove();
    });
  }

	// helper function for translateListener, pushes a range to its boundaries
  var expandToWordBoundary = function(range){
    var nonBoundaryPattern = /[^\s:!.,\"\(\)«»%$]/,
        startNodeValue = range.startContainer.nodeValue,
        endNodeValue = range.endContainer.nodeValue,
        start= range.startOffset,
        end = range.endOffset;

    while (start > 0 && startNodeValue && nonBoundaryPattern.test(startNodeValue[start-1])){
      start--;
    }
    while (endNodeValue && end < endNodeValue.length-1 && nonBoundaryPattern.test(endNodeValue[end])){
      end++;
    }
    range.setStart(range.startContainer,start);
    range.setEnd(range.endContainer,end);
    return range;
  };

	/*
	 * The public interface of gotGreek.
	*/
	return {
		boot: function(source, target){
      config.source = source;
      config.target = target;
      showMessage('Loading complete, select a phrase to translate it. Alt-click a link to translate its text.');
      init();
		}
	};
}();
