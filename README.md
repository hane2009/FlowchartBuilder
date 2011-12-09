Introduction
------------
FlowchartBuilder is a library that can be used to build a flowchart on HTML Canvas.

State of source code
--------------------
It is currently in a state where you can drag & drop shapes on a grid, not much but something.
The code needs some cleaning up so I can add several flowchart shapes.

Next 5 items of TODO list
-------------------------
 * Fix the grid so I can determine if a shape is 'over' multiple grid points
 * Fix the grid so it displays more nicely, I'm thinking grid lines, with 'main' gridlines every 5 or so
 * Add shapes for flowchart items to set of shapes
 * Fix javascript inheritance to make dragging/dropping 'default behaviour' of all shapes.
 * Allow new shapes to be placed from some kind of 'toolbar'

Testing
-------
You can use the included webserver.py to start a webserver on port 8080 that can be used to
test the source code. I have included a webserver because Google Chrome does not allow javascript
to be executed between frames when using the file:// protocol. This is probably a bug in chrome but
including a webserver seemed to be the quickest workaround to get stuff working.

Why are you using an iframe?
----------------------------
To be honest, the very first tests did not include an iframe, but this causes a small ugly bug in
Google Chrome. When dragging an element, Chrome would force the cursor to be a text-selection cursor.
The problem is described here on [Stack Overflow] [sochromebug]. The solution to this is to return false
on selection start. Because I still want to be able to select text on other elements of the page I tried this:

    $("canvas").mouseover( function() {
       document.onselectstart = function() { return false; };
    });
    $("canvas").mouseout( function() {
       document.onselectstart = function() { return true; };
    });

This seems to work fine, the first time. But after one mouseout event, the cursor seems to be changing again.
The best solution I could think of is to use an iframe, and inside this iframe set

    document.onselectstart = function() { return false; };

so that when the cursor is inside the iframe, it does not change to a text-selection cursor. This seems to hold
pretty well.

Why would you need javascript communication between the iframe and its parent document?
---------------------------------------------------------------------------------------
The flowchart builder should hold pretty well when not being able to communicate with its parent document,
there are two things that wont work:

 1. Even if there is a debugger output window on the parent page, it wouldn't display anything.
 2. The resize functionality would be broken.

For resizing I have chosen to use the jquery ui resizable plugin. This plugin wraps the canvas in a container
and triggers a custom event when resizing. I use this event to update the width and height attributes of the 
canvas, and of the parent iframe. This is necessary for the canvas because without it the canvas would be zooming,
e.g. the canvas itself is 200x200, but its viewport is 400x400, making it look like you have zoomed out bf 50%.
This is necessary for the parent iframe for obvious reasons. I do resize the parent iframe a bit bigger than the 
actual canvas, because otherwize the mouse would go out of the iframe boundary too fast when making the canvas
bigger.

License
-------
Copyright 2011. [IJsbrand Slob] [huppie].
Do not copy this code. Send me a notification if you would like to copy it. For now, all rights reserved as 
I have not yet determined how I would like to license it.

[huppie]:http://ijsbrandslob.com/
[sochromebug]:http://stackoverflow.com/questions/2745028/chrome-sets-cursor-to-text-while-dragging-why
