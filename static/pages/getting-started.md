# Getting Started

A second sample page, to demonstrate the index listing more than one file.

Pages are gated behind login: the server requires an authenticated session, and
the client redirects to `/login` if you are not signed in.

## How it works

1. The server reads `.md` files from `static/pages/`.
2. `GET /api/pages` returns the list of available pages.
3. `GET /api/pages/:slug` returns the raw markdown for one page.
4. React renders the markdown to HTML with `react-markdown`.
