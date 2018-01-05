/**
 * Created by Administrator on 2015/6/20 0020.
 */
; ( function ( $, window, udfd ) {

    var template = {
        box:    "<div class='cover-box'>" +
                    "<div>" +
                        "<img src='' class='cover-img' width='28' height='28'>" +
                        '<p class="cover-title">拼命加载中, 请稍后...</p>' +
                    "</div>" +
                "</div>",
        fixed:  "<div class='cover-fixed'></div>",
        abs:    "<div class='cover-abs'></div>"
    },
    directory = ( function () {
        var scripts = document.scripts;
        var src = scripts[scripts.length - 1].src;
        var minifyIndex = src.indexOf("?f=");
        return minifyIndex > -1 ? src.substring(0, minifyIndex) + "auxo/admin/forcestudy/extends/jquery/cover/" :
            src.substring( 0, scripts[scripts.length - 1].src.lastIndexOf( "/" ) + 1 );
    } () ),
    defaults = {
        imgSrc: directory + "images/loading.gif"
    };




    var Cover = function ( $obj, options ) {
        var cover = this;

        var $coverContainer = $( "<div class='cover-container'></div>" );
        var $coverBox = $( template.box );
        var $coverMask = ( function () {
            if ( $obj[0] === document || $obj[0] === window || $obj[0] === document.body ) {
                $obj = $( window );
                return $( template.fixed )
            } else {
                return $( template.abs );
            }
        }() );

        $coverContainer.append( $coverBox )
            .append( $coverMask )
            .appendTo( "body" );

        $coverBox.find( ".cover-img" )
            .attr( "src", defaults.imgSrc );

        cover.show = function ( title, time ) {
            var $div = $coverBox.children( "div" );
            var ow = $obj.outerWidth();
            var oh = $obj.outerHeight();
            var bw = $coverBox.outerWidth() + $div.outerWidth();
            var bh = $coverBox.outerHeight() + $div.outerHeight();
            if ( $coverMask.hasClass( "cover-abs" ) ) {
                $coverContainer.css( {
                    "left": $obj.offset().left,
                    "top": $obj.offset().top,
                    "width": ow,
                    "height": oh
                } );
                $coverBox.offset( {
                    left: ( ow - bw ) / 2,
                    top: ( oh - bh ) / 2
                } );
            } else {
                $coverBox.css( "position", "fixed" );
                $coverBox.css( {
                    left: ( ow - bw ) / 2,
                    top: ( oh - bh ) / 2
                } );
            }
            
            if ( title ) {
                $coverBox.find( ".cover-title" )
                    .text( title );
            }

            $coverContainer.fadeIn( time || 500 );
        };
        cover.hide = function ( time ) {
            $coverContainer.fadeOut( time || 500 );
        };
        return cover;
    };

    $.fn.cover = function ( opt ) {
        var $this = $( this );
        var cover = $this.data( "cover-container" );
        var args = arguments;
        var doCover = function () {
            if ( opt === "show" ) {
                cover.show( args[1] );
            } else if ( opt === "hide" ) {
                cover.hide();
            } else {
                cover.show( opt );
            }
        };
        if ( cover ) {
            doCover();
        } else {
            cover = new Cover( $this );
            $this.data( "cover-container", cover );
            doCover();
        }
    };
    $.fn.uncover = function () {
        var $this = $( this );
        var cover = $this.data( "cover-container" );
        if ( cover ) {
            cover.hide();
        }
    }


} ( jQuery, window ) );


