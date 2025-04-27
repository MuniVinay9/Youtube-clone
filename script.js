// Corrected and improved version of your script.js

// DOM elements declared properly
const searchInput = document.getElementById('searchInput');
const searchDiv = document.getElementById('searchDiv');
const scrollableRightSections = document.getElementById('scrollableRightSections');
const leftSection = document.getElementById('leftSection');
const copyRightSystem = document.getElementById('copyRightSystem');
const menuButton = document.getElementById("menubar");

const API_KEY = "AIzaSyCVwKurSR0Sb346-lhcAH2sPzjzp01t-cU";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

async function fetchData(searchQuery, maxItems) {
  try {
    let response = await fetch(`${BASE_URL}/search?key=${API_KEY}&q=${searchQuery}&maxResults=${maxItems}&part=snippet&type=video`);
    let data = await response.json();
    let arr = data.items;
    displayCards(arr, scrollableRightSections);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

window.addEventListener('load', () => {
  fetchData("", 12);
});

searchDiv.addEventListener("click", () => {
  let value = searchInput.value.trim();
  if (value) {
    fetchData(value, 12);
  }
  searchInput.value = "";
});

async function getVideoInfo(videoId) {
  try {
    let response = await fetch(`${BASE_URL}/videos?key=${API_KEY}&part=statistics&id=${videoId}`);
    let data = await response.json();
    return data.items;
  } catch (error) {
    console.error("Error fetching video info:", error);
    return [];
  }
}

async function getChannelLogo(channelId) {
  try {
    const response = await fetch(`${BASE_URL}/channels?key=${API_KEY}&part=snippet&id=${channelId}`);
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error("Error fetching channel logo:", error);
    return [];
  }
}

async function getSubscription(channelid) {
  try {
    let response = await fetch(`${BASE_URL}/channels?key=${API_KEY}&id=${channelid}&part=statistics`);
    let data = await response.json();
    return data.items;
  } catch (error) {
    console.error("Error fetching subscription count:", error);
    return [];
  }
}

async function displayCards(data, displayBody) {
  displayBody.innerHTML = "";

  for (const ele of data) {
    if (!ele.id || !ele.id.videoId || !ele.snippet || !ele.snippet.thumbnails) continue;

    let viewCountObj = await getVideoInfo(ele.id.videoId);
    ele.viewObject = viewCountObj;

    let channelInfoObject = await getChannelLogo(ele.snippet.channelId);
    ele.channelObject = channelInfoObject;

    let subscribers = await getSubscription(ele.snippet.channelId);
    ele.subscriberCount = subscribers;

    let displayDuration = calDuration(ele.snippet.publishedAt);

    let videoCard = document.createElement("a");
    videoCard.className = "videoCard";
    videoCard.href = `./selectedVideo.html?videoId=${ele.id.videoId}`;

    videoCard.addEventListener("click", () => {
      const InfoSelectedVideo = {
        videoTitle: `${ele.snippet.title}`,
        channelLogo: `${ele.channelObject[0]?.snippet?.thumbnails?.high?.url || ''}`,
        channelName: `${ele.snippet.channelTitle}`,
        likeCount: `${ele.viewObject[0]?.statistics?.viewCount || 0}`,
        channelID: `${ele.snippet.channelId}`,
        subscribers: `${ele.subscriberCount[0]?.statistics?.subscriberCount || 0}`,
      };
      sessionStorage.setItem("selectedVideoInformation", JSON.stringify(InfoSelectedVideo));
    });

    videoCard.innerHTML = `
      <img src="${ele.snippet.thumbnails.high.url}">
      <div class="channel">
        <img src="${ele.channelObject[0]?.snippet?.thumbnails?.high?.url || ''}" >
        <h4>${ele.snippet.title}</h4>
      </div>
      <div class="channelInfo">
        <p>${ele.snippet.channelTitle}</p>
        <p>${calculateViews(ele.viewObject[0]?.statistics?.viewCount || 0)} views, ${displayDuration} ago</p>
      </div>
    `;

    displayBody.appendChild(videoCard);
  }
}

function calDuration(publishedDate) {
  let publishedAt = new Date(publishedDate);
  let currentTime = new Date();
  let duration = currentTime - publishedAt;
  let days = Math.floor(duration / (1000 * 60 * 60 * 24));

  if (days < 1) return `${Math.floor(duration / (1000 * 60 * 60))} hours`;
  if (days <= 6) return `${days} days`;
  if (days <= 29) return `${Math.floor(days / 7)} weeks`;
  if (days <= 364) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

function calculateViews(viewCount) {
  if (viewCount < 1000) return viewCount;
  if (viewCount < 1_000_000) return (viewCount / 1000).toFixed(1) + " K";
  return (viewCount / 1_000_000).toFixed(1) + " M";
}

menuButton.addEventListener('click', showSmallMenuOptions);

function showSmallMenuOptions() {
  let menuCards = document.getElementsByClassName("mo");
  for (let menu of menuCards) {
    if (menu.classList.contains("menuCards")) {
      menu.classList.remove("menuCards");
      menu.classList.add("MENUCARDS");
      leftSection.style.flex = 1.5;
      copyRightSystem.style.display = "block";
    } else {
      menu.classList.remove("MENUCARDS");
      menu.classList.add("menuCards");
      leftSection.style.flex = 0.5;
      copyRightSystem.style.display = "none";
    }
  }
}
