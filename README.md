

browser-rulers
==============
Be your designer&#39;s best friend.  Rulers and guides for the browser.  Works anywhere &lt;canvas&gt; does.

What does it do?
----------------
![Screenshot](http://i.imgur.com/7ozfe.jpg)

This is a script that adds rulers to the X and Y axis of the browser, from which guides can be dragged to overlay page elements.  Useful for ensuring that your HTML and CSS matches up to whatever mockup you're working from.  Guides save themselves in the URL as you create them, so you can view them in multiple browsers effortlessly.

How To Install?
---------------
Chrome: download the repository to a folder and install it as an extension

Firefox: rulers.js will work as a Greasemonkey user script

IE:  rulers.js works as a bookmarklet (i recommend hosting the script yourself):  
```javascript
    javascript:void(function(scriptSrc){
        var script=document.createElement('script');
        script.src=scriptSrc;script.type='text/javascript';
        document.head.appendChild(script);
    }('http://catto5k.com/a/rulers.js'));
```
Features:
---------
- Tested and working in IE9, Chrome, Firefox.
- X and Y axis rulers with 50, 10, and 5 pixel markers.
- Click and drag from rulers to set a guide.
- Guides are mysteriously easy to select and drag.
- Click and drag a guide to reposition.
- Drag a guide back to the ruler to delete it.
- Guides and Rulers overlay does not block interaction with the page below.
- Guide positions and visibility are saved in URL hash (so you can set in one browser, test in many)
- Guides can be cleared all at once. (push the red button!)
- Create guides at specified locations via a handy form. (push the green button!)