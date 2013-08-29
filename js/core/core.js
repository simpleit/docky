/**
 * Core
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

var audioPlayer = {

    player: null,
    format: 'ogg',
    
    init: function(format){
        this.player = new Audio();
        this.player.loop = true;
        
        if(format != undefined && format.length > 1)
            this.format = format.toLowerCase();
        
        return this.player;
    },

    startScreen: function(){
        var player = this.player || this.init();

        player.setAttribute('src', '../../media/start_screen.ogg');
        player.play();
    },

    loading: function(){
        var player = this.player || this.init();

        player.setAttribute('src', '../../media/loading_screen.ogg');
        player.play();
    },

    converse: function(){
        var player = this.player || this.init();

        player.setAttribute('src', '../../media/converse.ogg');
        player.play();
    },
    
    setVolume: function(volume)
    {
    	if (typeof volume == 'number')
    	{
    		volume = parseFloat(volume);
    	
    		if (volume >= 0 && volume <= 1)
    			this.player.volume = volume;
    	}
    },
    
    inverseMuted: function()
    {
    	this.player.muted = !this.player.muted;
    }
};

var core = {

    /* core Variables */
    loadingScreen: false,
    activeEngine: null,

    screenNum: 0,
    activeScreen: null,
    activeEnigma: 0,
    lastScreenType: null,

    story: '',
    episode: '',
    loadedStyles: new Array(),
    loadedScripts: new Array(),

    /**
     * Init welcome Screen
     */
    initWelcomeScreen: function(){

        audioPlayer.startScreen();

        if(!$('#cache').length){
            $('<div>').attr('id', 'cache').hide().appendTo('body');
        }
        var $cache = $('#cache');

        $('<img>').attr('src', '../../ui/start_screen.png').appendTo($cache);
        $('#window.welcomeScreen').css('background-image', 'url(../../ui/start_screen.png)');
        $('#cache img').imagesLoaded(function(){
            $('#blackout').fadeOut('slow', core.welcomeScreen());
        });
    },

    /**
     * launch Welcome Screen
     */
    welcomeScreen: function(){
        var self = this;
        _.delay(function(){

            $('#macaron').animate({top: '60px'}, 700, 'easeInOutBack', function(){
                $.getJSON("resources/story/story.json", function(episodeData){
                    self.story = episodeData.name;
                    $.jStorage.set('story', self.story);
                    $.jStorage.set(self.story+'.episodeList', episodeData.episodes);
                    $('#start').animate({right: '+=160', bottom: '+=160'}, 700, 'easeInOutBack', function(){
                        $('#options').animate({left: '+=160', bottom: '+=160'}, 700, 'easeInOutBack');
                    });

                    // CLICK ON START
                    $('#start').click(function(){

                        var episodeIndex = $.jStorage.get(self.story+'.episodeIndex') || 0;
                        $.jStorage.set(self.story+'.episodeIndex', episodeIndex);
                        if(typeof episodeData.episodes[episodeIndex] == 'undefined')
                        {
                            self.toggleOptionsScreen(1);
                            return;
                        } else {
                            $('#options').animate({left: '-=160', bottom: '-=160'}, 700, 'easeInOutBack');
                            $('#start').animate({right: '-=160', bottom: '-=160'}, 700, 'easeInOutBack', function(){
                                $('#blackout').fadeIn('slow', function(){
                                    window.location.href = episodeData.episodes[episodeIndex]+'.html';
                                });
                            });
                        }
                    });

                    $('#options, #valid').click(function(){
                       self.toggleOptionsScreen();
                    });

                    $('#board span').click(function(){
                        self.flush();
                        window.location.reload();
                    });
                });
            });

            //if (screenfull.enabled) {
            //    screenfull.request($('#window')[0]);
            //}
            //soundObject.setAttribute('src', 'media/start_screen.ogg');
            //soundObject.play();
        }, 1000);

    },

    /**
     * Show or hide options screen
     */
    toggleOptionsScreen: function(screenNum){
        if($('#board').hasClass('open')){
            // Fermeture
            $('#board').toggleClass('open');
            $('#valid').animate({right: '-=130', bottom: '-=130'}, 700, 'easeInOutBack');
            $('#macaron').animate({top: '60px'}, 700, 'easeInOutBack');
            $('#options').animate({left: '+=160', bottom: '+=160'}, 700, 'easeInOutBack');
            $('#start').animate({right: '+=160', bottom: '+=160'}, 700, 'easeInOutBack');
        } else {
            // Ouverture
            screenNum = screenNum || 0;
            $('#board>div').hide();
            $('#board>div').eq(screenNum).show();

            $('#macaron').animate({top: '-280px'}, 700, 'easeInOutBack');
            $('#options').animate({left: '-=160', bottom: '-=160'}, 700, 'easeInOutBack');
            $('#start').animate({right: '-=160', bottom: '-=160'}, 700, 'easeInOutBack');
            $('#valid').animate({right: '+=130', bottom: '+=130'}, 700, 'easeInOutBack');
            $('#board').toggleClass('open');
        }
    },

    /**
     * Animate footprints
     */
    footprints: function(){
        if(!core.loadingScreen) return;
        $('#blackout div:hidden').eq(0).fadeIn();
        if($('#blackout div:hidden').length)
            setTimeout(core.footprints, 700);
        else {
            setTimeout(function(){
                $('#blackout div.foot').fadeOut();
                core.footprints();
            }, 1400);
        }
    },

    /**
     * Show load screen
     */
    showLoadScreen: function(){
        var self=this;
        self.loadingScreen = true;
        audioPlayer.loading();
        if($('#blackout div.foot').length<10) {
            for (var i=0;i<11;i++)
            {
                var foot = $('<div>').addClass('foot').appendTo('#blackout');
                foot.css('bottom', (i*foot.height() + 20 )+'px');
                if(i % 2)
                    foot.addClass('flip');
            }
        }

        setTimeout(function(){
            //soundObject.setAttribute('src', 'media/loading_screen.ogg');
            //soundObject.play();
            self.footprints();
            var $chapter = $('#blackout div.chapter');
            $('h3', $chapter).html(self.episode.episodeTitle);
            $('span', $chapter).eq(0).html(self.episode.episodeNumber).css('opacity', 1);
            $chapter.css('bottom', '-' + $('body').css('height'));
            $chapter.animate({bottom: '200px'}, 1000, 'easeOutBack', function(){
                $('span:last-child', $chapter).addClass('blink');
            });
        }, 500);
    },

    /**
     * Episode conclusion
     */
    showEndingScreen: function(){
        var self=this;
        var $blackout = $('#blackout'),
            $chapter = $('div.chapter', $blackout),
            score = $.jStorage.get(self.story+'.playerScore');
        $('h3', $chapter).html(self.episode.episodeNumber+' terminé');
        $('span', $chapter).eq(0).html(self.episode.episodeTitle);
        $chapter.css({width: 'auto', left: '200px', bottom: '-' + $('body').css('height')});

        var finalScore = $('<div>').attr('id', 'finalScore').html('Tu repars avec <span>'+score+'</span>');
        $blackout.fadeIn();
        $chapter.animate({bottom: '210px'}, 1000, 'easeOutBack', function(){
            finalScore.appendTo('#blackout').animate({left: '200px'}, 1700, 'easeInOutCirc');
        });
        $('<div>').addClass('ender').appendTo($blackout);

    },

    /**
     * Hide Load screen
     *
     * @param callback Callback function
     */
    hideLoadScreen: function(callback){
        if(!this.loadingScreen)
            return;

        callback = null || callback;
        this.loadingScreen = false;
        $('#blackout div.foot').fadeOut();
        $('#blackout div.chapter span').eq(1).fadeOut('fast');
        $('#blackout div.chapter .blink').fadeOut(100, function(){
            $('#blackout div.chapter').css('width', '100%');
        });
        $('#blackout div.chapter').animate({left: '105%'}, 900, 'easeInOutBack', function(){
            //$('#blackout').fadeOut('slow', function(){
                if(callback != null)
                    callback();
            //});
        });
    },

    /**
     * Display conversation next line
     *
     * @returns {boolean} Conversation going on or not
     */
    displayNextLine: function(){
        var self=this;
        if(self.activeScreen.lines[self.lineNumber] == undefined){
            return false;
        }

        if(!$('div.bubble').hasClass(this.activeScreen.lines[self.lineNumber].position)){
            $('div.bubble-inner').hide();
            $('img.next').hide();
            $('div.bubble').fadeOut('2000', function(){
                $('div.bubble').removeClass('right');
                $('div.bubble').removeClass('left');
                $('div.bubble').addClass(self.activeScreen.lines[self.lineNumber].position);

                $('div.bubble').fadeIn('100', function(){
                    $('div.bubble-inner').show();
                });
            });
        } else {
            $('div.bubble-inner').show();
        }

        $('#converse div').removeClass('speaking');

        var text = self.activeScreen.lines[self.lineNumber].text + '\n';

        if(self.currentLineNumber < self.lineNumber) {
            $('div.bubble-inner').html(text);
            $('div.bubble-inner').ghostType($('.'+self.activeScreen.lines[self.lineNumber].position+'Character'));
            self.currentLineNumber++;
        } else {
            clearTimeout(ghostTimer);
            $('div.bubble-inner').html(text.replace(/\|/g, ''));
            self.currentLineNumber = self.lineNumber;
            self.lineNumber++;
        }

        return true;
    },

    /**
     * Load conversation Screen
     */
    loadConverseScreen: function(){
        var self=this;
        // Show characters
        $('#converse').css('background-image', 'url(resources/background/'+ self.activeScreen.background+')');
        $('#converse div.leftCharacter').css('background-image', 'url(resources/character/'+ self.activeScreen.leftCharacter+'.png)');
        $('#converse div.rightCharacter').css('background-image', 'url(resources/character/'+ self.activeScreen.rightCharacter+'.png)');

        $('div.bubble').hide();
        $('div.bubble').removeClass('right');
        $('div.bubble').removeClass('left');
        $('.leftCharacter').css('left', '-300px').delay(2000).animate({left: '+=300'}, 1000, 'easeOutCubic');
        $('.rightCharacter').css('right', '-300px').delay(2500).animate({right: '+=300'}, 1000, 'easeOutCubic');

        self.blackFadeOut(function(){
            self.lineNumber = 0;
            self.currentLineNumber = -1;
            setTimeout(function(){
                self.displayNextLine();
            }, 5000);
        });
        $('div.bubble').click(function(){

            if(!self.displayNextLine()){
                $('div.bubble').unbind('click');
                self.loadNextScreen();
            }

        });

        $('#converse').show();
    },

    /**
     * Enigma introduction
     *
     * @param callback Callback function
     */
    enigmaIntro: function(callback){
        var self=this;
        $('#introEnigma').slideDown();
        $('#introEnigma h1').remove();
        $('#introEnigma span').hide();

        /* Compute enigma Index */
        var enigmeIndex = 0;
        for (var i=0; i<self.episode.screens.length;i++) {
            if(self.episode.screens[i].type == 'enigma')
                enigmeIndex++;
            if(self.episode.screens[i] == self.activeScreen)
                break;
        }
        self.activeEnigma = enigmeIndex;

        $('#introEnigma').append('<h1>Enigme '+self.activeEnigma+'</h1>');

        /* show question marks */
        var delay = 800;
        $('#introEnigma span').each(function(key){
            var deg = _.random(0, 360);
            $(this).delay(delay).fadeIn("slow").css('-webkit-transform', 'rotate('+deg+'deg)').css('-moz-transform', 'rotate('+deg+'deg)');
            delay += 800;
        });

        _.delay(callback, delay);
    },

    /**
     * Enigma start
     */
    enigmaStart: function(){
        var self=this;

        $('#enigma').remove();
        var $enigma = $('<div>').attr('id', 'enigma').appendTo($('#window'));

        /* Prepare enigma screen */
        $('<div>').attr('class', 'breadcrumb').html('Enigme '+self.activeEnigma).appendTo($enigma);
        $('<div>').attr('class', 'legend').html(self.activeScreen.legend).appendTo($enigma);

        eval("var activeEngine = " + self.activeScreen.engine);
        self.activeEngine = activeEngine;
        self.activeEngine.container = $enigma;
        self.activeEngine.init(self.activeScreen);

        self.enigmaActions();
        $('#introEnigma').fadeOut();
    },

    /**
     * Prepare enigma special actions
     */
    enigmaActions: function(){
        var self= this,
            $enigma = $('#enigma'),
            help = '<div>'+self.activeScreen.help+'</div><div class="accept">Oui</div><div class="deny">Non</div>',
            $help = $('<div>').attr('id', 'helpScreen').prependTo($enigma).html(help),
            $valid = $('<a>').attr('id', 'valid').addClass('roundedCorner cornerRight cornerSmall').appendTo($enigma);

        $('div.accept', $help).click(function(){
            self.activeEngine.help();
            self.toggleHelpScreen(true);
        });
        $('div.deny', $help).click(function(){
            self.toggleHelpScreen(false);
        });

        $('<a>').attr('id', 'help').addClass('roundedCorner cornerLeft cornerSmall').appendTo($enigma);
        $('<span>').appendTo($valid);
        $('<span>').appendTo($('#help'));

        $valid.delay(700).animate({right: '+=130', bottom: '+=130'}, 700, 'easeInOutBack', function(){
            $('#help').animate({left: '+=130', bottom: '+=130'}, 700, 'easeInOutBack').click(function(){
                self.toggleHelpScreen(false);
            });
            $('div.breadcrumb').animate({top: '0'}, 700, 'easeOutCirc', function(){
                $('div.legend').animate({bottom: '20px'}, 700, 'easeOutCirc');
            });
        });

        $valid.click(function(e){
            console.log('VALIDATION');
            e.preventDefault();
            self.activeEngine.checkResponse();
        });
    },

    /**
     * Show or display help screen
     * @param close
     */
    toggleHelpScreen: function(close){
        if($('#helpScreen').is(':visible')) {
            if(!close)
                $('#help').animate({left: '+=130', bottom: '+=130'}, 700, 'easeInOutQuint');
            $('#valid').animate({right: '+=130', bottom: '+=130'}, 700, 'easeInOutQuint');
            $('#helpScreen').fadeOut();
        } else {
            $('#help').animate({left: '-=130', bottom: '-=130'}, 700, 'easeInOutQuint');
            $('#valid').animate({right: '-=130', bottom: '-=130'}, 700, 'easeInOutQuint');
            $('#helpScreen').fadeIn();
        }

    },

    /**
     * Manage enigma closure
     * @param nbTry
     */
    enigmaEnd: function(nbTry){
        var self=this;
        var $enigmaEnd = $('<div>').attr('id', 'endEnigma').appendTo($('#window'));
        var $enigmaEndContainer = $('<div>').attr('id', 'endEnigmaContainer').appendTo($enigmaEnd);
        $('<h1>').html('Bravo !').appendTo($enigmaEndContainer);
        $('<h2>').html('Enigme '+self.activeEnigma).appendTo($enigmaEndContainer);

        $enigmaEnd.fadeIn('slow', function(){
            self.activeEngine.clean();
            $('#enigma').remove();


            var num = _.max([40 - (nbTry*10), 10]);
            var score = 0 || $.jStorage.get(self.story+'.playerScore');
            $('<span>').html(score).appendTo($enigmaEndContainer);
            $('<div>').addClass('addToScore').html('+'+num).appendTo($enigmaEndContainer);

            _.delay(function(){

                $('h1', $enigmaEndContainer).animate({left: '-5px'}, 700, 'easeInOutBack', function(){
                    $('h1', $enigmaEndContainer).delay(1600).animate({left: '1500px'}, 700, 'easeInOutBack');
                });

                for (var i=0; i < num; i++) {
                    _.delay(function(){
                        num--;
                        score++;
                        $('span', $enigmaEndContainer).html(score);
                        $('div.addToScore', $enigmaEndContainer).html('+'+num);
                    }, i*130);
                }

                _.delay(function(){
                    $.jStorage.set(self.story+'.playerScore', score);
                    $('div.addToScore', $enigmaEnd).fadeOut();
                }, i*130);

                _.delay(function(){
                    self.blackFade(function(){
                        $enigmaEnd.hide();
                        $('#endEnigma').remove();
                        console.log('Enigma End - load next screen');
                        self.loadNextScreen();
                    });

                }, i*130+1000);
            }, 800);
        });
    },


    /**
     * Load next episode Screen
     */
    loadNextScreen: function(){
        var self=this;
        self.activeScreen = self.episode.screens[self.screenNum];
        self.loadScreen(self.activeScreen);

        $.jStorage.set(self.story+'.screenNum', self.screenNum);
        self.screenNum++;
    },

    /**
     * Trigger black fadeOut
     * @param callback Callback function
     */
    blackFadeOut: function(callback){
        $('#blackout').fadeOut('normal', callback);
    },

    /**
     * Trigger black fadeIn
     * @param callback Callback function
     */
    blackFade: function(callback){
        $('#blackout').fadeIn('slow', callback);
    },

    /**
     * load Screen
     *
     * @param activeScreen Request screen
     */
    loadScreen: function(activeScreen){
        var self=this;
        if(activeScreen == undefined) {
            self.loadNextEpisode();
            return;
        }

        if (self.lastScreenType == activeScreen.type) {
            self.blackFade(function(){
                self.selectScreen()
            });
        } else
            self.selectScreen();

        self.lastScreenType = activeScreen.type;
    },

    /**
     * Select screen behavior
     */
    selectScreen: function(){
        var self=this;
        switch(self.activeScreen.type){
            case 'converse':
                self.loadConverseScreen();
                break;
            case 'enigma':
                self.enigmaIntro(function(){self.enigmaStart()});
            break;
            default:
            break;
        }
    },

    /**
     * Load episode fully
     */
    loadEpisode: function(){
        var self = this;
        /* check user progress */
        self.story = $.jStorage.get('story') || '';
        if(self.story == '')
            window.location.href= 'index.html';

        var episodeIndex = $.jStorage.get(self.story+'.episodeIndex');
        var episodes = $.jStorage.get(self.story+'.episodeList');


        this.screenNum = $.jStorage.get(self.story+'.screenNum') || 0;
        $.jStorage.set(self.story+'.screenNum', this.screenNum);

        // Init Score ??
        $.jStorage.set(self.story+'.playerScore', 0);
        var episodeName = $('meta[name=episode]').attr("content");

        if(!_.contains(episodes, episodeName) || episodes[episodeIndex] != episodeName){
            window.location.href= 'index.html';
            return;
        }

        var self=this;

        $.getJSON("resources/story/"+episodeName+".json", function(episodeJson){
            $('title').html(episodeJson.title);
            self.episode = episodeJson;


            self.showLoadScreen();

            _.forEach(self.episode.screens, function(screen){
                if(screen.type == 'enigma') {
                    self.loadScript(screen.engine);
                    self.loadStyle(screen.stylesheet);
                }
                self.loadCache(screen);

                if(_.last(self.episode.screens) == screen) {
                    var now = new Date();
                    $('#cache img').imagesLoaded(function(){
                        var finish = new Date();
                        if (finish - now < 10000) {
                            _.delay(function(){self.launch();}, 10000 - (finish - now));
                        } else {
                            self.launch();
                        }

                    });
                }
            });

        }).fail(function() {
                alert( "error" );
        });

    },

    /**
     * launch episode when ready
     */
    launch: function(){
        var self=this;
        //self.hideLoadScreen(function(){self.showEndingScreen()});
        self.hideLoadScreen(function(){self.loadNextScreen()});
        audioPlayer.converse();
        $.jStorage.subscribe("enigmaResolve", function(channel, nbTry){
            self.enigmaEnd(nbTry);
        });
    },

    /**
     * reset stats for manual debug
     */
    flush: function(){
        $.jStorage.flush();
    },

    /**
     * Load next episode requested
     */
    loadNextEpisode: function(){
        var self=this,
            episodeIndex = $.jStorage.get(self.story+'.episodeIndex'),
            episodeList = $.jStorage.get(self.story+'.episodeList');

        episodeIndex++;
        $.jStorage.set(self.story+'.episodeIndex', episodeIndex);
        this.screenNum = 0;
        $.jStorage.set(self.story+'.screenNum', this.screenNum);


        self.showEndingScreen();

        _.delay(function(){
            if(typeof episodeList[episodeIndex] != 'undefined')
                window.location.href = episodeList[episodeIndex]+'.html';
            else
                window.location.href = 'index.html';
        }, 7000);

    },

    /**
     * Load requested stylesheet
     * @param style
     */
    loadStyle: function(style){
        if(!_.contains(this.loadedStyles, style)){
            this.loadedStyles.push(style);

            if (document.createStyleSheet){
                document.createStyleSheet('../../css/'+style);
            }
            else {
                $("head").append($("<link rel='stylesheet' href='../../css/"+style+"' type='text/css' media='screen' />"));
            }
        }
    },

    /**
     * Load requested script
     * @param script
     */
    loadScript: function(script){
        if(!_.contains(this.loadedStyles, script)){
            this.loadedScripts.push(script);
            $.getScript("../../js/"+ script+"Engine.js");
        }
    },

    /**
     * Cache loader
     * @param screen current Screen parsed
     */
    loadCache: function(screen){
        if(!$('#cache').length){
            $('<div>').attr('id', 'cache').hide().appendTo('body');
        }
        var $cache = $('#cache');

        if(screen.type == 'enigma') {
            _.each(screen.assets, function(val, key) {
                $('<img>').attr('src', 'resources/enigma/'+val).appendTo($cache);

            });
        }

        if(screen.type == 'converse') {
            $('<img>').attr('src', 'resources/character/'+screen.leftCharacter+'.png').appendTo($cache);
            $('<img>').attr('src', 'resources/character/'+screen.rightCharacter+'.png').appendTo($cache);
        }

        $('<img>').attr('src', 'resources/background/'+screen.background).appendTo($cache);

    }
}


// DevMODE with reset
var hash = window.location.href.split('#')[1];
if (hash == 'reset'){
    core.flush();
}


(function($, self){

    if(!$ || !self) {
        return;
    }

    for(var i=0; i<self.properties.length; i++) {
        var property = self.properties[i],
            camelCased = StyleFix.camelCase(property),
            PrefixCamelCased = self.prefixProperty(property, true);

        $.cssProps[camelCased] = PrefixCamelCased;
    }

})(window.jQuery, window.PrefixFree);
