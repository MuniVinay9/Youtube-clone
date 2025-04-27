// Corrected and improved version of selectedVideo.js

// DOM elements declared properly
const VideoContainer = document.getElementById("mainVideo");
const selectedVideoInfo = document.getElementById("mainVideoInfo");
const userCommentDiv = document.getElementById("userCommentSection");
const ownerComments = document.getElementById("ownerComment");
const recommendedSectionDiv = document.getElementById("recommendedVideo");

const API_KEY = "AIzaSyCVwKurSR0Sb346-lhcAH2sPzjzp01t-cU";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// Extract videoId from URL
const urlParam = new URLSearchParams(window.location.search);
const videoID = urlParam.get("videoId");

window.addEventListener("load", () => {
  if (typeof YT !== "undefined") {
    new YT.Player(VideoContainer, {
      height: "400",
      width: "100%",
      videoId: videoID,
    });
  }
  loadSelectedVideoInfo();
  getComments(videoID);
  getRecommendedVideos(videoID);
});

// Load video info from session storage
function loadSelectedVideoInfo() {
  const videoInfoString = sessionStorage.getItem("selectedVideoInformation");
  if (!videoInfoString) return;

  const getSelectedVideoInfo = JSON.parse(videoInfoString);

  let correctLikeCount = calculateLikes(getSelectedVideoInfo.likeCount);
  let correctSubscriberCount = calculateLikes(getSelectedVideoInfo.subscribers);

  selectedVideoInfo.innerHTML = `
    <h3>${getSelectedVideoInfo.videoTitle}</h3>
    <div class="videoInfo">
      <div class="channel">
        <img src="${getSelectedVideoInfo.channelLogo}" />
        <div>
          <h4>${getSelectedVideoInfo.channelName}</h4>
          <p>${correctSubscriberCount} subscribers</p>
        </div>
        <button class="subscribe">Subscribe</button>
      </div>
      <div class="channel">
        <button class="likeButton">
          <i class="fa-regular fa-thumbs-up"></i>
          <pre>${correctLikeCount}</pre>
          <div class="horizontalLine"></div>
          <i class="fa-regular fa-thumbs-down"></i>
        </button>
        <button class="likeButton">
          <i class="fa-regular fa-share-from-square"></i>
          Share
        </button>
        <button class="likeButton">
          <i class="fa-solid fa-ellipsis"></i>
        </button>
      </div>
    </div>
  `;
}

// Calculate like counts beautifully
function calculateLikes(count) {
  if (count < 1000) return count;
  if (count < 1000000) return (count / 1000).toFixed(1) + " K";
  return (count / 1000000).toFixed(1) + " M";
}

// Get comments
async function getComments(videoId) {
  try {
    let response = await fetch(`${BASE_URL}/commentThreads?key=${API_KEY}&videoId=${videoId}&maxResults=20&part=snippet`);
    const data = await response.json();
    displayComments(data.items || []);
  } catch (error) {
    console.error("Error loading comments:", error);
  }
}

function displayComments(data) {
  userCommentDiv.innerHTML = "";
  if (!data.length) {
    userCommentDiv.innerHTML = "<p>No comments found.</p>";
    return;
  }

  for (const ele of data) {
    const comment = ele.snippet.topLevelComment.snippet;
    let individualCommentDiv = document.createElement("div");
    individualCommentDiv.innerHTML = `
      <div class="userComment channel">
        <img src="${comment.authorProfileImageUrl}"/>
        <div class="userCommented">
          <p>@${comment.authorDisplayName}</p>
          <p>${comment.textDisplay}</p>
        </div>
      </div>
      <div class="comentLikeDislike">
        <div>
          <i class="fa-regular fa-thumbs-up"></i>
          <i class="fa-regular fa-thumbs-down"></i>
        </div>
        <p>Reply</p>
      </div>
    `;
    userCommentDiv.appendChild(individualCommentDiv);
  }
}

// Recommended videos
async function getRecommendedVideos(videoId) {
  try {
    let response = await fetch(`${BASE_URL}/search?key=${API_KEY}&relatedToVideoId=${videoId}&type=video&maxResults=16&part=snippet`);
    const data = await response.json();
    displayRecommendedVideos(data.items || []);
  } catch (error) {
    console.error("Error loading recommended videos:", error);
  }
}

function displayRecommendedVideos(data) {
  recommendedSectionDiv.innerHTML = "";
  if (!data.length) {
    recommendedSectionDiv.innerHTML = "<p>No recommended videos found.</p>";
    return;
  }

  for (const ele of data) {
    if (!ele.id || !ele.id.videoId || !ele.snippet) continue;

    let recommendedVideoCard = document.createElement("a");
    recommendedVideoCard.className = "recommenedvideoCard";
    recommendedVideoCard.href = `./selectedVideo.html?videoId=${ele.id.videoId}`;

    recommendedVideoCard.innerHTML = `
      <img src="${ele.snippet.thumbnails.high.url}"/>
      <div>
        <div class="channel">
          <h4>${ele.snippet.title}</h4>
        </div>
        <div>
          <p>${ele.snippet.channelTitle}</p>
        </div>
      </div>
    `;

    recommendedSectionDiv.appendChild(recommendedVideoCard);
  }
}

// Add your own comment (basic setup)
ownerComments.addEventListener("keyup", (event) => {
  if (event.key === "Enter" && event.target.value.trim()) {
    alert("Comment added (you can implement storing if you want)");
    event.target.value = "";
  }
});
