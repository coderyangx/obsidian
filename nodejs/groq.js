import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: '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', // process.env.GROQ_API_KEY,
});

console.log('groq', groq);
let res = '';

async function main() {
  const completion = await groq.chat.completions
    .create({
      messages: [
        {
          role: 'user',
          content: 'Explain the importance of low latency LLMs',
        },
      ],
      model: 'mixtral-8x7b-32768',
    })
    .then((chatCompletion) => {
      res = chatCompletion.choices[0]?.message?.content;
      // process.stdout.write(chatCompletion.choices[0]?.message?.content || '');
    });
}

main();
