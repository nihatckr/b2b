
  "errors": [
    {
      "message": "Access denied. This operation requires authentication.",
      "locations": [
        {
          "line": 16,
          "column": 5
        }
      ],
      "path": [
        "login",
        "token"
      ],
      "extensions": {
        "code": "FORBIDDEN",
        "statusCode": 403,
        "stacktrace": [
          "AuthorizationError: Access denied. This operation requires authentication.",
          "    at Rule.func (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\src\\permission\\index.ts:183:30)",
          "    at Rule.executeRule (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-shield\\cjs\\rules.js:132:37)",
          "    at Rule.resolve (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-shield\\cjs\\rules.js:29:36)",
          "    at middleware (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-shield\\cjs\\generator.js:28:36)",
          "    at C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-middleware\\dist\\applicator.js:9:39",
          "    at field.resolve (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\@apollo\\server\\src\\utils\\schemaInstrumentation.ts:82:22)",
          "    at executeField (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:500:20)",
          "    at executeFields (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:422:22)",
          "    at completeObjectValue (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:933:10)",
          "    at completeValue (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:654:12)"
        ]
      }
    },
    {
      "message": "Access denied. This operation requires authentication.",
      "locations": [
        {
          "line": 17,
          "column": 5
        }
      ],
      "path": [
        "login",
        "user"
      ],
      "extensions": {
        "code": "FORBIDDEN",
        "statusCode": 403,
        "stacktrace": [
          "AuthorizationError: Access denied. This operation requires authentication.",
          "    at Rule.func (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\src\\permission\\index.ts:183:30)",
          "    at Rule.executeRule (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-shield\\cjs\\rules.js:132:37)",
          "    at Rule.resolve (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-shield\\cjs\\rules.js:29:36)",
          "    at middleware (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-shield\\cjs\\generator.js:28:36)",
          "    at C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql-middleware\\dist\\applicator.js:9:39",
          "    at field.resolve (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\@apollo\\server\\src\\utils\\schemaInstrumentation.ts:82:22)",
          "    at executeField (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:500:20)",
          "    at executeFields (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:422:22)",
          "    at completeObjectValue (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:933:10)",
          "    at completeValue (C:\\Users\\nihat\\Desktop\\Web\\fullstack\\server\\node_modules\\graphql\\execution\\execute.js:654:12)"
        ]
      }
    }
  ],
  "data": {
    "login": {
      "token": null,
      "user": null
    }
  }
}
