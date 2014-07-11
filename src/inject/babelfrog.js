var BabelFrog = BabelFrog || function(){};

//============================================================================
// State
//============================================================================

// Default options
BabelFrog.config = {};

BabelFrog.currentJob = {
  text: '',
  translation: '',
  range: null,
  x:0,
  y:0
};

//============================================================================
// Initialization
//============================================================================

BabelFrog.init = function(){
  rangy.init();

  // dismiss tooltip on [Esc] keypress
  jQuery(document).keyup(function(e) {
    var KEYCODE_ESC = 27;
    if (e.keyCode == KEYCODE_ESC) {
      BabelFrog.hideTooltip();
    }
  });

  jQuery("body").keydown(function(event) {
    // trap only Alt key
    if (event.keyCode == 18) {
      jQuery('body').addClass('BabelFrog-alt-held');
    }
  });

  jQuery("body").keyup(function(event) {
      jQuery('body').removeClass('BabelFrog-alt-held');
  });

  // support alt-clicking on links to translate them
  jQuery('a').click(function(event){
    if (event.altKey) {
      // holding ALT while clicking on a link will prevent navigation
      event.preventDefault();
      // but it's still desirable to clear the previous selection
      rangy.getSelection().removeAllRanges();
    }
  });

  var isBabelFrogBox = function(target) {
    var target = jQuery(target);
    return (target.attr('id') == 'BabelFrog-box' || target.parents('#BabelFrog-box').length);
  }

  // clear result box on any click (mousedown)
  jQuery('body').mousedown(function(event){
    // only act on left clicks (on osx, ctrlKey triggers contextMenu too)
    if (event.which != 1 || event.ctrlKey) {
      return true;
    }
    console.log("MOUSEDOWN", event);
    if (isBabelFrogBox(event.target)) {
      // if still collapsed, click should expand
      if (jQuery('#BabelFrog-box div.collapsed').length) {
        jQuery('#BabelFrog-box div.collapsed').removeClass('collapsed');
        event.preventDefault(); // otherwise click forces active selection to clear
        return true;
      } else {
        // if already collapsed (and click not on link), dismiss box
        if (event.target.nodeName == "A") {
          return true;
        } else {
          // fall through, to dismiss box
        }
      }
    }
    // if we get this far, dismiss box
    if (jQuery('#BabelFrog-box').length) {
      // Clear active selection.
      rangy.getSelection().removeAllRanges();
      BabelFrog.hideTooltip();
    }
  });

  // display translation of selection (mouseup)
  jQuery('body').mouseup(function(event){
    if (event.which != 1 || event.ctrlKey) {
      return true;
    }
    if (!isBabelFrogBox(event.target)) {
      // Due to race condition triggered by re-clicking on existing selection,
      // we need to add a tiny timeout; see https://code.google.com/p/rangy/issues/detail?id=175
      window.setTimeout(function(){
        BabelFrog.translateListener(event);
      }, 10);
    }

  });
};

BabelFrog.setConfig = function(config){
  var defaultConfig = {
    googleTranslateJsonp: true,
    engine: BabelFrog.engines.googleTranslateFree,
    successCallback: BabelFrog.callbacks.standardSuccesCallback,
    errorCallback: BabelFrog.callbacks.standardErrorCallback,
  };

  BabelFrog.config = jQuery.extend({}, defaultConfig, config);
  console.log("running BabelFrog.setConfig");
  console.log(BabelFrog.config);

  return;
}

// TODO: update bookmarklet index.html to call boot in the new style, pass in API key
BabelFrog.boot = function(){
  if (!BabelFrog.running) {
    BabelFrog.running = true;
    BabelFrog.init();
    BabelFrog.showMessage('BabelFrog is activated. Select a phrase to translate it. Alt-click a link to translate its text.');
  }
  BabelFrog.processSelection();
},


//============================================================================
// Callbacks
//============================================================================

BabelFrog.callbacks = {};

/**
 * Handles displaying results from translation engine.
 * @param {string} text - The results from the translation engine.
 * @param {array} expanded - The array of html strings to display on expansion.
 */
BabelFrog.callbacks.standardSuccessCallback = function(translation, expanded) {
  var currentJob = BabelFrog.currentJob,
      text = currentJob.text;

  //TODO: simplify this
  currentJob.translation = translation;

  var fromCode = BabelFrog.config.source,
      toCode = BabelFrog.config.target,
      lingueeUrl = BabelFrog.getLingueeUrl(fromCode, toCode, currentJob.text);
      gtUrl = BabelFrog.getGoogleTranslateUrl(fromCode, toCode, currentJob.text);

  if (expanded.length) {
    currentJob.translation = currentJob.translation + "<div class='ellipsis'>…</div>";
  }

  expanded = expanded || [];
  expanded.push('<a target="_blank" href="' + gtUrl + '">G</a>');
  if (lingueeUrl) { // linguee doesn't support all language pairs
    expanded.push('<a target="_blank" href="' + lingueeUrl + '">ℒ</a>');
  }

  console.log("BabelFrog has received translation for the following text:");
  console.log(text);

  BabelFrog.showTooltipExpanded(currentJob.translation, expanded, currentJob.x, currentJob.y);
};

