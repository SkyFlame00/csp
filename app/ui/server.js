const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static('./dist'));

app.get('*', (req, res) => {
  const bootstrap = fs.readFileSync('./bootstrap/index.html', 'utf8');
  res.end(bootstrap);
});

const port = 3001;
app.listen(port, () => console.log('Listening on port ' + port))