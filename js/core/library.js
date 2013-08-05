/**
 * Open Story
 * @type {{loadingScreen: boolean, activeEngine: null, screenNum: number, activeScreen: null, lastScreenType: null, episode: string, loadedStyles: Array, loadedScripts: Array, welcomeScreen: Function, footprints: Function, showLoadScreen: Function, hideLoadScreen: Function, displayNextLine: Function, loadConverseScreen: Function, enigmaIntro: Function, enigmaStart: Function, loadNextScreen: Function, blackFadeOut: Function, blackFade: Function, loadScreen: Function, selectScreen: Function, loadEpisode: Function, loadStyle: Function, loadScript: Function}}
 */

var core = {

    /* core Variables */
    loadingScreen: false,
    activeEngine: null,

    screenNum: 0,
    activeScreen: null,
    lastScreenType: null,

    episode: '',
    loadedStyles: new Array(),
    loadedScripts: new Array(),

    /**
     * Load Welcome Screen
     */
    welcomeScreen: function(){
        var self = this;
        _.delay(function(){

            $('#macaron').animate({top: '60px'}, 700, 'easeInOutBack', function(){
                $.getJSON("resources/story/story.json", function(episodeData){
                    $.jStorage.set('episodeList', episodeData.episodes);
                    $('#start').animate({right: '+=160', bottom: '+=160'}, 700, 'easeInOutBack', function(){
                        $('#options').animate({left: '+=160', bottom: '+=160'}, 700, 'easeInOutBack');
                    });

                    // CLICK ON START
                    $('#start').click(function(){

                        var episodeIndex = $.jStorage.get('episodeIndex') || 0;
                        $.jStorage.set('episodeIndex', episodeIndex);
                        if(typeof episodeData.episodes[episodeIndex] == 'undefined')
                        {
                            alert('GAME OVER');
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
                });
            });

            //if (screenfull.enabled) {
            //    screenfull.request($('#window')[0]);
            //}
            //soundObject.setAttribute('src', 'media/start_screen.ogg');
            //soundObject.play();
        }, 1000);

    },

    toggleOptionsScreen: function(){
        if($('#optionsForm').hasClass('open')){
            // Fermeture
            $('#optionsForm').toggleClass('open');
            $('#valid').animate({right: '-=130', bottom: '-=130'}, 700, 'easeInOutBack');
            $('#macaron').animate({top: '60px'}, 700, 'easeInOutBack');
            $('#options').animate({left: '+=160', bottom: '+=160'}, 700, 'easeInOutBack');
            $('#start').animate({right: '+=160', bottom: '+=160'}, 700, 'easeInOutBack');
        } else {
            // Ouverture
            $('#macaron').animate({top: '-280px'}, 700, 'easeInOutBack');
            $('#options').animate({left: '-=160', bottom: '-=160'}, 700, 'easeInOutBack');
            $('#start').animate({right: '-=160', bottom: '-=160'}, 700, 'easeInOutBack');
            $('#valid').animate({right: '+=130', bottom: '+=130'}, 700, 'easeInOutBack');
            $('#optionsForm').toggleClass('open');
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
     *
     * @param title    The chapter title
     * @param subtitle The chapter subtitle
     * @param callback callback function
     */
    showLoadScreen: function(title, subtitle, callback){
        core.loadingScreen = true;
        callback = null || callback;

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
            if(callback != null)
                callback();
            //soundObject.setAttribute('src', 'media/loading_screen.ogg');
            //soundObject.play();
            core.footprints();
            var chapter = $('#blackout div.chapter');
            $('h3', chapter).html(title);
            $('span', chapter).eq(0).html(subtitle).css('opacity', 1);
            chapter.css('top', '-40px');
            chapter.animate({top: '250px'}, 1700, 'easeOutBack', function(){
                $('span:last-child', chapter).addClass('blink');
            });
        }, 500);
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
        $('#blackout div.chapter').css('width', '1300');
        $('#blackout div.chapter').animate({left: '+=2000'}, 900, 'easeInOutBack', function(){

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
            $('div.bubble').fadeOut('3000', function(){
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
        $('#introEnigma').slideDown();
        $('#introEnigma').append('<h1>Enigme 1</h1>');

        //show question marks
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
        $('<div>').attr('class', 'breadcrumb').html('Enigme 1').appendTo($enigma);
        $('<div>').attr('class', 'legend').html(this.activeScreen.legend).appendTo($enigma);
        $('<a>').attr('id', 'valid').appendTo($enigma);
        $('<a>').attr('id', 'help').appendTo($enigma);
        $('<span>').appendTo($('#valid'));
        $('<span>').appendTo($('#help'));

        eval("var activeEngine = " + this.activeScreen.engine);
        this.activeEngine = activeEngine;

        this.activeEngine.container = $enigma;
        this.activeEngine.init(this.activeScreen);
        $('#introEnigma').fadeOut();

        $('#valid').delay(700).animate({right: '+=130', bottom: '+=130'}, 700, 'easeInOutBack', function(){
            $('#help').animate({left: '+=130', bottom: '+=130'}, 700, 'easeInOutBack');
            $('div.breadcrumb').animate({top: '0'}, 700, 'easeOutCirc', function(){
                $('div.legend').animate({bottom: '20px'}, 700, 'easeOutCirc');
            });
        });

        $.jStorage.subscribe("enigmaResolve", function(channel, nbTry){
            self.enigmaEnd(nbTry);
        });
    },

    enigmaEnd: function(nbTry){
        $('#endEnigma').remove();
        var self=this;
        var $enigmaEnd = $('<div>').attr('id', 'endEnigma').appendTo($('#window'));
        $('<h1>').html('Bravo !').appendTo($enigmaEnd);
        $('<h2>').html('Enigme 1').appendTo($enigmaEnd);

        $enigmaEnd.fadeIn('slow', function(){
            self.activeEngine.clean();
            $('#enigma').remove();


            var num = _.max([40 - (nbTry*10), 10]);
            var score = $.jStorage.get('playerScore') || 0;
            $('<span>').html(score).appendTo($enigmaEnd);
            $('<div>').html('+'+num).appendTo($enigmaEnd);

            _.delay(function(){

                $('h1', $enigmaEnd).animate({left: '380px'}, 700, 'easeInOutBack', function(){
                    $('h1', $enigmaEnd).delay(1600).animate({left: '1080px'}, 700, 'easeInOutBack');
                });

                for (var i=0; i < num; i++) {
                    _.delay(function(){
                        num--;
                        score++;
                        $('span', $enigmaEnd).html(score);
                        $('div', $enigmaEnd).html('+'+num);
                    }, i*130);
                }

                _.delay(function(){
                    $.jStorage.set('playerScore', score);
                    $('div', $enigmaEnd).fadeOut();
                }, i*130);

                _.delay(function(){
                    self.blackFade(function(){
                        $enigmaEnd.hide();
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
        this.activeScreen = this.episode.screens[this.screenNum];
        this.loadScreen(this.activeScreen);

        $.jStorage.set('screenNum', this.screenNum);
        this.screenNum++;
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

        /* check user progress */
        var episodeIndex = $.jStorage.get('episodeIndex');
        var episodes = $.jStorage.get('episodeList');

        this.screenNum = $.jStorage.get('screenNum') || 0;
        $.jStorage.set('screenNum', this.screenNum);

        // Init Score ??
        $.jStorage.set('playerScore', 0);
        var episodeName = $('meta[name=episode]').attr("content");

        if(!_.contains(episodes, episodeName) || episodes[episodeIndex] != episodeName){
            window.location.href= 'index.html';
            return;
        }

        var self=this;

        $.getJSON("resources/story/"+episodeName+".json", function(episodeJson){
            $('title').html(episodeJson.title);
            core.showLoadScreen(episodeJson.chapterTitle, episodeJson.chapterNumber);
            self.episode = episodeJson;

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
                        if (finish - now < 4000) {
                            _.delay(function(){self.launch();}, 4000 - finish + now);
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

    launch: function(){
        var self=this;
        self.hideLoadScreen(function(){self.loadNextScreen()});
    },


    loadNextEpisode: function(){
        var episodeIndex = $.jStorage.get('episodeIndex');
        var episodeList = $.jStorage.get('episodeList');

        episodeIndex++;
        $.jStorage.set('episodeIndex', episodeIndex);
        $.jStorage.set('screenNum', 0);
        if(typeof episodeList[episodeIndex] == 'undefined'){
            window.location.href = episodeList[episodeIndex]+'.html';
        } else
            window.location.href = 'index.html';
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
