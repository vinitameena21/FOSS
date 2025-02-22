
        function toggleDarkMode() {
            document.body.classList.toggle("dark-mode");
        }
        
        async function searchWord() {
            const word = document.getElementById("wordInput").value;
            if (!word) {
                alert("Please enter a word!");
                return;
            }
            saveToHistory(word);
            
            const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.title) {
                    document.getElementById("result").innerHTML = "<p>Word not found! ❌</p>";
                } else {
                    const meaning = data[0].meanings[0].definitions[0].definition;
                    const synonyms = data[0].meanings[0].synonyms.join(", ") || "No synonyms available";
                    let pronunciation = "";
                    for (let phonetic of data[0].phonetics) {
                        if (phonetic.audio) {
                            pronunciation = phonetic.audio;
                            break;
                        }
                    }
                    const hindiMeaning = await getHindiTranslation(meaning);
                    
                    document.getElementById("result").innerHTML = `
                        <h3>${word} <button onclick="addToFavorites('${word}')">⭐</button></h3>
                        <p><strong>Meaning (English):</strong> ${meaning}</p>
                        <p><strong>Meaning (Hindi):</strong> ${hindiMeaning}</p>
                        <p><strong>Synonyms:</strong> ${synonyms}</p>
                        ${pronunciation ? `<button onclick="playAudio('${pronunciation}')">🔊 Listen</button>` : "<p>No pronunciation available</p>"}
                    `;
                }
            } catch (error) {
                console.error("Error fetching data", error);
                document.getElementById("result").innerHTML = "<p>Something went wrong! ❌</p>";
            }
        }
        function playAudio(url) {
            new Audio(url).play();
        }
        async function getHindiTranslation(text) {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.responseData.translatedText || "No Hindi meaning available";
            } catch (error) {
                console.error("Error fetching Hindi translation", error);
                return "Translation not available";
            }
        }
        function startVoiceInput() {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = "en-US";
            recognition.start();
            recognition.onresult = function (event) {
                document.getElementById("wordInput").value = event.results[0][0].transcript;
            };
        }
        function saveToHistory(word) {
            let history = JSON.parse(localStorage.getItem("history")) || [];
            history.unshift(word);
            if (history.length < 5) history.pop();
            localStorage.setItem("history", JSON.stringify(history));
            displayHistory();
        }
        function displayHistory() {
            const history = JSON.parse(localStorage.getItem("history")) || [];
            document.getElementById("historyList").innerHTML = history.map(word => `<li>${word}</li>`).join('');
        }
        function addToFavorites(word) {
            let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
            if (!favorites.includes(word)) {
                favorites.push(word);
                localStorage.setItem("favorites", JSON.stringify(favorites));
            }
            displayFavorites();
        }
        function displayFavorites() {
            const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
            document.getElementById("favoritesList").innerHTML = favorites.map(word => `<li>${word}</li>`).join('');
        }
        displayHistory();
        displayFavorites();
 
