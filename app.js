let allTweets = [];

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function parseTweets(fileContent) {
    const jsonStart = fileContent.indexOf('[');
    const jsonEnd = fileContent.lastIndexOf(']') + 1;
    const jsonContent = fileContent.slice(jsonStart, jsonEnd);
    return JSON.parse(jsonContent);
}

function displaySelectedFiles() {
    const fileInput = document.getElementById('fileInput');
    const fileListDiv = document.getElementById('fileList');
    fileListDiv.innerHTML = "";  // Clear previous file names

    const files = fileInput.files;
    if (files.length > 0) {
        const fileList = document.createElement('ul');
        for (const file of files) {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        }
        fileListDiv.appendChild(fileList);
    } else {
        fileListDiv.textContent = "No files selected.";
    }
}

async function readFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Please upload files.");
        return;
    }

    allTweets = []; // Reset allTweets to avoid data duplication

    for (const file of files) {
        const fileContent = await readFileAsync(file);
        const tweets = parseTweets(fileContent);
        allTweets.push(...tweets);
    }

    // Enable the tweet ID input and process button
    document.getElementById('tweetIdInput').disabled = false;
    document.querySelector('button[onclick="processTweet()"]').disabled = false;

    alert("Files have been read successfully!");
}

function findTweetById(tweets, tweetId) {
    for (const tweet of tweets) {
        if (tweet['tweet']['id'] === tweetId) {
            return tweet['tweet'];
        }
    }
    return null;
}

function createTextChain(tweets, tweetId) {
    const tweetChain = [];
    let currentTweetId = tweetId;

    while (currentTweetId) {
        const tweetInfo = findTweetById(tweets, currentTweetId);
        if (tweetInfo) {
            tweetChain.unshift(tweetInfo['full_text']);
            currentTweetId = tweetInfo['in_reply_to_status_id'] || "";
            if (!currentTweetId) break;
        } else {
            break;
        }
    }

    return tweetChain.join("\n");
}

function processTweet() {
    const tweetIdInput = document.getElementById('tweetIdInput').value;

    if (!tweetIdInput) {
        alert("Please enter a tweet ID.");
        return;
    }

    const tweetChainText = createTextChain(allTweets, tweetIdInput);

    const blob = new Blob([tweetChainText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${tweetIdInput}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}