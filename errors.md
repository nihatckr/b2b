sub: '2',
email: 'owner@textilepro.com',
role: 'COMPANY_OWNER',
companyId: 1,
department: null
}
👤 User Context: {
id: 2,
email: 'owner@textilepro.com',
role: 'COMPANY_OWNER',
companyId: 1,
department: null
}
Error uploading file: TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined
at Object.join (node:path:478:7)
at uploadFile (C:\Users\nihat\Desktop\Web\fullstack\backend\src\utils\fileUpload.ts:64:27)
at resolve (C:\Users\nihat\Desktop\Web\fullstack\backend\src\graphql\mutations\aiFileMutation.ts:216:36)
at run (C:\Users\nihat\Desktop\Web\fullstack\backend\node_modules\@pothos\plugin-scope-auth\src\steps.ts:105:31)
at runSteps (C:\Users\nihat\Desktop\Web\fullstack\backend\node_modules\@pothos\plugin-scope-auth\src\resolve-helper.ts:66:28)
at <anonymous> (C:\Users\nihat\Desktop\Web\fullstack\backend\node_modules\@pothos\plugin-scope-auth\src\resolve-helper.ts:90:20) {
code: 'ERR_INVALID_ARG_TYPE'
}
[Yoga Debug] Processing GraphQL Parameters done.
