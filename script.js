const display = document.getElementById('result');
const toggle = document.getElementById('modeToggle');
const copyBtn = document.getElementById('copyBtn');

// Helper: Adds a leading zero to numbers < 10
function pad(num) {
    return num.toString().padStart(2, '0');
}

// 1. AUTO-SWITCH LOGIC
function checkTimeRules() {
    const now = new Date();
    // Convert current time to "minutes from midnight" for easy comparison
    // e.g., 06:00 = 360, 10:00 = 600
    const currentMins = (now.getHours() * 60) + now.getMinutes();

    let shouldBeClockOut = true; // Default to OUT

    // LOGIC: Check "IN" periods. If it matches, set to false (Clock In).
    
    // 6:00 ~ 10:00 = IN (360 to 600)
    if (currentMins >= 360 && currentMins < 600) {
        shouldBeClockOut = false;
    }
    // 12:30 ~ 17:00 = IN (750 to 1020)
    else if (currentMins >= 750 && currentMins < 1020) {
        shouldBeClockOut = false;
    }
    // 17:15 ~ 19:00 = IN (1035 to 1140)
    else if (currentMins >= 1035 && currentMins < 1140) {
        shouldBeClockOut = false;
    }
    
    // Apply the rule to the switch
    // (Only change it if it's different, to avoid weird UI glitches)
    if (toggle.checked !== shouldBeClockOut) {
        toggle.checked = shouldBeClockOut;
        console.log("Auto-updated switch based on office rules.");
        updateState(); // Refresh the text display immediately
    }
}

// 2. MAIN DISPLAY FUNCTION
function updateState() {
    const now = new Date();
    
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    // Determine status based on checkbox state
    const status = toggle.checked ? '下班' : '上班';

    const finalString = `${month}/${day} ${status} ${hours}:${minutes}`;
    
    display.innerText = finalString;
}

// 3. COPY FUNCTION
function copyText() {
    const textToCopy = display.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Copied!";
        copyBtn.style.backgroundColor = "#4CAF50";
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.backgroundColor = "#333";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert("Could not copy text automatically.");
    });
}

// --- INITIALIZATION ---

// Run the rule check immediately when page loads
checkTimeRules();

// Run the display update immediately
updateState();

// Listen for manual clicks on the switch
toggle.addEventListener('change', updateState);

// Update display text every 1 second (to catch minute changes)
setInterval(updateState, 1000);

// Check office rules every 15 seconds (15000 ms)
setInterval(checkTimeRules, 15000);
