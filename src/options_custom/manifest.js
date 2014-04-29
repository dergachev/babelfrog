this.languageOptions = function(){
  var featured = {
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish',
    'ru': 'Russian',
  };

  var languages = {
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'eu': 'Basque',
    'be': 'Belarusian',
    'bn': 'Bengali',
    'bs': 'Bosnian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'zh-CN': 'Chinese',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'tl': 'Filipino',
    'fi': 'Finnish',
    'fr': 'French',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'ha': 'Hausa',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hmn': 'Hmong',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'ig': 'Igbo',
    'id': 'Indonesian',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'kn': 'Kannada',
    'km': 'Khmer',
    'ko': 'Korean',
    'lo': 'Lao',
    'la': 'Latin',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'mk': 'Macedonian',
    'ms': 'Malay',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn': 'Mongolian',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'pa': 'Punjabi',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sr': 'Serbian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali',
    'es': 'Spanish',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'zu': 'Zulu'
  };

  var ret = [];
  for(var code in featured) {
    ret.push( { value: code, text: languages[code], group: 'Featured'});
  }
  for(var code in languages) {
    ret.push( { value: code, text: languages[code], group: 'All'});
  }
  return {
      "groups": [
          "Featured", "All",
      ],
      "values": ret
  }
}

this.manifest = {
    "name": "BabelFrog",
    "icon": "../../icons/frog48.png",
    "settings": [
        {
            "tab": i18n.get("information"),
            "group": i18n.get("languages"),
            "name": "srcLang",
            "type": "popupButton",
            "label": "Source language",
            "options": this.languageOptions(),
        },
        {
            "tab": i18n.get("information"),
            "group": i18n.get("languages"),
            "name": "targetLang",
            "type": "popupButton",
            "label": "Target language",
            "options": this.languageOptions(),
        },
        {
            "tab": i18n.get("information"),
            "group": i18n.get("Google Translate"),
            "name": "googleApiKey",
            "type": "text",
            "label": i18n.get("API Key"),
            // "text": i18n.get("x-characters")
        },
        {
            "tab": i18n.get("information"),
            "group": i18n.get("Google Translate"),
            "name": "myDescription",
            "type": "description",
            "text": i18n.get("description")
        },
        {
            "tab": i18n.get("information"),
            "group": i18n.get("Google Translate"),
            "name": "vocalize",
            "type": "checkbox",
            "label": i18n.get("Pronounce word in source language")
        }
    ]

};
