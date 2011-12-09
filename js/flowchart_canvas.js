var FONT_SIZE = 10;
var FlowchartCanvas = function(jqCanvas, jqIFrame, gridSize) {
   "use strict";
   
   this.get2dContext = function() {
      // Get the canvas 2d context.
      var context = jqCanvas.get()[0].getContext('2d');
      if( !context ) {
         return;
      }
      
      context.lineWidth = 2;
      
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = FONT_SIZE + 'px sans-serif';
      
      return context;
   };
   
   this.initializeGrid = function( gridSize ) {
      var x = 0,
          y = 0;
      this._grid = [];
      for( x = gridSize[0] * 0.5; x < this._width; x += gridSize[0] ) {
         for( y = gridSize[1] * 0.5; y < this._height; y += gridSize[1] ) {
            this._grid.push([x,y]);
         }
      }
   };
   
   this.isGridPointTaken = function( pos ) {
      var i = 0;
      for( i = 0; i < this._shapes.length; i += 1 ) {
         if( this._shapes[i].posX === pos[0] &&
             this._shapes[i].posY === pos[1] ) {
            return true;
         }
      }
      return false;
   };
   
   this.findNearestGridPoint = function( pos ) {
      var nearestGridPoint = pos,
          minDist = 65535,
          dist = 0,
          i = 0;
      for( i = 0; i < this._grid.length; i += 1 ) {
         dist = Math.abs(this._grid[i][0] - pos[0]) + Math.abs(this._grid[i][1] - pos[1]);
         
         if( minDist > dist ) {
            if( !this.isGridPointTaken( this._grid[i] ) ) {
               nearestGridPoint = this._grid[i];
               minDist = dist;
            }
         }
      }
      return nearestGridPoint;
   };
   
   this.snapToGrid = function( shape ) {
      var gridPosition = this.findNearestGridPoint( [shape.posX, shape.posY] );
      shape.setPosition( gridPosition );
   };
   
   this.addShape = function( pos, shape ) {
      var gridPosition = this.findNearestGridPoint( pos );
      shape.setParent( this, gridPosition );
      this._shapes.push(shape);
   };
   
   this.draw = function() {
      var context = this.get2dContext(),
          x = 0,
          y = 0,
          i = 0;
      // Clear canvas
      context.clearRect( 0,0, this._width, this._height );
      
      // Draw grid locations...
      for( i = 0; i < this._grid.length; i += 1 ) {
         x = this._grid[i][0];
         y = this._grid[i][1];
         
         // X marks the spot
         context.beginPath();
         context.moveTo(x-5,y-5);
         context.lineTo(x+5,y+5);
         context.moveTo(x+5,y-5);
         context.lineTo(x-5,y+5);
         context.closePath();
         context.stroke();
      }
      
      for( i = 0; i < this._shapes.length; i += 1 ) {
         this._shapes[i].draw( context );
      }
      
      //$("#debugger", top.document).html( 'this._draws: '+ this._draws + "<br>"+
      //                                   'this._width: '+ this._width + "<br>"+
      //                                   'this._height: ' + this._height + "<br>");
      this._draws += 1;
   };
   
   this.resize = function( width, height ) {
      this._width = width;
      this._height = height;
      
      this._jqCanvas.attr("width", this._width);
      this._jqCanvas.attr("height", this._height);
      
      this._jqIFrame.attr("width", this._jqCanvas.outerWidth() + 50);
      this._jqIFrame.attr("height", this._jqCanvas.outerHeight() + 50); 
   };
   
   this.resizeFunc = function() {
      var self = this;
      return function(event, ui) {
         if( self._width !== ui.originalElement.width() ||
             self._height !== ui.originalElement.height() ) {
            self.resize( ui.originalElement.width(), ui.originalElement.height() );
            self.draw();
         }
      };
   };
   
   this.mouseMoveFunc = function() {
      var self = this,
          i = 0;
      return function(event) {
         // Find any shapes on cursor position...
         $("#debugger", top.document).html( 'x: '+ event.offsetX + '<br>' + 'y: '+ event.offsetY );
         for( i = 0; i < self._shapes.length; i += 1 ) {
            var inBoundaries = self._shapes[i].inBoundaries( event.offsetX, event.offsetY );
            if( !self._shapes[i].inMouseOverState() && inBoundaries ) {
               self._shapes[i].onMouseOver( self._jqCanvas, event );
            }
            else if( self._shapes[i].inMouseOverState() && !inBoundaries ) {
               self._shapes[i].onMouseOut( self._jqCanvas, event );
            }
         }
      };
   };
   
   this.clickFunc = function() {
      var self = this,
          i = 0;
      return function(event) {
         for( i = 0; i < self._shapes.length; i += 1 ) {
            if( self._shapes[i].inMouseOverState() ) {
               self._shapes[i].onClick(self._jqCanvas, event);
            }
         }
      };
   };
   
   this.mouseDownFunc = function() {
      var self = this,
          i = 0;
      return function(event) {
         for( i = 0; i < self._shapes.length; i += 1 ) {
            if( self._shapes[i].inMouseOverState() ) {
               self._shapes[i].onMouseDown(self._jqCanvas, event);
            }
         }
      };
   };
   
   jqCanvas.resizable({
      minHeight: 50,
      minWidth: 50,
      grid: [50,50],
      resize: this.resizeFunc()
   });
   jqCanvas.on('mousemove', this.mouseMoveFunc() );
   jqCanvas.on('mousedown', this.mouseDownFunc() );
   jqCanvas.on('click', this.clickFunc() );
   
   this._jqCanvas = jqCanvas;
   this._jqIFrame = jqIFrame;
   this._shapes = [];
   this._draws = 0;
   this.resize( jqCanvas.width(), jqCanvas.height() );
   this.initializeGrid( gridSize );
};

