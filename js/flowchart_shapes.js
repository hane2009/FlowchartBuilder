/*!
 * FlowchartBuilder - Shape
 *
 * Copyright 2011, IJsbrand Slob
 * All rights reserved
 */

/*!
 * FlowchartShape
 * Example shape to test functionality.
 */
var FlowchartShape = function( rect ) {
   "use strict";
   
   // Public API
   /*!
    * Draw
    * Draws this shape.
    * Because this is an example shape I opted to draw just the boundaries
    * of the shape while dragging, and the entire shape when in place.
    */
   this.Draw = function( context ) {
      context.lineWidth = 2;
      context.fillStyle = "#000";
      context.strokeStyle = "#000";
      
      if( this._deltaX !== 0 || this._deltaY !== 0 ) {
         context.strokeRect( this.posX + this._deltaX - (0.5 * this.width),
                             this.posY + this._deltaY - (0.5 * this.height), this.width, this.height );
         
         context.strokeStyle = "#f00";
         context.lineWidth = 1;
         context.beginPath();
         context.moveTo( this.posX + this._deltaX - 2.5, this.posY + this._deltaY - 2.5 );
         context.lineTo( this.posX + this._deltaX + 2.5, this.posY + this._deltaY + 2.5 );
         context.moveTo( this.posX + this._deltaX - 2.5, this.posY + this._deltaY + 2.5 );
         context.lineTo( this.posX + this._deltaX + 2.5, this.posY + this._deltaY - 2.5 );
         context.closePath();
         context.stroke();
      }
      else {
         //context.clearRect( this.posX - (0.5 * this.width), this.posY - (0.5 * this.height),
         //                   this.width, this.height );
         context.strokeRect( this.posX - (0.5 * this.width), this.posY - (0.5 * this.height),
                             this.width, this.height );
         context.fillRect( this.posX - (0.25 * this.width), this.posY - (0.25 * this.height),
                           0.5 * this.width, 0.5 * this.height );
      }
   };
   
   /*!
    * In Boundaries?
    * Tests if a point is inside this shape's boundaries.
    */
   this.InBoundaries = function( posX, posY ) {
      return( posX >= this.posX - (0.5 * this.width) &&
              posX <= this.posX + (0.5 * this.width) &&
              posY >= this.posY - (0.5 * this.height) &&
              posY <= this.posY + (0.5 * this.height) );
   };
   
   /*!
    * In Mouseover State?
    * Checks if this shape is currently in mouseover state.
    * TODO: Should be refactored.
    */
   this.InMouseOverState = function() {
      return this._state === '_mouseover_';
   };
   
   /*!
    * On Mouseover
    * Event handler for onmouseover events.
    * In test shape, just switch the cursor to a pointer and toggle state.
    */
   this.OnMouseOver = function( canvas, event ) {
      canvas.css('cursor', 'pointer');
      this._state = '_mouseover_';
   };
   
   /*!
    * On Mouseout
    * Event handler for onmouseout events.
    * In test shape, just switch the cursor back to default and toggle state.
    */
   this.OnMouseOut = function( canvas, event ) {
      canvas.css('cursor', 'default');
      this._state = '_default_';
   };
   
   /*!
    * On Click
    * Event handler for click events.
    * In test shape, don't do anyting.
    */
   this.OnClick = function( canvas, event ) {
   };
   
   /*!
    * On Mousedown
    * Event handler for mousedown events.
    * In test shape: Start dragging.
    * TODO: Dragging should be a default function for all shapes.
    */
   this.OnMouseDown = function( canvas, event ) {
      // Save begin position of drag
      this._lastPosX = event.offsetX; this._lastPosY = event.offsetY;
      
      // Save currently attached event handlers.
      this._savedMouseOutHandlers = this.detachHandlers( canvas, 'mouseout' );
      this._savedMouseUpHandlers = this.detachHandlers( canvas, 'mouseup' );
      this._savedMouseMoveHandlers = this.detachHandlers( canvas, 'mousemove' );
      
      // Bind new event handlers for dragging purposes.
      canvas.on('mouseup', this.mouseUpFunc(canvas, false));
      canvas.on('mouseout', this.mouseUpFunc(canvas, true));
      canvas.on('mousemove', this.dragFunc());
      
      // Change the cursor to show that we're dragging.
      canvas.css('cursor', 'move');
      
      // Free occupied grid points...
      this._parent.removeFromGrid( this );
   };
   
   /*!
    * Get Occupied Gridpoints
    */
   this.GetOccupiedGridpoints = function( gridSize ) {
      var x = 0,
          y = 0,
          minPos = 0,
          maxPos = 0,
          gridPoints = [];
      
      minPos = this._parent.FindNearestGridPoint( [this.posX - this.width * 0.5, this.posY - this.height * 0.5 ] );
      maxPos = this._parent.FindNearestGridPoint( [this.posX + this.width * 0.5, this.posY + this.height * 0.5 ] );
      for( x = maxPos[0]; x >= minPos[0]; x -= gridSize[0] ) {
         for( y = maxPos[1]; y >= minPos[1]; y -= gridSize[1] ) {
            gridPoints.push( [x,y] );
         }
      }
      return gridPoints;
   };
   
   /*!
    * Set Parent
    */
   this.SetParent = function( p ) {
      this._parent = p;
   };
   
   /*!
    * Set Position
    */
   this.SetPosition = function( position ) {
      this.posX = position[0];
      this.posY = position[1];
   };
   
   /*!
    * Constructor
    */
   this.__init__ = function() {
      this.ID = -1;
      
      this.width = rect[0];
      this.height = rect[1];
      
      this._state = '_default_';
      
      // Dragging stuff
      this._lastPosX = 0;
      this._lastPosY = 0;
      this._deltaX = 0;
      this._deltaY = 0;
      this._savedMouseMoveHandlers = [];
      this._savedMouseUpHandlers = [];
      this._savedMouseOutHandlers = [];
   };
   
   // Private API
   /*!
    * Split text
    * Split the text into lines.
    */
   this.splitText = function( text ) {
      var lines = new Array();
      do {
         lines.push( text.substr( 0, 12 ).replace(/^\s+|\s+$/g, '') );
         text = text.substr( 12 );
      } while( text.length > 0 );
      
      
      return lines;
   };
   
   /*!
    * Draw Text
    * Draws an array of lines.
    */
   this.drawText = function( lines, context, midPosX, midPosY ) {
      var offsetY = -(0.5 * FONT_SIZE) * (lines.length - 1),
          i = 0;
      context.fillStyle = "#000";
      for( i = 0; i < lines.length; i += 1 ) {
         context.fillText( lines[i], midPosX, midPosY + offsetY );
         offsetY += FONT_SIZE;
      }
   };
   
   /*!
    * Detach Handlers
    * Detaches eventhandlers bound to event from canvas.
    * Returns all detached event handlers as an array.
    */
   this.detachHandlers = function( canvas, eventname ) {
      var detachedHandlers = [],
          events = canvas.data('events'),
          name = '';
      for( name in events ) {
         if( events.hasOwnProperty(name) ) {
            if( name === eventname ) {
               while( events[eventname].length > 0 ) {
                  detachedHandlers.push( events[eventname].pop() );
               }
            }
         }
      }
      canvas.data('events', events);
      
      return detachedHandlers;
   };
   
   /*!
    * Attach Handlers
    * Bind a list of event handlers to eventname on canvas.
    */
   this.attachHandlers = function( canvas, eventname, handlers ) {
      while( handlers.length > 0 ) {
         canvas.on(eventname, handlers.pop());
      }
   };
   
   /*!
    * Mouse Up Functor
    * Returns a function that handles mouse up events. Used for dragging.
    * TODO: Dragging should be a default function for all shapes.
    */
   this.mouseUpFunc = function(canvas, isMouseOut) {
      var self = this;
      return function(event) {
         // Save new location
         self.posX = self.posX + self._deltaX;
         self.posY = self.posY + self._deltaY;
         self._deltaX = 0;
         self._deltaY = 0;
         
         // Restore event handlers to canvas
         canvas.off('mousemove');
         canvas.off('mouseout');
         canvas.off('mouseup');
         
         self.attachHandlers(canvas, 'mouseout', self._savedMouseOutHandlers );
         self.attachHandlers(canvas, 'mouseup', self._savedMouseUpHandlers );
         self.attachHandlers(canvas, 'mousemove', self._savedMouseMoveHandlers );
         
         // Snap to grid and refresh
         self._parent.snapToGrid(self);
         self._parent.Draw();
         
         // If the mouse moves outside the canvas, make sure to fire
         // mouseout events on this shape, and on the originally bound mouseout
         // event handlers of the canvas.
         if( isMouseOut ) {
            self.OnMouseOut(canvas, event);
            canvas.mouseout();
         }
         else {
            self.OnMouseOver(canvas, event);
         }
      };
   };
   
   /*!
    * Drag Functor
    * Returns a function that handles drag events.
    * TODO: Dragging should be a default function for all shapes.
    */
   this.dragFunc = function() {
      var self = this;
      return function(event) {
         self._deltaX = event.offsetX - self._lastPosX;
         self._deltaY = event.offsetY - self._lastPosY;
         $("#debugger", parent.document).html('deltaX: '+self._deltaX+'<br>deltaY: '+self._deltaY);
         self._parent.Draw();
      };
   };
   
   // Call the constructor
   this.__init__();
};

