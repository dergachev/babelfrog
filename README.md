BabelFrog
==========

A Google Chrome extension to help you learn a language as you browse the web. 
Uses Google Translate to translate the selected text.

![](http://babelfrog.com/img/babelfrog-demo-4.gif)

For usage instructions, see [http://babelfrog.com/help](http://babelfrog.com/help).

Installation
------------

The easiest way to run BabelFrog is to install it via the [Chrome Web
Store](https://chrome.google.com/webstore/detail/babelfrog/jnhmkblbgggfgeebimebebnkhgnagnpj).

To install from source, clone this repository and then load it to chrome as an "Unpacked extension":

```
cd ~/code  #  or wherever you put your cloned github repos
git clone https://github.com/dergachev/babelfrog.git
```

Now open Chrome's extension management:

![](https://raw.githubusercontent.com/dergachev/babelfrog/master/screenshots/chrome-screenshot-tools-extensions.png)

And add the "Unpacked extension":

![](https://raw.githubusercontent.com/dergachev/babelfrog/master/screenshots/chrome-load-unpacked-screenshot.png)

Keep in mind that if you edit certain files (like manifest.json,
background.html), the changes will not be picked up by Chrome until you reload
the Extensions management page (chrome://extensions/), which auto-reloads all
unpacked extensions.

See [DEVNOTES.md](https://github.com/dergachev/babelfrog/blob/master/DEVNOTES.md) for
other developer instructions.