/**
 * Handles displaying error from translation engine.
 * @param {string} errorMessage - The error message from the translation engine.
 */
BabelFrog.callbacks.standardErrorCallback = function(errorMessage){
  BabelFrog.showMessage(errorMessage);
}


//============================================================================
// Tooltip/message helpers
//============================================================================

BabelFrog.getGoogleTranslateUrl = function(fromCode, toCode, query) {
  query = encodeURIComponent(query);
  return "http://translate.google.com#" + fromCode + "/" + toCode + "/" + query;
}

/**
 * Display BabelFrog tooltip with click to expand.
 * @param {string} text - The contents of the tooltip.
 * @param {expanded} html - The html or jquery div to show in initially collapsed state.
 * @param {int} x - The x-coordinate of tooltip, relative to screen.
 * @param {int} y - The y-coordinate of tooltip, relative to screen.
 */
BabelFrog.showTooltipExpanded = function(translation, expanded, x, y){
  BabelFrog.hideTooltip();

  var el = jQuery('<div id="BabelFrog-box" class="BabelFrog-box">')
    .html(translation);

  if (expanded) {
    jQuery('<div class="expanded collapsed">').append(expanded).appendTo(el);
  }

  BabelFrog.drawOverlay(el, x -5, y + 3);
};

BabelFrog.drawOverlay = function(el, x, y){

  x = x + jQuery(document).scrollLeft();
  y = y + jQuery(document).scrollTop();

  // if body positioned relative or absolute; then need to account for its offsets
  if (jQuery.css(document.body, "position") != "static") {
    x = x - jQuery('body').offset().left;
    y = y - jQuery('body').offset().top;
  }

  el.css( { 'left': x + 'px', 'top':  y + 'px' })
    .appendTo('body')
}

BabelFrog.hideTooltip = function() {
  jQuery('#BabelFrog-box').remove();
}

BabelFrog.showMessage = function(message) {
  BabelFrog.showTooltipExpanded(message, null, 10, 10);
  jQuery('.BabelFrog-box').fadeOut(5000 || 0, function(){
    jQuery(this).remove();
  });
}

//============================================================================
// Rangy helpers
//============================================================================

//
BabelFrog.filterSelection = function(text) {
  // collapse multiple blank lines
  return text.replace(/\n\s*\n/g, '\n\n');
}

