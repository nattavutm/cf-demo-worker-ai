export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === "/api/chat") {
            if (request.method === "OPTIONS") {
                return new Response(null, {
                    status: 204,
                    headers: {
                        "access-control-allow-origin": "*",
                        "access-control-allow-methods": "POST, OPTIONS",
                        "access-control-allow-headers": "content-type",
                    },
                });
            }

            if (request.method !== "POST") {
                return new Response("Method Not Allowed", { status: 405 });
            }

            try {
                const body = await request.json();
                const messages = Array.isArray(body?.messages) ? body.messages : [];
                const requestedModel = typeof body?.model === "string" ? body.model : "";

                const system = {
                    role: "system",
                    content: "You are a helpful assistant.",
                };

                const promptMessages = [system, ...messages]
                    .filter((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "system") && typeof m.content === "string")
                    .map((m) => ({ role: m.role, content: m.content }));

                const allowedModels = new Set([
                    "@cf/meta/llama-3.1-8b-instruct",
                    "@cf/meta/llama-3.1-70b-instruct",
                    "@cf/mistral/mistral-7b-instruct-v0.2",
                ]);

                const defaultModel = "@cf/meta/llama-3.1-8b-instruct";
                const model = allowedModels.has(requestedModel) ? requestedModel : defaultModel;

                const aiResult = await env.AI.run(model, {
                    messages: promptMessages,
                });

                const reply =
                    aiResult?.response ??
                    aiResult?.result ??
                    aiResult?.output ??
                    (typeof aiResult === "string" ? aiResult : JSON.stringify(aiResult));

                return Response.json(
                    { reply },
                    {
                        headers: {
                            "access-control-allow-origin": "*",
                        },
                    }
                );
            } catch (err) {
                return Response.json(
                    { error: "Chat request failed" },
                    {
                        status: 500,
                        headers: {
                            "access-control-allow-origin": "*",
                        },
                    }
                );
            }
        }

        // Simple routing for static assets
        if (url.pathname === "/style.css") {
            return new Response(STYLES, {
                headers: { "content-type": "text/css" },
            });
        }

        if (url.pathname === "/script.js") {
            return new Response(SCRIPT, {
                headers: { "content-type": "application/javascript" },
            });
        }

        return new Response(HTML, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        });
    },
};

