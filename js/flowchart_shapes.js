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
      if( this._deltaX !== 0 || this._deltaY !== 0 ) {
         context.strokeRect( this.posX + this._deltaX - (0.5 * this.width),
                             this.posY + this._deltaY - (0.5 * this.height), this.width, this.height );
      }
      else {
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
         $("#debugger", parent.document).html('deltaX: '+self.deltaX+'<br>deltaY: '+self.deltaY);
         self._parent.Draw();
      };
   };
   
   // Call the constructor
   this.__init__();
};
