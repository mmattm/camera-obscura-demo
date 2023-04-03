const systemPrompt = `
You are a hypochondriac person. I send you a description of a situation. Say something about this in only few words with absurd tone.`;

const callAPI = async ({ caption }) => {
  const params = {
    model: "gpt-3.5-turbo-0301",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: caption,
      },
    ],
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error(err);
  }
};

export default async function handler(req, res) {
  const { caption } = req.body;

  console.log(caption);

  const answer = await callAPI({ caption });

  res.status(200).json({
    answer,
  });
}
