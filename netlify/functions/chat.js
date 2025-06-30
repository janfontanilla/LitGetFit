const Groq = require('groq-sdk');

exports.handler = async function(event, context) {
  // We only care about POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const { message, conversationHistory, userProfile } = JSON.parse(event.body);
  const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!groqApiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Groq API key is not configured.' }),
    };
  }

  const groq = new Groq({ apiKey: groqApiKey });

  // This is a simplified system prompt. You can enhance this.
  const systemPrompt = `You are an expert AI fitness and nutrition coach. Be encouraging, professional, and focus on healthy habits. The user profile is: ${JSON.stringify(userProfile)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(conversationHistory || []),
    { role: 'user', content: message },
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content || 'Sorry, I had trouble getting a response.';

    return {
      statusCode: 200,
      body: JSON.stringify({ response }),
    };
  } catch (error) {
    console.error('Error with Groq API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response from AI service.' }),
    };
  }
}; 