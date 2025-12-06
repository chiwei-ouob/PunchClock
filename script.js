const display = document.getElementById('result');
const toggle = document.getElementById('modeToggle');
const copyBtn = document.getElementById('copyBtn');

// Helper: Adds a leading zero to numbers < 10
function pad(num) {
    return num.toString().padStart(2, '0');
}

// Main Function: Generates the string
function updateState() {
    const now = new Date();
    
    // Date parts
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    
    // Time parts
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    // Determine status
    const status = toggle.checked ? '下班' : '上班';

    // Assemble the string
    const finalString = `${month}/${day} ${status} ${hours}:${minutes}`;
    
    // Update HTML
    display.innerText = finalString;
}

// Copy Function
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
        // Fallback for older browsers or non-secure contexts
        alert("Could not copy text automatically.");
    });
}

// Event Listeners
updateState();
toggle.addEventListener('change', updateState);
setInterval(updateState, 1000);