/**
 * Associate Engine
 *
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

var associateCardNumber = 0,
    nbTry = 0,
    associate = {

        /* Container is mandatory */
        container: null,

        /* card numbers */
        numbers: [ 1, 2, 3, 4, 5, 6 ],

        /**
         * Init engine
         */
        init: function(screen){
            if(this.container == null)
                return;

            this.container.attr('class', 'associate');
            this.container.css('background-image', 'url("resources/background/'+screen.background+'")');
            this.container.show();
            nbTry = 0;

            $('<div>').attr('id', 'associateStack').appendTo(this.container);
            $('<div>').attr('id', 'associateLabel').appendTo(this.container);
            $('<div>').attr('id', 'associateTarget').appendTo(this.container);

            this.construct(screen);
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
            for (var i=0; i<6; i++ ) {
                if($('#associateStack div').eq(i).data('number')>3){
                    $('#associateTarget div').eq(
                        $('#associateStack div').eq(i).css('visibility', 'hidden')
                        .data('dropped')
                    ).droppable('enable');
                }
            }
        },

        /**
         * Handle Drag stop
         */
        handleDragStop: function(event, ui){
            if(!ui.helper.hasClass( 'dropped' ))
            {
                // This part is a security. Normally, these 3 actions should change nothing.
                $('#associateTarget div').eq(ui.helper.data('dropped')).droppable( 'enable' );
                if (ui.helper.data( 'correct') == 'ok')
                {
                    associateCardNumber--;
                }
                ui.helper.data( 'correct', 'ko' );

                // This part is useful
                ui.helper.draggable( 'option', 'revert', true );
                ui.helper.animate({top: 0, left: 0});
                ui.helper.removeData('dropped');
            }
        },

        /**
         * Handle Drag start
         */
        handleDragStart: function(event, ui){
            if(ui.helper.hasClass( 'dropped' ))
            {
                if (ui.helper.data( 'correct') == 'ok')
                {
                    associateCardNumber--;
                }
                ui.helper.removeClass('dropped');
                ui.helper.data( 'correct', 'ko' );
                $('#associateTarget div').eq(ui.helper.data('dropped')).droppable( 'enable' );
            }
        },

        /**
         * Handle Drop
         */
        handleDrop: function(event, ui){
            var slotNumber = $(this).data( 'number' );
            ui.draggable.data( 'dropped', $(this).index() );

            if(slotNumber == ui.draggable.data( 'number')) {
                associateCardNumber++;
                ui.draggable.data( 'correct', 'ok' );

            }

            $(this).droppable( 'disable' );

            ui.draggable.position( { of: $(this), my: 'left top', at: 'left top' } );
            ui.draggable.draggable( 'option', 'revert', false );

            // Warning : this class setting has to happen before handleDragStop. Normally, it runs like that.
            ui.draggable.addClass( 'dropped' );
        },

        /**
         * reset Stask
         */
        resetStack: function(){
            $('#associateStack div').each(function(){
               if ($(this).data('correct') == 'ko') {
                   $(this).animate({left: 0, top:0}).removeClass('dropped');
                   $(this).draggable( 'option', 'revert', true );
                   $('#associateTarget div').eq($(this).data('dropped')).droppable( 'enable' );
               }
            });
        },

        /**
         * Construct Enigma
         */
        construct: function(screen){
            var self=this;
            self.numbers = _.shuffle(self.numbers);
            for (var i=0; i<6; i++ ) {
                $('<div></div>').data( 'correct', 'ko' ).data( 'number', self.numbers[i] )
                    .attr('id', 'card'+ self.numbers[i] ).appendTo( '#associateStack' ).draggable({
                    containment: self.container,
                    stack: '#associateStack div',
                    cursor: 'move',
                    revert: true,
                    start : self.handleDragStart,
                    stop: self.handleDragStop
                });
            }

            for (var i=1; i<=3; i++ ) {
                $('<div></div>').data( 'number', i ).addClass('slot'+i).appendTo( '#associateTarget' ).droppable({
                    accept: '#associateStack div',
                    hoverClass: 'hovered',
                    drop: self.handleDrop
                });
                $('<div></div>').addClass('label'+i).appendTo( '#associateLabel' );
            }

            $('#associateStack div').each(function(i){
                $(this).delay(i*100).fadeIn();
            });
            $('#associateLabel div, #associateTarget div').each(function(i){
                $(this).delay(i*100).fadeIn();
            });

            $('#associateLabel div, #associateStack div').css('background-image', 'url("resources/enigma/'+screen.assets.stack+'")');

        },

        /**
         * Check enigma response
         */
        checkResponse: function(){
            var self=this;

            if($('#associateTarget div.ui-droppable-disabled').length < $('#associateTarget div').length)
                self.answer();
            else if(associateCardNumber == $('#associateTarget div').length) {
                nbTry++;
                self.success();
            } else {
                nbTry++;
                self.fail();
            }
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
            self.resetStack();
            var failureMessage = $('<div>').addClass('legend').html('Tu as presque la bonne combinaison');
            failureMessage.css({bottom: '60px'});
            failureMessage.appendTo(self.container).addClass('shake').delay(4000).fadeOut('slow', function(){
                $(this).remove();
            });
        },

        /**
         * When response is missing
         */
        answer: function(){
            var self=this;
            $('div.legend', self.container).eq(1).remove();
            var failureMessage = $('<div>').addClass('legend').html('Fais glisser les propositions');
            failureMessage.css({bottom: '60px'});
            failureMessage.appendTo(self.container).addClass('shake').delay(4000).fadeOut('slow', function(){
                $(this).remove();
            });
            $('#associateStack div').each(function(i){
                if(!$(this).hasClass('dropped'))
                    $(this).delay(i*100).css('opacity', 0).animate({opacity: 1});
            });
        }
    }
