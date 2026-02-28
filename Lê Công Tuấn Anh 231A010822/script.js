let strongCount = 0;
let weakCount = 0;

/* ================= PASSWORD ================= */

function togglePassword() {
    let input = document.getElementById("password");
    let icon = document.querySelector(".toggle");
    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "🙈";
    } else {
        input.type = "password";
        icon.textContent = "👁";
    }
}

function liveCheck() {
    let password = document.getElementById("password").value;
    let score = 0;

    score += checkRequirement("length", password.length >= 8);
    score += checkRequirement("upper", /[A-Z]/.test(password));
    score += checkRequirement("lower", /[a-z]/.test(password));
    score += checkRequirement("number", /[0-9]/.test(password));
    score += checkRequirement("special", /[^A-Za-z0-9]/.test(password));

    updateStrengthBar(score);
}

function checkRequirement(id, condition) {
    let el = document.getElementById(id);
    let text = el.textContent.slice(2);
    if (condition) {
        el.innerHTML = "✅ " + text;
        el.style.color = "lime";
        return 1;
    } else {
        el.innerHTML = "❌ " + text;
        el.style.color = "red";
        return 0;
    }
}

function updateStrengthBar(score) {
    let fill = document.getElementById("strengthFill");
    let percent = (score / 5) * 100;
    fill.style.width = percent + "%";

    if (score <= 2) fill.style.background = "red";
    else if (score <= 4) fill.style.background = "orange";
    else fill.style.background = "lime";
}

function checkPassword() {
    let password = document.getElementById("password").value;
    let result = document.getElementById("passwordResult");
    let explain = document.getElementById("passwordExplain");

    let score = 0;
    let reasons = [];

    if (password.length >= 8) score++; else reasons.push("Thiếu độ dài");
    if (/[A-Z]/.test(password)) score++; else reasons.push("Thiếu chữ in hoa");
    if (/[a-z]/.test(password)) score++; else reasons.push("Thiếu chữ thường");
    if (/[0-9]/.test(password)) score++; else reasons.push("Thiếu số");
    if (/[^A-Za-z0-9]/.test(password)) score++; else reasons.push("Thiếu ký tự đặc biệt");

    if (score >= 4) {
        result.innerHTML = "✅ Mật khẩu mạnh";
        result.style.color = "lime";
        explain.innerHTML = "Mật khẩu đa dạng ký tự, khó bị brute-force.";
        strongCount++;
        saveHistory("Mật khẩu mạnh");
    } else {
        result.innerHTML = "❌ Mật khẩu yếu";
        result.style.color = "red";
        explain.innerHTML = "Lý do: " + reasons.join(", ");
        weakCount++;
        saveHistory("Mật khẩu yếu");
    }

    updateChart();
    saveData();
}

/* ================= WEBSITE CHECK ================= */

function checkURL() {
    let url = document.getElementById("url").value.trim();
    let result = document.getElementById("urlResult");
    let explain = document.getElementById("urlExplain");
    let riskFill = document.getElementById("riskFill");

    let riskScore = 0;
    let reasons = [];

    if (!url.startsWith("https://")) {
        riskScore += 20;
        reasons.push("Không dùng HTTPS");
    }

    if (/https?:\/\/(\d{1,3}\.){3}\d{1,3}/.test(url)) {
        riskScore += 25;
        reasons.push("Dùng IP thay vì domain");
    }

    if (url.includes("@")) {
        riskScore += 20;
        reasons.push("Có ký tự @ giả mạo");
    }

    if (url.length > 100) {
        riskScore += 15;
        reasons.push("URL quá dài");
    }

    if ((url.match(/\./g) || []).length > 3) {
        riskScore += 10;
        reasons.push("Quá nhiều subdomain");
    }

    let phishingWords = ["login","verify","update","bank","secure","account"];
    if (phishingWords.some(w => url.toLowerCase().includes(w))) {
        riskScore += 20;
        reasons.push("Chứa từ khóa phishing");
    }

    riskFill.style.width = riskScore + "%";

    if (riskScore < 30) {
        riskFill.style.background = "lime";
        result.innerHTML = "✅ An toàn ("+riskScore+"%)";
    } else if (riskScore < 60) {
        riskFill.style.background = "orange";
        result.innerHTML = "⚠️ Rủi ro trung bình ("+riskScore+"%)";
    } else {
        riskFill.style.background = "red";
        result.innerHTML = "🚨 Nguy hiểm cao ("+riskScore+"%)";
    }

    explain.innerHTML = reasons.length ? reasons.join(", ") : "Không phát hiện dấu hiệu đáng ngờ.";
    saveHistory("Kiểm tra link: "+riskScore+"%");
}

/* ================= HISTORY ================= */

function saveHistory(text) {
    let history = document.getElementById("history");
    let li = document.createElement("li");
    li.textContent = text;
    history.appendChild(li);
}

function saveData() {
    localStorage.setItem("strong", strongCount);
    localStorage.setItem("weak", weakCount);
}

/* ================= CHART ================= */

strongCount = parseInt(localStorage.getItem("strong")) || 0;
weakCount = parseInt(localStorage.getItem("weak")) || 0;

let ctx = document.getElementById("myChart").getContext("2d");
let chart = new Chart(ctx, {
    type: "doughnut",
    data: {
        labels: ["Mạnh","Yếu"],
        datasets: [{
            data: [strongCount, weakCount],
            backgroundColor: ["lime","red"]
        }]
    }
});

function updateChart() {
    chart.data.datasets[0].data = [strongCount, weakCount];
    chart.update();
}