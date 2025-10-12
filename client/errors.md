## Error Type
Runtime TypeError

## Error Message
_apollo_client__WEBPACK_IMPORTED_MODULE_2__.useMutation is not a function


    at useLoginMutation (src\lib\graphql\generated\graphql.ts:532:16)
    at LoginForm (src\components\Auth\LoginForm\login-form.tsx:54:43)
    at LoginModal (src\components\Auth\LoginModal\LoginModal.tsx:33:9)
    at Navbar (src\components\Navigation\Navbar.tsx:105:15)
    at ConditionalNavbar (src\components\Navigation\ConditionalNavbar.tsx:19:10)
    at RootLayout (src\app\layout.tsx:17:13)

## Code Frame
  530 | export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
  531 |         const options = {...defaultOptions, ...baseOptions}
> 532 |         return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      |                ^
  533 |       }
  534 | export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
  535 | export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;

Next.js version: 15.5.4 (Webpack)
