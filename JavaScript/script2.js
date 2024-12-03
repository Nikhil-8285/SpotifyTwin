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
    let songsUrl = `https://raw.githubusercontent.com/Nikhil-8285/SpotifyTwin/main/songs/${folder}/`;
    let response = await fetch(songsUrl);
    let text = await response.text();
    let div = document.createElement('div');
    div.innerHTML = text;
    let as = div.getElementsByTagName('a');
    songs = [];

    // Get all .mp3 files in the folder
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/main/songs/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector('.songlists').getElementsByTagName('ul')[0];
    songUL.innerHTML = '';
    
    for (const song of songs) {
        songUL.innerHTML += `
            <li><img class="invert" src="allSVG/music.svg" alt="music" />
                <div class="songName">
                    <div class="dontShow">${song.replaceAll('%20', ' ')}</div>
                    <div>${song.replaceAll('%20', ' ').split(' -')[0]}</div>
                    <div>${song.replaceAll('%20', ' ').split(' -')[1].split('.mp3')[0]}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="allSVG/pause.svg" alt="play">
                </div></li>`;
    }

    Array.from(document.querySelector('.songlists').getElementsByTagName('li')).forEach((e, index) => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.songName').firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `https://raw.githubusercontent.com/Nikhil-8285/SpotifyTwin/main/songs/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = 'allSVG/play.svg';
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00';
};

async function displayAlbums() {
    let a = await fetch(`https://raw.githubusercontent.com/Nikhil-8285/SpotifyTwin/main/songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector('.cardContainer');
    let array = Array.from(anchors).splice(2, 8); // Get first few albums

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        let folder = e.href.split('/').slice(-1)[0];

        try {
            // Fetch album info (info.json)
            let albumResponse = await fetch(`https://raw.githubusercontent.com/Nikhil-8285/SpotifyTwin/main/songs/${folder}/info.json`);
            let albumInfo = await albumResponse.json();

            // Add album to the UI
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="black">
                            <path d="M8 5v14l11-7z"></path>
                        </svg>
                    </div>
                    <img src="https://raw.githubusercontent.com/Nikhil-8285/SpotifyTwin/main/songs/${folder}/cover.jpg" alt="cover" onerror="this.src='default_cover.jpg'" />
                    <h2>${albumInfo.title}</h2>
                    <p>${albumInfo.description}</p>
                </div>`;
        } catch (error) {
            console.error(`Error fetching album data for ${folder}:`, error);
        }
    }

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs('HoneySingh'); // Get the default songs from HoneySingh
    playMusic(songs[0], true); // Play the first song

    displayAlbums(); // Display albums

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
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector('.volume>img').addEventListener('click', e => {
        if (e.target.src.includes('volume.svg')) {
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
            currentSong.volume = 0;
        } else {
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
            currentSong.volume = 0.5;
        }
    });
}

main();
