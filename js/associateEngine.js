/**
 Associate Engine

**/

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

            this.container.addClass('associate');
            this.container.css('background-image', 'url("resources/background/'+screen.background+'")');
            this.container.show();
            nbTry = 0;

            $('<div>').attr('id', 'stack').appendTo(this.container);
            $('<div>').attr('id', 'label').appendTo(this.container);
            $('<div>').attr('id', 'target').appendTo(this.container);

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
                if($('#stack div').eq(i).data('number')>3){
                    $('#stack div').eq(i).css('visibility', 'hidden');
                }
            }
        },

        /**
         * Handle Drag stop
         */
        handleDragStop: function(event, ui){
            if(ui.helper.hasClass( 'dropped' ))
            {
                if (ui.helper.data( 'correct') == 'ok')
                {
                    associateCardNumber--;
                }
                ui.helper.draggable( 'option', 'revert', true );
                ui.helper.animate({top: 0, left: 0});
                ui.helper.removeClass('dropped');
                ui.helper.data( 'correct', 'ko' );
                $('#target div').eq(ui.helper.data('dropped')).droppable( 'enable' );
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
            setTimeout(function(){ui.draggable.addClass( 'dropped' );}, 300);
        },

        /**
         * reset Stask
         */
        resetStack: function(){
            $('#stack div').each(function(){
               if ($(this).data('correct') == 'ko') {
                   $(this).animate({left: 0, top:0}).removeClass('dropped');
                   $(this).draggable( 'option', 'revert', true );
                   $('#target div').eq($(this).data('dropped')).droppable( 'enable' );
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
                    .attr('id', 'card'+ self.numbers[i] ).appendTo( '#stack' ).draggable({
                    containment: self.container,
                    stack: '#stack div',
                    cursor: 'move',
                    revert: true,
                    stop: self.handleDragStop
                });
            }

            for (var i=1; i<=3; i++ ) {
                $('<div></div>').data( 'number', i ).addClass('slot'+i).appendTo( '#target' ).droppable({
                    accept: '#stack div',
                    hoverClass: 'hovered',
                    drop: self.handleDrop
                });
                $('<div></div>').addClass('label'+i).appendTo( '#label' );
            }

            $('#stack div').each(function(i){
                $(this).delay(i*100).fadeIn();
            });
            $('#label div, #target div').each(function(i){
                $(this).delay(i*100).fadeIn();
            });

            $('#label div, #stack div').css('background-image', 'url("resources/enigma/'+screen.assets.stack+'")');

        },

        /**
         * Check enigma response
         */
        checkResponse: function(){
            var self=this;

            if($('#target div.ui-droppable-disabled').length < $('#target div').length)
                self.answer();
            else if(associateCardNumber == $('#target div').length) {
                nbTry++;
                self.success();
            } else {
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
            $('div.legend', self.container).remove();
            var failureMessage = $('<div>').addClass('legend').html('Fais glisser les propositions');
            failureMessage.css({bottom: '60px'});
            failureMessage.appendTo(self.container).addClass('shake').delay(4000).fadeOut('slow', function(){
                $(this).remove();
            });
            $('#stack div').each(function(i){
                if(!$(this).hasClass('dropped'))
                    $(this).delay(i*100).css('opacity', 0).animate({opacity: 1});
            });
        }
    }
