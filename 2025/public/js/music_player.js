document.addEventListener("DOMContentLoaded", () => {
    const playlist = [
        "cascade-breathe-future-garage-412839.mp3",
        "deep-abstract-ambient_snowcap-401656.mp3",
        "groovy-vibe-427121.mp3",
        "hype-drill-music-438398.mp3",
        "sweet-life-luxury-chill-438146.mp3",
        "the-last-point-beat-electronic-digital-394291.mp3",
        "cascade-breathe-future-garage-412839.mp3",
        "future-design-344320.mp3",
        "retro-lounge-389644.mp3",
        "tell-me-what-379638.mp3",
        "deep-abstract-ambient_snowcap-401656.mp3",
        "groovy-vibe-427121.mp3",
        "sandbreaker-379630.mp3",
        "the-last-point-beat-electronic-digital-394291.mp3",
        "embrace-364091.mp3",
        "hype-drill-music-438398.mp3",
        "sweet-life-luxury-chill-438146.mp3",
        "vlog-beat-background-349853.mp3",
    ];

    const ul = document.getElementById("playlist");
    const audioPlayer = document.getElementById("audio-player");

    playlist.forEach((file) => {
        const li = document.createElement("li");
        li.textContent = file;
        li.onclick = () => playMusic(file);
        ul.appendChild(li);
    });

    function playMusic(filename) {
        audioPlayer.src = `../../assets/music/${filename}`;
        audioPlayer.play();
        startGlitchEffects();
    }

    let audioCtx;
    let noiseNode;
    let gainNode;
    let analyser;
    let dataArray;
    let canvas, canvasCtx;
    let source;

    function startGlitchEffects() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            // Visualizer Setup
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128; // Reduced for chunkier bars
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            canvas = document.getElementById("visualizer");
            canvasCtx = canvas.getContext("2d");

            // Connect audio player to analyser
            if (!source) {
                source = audioCtx.createMediaElementSource(audioPlayer);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
            }

            drawVisualizer();
        }

        function drawVisualizer() {
            requestAnimationFrame(drawVisualizer);

            analyser.getByteFrequencyData(dataArray);

            // Calculate average volume (amplitude) for bounce
            let sum = 0;
            let bassSum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
                if (i < 10) bassSum += dataArray[i]; // First 10 bins are bass
            }
            const bassAverage = bassSum / 10;

            // Ghosting Effect
            canvasCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            // Bounce Effect: Modulate Center Y with Bass
            // We want it to vibrate/jump around the center, not drift
            const time = Date.now() / 1000;
            const waveOffset = Math.sin(time * 2) * 5; // Gentle wave
            // Vibrate vertically based on bass volume
            const bassOffset = Math.sin(time * 20) * (bassAverage / 255) * 10;

            const centerY = canvas.height / 2 + waveOffset + bassOffset;

            // Neon Gradient
            const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, "#ec1414ff"); // Red/Green mix
            gradient.addColorStop(0.25, "#ecc30dff"); // Red/Green mix
            gradient.addColorStop(0.5, "#7ef81aff"); // Yellow
            gradient.addColorStop(0.75, "#ecc30dff"); // Red/Green mix
            gradient.addColorStop(1, "#ec1414ff"); // Red

            canvasCtx.fillStyle = gradient;

            const barWidth = canvas.width / dataArray.length;
            let barHeight;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                barHeight = dataArray[i] / 1.5;

                // Draw mirrored bars from bouncing center
                canvasCtx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
                x += barWidth;
            }
        }

        setInterval(() => {
            if (!audioPlayer.paused && Math.random() < 0.4) {
                const skipTime = 1 + Math.random() * 2;
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - skipTime);
            }
        }, 2000);

        // Random Static Noise
        setInterval(() => {
            if (!audioPlayer.paused && Math.random() < 0.2) {
                // Reduced to 20% chance
                playStaticNoise();
            }
        }, 3000);

        // Random Motherboard Beeps
        setInterval(() => {
            if (!audioPlayer.paused && Math.random() < 0.4) {
                // Increased to 40% chance
                playBeep();
            }
        }, 2000); // Check every 2s instead of 4s
    }

    function playBeep() {
        const oscillator = audioCtx.createOscillator();
        const beepGain = audioCtx.createGain();

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // Fixed 1000Hz

        beepGain.gain.setValueAtTime(0.1, audioCtx.currentTime);

        oscillator.connect(beepGain);
        beepGain.connect(analyser); // Connect to analyser to visualize beep

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
        console.log("Glitch: Beep");
    }

    function playStaticNoise() {
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;

        gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.2;

        noiseNode.connect(gainNode);
        gainNode.connect(analyser); // Connect to analyser to visualize static

        noiseNode.start();
        console.log("Glitch: Static Noise");
    }
});
