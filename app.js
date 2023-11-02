
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
require('./db/conn');
const router = require('./Router/router');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const cookieParser = require('cookie-parser');
const session = require('express-session');

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
	res.send('server start');
});

app.use(express.json());
app.use(
	cors({
		origin: ['https://scms-web.netlify.app'],
		methods: ['GET', 'POST', 'DELETE', 'PATCH', 'UPDATE'],
		credentials: true,
	})
);

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		key: 'user',
		secret: 'jishank',
		resave: 'false',
		saveUninitialized: false,
		cookie: {
			expires: 60 * 60 * 24,
		},
	})
);

app.use('/uploads', express.static('./uploads'));
app.use(router);

app.listen(PORT, () => {
	console.log('Server started on port ' + PORT);
});