var Action = function( name ) {
   "use strict";
   
   // Initialize Action as a subclass of FlowchartShape.
   FlowchartShape.call(this,[8*FONT_SIZE,FONT_SIZE]);
   
   // Public API
   /*!
    * Draw
    * TODO: Add comments
    */
   this.Draw = function( context ) {
      context.lineWidth = 2;
      context.fillStyle = "#000";
      context.strokeStyle = "#000";
      
      context.clearRect( this.posX + this._deltaX - this.width * 0.5,
                         this.posY + this._deltaY - this.height * 0.5,
                         this.width, this.height );
      this.drawText( this._lines, context, this.posX + this._deltaX, this.posY + this._deltaY );
      context.strokeRect( this.posX + this._deltaX  - this.width * 0.5,
                          this.posY + this._deltaY - this.height * 0.5,
                          this.width, this.height );
   };
   
   /*!
    * Constructor
    */
   this.__init__ = function() {
      this._name = name;
      this._lines = this.splitText( name );
      this.width = 8 * FONT_SIZE;
      this.height = (this._lines.length + 1) * FONT_SIZE;
   };
   
   // Call the constructor
   this.__init__();
};

var Choice = function( name ) {
   "use strict";
   
   // Initialize Choice as a subclass of FlowchartShape.
   FlowchartShape.call(this,[8*FONT_SIZE,FONT_SIZE]);
   
   // Public API
   /*!
    * Draw
    * TODO: Add comments
    */
   this.Draw = function( context ) {
      context.lineWidth = 2;
      context.fillStyle = "#fff";
      context.strokeStyle = "#000";
      
      context.beginPath();
      context.moveTo( this.posX + this._deltaX, this.posY + this._deltaY - this.height * 0.5 );
      context.lineTo( this.posX + this._deltaX + this.width * 0.5, this.posY + this._deltaY );
      context.lineTo( this.posX + this._deltaX, this.posY + this._deltaY + this.height * 0.5 );
      context.lineTo( this.posX + this._deltaX - this.width * 0.5, this.posY + this._deltaY );
      context.lineTo( this.posX + this._deltaX, this.posY + this._deltaY - this.height * 0.5 );
      context.fill();
      context.stroke();
      context.closePath();
      this.drawText( this._lines, context, this.posX + this._deltaX, this.posY + this._deltaY );
   };
   
   /*!
    * In Boundaries?
    * Tests if a point is inside this shape's boundaries.
    */
   this.InBoundaries = function( posX, posY ) {
      var A = [],
          B = [],
          C = [],
          x = [];
      
      // Inside rectangle of boundaries...
      if( posX >= this.posX - (0.5 * this.width) &&
          posX <= this.posX + (0.5 * this.width) &&
          posY >= this.posY - (0.5 * this.height) &&
          posY <= this.posY + (0.5 * this.height) ) {
         // ... and inside actual boundaries.
         // Determine if point x (posX,posY) is within the absolute triangle
         //
         // C
         // |\
         // | \
         // |  \
         // | x \
         // |    \
         // A-----B
         A = [this.posX, this.posY];
         B = [this.posX + this.width * 0.5, this.posY];
         C = [this.posX, this.posY + this.height * 0.5];
         x = [Math.abs( this.posX - posX ), Math.abs( this.posY - posY )];
         return x[1] <= Math.ceil(((C[1] - A[1]) / (B[0] - A[0])) * (B[0] - A[0] - x[0]));
      }
      return false;
   };
   
   /*!
    * Get Occupied Gridpoints
    */
   this.GetOccupiedGridpoints = function( gridSize ) {
      var x = 0,
          y = 0,
          minPos = 0,
          maxPos = 0,
          gridPoints = [];
      
      minPos = this._parent.FindNearestGridPoint( [this.posX - this.width * 0.5, this.posY - this.height * 0.5 ] );
      maxPos = this._parent.FindNearestGridPoint( [this.posX + this.width * 0.5, this.posY + this.height * 0.5 ] );
      for( x = maxPos[0]; x >= minPos[0]; x -= gridSize[0] ) {
         for( y = maxPos[1]; y >= minPos[1]; y -= gridSize[1] ) {
            if( this.InBoundaries( x, y ) ) {
               gridPoints.push( [x,y] );
            }
            else if( this.getDistanceToBoundary(x,y) < (gridSize[0] + gridSize[1]) / 4) {
               gridPoints.push( [x,y] );
            }
         }
      }
      return gridPoints;
   };
   
   /*!
    * Constructor
    */
   this.__init__ = function() {
      this._name = name;
      this._lines = this.splitText( name );
      this.width = 9 * FONT_SIZE;
      this.height = (this._lines.length + 1) * FONT_SIZE;
   };
   
   // Private API
   this.getDistanceToBoundary = function( posX, posY ) {
      var A = [],
          B = [],
          C = [],
          x = [];
      // Determine Y position of boundary at posX
      //
      // C
      // |\
      // | \
      // |  \
      // | x \
      // |    \
      // A-----B
      A = [this.posX, this.posY];
      B = [this.posX + this.width * 0.5, this.posY];
      C = [this.posX, this.posY + this.height * 0.5];
      x = [Math.abs( this.posX - posX ), Math.abs( this.posY - posY )];
      return Math.abs(x[1] - Math.ceil(((C[1] - A[1]) / (B[0] - A[0])) * (B[0] - A[0] - x[0])));
   };
   // Call the constructor
   this.__init__();
};

