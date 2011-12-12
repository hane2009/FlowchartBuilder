/*!
 * FlowchartBuilder - Canvas
 *
 * Copyright 2011, IJsbrand Slob
 * All rights reserved
 */
// Set default font size, used by shapes.
var FONT_SIZE = 24;

/*!
 * FlowchartCanvas
 * Encapsulates a HTML canvas, handles all tasks and events related
 * to the canvas.
 */
var FlowchartCanvas = function(jqCanvas, jqIFrame, gridSize) {
   "use strict";
   
   // Public API
   /*!
    * Add Shape
    * Tries to add a shape at the specified position. Then snaps it to
    * the grid.
    */
   this.AddShape = function( pos, shape ) {
      shape.SetParent( this );
      shape.SetPosition( pos );
      shape.ID = this._shapes.length;
      this._shapes.push(shape);
      this.snapToGrid( shape );
   };
   
   /*!
    * Draw
    * Clears the canvas and re-draws the grid and contained
    * shapes.
    */
   this.Draw = function() {
      var context = this.get2dContext(),
          i = 0,
          showGridpoints = false;
      // Clear canvas
      context.clearRect( 0,0, this._width, this._height );
      
      this.drawGrid( context );
      
      for( i = 0; i < this._shapes.length; i += 1 ) {
         this._shapes[i].Draw( context );
      }
      
      if( showGridpoints === true ) {
         this.showGridPoints( context );
      }
   };
   
   /*!
    * Find Nearest Gridpoint
    * Find the nearest gridpoint to a position, not considering
    * whether the grid location is occupied.
    */
   this.FindNearestGridPoint = function( pos ) {
      var nearestGridPoint = pos,
          remainder = 0;
      
      var remainder = pos[0] % this._gridSize[0];
      nearestGridPoint[0] = pos[0] - remainder;
      if( Math.round( remainder / this._gridSize[0]  ) !== 0 ) {
         nearestGridPoint[0] += this._gridSize[0];
      }
      
      remainder = pos[1] % this._gridSize[1];
      nearestGridPoint[1] = pos[1] - remainder;
      if( Math.round( remainder  / this._gridSize[1] ) !== 0 ) {
         nearestGridPoint[1] += this._gridSize[1];
      }
      
      return nearestGridPoint;
   };
   
   /*!
    * Constructor
    */
   this.__init__ = function() {
      jqCanvas.resizable({
         minHeight: 50,
         minWidth: 50,
         grid: gridSize,
         resize: this.resizeFunc()
      });
      jqCanvas.on('mousemove', this.mouseMoveFunc() );
      jqCanvas.on('mousedown', this.mouseDownFunc() );
      jqCanvas.on('click', this.clickFunc() );
      
      this._jqCanvas = jqCanvas;
      this._jqIFrame = jqIFrame;
      this._shapes = [];
      this._gridSize = gridSize;
      this._grid = [];
      this.resize( jqCanvas.width(), jqCanvas.height() );
   };
    
   // Private API
   /*!
    * Get 2D Context
    * Get the canvas' 2d context and initialize it
    * to proper default values.
    */
   this.get2dContext = function() {
      // Get the canvas' 2d context.
      var context = jqCanvas.get()[0].getContext('2d');
      if( !context ) {
         return;
      }
      
      // Add proper defaults
      context.lineWidth = 2;
      
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = FONT_SIZE + 'px sans-serif';
      
      return context;
   };
   
   /*!
    * Draw Grid
    */
   this.drawGrid = function( context ) {
      var i = 0,
          x = 0,
          y = 0,
          pos = 0;
      context.lineWidth = 1;
      for( x = 1; x * this._gridSize[0] < this._width; x += 1 ) {
         if( x % 5 == 0 ) {
            context.strokeStyle = "#ccc";
         }
         else {
            context.strokeStyle = "#eee";
         }
         pos = x * this._gridSize[0] + 0.5;
         context.beginPath();
         context.moveTo( pos, 0 );
         context.lineTo( pos, this._height );
         context.closePath();
         context.stroke();
      }
      
      for( y = 1; y * this._gridSize[1] < this._height; y += 1 ) {
         if( y % 5 == 0 ) {
            context.strokeStyle = "#ccc";
         }
         else {
            context.strokeStyle = "#eee";
         }
         pos = y * this._gridSize[1] + 0.5;
         context.beginPath();
         context.moveTo( 0, pos );
         context.lineTo( this._width, pos );
         context.closePath();
         context.stroke();
      }
   };
   
   this.showGridPoints = function( context ) {
      var i = 0,
          shapeID = -1,
          occupiedGridpoints = [],
          occupiedGridpoint = [],
          availableGridpoints = [],
          freePoint = [];
      
      // Show grid points that are currently occupied.
      for( shapeID = 0; shapeID < this._shapes.length; shapeID += 1 ) {
         // Each shape has its own set of grid points.
         occupiedGridpoints = this._grid[shapeID];
         for( i = 0; i < occupiedGridpoints.length; i += 1 ) {
            occupiedGridpoint = occupiedGridpoints[i];
            
            context.strokeStyle = "#f00";
            context.beginPath();
            context.moveTo( occupiedGridpoint[0] - 2.5, occupiedGridpoint[1] - 2.5 );
            context.lineTo( occupiedGridpoint[0] + 2.5, occupiedGridpoint[1] + 2.5 );
            context.moveTo( occupiedGridpoint[0] - 2.5, occupiedGridpoint[1] + 2.5 );
            context.lineTo( occupiedGridpoint[0] + 2.5, occupiedGridpoint[1] - 2.5 );
            context.closePath();
            context.stroke();
         }
      }
      
      // Show grid points that are currently 'free'.
      var availableGridpoints = this.getAvailableGridpoints();
      for( i = 0; i < availableGridpoints.length; i += 1 ) {
         freePoint = availableGridpoints[i];
         
         context.fillStyle = "#0f0";
         context.strokeStyle = "#0f0";
         context.fillRect( freePoint[0] - 3, freePoint[1] - 3, 6, 6 );
      }
   };
   
   /*!
    * Is Valid Gridpoint
    */
   this.isValidGridpoint = function( point, deltaGrid ) {
      var i = 0,
          o = 0,
          gridpoint = [],
          // Flatten the grid to a single dimensional array:
          occupiedGridpoints = [].concat.apply([],this._grid);
      
      for( i = 0; i < deltaGrid.length; i += 1 ) {
         gridpoint = [point[0] + deltaGrid[i][0], point[1] + deltaGrid[i][1]];
         if( occupiedGridpoints.containsPoint( gridpoint ) ) {
            return false;
         }
      }
      
      return true;
   };
   
   /*!
    * Get Available Gridpoints
    */
   this.getAvailableGridpoints = function() {
      var x = 0,
          y = 0,
          gridpoint = [],
          // Flatten the grid to a single dimensional array:
          occupiedGridpoints = [].concat.apply([],this._grid),
          availableGridpoints = [];
      
      for( x = 0; x <= this._width; x += this._gridSize[0] ){
         for( y = 0; y <= this._height; y += this._gridSize[1] ) {
            gridpoint = [x,y];
            if( !occupiedGridpoints.containsPoint( gridpoint ) ){
               availableGridpoints.push( gridpoint );
            }
         }
      }
      
      return availableGridpoints;
   };
   
   /*!
    * Find Free Gridpoint
    * Finds the nearest gridpoint that is not occupied.
    */
   this.findFreeGridpoint = function( pos, deltaGrid ) {
      var gridpoint = this.FindNearestGridPoint( pos ),
          availableGridpoints = [],
          gridpointsPerDistance = [],
          i = 0,
          distance = 0;
      
      if( ! this.isValidGridpoint( gridpoint, deltaGrid ) ) {
         availableGridpoints = this.getAvailableGridpoints();
         // Brute force solution...
         // Determine distance to grid points
         gridpointsPerDistance = {};
         for( i = 0; i < availableGridpoints.length; i += 1 ) {
            distance = Math.abs(gridpoint[0] - availableGridpoints[i][0]) / this._gridSize[0] +
                           Math.abs(gridpoint[1] - availableGridpoints[i][1]) / this._gridSize[1];
            
            if( !gridpointsPerDistance.hasOwnProperty(distance) ) {
               gridpointsPerDistance[distance] = [];
            }
            gridpointsPerDistance[distance].push(availableGridpoints[i]);
         }
         
         // The keys are automagically sorted, a for...in should start with distance 0 if available.
         for( distance in gridpointsPerDistance ) {
            if( gridpointsPerDistance.hasOwnProperty(distance) ) {
               for( i = 0; i < gridpointsPerDistance[distance].length; i += 1 ) {
                  if( this.isValidGridpoint( gridpointsPerDistance[distance][i], deltaGrid ) ) {
                     return gridpointsPerDistance[distance][i];
                  }
               }
            }
         }
         alert('No available gridpoint found...');
      }
      
      return gridpoint;
   };
   
   /*!
    * Update Grid
    */
   this.updateGrid = function( shape ) {
      this._grid[shape.ID] = shape.GetOccupiedGridpoints( this._gridSize );
   };
   
   /*!
    * Remove From Grid
    */
   this.removeFromGrid = function( shape ) {
      this._grid[shape.ID] = [];
   };
   
   /*!
    * Snap To Grid
    * Snaps a shape to the grid.
    */
   this.snapToGrid = function( shape ) {
      var currentPosition = [shape.posX, shape.posY],
          deltaGrid = [],
          gridPosition = 0;
      
      // Get delta grid from shape...
      shape.SetPosition( [0,0] );
      deltaGrid = shape.GetOccupiedGridpoints( this._gridSize );
      shape.SetPosition( currentPosition );
      
      gridPosition = this.findFreeGridpoint( [shape.posX, shape.posY], deltaGrid );
      
      shape.SetPosition( gridPosition );
      this.updateGrid( shape );
   };
   
   /*!
    * Resize
    * Triggers when a resize event has taken place. Makes sure that
    * the width and height attributes are updated.
    */
   this.resize = function( width, height ) {
      this._width = width;
      this._height = height;
      
      // Sets the 'width' and 'height' attributes of the canvas to prevent scaling.
      // If you don't do this, the viewport and actual size of the canvas will vary,
      // and it will look like you zoomed out / zoomed in on the canvas.
      this._jqCanvas.attr("width", this._width);
      this._jqCanvas.attr("height", this._height);
      
      // Sets the 'width' and 'height' of the iframe to be a bit bigger than the canvas.
      // If you don't do this, the mouse will move out of the iframe easily when resizing
      // preventing new mouse-events to occur in this iframe, thus leaving the canvas in
      // a 'busy with resizing' state.
      this._jqIFrame.attr("width", this._jqCanvas.outerWidth() + 50);
      this._jqIFrame.attr("height", this._jqCanvas.outerHeight() + 50); 
   };
   
   /*!
    * Resize Functor
    * Returns a function that properly handles a resize event.
    */
   this.resizeFunc = function() {
      var self = this;
      return function(event, ui) {
         if( self._width !== ui.originalElement.width() ||
             self._height !== ui.originalElement.height() ) {
            self.resize( ui.originalElement.width(), ui.originalElement.height() );
            self.Draw();
         }
      };
   };
   
   /*!
    * Mouse Move Functor
    * Returns a function that handles mousemove events on the canvas.
    * The event handler creates mouseover / mouseout events for contained shapes.
    */
   this.mouseMoveFunc = function() {
      var self = this,
          i = 0;
      return function(event) {
         // Find any shapes on cursor position...
         $("#debugger", top.document).html( 'x: '+ event.offsetX + '<br>' + 'y: '+ event.offsetY );
         for( i = 0; i < self._shapes.length; i += 1 ) {
            var inBoundaries = self._shapes[i].InBoundaries( event.offsetX, event.offsetY );
            if( !self._shapes[i].InMouseOverState() && inBoundaries ) {
               self._shapes[i].OnMouseOver( self._jqCanvas, event );
            }
            else if( self._shapes[i].InMouseOverState() && !inBoundaries ) {
               self._shapes[i].OnMouseOut( self._jqCanvas, event );
            }
         }
      };
   };
   
   /*!
    * Click Functor
    * Returns a function that handles click events on the canvas.
    * The event handler will create click events for contained shapes.
    */
   this.clickFunc = function() {
      var self = this,
          i = 0;
      return function(event) {
         for( i = 0; i < self._shapes.length; i += 1 ) {
            if( self._shapes[i].InMouseOverState() ) {
               self._shapes[i].OnClick(self._jqCanvas, event);
            }
         }
      };
   };
   
   /*!
    * Mouse Down Functor
    * Returns a function that handles mousedown events on the canvas.
    * The event handler will create mousedown events for contained shapes.
    */
   this.mouseDownFunc = function() {
      var self = this,
          i = 0;
      return function(event) {
         for( i = 0; i < self._shapes.length; i += 1 ) {
            if( self._shapes[i].InMouseOverState() ) {
               self._shapes[i].OnMouseDown(self._jqCanvas, event);
            }
         }
      };
   };
   
   // Call the constructor
   this.__init__();
};

if( !Array.prototype.containsPoint ) {
   /*!
    * Array: Contains Point
    * Naieve implementation to check the grid array if it contains
    * a certain point.
    */
   Array.prototype.containsPoint = function(point) {
      "use strict";
      
      var i;
      
      if( this === void 0 || this === null )
         throw new TypeError();
      
      for( i = 0; i < this.length; i += 1 ) {
         if( this[i][0] === point[0] &&
             this[i][1] === point[1] ) {
            return true;
         }
      }
      return false;
   };
}

