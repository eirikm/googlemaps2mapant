// ==UserScript==
// @name            GoogleMaps to MapAnt
// @description     Link Google with other maps
// @namespace       1d196b78-800f-45a5-8c34-bfcf2f652eb4
// @version         0.2

// @match			https://www.google.no/maps/*
// @match			https://www.google.com/maps/*

// @require         http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js
// @require         https://greasyfork.org/scripts/17293-alert/code/$alert.js?version=109035
// @require https://greasyfork.org/scripts/9160-my-function-library/code/My%20Function%20library.js?version=168434


// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @grant			GM_getResourceURL


// @resource		MapAnt 		    https://mapant.no/favicon.ico

// @created         2015-03-06
// @released        2015-00-00
// @updated         2015-00-00

// @history         @version 0.25 - Alpha version: @released - 2015-03-12
// @history         @version 0.45 - Beta version: @released - 2015-03-17
// @history         @version 0.5 - RC version: @released - 2016-02-21

// @compatible      Greasemonkey, Tampermonkey
// @license         GNU GPL v3 (http://www.gnu.org/copyleft/gpl.html)
// @copyright       2015+, Magnus Fohlström
// ==/UserScript==

/*global $, jQuery*/
/*jshint -W014, -W030, -W082*/
// -W014, laxbreak, Bad line breaking before '+'
// -W030, Expected assignment or function call instead saw an expression



(function() {
	var returnThis,
		css = {
			button      : function(){
				return ''
					+	'#mapsHolder {'
					+		'position:absolute;'
					+		'right:150px;'
					+		'padding-top: 12px;'
					+		'height: 18px;'
					+		'background-color: rgba(83, 94, 72, 0.72);'
					+		'}'
					+	'#mapsHolder button {'
					+		'margin:-21px 6px;'
					+		'width:24px;'
					+		'height:24px;'
					+		'}'
					+	'.buttonPanoramio {'
					+		'position: relative;'
					+		'top: 13px;'
					+		'left: 11px;'
					+		'width: 52px !important;'
					+		'height: 40px !important;'
					+		'}'
					+	'#mapsHolder button img {'
					+		'width:100%;'
					+		'height:100%;'
					+		'}';
			},
			style  		: function( id, var1, var2 ){
				var $id = $( 'head #' + id ), cssID = css[ id ]( var1, var2 ).formatString();
				$id.length ? $id.html( cssID ) : $( $( '<style/>',{ id: id, class:'mySuperStyles', html: cssID } ) ).appendTo('head');
			}
		},
		html = {
			coordinates : null,
			positions   : {
				MapAnt : function(){
                    const zoom = parseInt(html.coordinates[2]) - 6;
					returnThis = 'https://mapant.no/#' + zoom + '/' + html.coordinates[0] + '/' + html.coordinates[1];
					return returnThis;
				}
			},
			dataArray   : function(){
				return [
					{ on:1, order:20, button:'MapAnt',   image:'', position: '' },
				];
			},
			thisURL     : function(){
				return location.href.split('@').pop().split(',');
			},
			mapsHolder  : null,
			button      : function( map ){
				return '<button aria-label="Go to '+ map.button +'" oncontextmenu="return false;" class="widget-expand-button-pegman-background grab-cursor button'+ map.button + '" > '
					+		'<div class="'+ map.button +'Wrapper mapButtonIcon" >'
					+		    '<a target="_blank" href="'+ this.positions[ map.button ]() + '" class="'+ map.button +'Url" data-map="'+ map.button +'" title="Go to '+ map.button +'">'
					+               '<img src="'+ ( map.image.length > 5 ? map.image : GM_getResourceURL( map.button ) ) +'"></a></div></button>';
			},
			render      : function( source ){
				c.l('renderSource', source );

				if( $('#mapsHolder').length )
					return false;
				else
					this.mapsHolder = $( '<div/>',{ id:'mapsHolder' });

				this.coordinates = this.thisURL();

				var that = this;
				$.each( that.dataArray().sort( sortBy( 'order' ) ), function( i, map ){
					map.on && ( 
						that.mapsHolder.find('.'+ map.button +'Wrapper').length || $( that.button( map ) ).appendTo( that.mapsHolder ) 
					);
				});
				this.mapsHolder.prependTo( $('.app-horizontal-widget-holder') );

				css.style('button');
				listener.button();
			}
		},
		listener = {
			button: function(){
				$( document ).on('mousedown mouseover', '.mapButtonIcon a img', function(e){
					var $p;
					timer.ms === 0 && this == e.target && (
						timer.set( 156 ),
						html.coordinates = html.thisURL(),
						$p = $( this ).parent(),
						//    c.i('listener button ' + $p.data('map'), e.type ),
						$p.attr('href', html.positions[ $p.data('map') ]() ) // html.dataArray().findArrayObj( 'button', $p.data('map') ).position )
					);
				});
			}
		},
		googleMaps_observer = new MutationObserver( function( mutations /*, observer */) {
			mutations.forEach( function( mutation ) {
				var newNodes = mutation.addedNodes;
				newNodes !== null && $( newNodes ).each( function( i, e ){
					var $e = $(e);
					( $e.hasClass( 'widget-expand-button-pegman' ) || $e.hasClass( '.app-horizontal-widget-holder' ) ) && html.mapsHolder === null && html.render( 'observer' );
				});
			});
		});

	googleMaps_observer.observe( document, { subtree: true, childList: true });
	
	c.l('Map Linker GoogleMaps');
	
	function loadLinkBar(){
		var barCheck = setInterval(function(e){
			$('#mapsHolder').length ? clearInterval( barCheck ) : html.render( 'load' );
		}, 64);
		listener.button();
	}
	
	$( document ).ready(function(e) {
		loadLinkBar();
	});

	$( window ).on('load', function(e) {
		loadLinkBar();
	});
})();