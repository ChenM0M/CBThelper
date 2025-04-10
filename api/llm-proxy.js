// api/llm-proxy.js

// Use dynamic import for node-fetch if needed, but Vercel's runtime might have fetch globally
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  const { prompt } = request.body;

  if (!prompt) {
    return response.status(400).json({ error: 'Prompt is required in the request body' });
  }

  const apiKey = process.env.LLM_API_KEY;
  const apiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions'; // Default URL
  const modelName = process.env.LLM_MODEL_NAME || 'gpt-3.5-turbo'; // Default model

  if (!apiKey) {
    console.error('LLM_API_KEY environment variable is not set.');
    return response.status(500).json({ error: 'API key configuration error on the server.' });
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,       // Keep parameters consistent with frontend needs
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.2
    }),
  };

  try {
    console.log(`Proxying request to LLM API: ${apiUrl} with model: ${modelName}`);
    const llmResponse = await fetch(apiUrl, requestOptions);
    const data = await llmResponse.json();

    if (!llmResponse.ok) {
      console.error('LLM API Error:', data);
      // Propagate the error structure if possible, otherwise a generic error
      return response.status(llmResponse.status).json(data || { error: `LLM API request failed with status ${llmResponse.status}` });
    }

    // Forward the successful response from LLM API to the frontend
    return response.status(200).json(data);

  } catch (error) {
    console.error('Error proxying LLM API request:', error);
    return response.status(500).json({ error: 'Failed to process LLM request.', details: error.message });
  }
} 