var Process = function( name ) {
   "use strict";
   
   // Initialize Process as a subclass of FlowchartShape.
   FlowchartShape.call(this,[8*FONT_SIZE,FONT_SIZE]);
   
   // Public API
   /*!
    * Draw
    * TODO: Add comments
    */
   this.Draw = function( context ) {
      context.lineWidth = 2;
      context.fillStyle = "#000";
      context.strokeStyle = "#000";
      
      context.clearRect( this.posX + this._deltaX - this.width * 0.5,
                         this.posY + this._deltaY - this.height * 0.5,
                         this.width, this.height );
      this.drawText( this._lines, context, this.posX + this._deltaX, this.posY + this._deltaY );
      context.strokeRect( this.posX + this._deltaX - (this.width - FONT_SIZE) * 0.5,
                          this.posY + this._deltaY - this.height * 0.5,
                          this.width - FONT_SIZE, this.height );
      context.strokeRect( this.posX + this._deltaX - this.width * 0.5,
                          this.posY + this._deltaY - this.height * 0.5,
                          this.width, this.height );
   };
   
   /*!
    * Constructor
    */
   this.__init__ = function() {
      this._name = name;
      this._lines = this.splitText( name );
      this.width = 9 * FONT_SIZE;
      this.height = (this._lines.length + 1) * FONT_SIZE;
   };
   
   // Call the constructor
   this.__init__();
};

