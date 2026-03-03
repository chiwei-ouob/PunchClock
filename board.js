// Import modern Firebase Web SDKs via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 🔴 ACTION REQUIRED: PASTE YOUR RENDER URL
// e.g., 'https://my-discord-bot.onrender.com'
// ==========================================
const RENDER_API_URL = 'YOUR_RENDER_URL_HERE';

// ==========================================
// 🔴 ACTION REQUIRED: PASTE YOUR FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ... add the rest of your config fields here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const taskInput = document.getElementById('taskInput');
const getTagsBtn = document.getElementById('getTagsBtn');
const reviewArea = document.getElementById('reviewArea');
const tagsInput = document.getElementById('tagsInput');
const postTaskBtn = document.getElementById('postTaskBtn');
const tasksContainer = document.getElementById('tasksContainer');

// --- STEP 1: Ask Render/Gemini for Tags ---
getTagsBtn.addEventListener('click', async () => {
    const text = taskInput.value.trim();
    if (!text) {
        alert("Please enter a task description first.");
        return;
    }

    // UI state: Loading
    getTagsBtn.innerText = "⏳ Asking AI...";
    getTagsBtn.classList.add('btn-disabled');
    getTagsBtn.disabled = true;

    try {
        const response = await fetch(`${RENDER_API_URL}/api/classify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) throw new Error("Backend error");

        const data = await response.json();
        
        // Populate the review box
        tagsInput.value = data.tags.join(', ');
        
        // Show review area
        reviewArea.classList.remove('hidden');
        getTagsBtn.innerText = "✨ Get AI Tags";

    } catch (error) {
        console.error(error);
        alert("Failed to connect to the AI backend.");
        getTagsBtn.innerText = "✨ Get AI Tags";
    } finally {
        // Reset UI state
        getTagsBtn.classList.remove('btn-disabled');
        getTagsBtn.disabled = false;
    }
});

// --- STEP 2: Post Final Task to Render (which saves to Firebase) ---
postTaskBtn.addEventListener('click', async () => {
    const text = taskInput.value.trim();
    // Split the comma string back into an array, clean up whitespace
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t); 

    postTaskBtn.innerText = "Saving...";
    postTaskBtn.disabled = true;

    try {
        const response = await fetch(`${RENDER_API_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, tags: tags, author: "Manager" })
        });

        if (!response.ok) throw new Error("Failed to save");

        // Success! Clean up the UI
        taskInput.value = '';
        tagsInput.value = '';
        reviewArea.classList.add('hidden');

    } catch (error) {
        console.error(error);
        alert("Failed to save to database.");
    } finally {
        postTaskBtn.innerText = "📤 Post to Noticeboard";
        postTaskBtn.disabled = false;
    }
});

// --- STEP 3: Listen for Tasks Real-Time ---
// This listens to the "tasks" collection, ordered by newest first
const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    tasksContainer.innerHTML = ''; // Clear out the loading text
    
    if (snapshot.empty) {
        tasksContainer.innerHTML = '<div style="color: #888;">No tasks found. You are all caught up!</div>';
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Format the time securely (sometimes serverTimestamp is null for a split second while saving)
        let timeString = "Just now";
        if (data.createdAt) {
            const dateObj = data.createdAt.toDate();
            // Formats to something like "18:05"
            timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
        }

        // Build HTML for tags
        let tagsHtml = '';
        if (data.tags && data.tags.length > 0) {
            data.tags.forEach(tag => {
                tagsHtml += `<span class="tag-badge">#${tag}</span>`;
            });
        }

        // Create the card
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-time">🕒 ${timeString}</div>
            <div class="task-text">${data.originalText}</div>
            <div>${tagsHtml}</div>
        `;
        
        tasksContainer.appendChild(card);
    });
}, (error) => {
    console.error("Firebase Listener Error:", error);
    tasksContainer.innerHTML = '<div style="color: red;">Error loading tasks. Check permissions.</div>';
});