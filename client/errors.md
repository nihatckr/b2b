## Error Type

Runtime TypeError

## Error Message

Cannot read properties of null (reading 'name')

    at NavUser (src/components/Dashboard/nav-user.tsx:51:62)
    at AppSidebar (src/components/Dashboard/app-sidebar.tsx:179:9)
    at DashboardLayout (src/app/(protected)/layout.tsx:21:7)

## Code Frame

49 | </Avatar>
50 | <div className="grid flex-1 text-left text-sm leading-tight">

> 51 | <span className="truncate font-medium">{user.name}</span>

     |                                                              ^

52 | <span className="text-muted-foreground truncate text-xs">
53 | {user.email}
54 | </span>

Next.js version: 15.5.4 (Webpack)
