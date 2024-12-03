let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector('.songlists').getElementsByTagName('ul')[0];
    songUL.innerHTML = '';
    for (const song of songs) {
        songUL.innerHTML =
            songUL.innerHTML +
            `<li><img class="invert" src="allSVG/music.svg" alt="music" />
                <div class="songName">
                    <div class="dontShow">${song.replaceAll('%20', ' ')}</div>
                    <div>${song.replaceAll('%20', ' ').split(' -')[0]}</div>
                    <div>${song.replaceAll('%20', ' ').split(' -')[1].split('.mp3')[0]}</div>
                </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img  class="invert" src="allSVG/pause.svg" alt="play">
                    </div></li>`;
    }

    Array.from(document.querySelector('.songlists').getElementsByTagName('li')).forEach((e, index) => {
        // console.log(e)
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.songName').firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio(`/songs/` + track);
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = `allSVG/play.svg`;
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00';
};

async function displayAlbums() {
    let a = await fetch(`https://github.com/Nikhil-8285/SpotifyTwin/tree/main/songs`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector('.cardContainer');
    // console.log(Array.from(anchors).splice(2,7))
    let array = Array.from(anchors).splice(2, 8);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes('/songs') && !e.href.includes(".htaccess")) {
            let folder = e.href.split('/').slice(-1)[0];
            // console.log(e)
            // console.log(folder)
            let a = await fetch(`https://github.com/Nikhil-8285/SpotifyTwin/tree/main/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML =
                cardContainer.innerHTML +
                ` <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="black">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="" />
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
        }
    }

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
            // console.log(getSongs(`songs/${item.currentTarget.dataset.folder}`))
        });
    });
}
async function main() {
    await getSongs(`songs/HoneySingh`);
    playMusic(songs[0], true);

    displayAlbums();

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = 'allSVG/play.svg';
        } else {
            currentSong.pause();
            play.src = 'allSVG/pause.svg';
        }
    });

    currentSong.addEventListener('timeupdate', () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector('.songtime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    });

    document.querySelector('.seekbar').addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + '%';
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-130%';
    });

    previous.addEventListener('click', () => {
        currentSong.pause();
        // console.log('previous');
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
        console.log(songs.indexOf(currentSong.src.split('/').slice(-1)[0]));
    });

    next.addEventListener('click', () => {
        // currentSong.pause();
        // console.log('next');
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
        // console.log(songs.indexOf(currentSong.src.split('/').splice(-1)[0]))
    });

    document
        .querySelector('.range')
        .getElementsByTagName('input')[0]
        .addEventListener('change', e => {
            currentSong.volume = parseInt(e.target.value) / 100;
        });

    document.querySelector('.volume>img').addEventListener('click', e => {
        // console.log(e.target);
        // console.log(e.target.src)
        if (e.target.src.includes('volume.svg')) {
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
            currentSong.volume = 0;
            document.querySelector('.range').getElementsByTagName('input')[0].value = 0;
        } else {
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
            currentSong.volume = 0.5;
            document.querySelector('.range').getElementsByTagName('input')[0].value = 50;
        }
    });
}
main();