const STYLES = `:root {
    --bg-white: #ffffff;
    --gemini-blue: #4796e3;
    --gemini-purple: #ad89eb;
    --gemini-pink: #ca6673;
    --text-main: #1f1f1f;
    --text-dim: #444746;
    --nav-height: 64px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Outfit', sans-serif;
    background-color: var(--bg-white);
    color: var(--text-main);
    line-height: 1.5;
    overflow-x: hidden;
    overflow-y: auto;
}

#background-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: #ffffff;
}

.glass-nav {
    position: fixed;
    top: 0;
    width: 100%;
    height: var(--nav-height);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
}

.nav-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-main);
}

.logo span {
    font-weight: 400;
    color: var(--text-dim);
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
}

.nav-item {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
}

.nav-links a {
    color: var(--text-main);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: opacity 0.2s;
}

.nav-links a:hover {
    opacity: 0.7;
}

.dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 8px;
    min-width: 200px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 1001;
}

.nav-item:hover .dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
}

.dropdown a {
    display: block;
    padding: 12px 16px;
    color: var(--text-main) !important;
    font-size: 0.85rem;
    font-weight: 500;
    border-radius: 8px;
    transition: background 0.2s;
}

.dropdown a:hover {
    background: #f5f5f7;
    opacity: 1 !important;
}

.btn-pill {
    background: #000;
    color: #fff !important;
    padding: 10px 24px;
    border-radius: 100px;
    font-weight: 600 !important;
}

.chat-shell {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding: calc(var(--nav-height) + 48px) 24px 64px;
}

.chat-header {
    text-align: center;
    margin-bottom: 24px;
}

.chat-header h1 {
    font-size: clamp(2.25rem, 6vw, 4rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin-bottom: 10px;
}

.chat-header h1 span {
    background: linear-gradient(90deg, var(--gemini-blue), var(--gemini-purple), var(--gemini-pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.chat-header p {
    color: var(--text-dim);
    font-size: 1.05rem;
    max-width: 860px;
    margin: 0 auto;
}

.chat-panel {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.08);
}

.chat-messages {
    height: min(58vh, 560px);
    overflow: auto;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.chat-bubble {
    width: fit-content;
    max-width: 85%;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.08);
    background: rgba(255,255,255,0.9);
    color: var(--text-main);
    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}

.chat-bubble.user {
    align-self: flex-end;
    background: rgba(71, 150, 227, 0.14);
    border-color: rgba(71, 150, 227, 0.25);
}

.chat-bubble.assistant {
    align-self: flex-start;
}

.chat-meta {
    font-size: 0.75rem;
    color: var(--text-dim);
    margin-bottom: 6px;
}

.chat-composer {
    display: flex;
    gap: 12px;
    padding: 14px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(255,255,255,0.85);
}

.chat-model {
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 14px;
    padding: 12px 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    outline: none;
    background: rgba(255,255,255,0.95);
    color: var(--text-main);
}

.chat-model:focus {
    border-color: rgba(71, 150, 227, 0.45);
    box-shadow: 0 0 0 4px rgba(71, 150, 227, 0.15);
}

.chat-input {
    flex: 1;
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 14px;
    padding: 12px 14px;
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    outline: none;
    background: rgba(255,255,255,0.95);
}

.chat-input:focus {
    border-color: rgba(71, 150, 227, 0.45);
    box-shadow: 0 0 0 4px rgba(71, 150, 227, 0.15);
}

.chat-send {
    border: 0;
    cursor: pointer;
    border-radius: 14px;
    padding: 12px 16px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(90deg, var(--gemini-blue), var(--gemini-purple), var(--gemini-pink));
}

.chat-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Hero Section */
.hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 120px 24px;
    text-align: center;
}

.hero-content h1 {
    font-size: clamp(3rem, 10vw, 5.5rem);
    font-weight: 700;
    line-height: 1.05;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    color: var(--text-main);
}

.hero-content h1 span {
    background: linear-gradient(90deg, var(--gemini-blue), var(--gemini-purple), var(--gemini-pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-content p {
    font-size: 1.25rem;
    color: var(--text-dim);
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.hero-actions {
    margin-top: 48px;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.btn-black {
    background: #1f1f1f;
    color: #fff;
    padding: 14px 32px;
    border-radius: 100px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.btn-black:hover {
    background: #000;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.15);
}

.btn-outline {
    background: transparent;
    border: 1px solid #dadce0;
    color: var(--text-main);
    padding: 14px 32px;
    border-radius: 100px;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-outline:hover {
    background: #f8f9fa;
}

.btn-black:hover {
    transform: scale(1.02);
}

/* Floating Cards */
.floating-cards {
    display: flex;
    gap: 2rem;
    margin-top: 5rem;
    perspective: 1000px;
}

.glass-card {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    padding: 2.5rem;
    border-radius: 24px;
    width: 280px;
    transition: transform 0.1s ease-out;
}

.card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.glass-card h3 {
    margin-bottom: 0.5rem;
}

.glass-card p {
    color: var(--text-dim);
    font-size: 0.9rem;
}

/* Console Section */
.demo-section {
    padding: 8rem 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.section-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-header h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.glass-container {
    background: var(--bg-card);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}

.terminal-header {
    background: rgba(255,255,255,0.05);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--glass-border);
}

.dots {
    display: flex;
    gap: 8px;
    margin-right: 1.5rem;
}

.dots span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.dots span:nth-child(1) { background: #ff5f56; }
.dots span:nth-child(2) { background: #ffbd2e; }
.dots span:nth-child(3) { background: #27c93f; }

.terminal-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: var(--text-dim);
}

.terminal-body {
    padding: 2rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    min-height: 300px;
}

.line { margin-bottom: 0.5rem; }
.blue { color: var(--primary); }
.green { color: #27c93f; }
.cyan { color: var(--secondary); }

.cursor {
    animation: blink 1s infinite;
}

@keyframes blink {
    50% { opacity: 0; }
}

footer {
    padding: 4rem 2rem;
    text-align: center;
    border-top: 1px solid var(--glass-border);
    color: var(--text-dim);
}

/* Animations */
.fade-in {
    opacity: 0;
    animation: fadeIn 0.8s forwards;
}

.fade-up {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeUp 0.8s 0.2s forwards;
}

@keyframes fadeIn {
    to { opacity: 1; }
}

@keyframes fadeUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .floating-cards {
        flex-direction: column;
    }
    .hero-actions {
        flex-direction: column;
        width: 100%;
    }

    .chat-shell {
        padding: calc(var(--nav-height) + 32px) 16px 48px;
    }
    .chat-messages {
        height: min(62vh, 520px);
        padding: 14px;
    }
}
`;

