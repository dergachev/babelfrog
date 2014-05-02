gotGreek = function(){};

//============================================================================
// State
//============================================================================

// Default options
gotGreek.config = {};

gotGreek.currentJob = {
  text: '',
  translation: '',
  range: null,
  x:0,
  y:0
};

gotGreek.cache = {};

//============================================================================
// Initialization
//============================================================================

gotGreek.init = function(){
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
    gotGreek.hideTooltip();
  });

  // display translation of selection (mouseup)
  jQuery('body').mouseup(function(event){
    // Due to race condition triggered by re-clicking on existing selection,
    // we need to add a tiny timeout; see https://code.google.com/p/rangy/issues/detail?id=175
    window.setTimeout(function(){
      gotGreek.translateListener(event);
    }, 10);
  });

  jQuery('body').trigger({ type: 'mouseup', button: 0 });
};

gotGreek.setConfig = function(config){
  var defaultConfig = {
    googleTranslateJsonp: true,
    engine: gotGreek.engines.googleTranslateFree,
    successCallback: gotGreek.callbacks.standardSuccesCallback,
    errorCallback: gotGreek.callbacks.standardErrorCallback,
  };

  gotGreek.config = jQuery.extend({}, defaultConfig, config);
  console.log(gotGreek.config);
  return;

  if (typeof gotGreek.config.googleTranslateJsonp === "undefined") {
    // default to true to support bookmarklet case
    gotGreek.config.googleTranslateJsonp = true;
  }

  if (typeof gotGreek.config.engine === "undefined") {
    gotGreek.config.engine = gotGreek.engines.googleTranslate;
  }

  if (typeof gotGreek.config.successCallback === "undefined") {
    gotGreek.config.successCallback = gotGreek.callbacks.standardSuccessCallback;
  }

  if (typeof gotGreek.config.errorCallback === "undefined") {
    gotGreek.config.errorCallback = gotGreek.callbacks.standardErrorCallback;
  }
}

// TODO: update bookmarklet index.html to call boot in the new style, pass in API key
gotGreek.boot = function(){
  gotGreek.init();
  gotGreek.showMessage('Loading complete, select a phrase to translate it. Alt-click a link to translate its text.');
},


//============================================================================
// Callbacks
//============================================================================

gotGreek.callbacks = {};
gotGreek.callbacks.standardSuccessCallback = function(translation) {
  //TODO: simplify this
  var currentJob = gotGreek.currentJob;
  currentJob.translation = translation;
  gotGreek.cache[currentJob.text] = currentJob.translation;
  gotGreek.showTooltip(currentJob.text, currentJob.translation, currentJob.x, currentJob.y);
};

gotGreek.callbacks.standardErrorCallback = function(errorMessage){
  gotGreek.showMessage(errorMessage);
}

//============================================================================
// Tooltip/message helpers
//============================================================================

gotGreek.showTooltip = function(text, translation, x, y){
  gotGreek.hideTooltip();
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

gotGreek.hideTooltip = function() {
  jQuery('#gotGreek-box').remove();
}

gotGreek.showMessage = function(message) {
  gotGreek.showTooltip(message, 'Got Greek', 0, 0);
  jQuery('.gotGreek-box').fadeOut(3000 || 0, function(){
    jQuery(this).remove();
  });
}

//============================================================================
// Rangy helpers
//============================================================================

// helper function for translateListener, pushes a range to its boundaries
gotGreek.expandToWordBoundary = function(range){
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


//============================================================================
// Listener
//============================================================================

gotGreek.translateListener = function(event){

  var currentJob = gotGreek.currentJob;

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
    gotGreek.expandToWordBoundary(r);
    currentJob.range = r;
  }

  if (currentJob.range===null){
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

    if (gotGreek.cache[currentJob.text]){
      currentJob.translation = gotGreek.cache[currentJob.text];
      gotGreek.showTooltip(currentJob.text, currentJob.translation, currentJob.x, currentJob.y);
      return;
    }

    //send request to Google
    gotGreek.invokeTranslationEngine(currentJob);
  }
}

gotGreek.invokeTranslationEngine = function(currentJob){
  gotGreek.config.engine(currentJob.text);
}

//============================================================================
// Translation engines
//============================================================================

gotGreek.engines = {};

// works well for bookmarklet, needs (paid) API key
gotGreek.engines.googleTranslate = function(sourceText){
  jQuery.ajax({
    url:'https://www.googleapis.com/language/translate/v2',
    type: 'GET',
    dataType: gotGreek.config.googleTranslateJsonp ? 'jsonp' : null,
    success: function(response){
      if (response.data && response.data.translations) {
        gotGreek.config.successCallback(response.data.translations[0].translatedText);
        return;
      }

      // Google Translate reports 200 in case of error messages
      if (response.error){
        gotGreek.config.errorCallback('Google Translate Error ' + response.error.code + ': <br/>' + response.error.message);
      }
      else {
        gotGreek.config.errorCallback('Google Translate error: unable to parse response.');
      }
    },
    error: function(xhr, status){
      gotGreek.config.errorCallback("Google Translate XHR error: <br/>"  + status);
    },
    data: {
      key: gotGreek.config.googleApiKey,
      source: gotGreek.config.source,
      target: gotGreek.config.target,
      q: sourceText
    }
  });
}

// Potentially illegitimate use of non-public API; but many other extensions use it too.
gotGreek.engines.googleTranslateFree = function(sourceText){
  jQuery.ajax({
    url:'http://translate.google.com/translate_a/t',
    type: 'GET',
    success: function(response){
      // This URL returns invalid JSON, so we need to sanitize it first
      // [[["dreams","rêves","",""]],[["verb",["dream"],[["dream",["rêver","faire un rêve"],,0.32465246]],"rêver",2]],"fr",,[["dreams",[1],true,false,986,0,1,0]],[["rêves",1,[["dreams",986,true,false],["dream",0,true,false]],[[0,5]],"rêves"]],,[,"rêve",[10],,true],[],17]
      response = response.replace(/,(?=,)/g, ',null');
      response = response.replace(/,\]/g, ',null]');
      response = response.replace(/\[,/g, '[null,');
      response = JSON.parse(response);
      if (response && response[0] && response[0][0] && response[0][0][0]){
        gotGreek.config.successCallback(response[0][0][0]);
        return;
      }

      // Google Translate reports 200 in case of error messages
      if (response.error){
        gotGreek.config.errorCallback('Google Translate Error ' + response.error.code + ': <br/>' + response.error.message);
      }
      else {
        gotGreek.config.errorCallback('Google Translate: unable to parse response.');
      }
    },
    error: function(xhr, status){
      gotGreek.config.errorCallback("Google Translate XHR error: <br/>"  + status);
    },
    data: {
      client:'t',
      hl:'en',
      sc:'2',
      ie:'UTF-8',
      oe:'UTF-8',
      ssel:'0',
      tsel:'0',
      sl: gotGreek.config.source,
      tl: gotGreek.config.target,
      q: sourceText
    }
  });
}
