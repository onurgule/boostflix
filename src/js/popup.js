var userConfig = [];
var locked = false;
var session = 'loading';
//0: playbackRate, 1:subSlow, 2:autoSkip
const sliderEl = document.querySelector('#slider');
const playbackRateEl = document.querySelector('.playback-rate');
var chSubSlow = document.querySelector('#cbsubslow').checked;
var chAutoSkip = document.querySelector('#cbautoskip').checked;
const defaultPlaybackRate = 1.0;
const defaultSubSlow = true;

/**
 * Given a value, this function filters the value
 * against the main playback rate values
 *
 * @param value - Playback value
 */
const filterSmallValues = value => !![0.1, 1.0, 2.0, 5.0].includes(value) ? 1 : 0

/**
 * Finds the video element on the current tab and sets currentPlaybackRate to be its playback rate
 *
 * @param currentPlaybackRate - Playback rate set by the slider
 * @param subSlow - subtitle slow check
 */
//document.querySelector('.skip-credits').classList.length == 1   -- true ise geç var
// document.querySelector('.skip-credits a').click() //tıklat

const changePlaybackRate = (domRef = false,currentPlaybackRate, subSlow, autoSkipIntro = 0) => {
    if(domRef){
        locked = true;
        document.querySelector('#slider').noUiSlider.set(currentPlaybackRate)
        document.querySelector('#cbsubslow').checked = subSlow;
        document.querySelector('#cbautoskip').checked = autoSkipIntro;
        locked = false;
    }
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.executeScript(
            tabs[0].id,
            {
                code:  `
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                  }
                  var player = null;
                  async function tanimla(pl){
                    await sleep(10000);
                    try{
                    const videoPlayer = netflix
                    .appContext
                    .state
                    .playerApp
                    .getAPI()
                    .videoPlayer
                  
                  // Getting player id
                  const playerSessionId = videoPlayer
                    .getAllPlayerSessionIds()[0]
                  
                  player = videoPlayer
                    .getVideoPlayerBySessionId(playerSessionId)
                    }
                    catch(exc){
                        console.log("You should watch something.")
                    }
                  }
                  tanimla(player);
                  document.addEventListener('keypress', logKey);
                  
                  function logKey(e) {
                    
                    switch(e.code){
                      case 'KeyN':
                        document.getElementsByClassName('button-nfplayerNextEpisode')[0].click();
                        break;
                      case 'KeyQ':
                        document.getElementsByClassName('button-nfplayerBack')[0].click();
                        break;
                      case 'KeyK':
                        player.seek(player.getCurrentTime()-2000);
                        break;
                      case 'KeyL':
                        player.seek(player.getCurrentTime()+2000);
                        break;
                    }
                  }
                if(flexTimers != null && flexTimers != undefined){
                    flexTimers.map((a) => {
                        clearInterval(a);
                        flexTimers = [];
                      })    
                }
                var flexTimers = [];
                function olaybicocuk(speed, subslow){
                    var website = window.location.href.includes("youtube.com") ? "Y" : ( window.location.href.includes("netflix.com") ? "N" : null);
                    if(website == null){
                        console.log("Only Netflix is supported.");
                        flexTimers.map((a) => {
                            clearInterval(a);
                            flexTimers = [];
                          })  
                          return;
                    }
                    var altyazi = website=="N"?document.getElementsByClassName('player-timedtext-text-container').length:(website=="Y"?document.getElementsByClassName('caption-visual-line').length : 0);
                    if(altyazi>0 && subslow == true){
                    document.querySelectorAll('video').forEach(v => v.playbackRate = 1)
                    }
                    else{
                    document.querySelectorAll('video').forEach(v => v.playbackRate = speed)
                    }
                    }
                    flexTimers.push(setInterval(function () {
                        olaybicocuk(${currentPlaybackRate}, ${subSlow});
                        if(${autoSkipIntro} == true){
                            if(document.querySelector('.skip-credits') != null){
                                if(document.querySelector('.skip-credits').classList.length == 1){
                                    document.querySelector('.skip-credits a').click()
                                }
                            }
                        }
                      }, 100));

                      //var imdbList = "";
                      if (window.sessionStorage !== "undefined") {
                      var imdbList = (window.sessionStorage.getItem('imdbList') != null) ? window.sessionStorage.getItem('imdbList') : "";
                        var rating = "?";
                        var target = document.body;
                        // create an observer instance
                        var observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                //window.setTimeout(fetchMovieNameYear, 5);
                                //bak bakalım moviede mi?
                                if(document.querySelectorAll('.previewModal--boxart').length > 0)
                                {
                                    //moviede
                                    var title = document.querySelectorAll('.previewModal--boxart')[0].alt;
                                    //var exist = imdbList.find(mvi => mvi.title == title);
                                    var exist = (imdbList != null) ? imdbList.split(";").find(xa => xa.indexOf(title) != -1) : null;
                                    if(exist != null){
                                        rating = exist.split('_')[1];
                                        //rating = exist.rating;
                                    }
                                    else {
                                    fetch("https://imdb-internet-movie-database-unofficial.p.rapidapi.com/film/"+title, {
                                    "method": "GET",
                                    "headers": {
                                        "x-rapidapi-host": "imdb-internet-movie-database-unofficial.p.rapidapi.com",
                                        "x-rapidapi-key": "65b75494f9msh33767e15e879691p187583jsn8d15da8929b6"
                                    }
                                })
                                .then(response => response.json())
                                .then(infos => {
                                    rating = infos.rating;
                                    //imdbList.push({title: title, rating: rating });
                                    var exist = (window.sessionStorage.getItem('imdbList') != null) ? window.sessionStorage.getItem('imdbList').split(";").find(xa => xa.indexOf(title) != -1) : null;
                                    if(exist == null){
                                    imdbList += title+"_"+rating+";";
                                    
                                    window.sessionStorage.setItem('imdbList',imdbList);
                                    }
                                    if(title == document.querySelectorAll('.previewModal--boxart')[0].alt )
                                    if(document.querySelector('.videoMetadata--second-line').innerHTML.indexOf('IMDB') == -1)
                                    document.querySelector('.videoMetadata--second-line').innerHTML+= "<span>IMDB: "+rating+"</span>"

                                })
                                .catch(err => {
                                    console.log(err);
                                });
                                    }
                                }
                            });
                        });
                        // configuration of the observer:
                        var config = {
                            attributes: true,
                            childList: true,
                            characterData: true
                        };
                        observer.observe(target, config);
                    }
                      `

                      
            }
        )
    })
}

