/*
    ghostType v1.2 [March 19, 2011]
    http://ghosttype.com
    by William Moynihan

    ghostType jQuery Plugin
    -----------------------
    Use: Add text within an object of your document and call the ghostType function.

    Ex: $("#mydiv").ghostType();

    (It is recommended that you add the "display: none" CSS property to the object.)

    ghostType reserves the "^" character to create a delay between portions of your text.
    You can use this to simulate a more natural typing effect, such as delays between
    displaying sentences.

    Ex: <div id="mydiv">Welcome to my website.^^^^^^^^^^ I've been expecting you!</div>

    With a default delay setting of 100ms the above example will add a 1 second delay
    before displaying the second sentence. "^" characters will be removed.
*/
var ghostTimer = null;
(function( $ ){
    $.fn.ghostType = function(character) {

        return this.each(function() {

            var $this = $(this);
            var str = $this.text();
            $this.empty().show();
            str = str.split("");
          //str.push("_");

            // increase the delay to ghostType slower
            var delay = 40;
            var duration = 0;

            $.each(str, function (i, val) {
                if (val == "|") {
                    // Do nothing. This will add to the delay.
                }
                else {
                    character.addClass('speaking');
                    $this.append('<span>' + val + '</span>');
                    $this.children("span").hide().fadeIn(150).delay(delay * i);
					duration += delay;
                }
            });
            //$this.children("span:last").css("textDecoration", "blink");
            ghostTimer = setTimeout(function(){
            	character.removeClass('speaking');
				$('img.next').delay('500').fadeIn('3000');
				var properties = {marginRight: '10px'};                    
				//$('img.next').pulse(properties, {duration : 1000, pulses : -1});
                core.lineNumber++;
			}, duration);
            
        });

    };
})( jQuery );
