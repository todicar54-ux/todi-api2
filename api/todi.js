export default async function handler(req, res) {
  try {
    const OPENAI_KEY = process.env.OPENAI_KEY;
    const ELEVEN_KEY = process.env.ELEVEN_KEY;

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { message } = body;

    if (!message) {
      return res.status(400).json({ error: "Mesaj yok" });
    }

    // 🔥 GPT (Satış temsilcisi TODİ)
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
Genç erkek satış temsilcisisin.
Samimi, özgüvenli ve ikna edicisin.
TODICAR ürünlerini en iyi şekilde tanıt.
Rakiplerden ASLA bahsetme.
Kısa, net ve satış odaklı konuş.
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const gptData = await gpt.json();

    const text = gptData.choices[0].message.content;

    // 🔊 ElevenLabs (Gerçek ses)
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
