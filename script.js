const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYLdFIRg-AZg8l7ytgpYX3Icc7mMnAhvL2eNw7HK8DTBmQerZ1TLQVBM8qBZ9ZYRgh/exec?action=getTests";
let isUserPaid = false; // Default
let allTestData = [];

// 1. Check if user is logged in and paid
async function checkUserStatus(email) {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkPayment&email=${email}`);
    const data = await response.json();
    isUserPaid = data.paid;
    renderTestList();
}

// 2. Render 50 Mock Tests
function renderTestList() {
    const container = document.getElementById('test-list-grid');
    container.innerHTML = "";

    for (let i = 1; i <= 50; i++) {
        const isLocked = !isUserPaid;
        const card = document.createElement('div');
        card.className = "test-item glass-card";
        card.innerHTML = `
            <div class="test-info">
                <span class="material-icons-round">${isLocked ? 'lock' : 'play_circle'}</span>
                <div>
                    <h4>Mock Test ${i}</h4>
                    <p>100 Questions • 90 Mins</p>
                </div>
            </div>
            ${isLocked ? 
                `<button class="btn-lock" onclick="handlePayment()">Unlock</button>` : 
                `<button class="btn-start" onclick="fetchQuestionsAndStart('Test_${i}')">Start</button>`
            }
        `;
        container.appendChild(card);
    }
}

// 3. Razorpay Payment
function handlePayment() {
    var options = {
        "key": "YOUR_RAZORPAY_KEY",
        "amount": "79900",
        "name": "Radiography Aspirants",
        "description": "AIIMS CRE Rankers Mock Test",
        "handler": async function (response){
            // Save payment to Google Sheet
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'registerPayment',
                    email: firebase.auth().currentUser.email,
                    name: firebase.auth().currentUser.displayName
                })
            });
            alert("Payment Successful! All tests unlocked.");
            location.reload();
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

// 4. Save Score to Google Sheet
async function saveScoreToSheet(score, accuracy, testId) {
    const user = firebase.auth().currentUser;
    await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'saveResult',
            email: user.email,
            name: user.displayName,
            testId: testId,
            score: score,
            accuracy: accuracy
        })
    });
}
