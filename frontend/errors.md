## Error Type

Console Error

## Error Message

A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

...
<HotReload assetPrefix="" globalError={[...]}>
<AppDevOverlayErrorBoundary globalError={[...]}>
<ReplaySsrOnlyErrors>
<DevRootHTTPAccessFallbackBoundary>
<HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
<HTTPAccessFallbackErrorBoundary pathname="/dashboard" notFound={<NotAllowedRootHTTPFallbackError>} ...>
<RedirectBoundary>
<RedirectErrorBoundary router={{...}}>
<Head>
<**next_root_layout_boundary**>
<SegmentViewNode type="layout" pagePath="layout.tsx">
<SegmentTrieNode>
<link>
<RootLayout>
<html
lang="en"

-                         className="dark"
-                         style={{color-scheme:"dark"}}
                        >
                  ...

  at html (<anonymous>:null:null)
  at RootLayout (src/app/layout.tsx:34:5)

## Code Frame

32 |
33 | return (

> 34 | <html lang="en">

     |     ^

35 | <body
36 | className={`${geistSans.variable} ${geistMono.variable} antialiased`}
37 | >

Next.js version: 15.5.6 (Webpack)
