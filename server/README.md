## Error Type

Console Error

## Error Message

Cannot update a component (`CollectionsPage`) while rendering a different component (`SeasonsPage`). To locate the bad setState() call inside `SeasonsPage`, follow the stack trace as described in https://react.dev/link/setstate-in-render

    at SeasonsPage (src/app/(protected)/dashboard/library/seasons/page.tsx:63:40)

## Code Frame

61 | });
62 |

> 63 | const [{ data, fetching }] = useQuery({

     |                                        ^

64 | query: MY_SEASONS_QUERY,
65 | requestPolicy: "network-only",
66 | });

Next.js version: 15.5.4 (Webpack)