const SCRIPT = `const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let width, height, particles;

const colors = ['#4796e3', '#ad89eb', '#ca6673', '#ad89eb'];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = Math.random() * 0.5 + 0.2;
        this.orbitRadius = Math.random() * 300 + 50;
        this.centerX = width / 2;
        this.centerY = height / 2;
    }

    update() {
        this.angle += this.velocity * 0.01;
        this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
    }
}

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

function createBubble({ role, text }) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-bubble ' + role;

    const meta = document.createElement('div');
    meta.className = 'chat-meta';
    meta.textContent = role === 'user' ? 'You' : 'Assistant';

    const content = document.createElement('div');
    content.textContent = text;

    wrapper.appendChild(meta);
    wrapper.appendChild(content);
    messages.appendChild(wrapper);

    messages.scrollTop = messages.scrollHeight;
}

const chatHistory = [];

async function callChatApi() {
    const modelSelect = document.getElementById('chat-model');
    const model = modelSelect ? modelSelect.value : '';
    const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ messages: chatHistory, model })
    });

    if (!resp.ok) {
        throw new Error('Bad response: ' + resp.status);
    }

    return await resp.json();
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    if (!input || !sendBtn) return;

    const raw = input.value;
    const text = raw.trim();
    if (!text) return;

    input.value = '';
    sendBtn.disabled = true;

    createBubble({ role: 'user', text });

    chatHistory.push({ role: 'user', content: text });

    callChatApi()
        .then((data) => {
            const reply = (data && data.reply) ? String(data.reply) : 'No reply returned.';
            createBubble({ role: 'assistant', text: reply });
            chatHistory.push({ role: 'assistant', content: reply });
        })
        .catch(() => {
            createBubble({ role: 'assistant', text: 'Error: failed to reach AI.' });
        })
        .finally(() => {
            sendBtn.disabled = false;
            input.focus();
        });
}

window.addEventListener('resize', init);
init();
animate();

createBubble({
    role: 'assistant',
    text: 'Hi! Ask me anything.'
});

const modelSelect = document.getElementById('chat-model');
if (modelSelect) {
    const models = [
        { id: '@cf/meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B' },
        { id: '@cf/meta/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
        { id: '@cf/mistral/mistral-7b-instruct-v0.2', label: 'Mistral 7B' },
    ];

    modelSelect.innerHTML = '';
    models.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.label;
        modelSelect.appendChild(opt);
    });

    modelSelect.value = models[0].id;
}

const sendBtn = document.getElementById('chat-send');
const input = document.getElementById('chat-input');

if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

if (input) {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}
`;

const HTML = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Demo | Antigravity Style</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
</head>
<body class="light-theme">
    <canvas id="background-canvas"></canvas>
    
    <nav class="glass-nav">
        <div class="nav-content">
            <div class="logo"><a href="https://demo-ai.cfdemor5r5.online/" target="_blank" style="color: inherit; text-decoration: none;">Cloudflare <span>Demo</span></a></div>
            <div class="nav-links">
                <a href="https://www.cloudflare.com/" target="_blank">Product</a>
                <div class="nav-item">
                    <a href="#use-cases">Use Cases <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle; margin-left:2px;"><path d="m6 9 6 6 6-6"/></svg></a>
                    <div class="dropdown">
                        <a href="https://ai-search.cfdemor5r5.online/" target="_blank">AI Search</a>
                        <a href="https://dash.cloudflare.com/13ebdde3f1c7214069372d80970c4b28/ai/ai-gateway/gateways/cf-demo-ai-suite-ai-search/overview" target="_blank">AI Gateway</a>
                        <a href="https://steam.cfdemor5r5.online/" target="_blank">Stream</a>
                    </div>
                </div>
                <a href="https://www.linkedin.com/in/bank-nattavut" target="_blank" class="btn-pill" style="background: #0A66C2;">LinkedIn</a>
            </div>
        </div>
    </nav>

    <main>
        <section class="chat-shell">
            <div class="chat-header">
                <h1 class="fade-in">Cloudflare <span>Worker AI Chat</span></h1>
                <p class="fade-up">Chat UI demo for Cloudflare Workers AI. The backend connection is intentionally not implemented yet.</p>
            </div>

            <div class="chat-panel">
                <div class="chat-messages" id="chat-messages"></div>
                <div class="chat-composer">
                    <select class="chat-model" id="chat-model" aria-label="Model"></select>
                    <input class="chat-input" id="chat-input" type="text" placeholder="Type your message..." autocomplete="off" />
                    <button class="chat-send" id="chat-send" type="button">Send</button>
                </div>
            </div>
        </section>
    </main>

    <script src="/script.js"></script>
</body>
</html>
`;
