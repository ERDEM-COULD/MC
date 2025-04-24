const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Kök klasördeki statik dosyaları servis et
app.use(express.static(__dirname));

// index.html dosyasını kökten gönder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
