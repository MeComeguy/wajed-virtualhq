const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

const serviceAccount = require('./serviceAccount.json');
// Put your Firebase service account JSON file here
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const tokensFilePath = path.join(__dirname, 'tokens.json');

const readTokensFromFile = () => {
  if (fs.existsSync(tokensFilePath)) {
    const data = fs.readFileSync(tokensFilePath, 'utf8');
    return JSON.parse(data);
  }
  return {};
};

const writeTokensToFile = (tokens) => {
  fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));
};

app.post('/submit', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCredential = await admin.auth().createUser({
      email: email,
      password: password
    });
    const user = userCredential;
    console.log('User created:', user.uid);

    await admin.auth().generateEmailVerificationLink(email);
    console.log("Email verification has been sent to user:", user.uid);

    const customToken = await admin.auth().createCustomToken(user.uid);

    // Read existing tokens
    const tokens = readTokensFromFile();
    tokens[user.uid] = customToken;
    writeTokensToFile(tokens);

    res.status(200).json({
      message: 'Verification email sent!',
      details: {
        title: 'Verification email sent!'
      },
      customToken
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    if (!res.headersSent) {
      res.status(400).send(error.message);
    }
  }
});

app.post('/check-auth', (req, res) => {
  const { idToken } = req.body;
  try {
    const tokens = readTokensFromFile();
    const uid = Object.keys(tokens).find(key => tokens[key] === idToken);

    if (uid) {
      res.status(200).json({ authenticated: true, uid });
    } else {
      res.status(401).json({ authenticated: false, error: 'Token not found in storage.' });
    }
  } catch (error) {
    res.status(401).json({ authenticated: false, error: error.message });
  }
});

app.post('/signin', (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = { uid: `uid-${Date.now()}` };
    const uid = decodedToken.uid;

    const tokens = readTokensFromFile();
    tokens[uid] = idToken;
    writeTokensToFile(tokens);

    res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error('Error during sign-in:', error.message);
    res.status(401).json({ authenticated: false, error: error.message });
  }
});

app.post('/signoutall', async (req, res) => {
  try {
    writeTokensToFile({});

    res.status(200).send('Successfully signed out all users.');
  } catch (error) {
    console.error('Error signing out all users:', error.message);
    res.status(500).send('Failed to sign out all users.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
