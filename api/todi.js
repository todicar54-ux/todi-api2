export default async function handler(req, res) {
  try {

    // 🔥 BODY FIX
    let body;

    if (req.body) {
      body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;
    } else {
      body = {};
    }

    const message = body.message;

    if (!message) {
      return res.status(400).json({ error: "Mesaj yok" });
    }

    const OPENAI_KEY = process.env.OPENAI_KEY;
    const ELEVEN_KEY = process.env.ELEVEN_KEY;

    // GPT
    const gpt = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Sen TODİ'sin.
Satış temsilcisisin.
Kısa ve ikna edici konuş.
Rakiplerden bahsetme.
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const gptData = await gpt.json();
    const text = gptData.choices[0].message.content;

    // SES
    const voice = await fetch("https://api.elevenlabs.io/v1/text-to-speech/TxGEqnHWrfWFTfGW9XjX", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2"
      })
    });

    const audioBuffer = await voice.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("x-text", text);

    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
