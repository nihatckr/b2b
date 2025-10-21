## Error Type

Runtime TypeError

## Error Message

sizes.map is not a function

    at eval (src\app\(protected)\dashboard\library\size-groups\page.tsx:262:36)
    at Array.map (<anonymous>:null:null)
    at SizeGroupsPage (src\app\(protected)\dashboard\library\size-groups\page.tsx:232:31)

## Code Frame

260 | </p>
261 | <div className="flex flex-wrap gap-1">

> 262 | {sizes.map((size: string, idx: number) => (

      |                                    ^

263 | <span
264 | key={idx}
265 | className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"

Next.js version: 15.5.6 (Webpack)
