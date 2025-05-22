export function GET(req: Request) {
  const url = new URL(req.url);
  const percent = url.searchParams.get("percent")?.toString();

  const body = `
  ${frontMatter(percent ? Number.parseInt(percent, 10) : null)}
  ${backMatter}
  `;

  return new Response(body, {
    headers: { "Content-Type": "text/html" },
    status: 200,
    statusText: "OK",
  });
}

const dotted = "⣀⣄⣤⣦⣶⣷⣿";
const shaded = "░▒▓█";

export async function POST(req: Request) {
  const formBody = await req.formData();
  let percent = formBody.get("percent")?.toString();

  if (!percent) percent = "0";

  return new Response(null, {
    headers: { Location: `${req.url}/${percent}` },
    status: 302,
  });
}

function generate(
  percent: number | null | undefined,
  bars: typeof dotted | typeof shaded,
) {
  const b_len = bars.length - 1;
  const empty = bars[0];
  const full = bars[b_len];

  function repeat(s: string, i: number) {
    let r = "";
    for (let j = 0; j < i; j++) r += s;
    return r;
  }

  function make_bar(p: number) {
    const size = 13;

    // short circuit for 100% & 0% cases
    if (p === 100) {
      return {
        str: repeat(full, size),
        delta: 0,
      };
    }

    if (p === 0) {
      return {
        str: repeat(empty, size),
        delta: 0,
      };
    }

    const float_percent = p / 100;
    const segment_unit = float_percent * size;
    const su_floor = segment_unit | 0;
    const middlepiece = Math.max(1, ((segment_unit - su_floor) * b_len) | 0);
    const delta = Math.min(
      Number.POSITIVE_INFINITY,
      Math.abs(p - (su_floor + middlepiece / b_len) / size),
    );

    return {
      str: bars[middlepiece].padStart(su_floor + 1, full).padEnd(size, empty),
      delta,
    };
  }

  return make_bar(percent ?? 0);

  //   function generate(evt) {
  //     var r1 = document.getElementById("bar-container"),
  //       p = Number(document.getElementById("percentage").value);

  //     r1.innerHTML = `<div>${make_bar(p).str}</div>`;
  //   }
}

const frontMatter = (percent?: number | null) => `<!DOCTYPE html>
<html class="h-full">
  <head>
    <title>ascii.bar | unicode progress bars</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link rel="stylesheet" href="assets/styles.css">
    <script src="_vercel/insights/script.js" defer="true"></script>
  </head>
  <body class="h-full min-h-screen font-mono flex flex-col gap-8">
    <header class="flex justify-between mb-4 px-8 py-4 border-b-4 border-black">
      <h1 class="text-4xl font-bold uppercase">ascii.bar</h1>
      <nav class="flex items-center gap-2">
        <a href="https://github.com/tbremer/ascii-bar" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" class="text-black hover:text-[#0000FF] visited:hover:text-[#800080] transition-colors duration-200">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        <a href="https://tbremer.dev" target="_blank" rel="noopener noreferrer" aria-label="Visit Tom Bremer's website" class="text-black hover:text-[#0000FF] visited:hover:text-[#800080] transition-colors duration-200">
            <span class="text-2xl font-bold">~/</span>
          </a>
      </nav>
    </header>
    <main class="flex-grow flex flex-col gap-8 max-w-[900px] mx-auto">
      <p class="text-xl">This program generates progress bars made of Unicode symbols.</p>


      <section class="border-4 border-black p-8 flex flex-col gap-8">
        <form action="/" method="post">
          <label for="percent" class="font-bold text-xl uppercase mb-1 block">Fill percentage:</label>
          <div class="flex gap-2">
            <input class="flex-grow border-2 border-black focus:border-[#0000ff] rounded px-2 py-1 text-xl focus-visible:outline-none" id="percent" type="number" min="0" max="100" name="percent" step="1" value="${percent ?? "0"}" />
            <input class="border-2 border-black bg-black text-white text-xl rounded px-4 font-medium uppercase hover:bg-gray-700 active:bg-gray-800 transition-colors duration-75 cursor-pointer" type="submit" value="Generate" />
          </div>
        </form>

        <section class="flex flex-col gap-2">
          <h3 class="font-bold text-xl uppercase mb-1">Character Set Preview:</h3>
          <dl class="flex font-mono">
            <div class="flex-grow flex flex-col gap-1">
              <dt class="font-bold">Shaded:</dt>
              <dd class="text-2xl">░ ▒ ▓ █</dd>
            </div>

            <div class="flex-grow flex flex-col gap-1">
              <dt class="font-bold">Dotted:</dt>
              <dd class="text-2xl">⣀ ⣄ ⣤ ⣦ ⣶ ⣷ ⣿</dd>
            </div>
          </dl>
        </section>

        ${contentMatter(percent)}

      </section>
`;

const contentMatter = (percent: number | null | undefined) =>
  typeof percent === "number"
    ? `
<section class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <h4 class="text-lg font-bold uppercase">Shaded:</h4>
    <div class="border-2 border-black bg-gray-200 p-4 text-4xl rounded">
      <p class="-translate-y-[0.1875rem]">${generate(percent, shaded).str}</p>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h4 class="text-lg font-bold uppercase">Dotted:</h4>
    <div class="border-2 border-black bg-gray-200 p-4 text-4xl rounded">
      <p class="-translate-y-[0.1875rem]">${generate(percent, dotted).str}</p>
    </div>
  </div>
</section>
`
    : "";

const backMatter = `</main>
<footer class="mt-8 border-t-4 border-black py-4 text-center flex justify-center items-center space-x-4">
        <p>© ${new Date().getFullYear()} ascii.bar</p>
        <a 
          href="https://github.com/tbremer/ascii-bar" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="text-black hover:text-[#0000FF] visited:hover:text-[#800080] transition-colors duration-200 font-bold"
        >
          tbremer/ascii-bar
        </a>
      </footer>
  </body>
</html>
`;
