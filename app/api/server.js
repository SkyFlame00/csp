const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')

const mountRoutes = require('./routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uiServerLocation = 'http://localhost:3001';

// app.use((req, res, next) => {
//   res.set('Access-Control-Allow-Origin', uiServerLocation);
//   res.set('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

app.use(cors());

const {db} = require('csp-app-api/main');
mountRoutes(app, db)

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));