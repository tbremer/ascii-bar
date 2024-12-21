export function GET(req: Request) {
    const url = new URL(req.url);
    let percent = url.searchParams.get('percent')?.toString();

    if (!percent) percent = '0';

    const parsedPercent = Number.parseInt(percent, 10);
    const body = `${frontMatter(parsedPercent)}${generate(parsedPercent).str}${backMatter}`;

    return new Response(body,{
        headers: {"Content-Type": "text/html"},
        status: 200,
        statusText: 'OK'
    });
}

export async function POST(req: Request) {
    const formBody = await req.formData();
    let percent = formBody.get('percent')?.toString();

    if (!percent) percent = '0';

    return new Response(null, {
        headers: {"Location": `${req.url}/${percent}`},
        status: 302
    });
}


function generate(percent:number|null|undefined) {
    const bars = "⣀⣄⣤⣦⣶⣷⣿";
      const b_len = bars.length - 1;
      const empty = bars[0];
      const full = bars[b_len];

      function repeat(s, i) {
        var r = "";
        for (var j = 0; j < i; j++) r += s;
        return r;
      }

      function make_bar(p) {
        const size = 13;
        
        // short circuit for 100% & 0% cases
        if (p === 100) {
          return {
            str: repeat(full, size),
            delta: 0,
          };
        } else if (p === 0) {
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
          str: bars[middlepiece].padStart(su_floor+1, full).padEnd(size, empty),
          delta,
        };
      }

      return make_bar(percent);


    //   function generate(evt) {
    //     var r1 = document.getElementById("bar-container"),
    //       p = Number(document.getElementById("percentage").value);

    //     r1.innerHTML = `<div>${make_bar(p).str}</div>`;
    //   }
}

const frontMatter=(percent?: number|null) => `<!DOCTYPE html>
<html>
  <head>
    <title>Unicode progress bars</title>
    <meta charset="utf-8" />
    <style>
      noscript {
        display: inline-block;
        margin: 1em 0;
        padding: 8px 14px;
        color: #b94a48;
        background-color: #f2dede;
        border-color: #eed3d7;
        border-radius: 4px;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
      }

      body {
        margin: 0;
        padding: 0;
        display: inline-block;
        min-width: 100%;
        font-family:
          Helvetica Neue,
          Helvetica,
          sans-serif;
        font-size: 24px;
      }

      input[type="number"] {
        width: 3em;
      }
      label {
        display: inline-block;
        margin-right: 1em;
      }
    </style>
  </head>
  <body>
    <main id="container">
      <p>This program generates progress bars made of Unicode symbols.</p>

      <form action="/" method="post">
        <label>
            Percentage:
            <input type="number" min="0" max="100" name="percent" step="1" value="${percent??'0'}" />
        </label>
        <input type="submit" value="Generate" />
      </form>`;

const backMatter=`</main>
  </body>
</html>
`;