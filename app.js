let audioContext;
let micStream;
let gainNode;
let micActive = false;
let reverbNode;
let convolverBuffer;
let audioDestination;

const micButton = document.getElementById("micButton");
const volumeControl = document.getElementById("volumeControl");
const reverbToggle = document.getElementById("reverbToggle");
const inputSelect = document.getElementById("inputSelect");
const outputSelect = document.getElementById("outputSelect");
const songButton = document.getElementById("songButton");
const songInput = document.getElementById("songInput");
const player = document.getElementById("player");

// Yankı için impulse response (örnek yankı efekti)
async function loadReverb() {
  const response = await fetch("https://cdn.jsdelivr.net/gh/mdn/webaudio-examples/audio-buffer/concert-crowd.ogg");
  const arrayBuffer = await response.arrayBuffer();
  convolverBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

async function startMic() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const inputId = inputSelect.value;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: inputId ? { exact: inputId } : undefined } });
  micStream = audioContext.createMediaStreamSource(stream);

  gainNode = audioContext.createGain();
  reverbNode = audioContext.createConvolver();
  await loadReverb();
  reverbNode.buffer = convolverBuffer;

  micStream.connect(gainNode);

  if (reverbToggle.checked) {
    gainNode.connect(reverbNode);
    reverbNode.connect(audioContext.destination);
  } else {
    gainNode.connect(audioContext.destination);
  }

  micActive = true;
  micButton.textContent = "🔇 Mikrofona Durdur";
}

function stopMic() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    micActive = false;
    micButton.textContent = "🎙️ Mikrofona Başla";
  }
}

micButton.addEventListener("click", async () => {
  if (!micActive) {
    await startMic();
  } else {
    stopMic();
  }
});

volumeControl.addEventListener("input", e => {
  const volume = parseFloat(e.target.value);
  if (gainNode) gainNode.gain.value = volume;
});

reverbToggle.addEventListener("change", async () => {
  if (micActive) {
    stopMic();
    await startMic(); // Reverb aç/kapa için sesi yeniden yönlendiriyoruz
  }
});

songButton.addEventListener("click", () => {
  songInput.click();
});

songInput.addEventListener("change", () => {
  const file = songInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    player.src = url;
    player.play();
  }
});

// Giriş/çıkış aygıtlarını listele
navigator.mediaDevices.enumerateDevices().then(devices => {
  devices.forEach(device => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = `${device.kind === 'audioinput' ? '🎙️' : '🔈'} ${device.label || device.deviceId}`;
    if (device.kind === 'audioinput') {
      inputSelect.appendChild(option);
    } else if (device.kind === 'audiooutput') {
      outputSelect.appendChild(option);
    }
  });
});

// Seçilen çıkış cihazını ayarla
outputSelect.addEventListener("change", () => {
  const sinkId = outputSelect.value;
  if (typeof player.sinkId !== 'undefined') {
    player.setSinkId(sinkId).catch(err => console.error('Çıkış değiştirilemedi:', err));
  } else {
    console.warn('Tarayıcın output değişimini desteklemiyor 😢');
  }
});