var Document = function( name ) {
   "use strict";
   
   // Initialize Document as a subclass of FlowchartShape.
   FlowchartShape.call(this,[8*FONT_SIZE,FONT_SIZE]);
   
   // Public API
   /*!
    * Draw
    * TODO: Add comments
    */
   this.Draw = function( context ) {
      context.lineWidth = 2;
      context.fillStyle = "#fff";
      context.strokeStyle = "#000";
      
      context.beginPath();
      context.moveTo( this.posX + this._deltaX - this.width * 0.5, this.posY + this._deltaY + this.height * 0.4 );
      context.lineTo( this.posX + this._deltaX - this.width * 0.5, this.posY + this._deltaY - this.height * 0.5 );
      context.lineTo( this.posX + this._deltaX + this.width * 0.5, this.posY + this._deltaY - this.height * 0.5 );
      context.lineTo( this.posX + this._deltaX + this.width * 0.5, this.posY + this._deltaY + this.height * 0.2 );
      context.bezierCurveTo( this.posX + this._deltaX + this.width * 0.25, this.posY + this._deltaY + this.height * 0.2,
                             this.posX + this._deltaX - this.width * 0.25, this.posY + this._deltaY + this.height * 0.8,
                             this.posX + this._deltaX - this.width * 0.5, this.posY + this._deltaY + this.height * 0.4 );
      context.fill();
      context.stroke();
      context.closePath();
      
      this.drawText( this._lines, context, this.posX + this._deltaX, this.posY + this._deltaY );
   };
   
   /*!
    * Constructor
    */
   this.__init__ = function() {
      this._name = name;
      this._lines = this.splitText( name );
      this.width = 9 * FONT_SIZE;
      this.height = (this._lines.length + 1) * FONT_SIZE;
   };
   
   // Call the constructor
   this.__init__();
};
