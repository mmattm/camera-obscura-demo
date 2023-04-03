export default async function handler(req, res) {
  //console.log(req.body.image);
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version:
        "4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608",

      // This is the text prompt that will be submitted by a form on the frontend
      input: {
        caption: req.body.caption,
        image: req.body.image,
        question: "what do you think about this image ?",
      },
    }),
  });

  //console.log(response);

  if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const prediction = await response.json();
  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}
