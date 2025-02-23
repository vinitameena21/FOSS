        
        
function playSound() {
    let audio = new Audio('https://www.soundjay.com/button/button-3.mp3'); 
    audio.play();
}

// Toggle Theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

// Speech Recognition (Mic)
function startListening() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = function(event) {
        document.getElementById('wordInput').value = event.results[0][0].transcript;
        searchWord(); 
    };
    recognition.start();
}

// Search History Load
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
updateHistory();

async function searchWord() {
    let word = document.getElementById("wordInput").value.trim();
    if (!word) return alert("Please enter a word");
    
    try {
        let response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        let data = await response.json();
        
        if (response.ok) {
            let meanings = data[0].meanings;
            let definitions = meanings.map(meaning => meaning.definitions[0].definition).join(", ");
            let synonyms = meanings.flatMap(meaning => meaning.synonyms).filter((v, i, a) => a.indexOf(v) === i);
            let antonyms = meanings.flatMap(meaning => meaning.antonyms).filter((v, i, a) => a.indexOf(v) === i);
            let example = meanings[0].definitions[0].example || "No example available.";
            
            // Fetch Hindi Meaning
            let hindiMeaningResponse = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|hi`);
            let hindiData = await hindiMeaningResponse.json();
            let hindiMeaning = hindiData.responseData.translatedText || "No translation available.";
            
            document.getElementById("result").innerHTML = `
                <strong>Word:</strong> ${word} <br>
                <strong>Meaning:</strong> ${definitions} <br>
                <strong>Hindi Meaning:</strong> ${hindiMeaning} <br>
                <strong>Synonyms:</strong> ${synonyms.length ? synonyms.join(", ") : "None"} <br>
                <strong>Antonyms:</strong> ${antonyms.length ? antonyms.join(", ") : "None"} <br>
                <strong>Example:</strong> ${example}
            `;

            // Save to History
            if (!searchHistory.includes(word)) {
                searchHistory.push(word);
                localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
                updateHistory();
            }
        } else {
            document.getElementById("result").innerHTML = "No definition found!";
        }
    } catch (error) {
        document.getElementById("result").innerHTML = "Error fetching data!";
    }
}

// Update Search History
function updateHistory() {
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    searchHistory.forEach(word => {
        let option = document.createElement("option");
        option.value = word;
        option.textContent = word;
        historyList.appendChild(option);
    });
}

// Load from History
function loadFromHistory() {
    let word = document.getElementById("historyList").value;
    if (word) {
        document.getElementById("wordInput").value = word;
        searchWord();
    }
}

// Clear History
function clearHistory() {
    localStorage.removeItem("searchHistory");
    searchHistory = [];
    updateHistory();
}

// Text-to-Speech
function speakResult() {
    let text = document.getElementById("result").innerText;
    if (!text) return alert("No result to speak!");
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
}

// Word Suggestions
async function showSuggestions() {
    let input = document.getElementById("wordInput").value.trim();
    if (input.length < 2) {
        document.getElementById("suggestions").style.display = "none";
        return;
    }

    let response = await fetch(`https://api.datamuse.com/sug?s=${input}`);
    let data = await response.json();

    let suggestionsBox = document.getElementById("suggestions");
    suggestionsBox.innerHTML = "";
    data.forEach(item => {
        let div = document.createElement("div");
        div.textContent = item.word;
        div.onclick = () => {
            document.getElementById("wordInput").value = item.word;
            searchWord();
            suggestionsBox.style.display = "none";
        };
        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
}