// helper function for translateListener, pushes a range to its boundaries
BabelFrog.expandToWordBoundary = function(range){
  // TODO: find a cleaner (unicode aware) way of doing this.

  var nonBoundaryPattern = /[^\s:!.,\"\(\)«»%$]/, // any character except punctuation or space
      startNodeValue = range.startContainer.nodeValue,  //text contents of startContainer
      endNodeValue = range.endContainer.nodeValue,  //text contents of endContainer
      start = range.startOffset, //position of start of selection in startContainer; runs between 0 and length-1
      end = range.endOffset; //position of end of selection in endContainer; runs between 1 and length

  if (startNodeValue) {
    while (start > 0 && nonBoundaryPattern.test(startNodeValue[start-1])){
      start--;
    }
  }
  if (endNodeValue) {
    while (end < endNodeValue.length && nonBoundaryPattern.test(endNodeValue[end])){
      end++;
    }
  }
  range.setStart(range.startContainer,start);
  range.setEnd(range.endContainer,end);
  return range;
};

BabelFrog.drawRectangles = function(rects) {
  var drawRect = function(rect, color) {
    var el = jQuery('<div />')
              .css( {
                "position": "absolute",
                "width":(rect.width) + 'px',
                "height":(rect.height) + 'px',
                "border": "1px solid " + color,
                "background": "none",
                "z-index": "9999",
                "-webkit-user-select": "none"
              })
    BabelFrog.drawOverlay(el, rect.left , rect.top);
  }

  drawRect(window.getSelection().getRangeAt(0).getBoundingClientRect(), 'blue');

  console.log(rects);
  for (var i = 0; i < rects.length; i++) {
    var rect = rects[i];
    drawRect(rect, 'red');
    console.log(rect.top);
  }
}


//============================================================================
// Listener
//============================================================================


BabelFrog.translateListener = function(event){
  // only pay attention to left-clicks
  if (event.button!==0) {
    return false;
  }
  // manually select alt-clicked link's text; see http://stackoverflow.com/a/14295222/9621
  if (event.altKey && event.target.nodeName == 'A') {
    var r = rangy.createRange(),
        sel = rangy.getSelection();
    r.selectNodeContents(event.target);
    sel.removeAllRanges();
    sel.addRange(r);
  }

  BabelFrog.processSelection();
}

BabelFrog.processSelection = function() {

  // no text is selected
  if (rangy.getSelection().isCollapsed){
    return;
  }

  // if there is a selection, push it to its bounding limits
  var r = rangy.getSelection().getRangeAt(0);
  BabelFrog.expandToWordBoundary(r);
  rangy.getSelection().setSingleRange(r);

  var currentJob = BabelFrog.currentJob;
  currentJob.range = r;

  // Instead of currentJob.range.toString(), we use the native method as its closer
  // to what the user expects than the rangy version.
  var selection = currentJob.range.nativeRange.toString();

  if (typeof selection !== 'undefined' && /\S/.test(selection) && /\D/.test(selection)){
    currentJob.text = BabelFrog.filterSelection(selection);
    var rects = currentJob.range.nativeRange.getClientRects();

    // In Chrome, these are ordered by top ascending, so we take the last one.
    // This corresponds to the "most specific" "bottom-most" rectangle, which should
    // contain the end of the selection and not much else.
    // To debug, try calling:
    //   BabelFrog.drawRectangles(rects);

    // Ocasionally, the range will end at the beginning of a node that doesn't actually
    // contain any of the selected text (just in case?). In this case, we need to position the tooltip
    // relative to the penultimate node. We check for this via range.endOffset property,
    // which specifies how many characters of the end node are included in the selection.
    // See https://dl.dropbox.com/u/29440342/screenshots/HKANHFEW-2014.06.16-11-14-06.png
    var lastIndex =  (currentJob.range.endOffset == 0) ? rects.length - 2 : rects.length - 1;

    // Align the tooltip under the last rectangle.
    currentJob.y = rects[lastIndex].bottom;
    currentJob.x = rects[lastIndex].left;

    // Each inline span element gets its own rectangle too, so we must align
    // tooltip with the left-most rectangle.
    // See https://dl.dropbox.com/u/29440342/screenshots/MPABGIGR-2014.06.16-12-09-53.png
    for (var i = 0; i < lastIndex; i++) {
      if (currentJob.x > rects[i].left) {
        currentJob.x = rects[i].left;
      }
    }

    //send request to Google
    BabelFrog.invokeTranslationEngine(currentJob);
  }
}

BabelFrog.invokeTranslationEngine = function(currentJob){
  BabelFrog.config.engine(currentJob.text);
}

//============================================================================
// Translation engines
//============================================================================

BabelFrog.engines = {};

// works well for bookmarklet, needs (paid) API key
BabelFrog.engines.googleTranslate = function(sourceText){
  jQuery.ajax({
    url:'https://www.googleapis.com/language/translate/v2',
    type: 'GET',
    dataType: BabelFrog.config.googleTranslateJsonp ? 'jsonp' : null,
    success: function(response){
      if (response.data && response.data.translations) {
        BabelFrog.config.successCallback(response.data.translations[0].translatedText);
        return;
      }

      // Google Translate reports 200 in case of error messages
      if (response.error){
        BabelFrog.config.errorCallback('Google Translate Error ' + response.error.code + ': <br/>' + response.error.message);
      }
      else {
        BabelFrog.config.errorCallback('Google Translate error: unable to parse response.');
      }
    },
    error: function(xhr, status){
      BabelFrog.config.errorCallback("Google Translate XHR error: <br/>"  + status);
    },
    data: {
      key: BabelFrog.config.googleApiKey,
      source: BabelFrog.config.source,
      target: BabelFrog.config.target,
      q: sourceText
    }
  });
}

// Potentially illegitimate use of non-public API; but many other extensions use it too.
BabelFrog.engines.googleTranslateFree = function(sourceText){
  jQuery.ajax({
    url:'http://translate.google.com/translate_a/t',
    type: 'GET',
    dataType: 'json',
    success: function(response){

      if (response && response.sentences && response.sentences.length > 0) {
        var ret = [];
        var expandRet = [];
        for (var i = 0; i < response.sentences.length; i++) {
          ret.push(response.sentences[i].trans);
        }
        ret = ret.join(" ");

        // google translate sends us definitions only if a single word is searched for
        if (response.dict) {
          for (var i = 0; i < response.dict.length; i++) {
            var def = response.dict[i],
                base = def.base_form,
                type = def.pos,
                terms = def.terms.join(", ");

            // Special case: omit definitions that are identical to translation.
            if (terms != ret) {
              expandRet.push("<em>(" + type + ")</em> " + def.terms.join(", "));
            }
          }
        }
        if (expandRet.length) {
          expandRet = ["<ul class='dict'><li>" + expandRet.join("</li><li>") + "</li></ul>"];
        }
        BabelFrog.config.successCallback(ret, expandRet);
        return;
      }

      // Google Translate reports 200 in case of error messages
      if (response.error){
        BabelFrog.config.errorCallback('Google Translate Error ' + response.error.code + ': <br/>' + response.error.message);
      }
      else {
        BabelFrog.config.errorCallback('Google Translate: unable to parse response.');
      }
    },
    error: function(xhr, status){
      BabelFrog.config.errorCallback("Google Translate XHR error: <br/>"  + status);
    },
    data: {
      client:'p',
      hl:'en',
      sc:'2',
      ie:'UTF-8',
      oe:'UTF-8',
      ssel:'0',
      tsel:'0',
      sl: BabelFrog.config.source,
      tl: BabelFrog.config.target,
      q: sourceText
    }
  });
}
