/**
 *
 * Chronology Engine
 * This file is part of Docky.
 *
 * Docky is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Docky is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Docky. If not, see <http://www.gnu.org/licenses/>
 */

var nbTry = 0,
    chronology = {

        /* Container is mandatory */
        container: null,



        /**
         * Init engine
         */
        init: function(screen){
            if(this.container == null)
                return;

            this.container.attr('class', 'chronology');
            this.container.css('background-image', 'url("resources/background/'+screen.background+'")');
            this.container.show();
            nbTry = 0;

            var line = $('<div>').attr('id', 'chronologyLine').appendTo(this.container);
            $('<span>').html('Début').appendTo(line);
            $('<span>').html('Fin').appendTo(line);

            for (var i=1; i<5; i++ ) {
                $('<div>').attr('id', 'chronologyBub'+i).addClass('chronologyBubble').hide().appendTo(this.container).delay(i*150 + 200).fadeIn();
            }
            $('<a href="#" class="up"></a><span></span><a href="#" class="down"></a>').appendTo('div.chronologyBubble');

            this.start(screen);
        },

        /**
         * Clean Enigma
         */
        clean: function(){
            this.container.html('');
        },

        /**
         * Remove useless cards
         */
        help: function(){
            nbTry++;
            $('div.chronologyBubble').each(function(i){
                if(i<2) {
                    $('a', this).unbind('click').css('opacity', 0);
                    var bubble = $('span', this).data('position', (i+1)),
                        posCompute = -i*114;
                    bubble.animate({'background-position-y': posCompute+'px'}, 300, 'swing');
                }
            });
        },

        /**
         * Start Enigma
         */
        start: function(screen){
            var self=this,
                numbers = [ 1, 2, 3, 4 ],
                bubbleY = 116;

            numbers = _.shuffle(numbers);

            $('div.chronologyBubble span').each(function(i){
                $(this).data('position', numbers[i]).css('background-position', '0 -'+((numbers[i]-1)*bubbleY)+'px');
            });

            $('div.chronologyBubble a').click(function(e){
                e.preventDefault();
                var pos = $(this).data('position');
                if($(this).hasClass('up')){
                    var bubble = $(this).next(),
                        pos = bubble.data('position');

                    pos++;
                } else {
                    var bubble = $(this).prev(),
                        pos = bubble.data('position');

                    pos--;
                }

                var posCompute = -(pos-1)*bubbleY;
                bubble.animate({'background-position-y': posCompute+'px'}, 300, 'swing', function(){
                    if(pos==0)
                        pos=4;
                    if(pos>4)
                        pos=1;

                    posCompute = -(pos-1)*bubbleY;
                    bubble.css({'background-position-y': posCompute+'px'});
                    bubble.data('position', pos);
                });

            });
            $('div.chronologyBubble span').css('background-image', 'url("resources/enigma/'+screen.assets.stack+'")');

        },

        /**
         * Check enigma response
         */
        checkResponse: function(){
            var self=this;
            var check = 0;
            $('div.chronologyBubble span').each(function(){
                if($(this).data('position') == check + 1)
                    check++;
            });
            nbTry++;
            if(check == $('div.chronologyBubble span').length)
                self.success();
            else
                self.fail();
        },

        /**
         * When response is correct
         */
        success: function(){
            $.jStorage.publish("enigmaResolve", nbTry);
        },

        /**
         * When response is incorrect
         */
        fail: function(){
            var self=this;
            var failureMessage = $('<div>').addClass('legend').html('Ce n\'est pas tout à fait cela.');
            failureMessage.css({bottom: '60px'});
            failureMessage.appendTo(self.container).addClass('shake').delay(4000).fadeOut('slow', function(){
                $(this).remove();
            });
        }

    }
