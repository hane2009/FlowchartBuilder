var FlowchartShape = function( rect ) {
   "use strict";
   
   this.draw = function( canvas ) {
      if( this._deltaX !== 0 || this._deltaY !== 0 ) {
         canvas.strokeRect( this.posX + this._deltaX - (0.5 * this.width),
                            this.posY + this._deltaY - (0.5 * this.height), this.width, this.height );
      }
      else {
         canvas.strokeRect( this.posX - (0.5 * this.width), this.posY - (0.5 * this.height),
                            this.width, this.height );
         canvas.fillRect( this.posX - (0.25 * this.width), this.posY - (0.25 * this.height),
                          0.5 * this.width, 0.5 * this.height );
      }
   };
   
   this.inBoundaries = function( posX, posY ) {
      return( posX >= this.posX - (0.5 * this.width) &&
              posX <= this.posX + (0.5 * this.width) &&
              posY >= this.posY - (0.5 * this.height) &&
              posY <= this.posY + (0.5 * this.height) );
   };
   
   this.inMouseOverState = function() {
      return this._state === '_mouseover_';
   };
   
   this.onMouseOver = function( canvas, event ) {
      canvas.css('cursor', 'pointer');
      this._state = '_mouseover_';
   };
   
   this.onMouseOut = function( canvas, event ) {
      canvas.css('cursor', 'default');
      this._state = '_default_';
   };
   
   this.onClick = function( canvas, event ) {
      // Do nothing for now...
   };
   
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
   
   this.attachHandlers = function( canvas, eventname, handlers ) {
      while( handlers.length > 0 ) {
         canvas.on(eventname, handlers.pop());
      }
   };
   
   this.onMouseDown = function( canvas, event ) {
      // Save begin position of drag
      this._lastPosX = event.offsetX; this._lastPosY = event.offsetY;
      
      // Save event handlers
      this._savedMouseOutHandlers = this.detachHandlers( canvas, 'mouseout' );
      this._savedMouseUpHandlers = this.detachHandlers( canvas, 'mouseup' );
      this._savedMouseMoveHandlers = this.detachHandlers( canvas, 'mousemove' );
      
      // Bind new event handlers for dragging
      canvas.on('mouseup', this.mouseUpFunc(canvas, false));
      canvas.on('mouseout', this.mouseUpFunc(canvas, true));
      canvas.on('mousemove', this.dragFunc());
      
      canvas.css('cursor', 'move'); };
   
   this.mouseUpFunc = function(canvas, isMouseOut) {
      var self = this;
      return function(event) {
         // Save location
         self.posX = self.posX + self._deltaX;
         self.posY = self.posY + self._deltaY;
         self._deltaX = 0;
         self._deltaY = 0;
         
         // Restore event handlers
         canvas.off('mousemove');
         canvas.off('mouseout');
         canvas.off('mouseup');
         
         self.attachHandlers(canvas, 'mouseout', self._savedMouseOutHandlers );
         self.attachHandlers(canvas, 'mouseup', self._savedMouseUpHandlers );
         self.attachHandlers(canvas, 'mousemove', self._savedMouseMoveHandlers );
         
         self._parent.snapToGrid(self);
         self._parent.draw();
         
         if( isMouseOut ) {
            self.onMouseOut(canvas, event);
            canvas.mouseout();
         }
         else {
            self.onMouseOver(canvas, event);
         }
      };
   };
   
   this.dragFunc = function() {
      var self = this;
      return function(event) {
         self._deltaX = event.offsetX - self._lastPosX;
         self._deltaY = event.offsetY - self._lastPosY;
         $("#debugger", parent.document).html('deltaX: '+self.deltaX+'<br>deltaY: '+self.deltaY);
         self._parent.draw();
      };
   };
   
   this.setParent = function( p, position ) {
      this._parent = p;
      this.setPosition( position );
   };
   
   this.setPosition = function( position ) {
      this.posX = position[0];
      this.posY = position[1];
   };
   
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
