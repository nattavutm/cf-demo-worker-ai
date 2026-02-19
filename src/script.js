document.addEventListener('DOMContentLoaded', () => {
    // Floating Animation for Cards
    const cards = document.querySelectorAll('.glass-card');

    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;

        cards.forEach(card => {
            const speed = parseInt(card.getAttribute('data-speed') || '1');
            card.style.transform = `rotateY(${xAxis * speed / 2}deg) rotateX(${yAxis * speed / 2}deg) translateY(${yAxis * speed}px)`;
        });

        // Move background aura
        const aura = document.querySelector('.glow-aura');
        if (aura) {
            aura.style.transform = `translate(${e.pageX / 20}px, ${e.pageY / 20}px)`;
        }
    });

    // Terminal Typewriter Effect (Simulated)
    const terminal = document.getElementById('terminal');
    const logs = [
        '[HTTP] GET /api/v1/auth (200 OK) - 4ms',
        '[KV] Writing cache key: user_session_451...',
        '[AI] Prompting Llama-3-8b via AI Gateway',
        '[AI] Response generated in 842ms',
        '[D1] Querying database: SELECT * FROM telemetry...',
        '[R2] Uploading artifact to bucket: demo-assets'
    ];

    let logIndex = 0;

    function addLogLine() {
        if (logIndex < logs.length) {
            const line = document.createElement('div');
            line.className = 'line';
            line.innerHTML = `<span class="blue">[LOG]</span> ${logs[logIndex]}`;

            const activeLine = document.querySelector('.active-line');
            terminal.insertBefore(line, activeLine);

            logIndex++;
            setTimeout(addLogLine, Math.random() * 2000 + 500);
        }
    }

    // Start logs after a short delay
    setTimeout(addLogLine, 2000);
});