/**
 * Create slider on sliderEl element
 */
noUiSlider.create(sliderEl, {
    range: {
        'min': [0.1, 0.1],
        '30%': [1.0, 0.1],
        '60%': [2.0, 0.5],
        'max': [5.0]
    },
    start: defaultPlaybackRate,
    behaviour: 'tap-drag',
    tooltips: true,
    pips: {
        mode: 'steps',
        density: 20,
        filter: filterSmallValues
    }
});

/**
 * Set the slider value to default playback rate
 */
document.addEventListener('DOMContentLoaded', function() {
    
    //if(userConfig.length == 0)
    chrome.storage.local.get({userConfig:[]},function(data){
        userConfig = data.userConfig;
        changePlaybackRate(true,userConfig[0],userConfig[1],userConfig[2])
        session = 'loaded';
    });
    // event listener for the button inside popup window
    //document.getElementById('button').addEventListener('click', addLink);
});

/*document.querySelector('.button-reset').addEventListener('click', () => {
    sliderEl.noUiSlider.set(defaultPlaybackRate)
    changePlaybackRate(defaultPlaybackRate,defaultSubSlow)
});*/

document.querySelector('#cbsubslow').addEventListener('change', (sonuc) => {
    if(!locked){
    chSubSlow = sonuc.target.checked;
    changePlaybackRate(false,sliderEl.noUiSlider.get(),chSubSlow)
    saveConfigs();
    }
});
document.querySelector('#cbautoskip').addEventListener('change', (sonuc) => {
    if(!locked){
    chAutoSkip = sonuc.target.checked;
    changePlaybackRate(false,sliderEl.noUiSlider.get(),chSubSlow,chAutoSkip)
    saveConfigs();
    }
});

/**
 * Sets the playback rate text to current playback rate whenever the slider value is updated
 */
sliderEl.noUiSlider.on('update', () => {
    if(!locked){
    playbackRateEl.textContent = `Video Speed: ${sliderEl.noUiSlider.get()}x`
    changePlaybackRate(false,sliderEl.noUiSlider.get(),chSubSlow)
    saveConfigs();
    }
});
function saveConfigs(){
    if(session == 'loaded'){
    userConfig = [sliderEl.noUiSlider.get(),chSubSlow,chAutoSkip];
    chrome.storage.local.set({userConfig},function(){
        if(typeof callback === 'function'){
            //If there was no callback provided, don't try to call it.
            callback();
        }
    });
}
}



