const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

const publicData = JSON.parse(fs.readFileSync('data/public_data.json', 'utf-8'));
const customData = JSON.parse(fs.readFileSync('data/custom_data.json', 'utf-8'));

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // 임의로 법률 정보와 위로의 말을 선택
  const lawInfo = publicData.laws[Math.floor(Math.random() * publicData.laws.length)];
  const caseInfo = customData.cases[Math.floor(Math.random() * customData.cases.length)];
  const comfortingWord = customData.comforting_words[Math.floor(Math.random() * customData.comforting_words.length)];

  const prompt = `
  User: ${userMessage}
  Bot: ${lawInfo}
  Bot: ${caseInfo}
  Bot: ${comfortingWord}
  `;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const botMessage = response.data.choices[0].text.trim();
    res.json({ message: botMessage });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
