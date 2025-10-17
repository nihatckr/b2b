## Error Type
Console Error

## Error Message
Cannot update a component (`NavUser`) while rendering a different component (`MessagesPage`). To locate the bad setState() call inside `MessagesPage`, follow the stack trace as described in https://react.dev/link/setstate-in-render


    at MessagesPage (src\app\(protected)\dashboard\messages\page.tsx:98:42)

## Code Frame
   96 |   });
   97 |
>  98 |   const [{ data: unreadData }] = useQuery({
      |                                          ^
   99 |     query: UNREAD_COUNT_QUERY,
  100 |     requestPolicy: "network-only",
  101 |   });

Next.js version: 15.5.4 (Webpack)
