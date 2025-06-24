# Admin User Setup

## Overview

The admin system uses Clerk's `privateMetadata` to determine admin status. Instead of hardcoded user IDs, we now check for a `role` field in the user's private metadata.

## How to Set Up an Admin User

1. **Access Clerk Dashboard**: Go to your Clerk dashboard and navigate to the Users section.

2. **Find the User**: Locate the user you want to make an admin.

3. **Edit Private Metadata**: 
   - Click on the user to view their details
   - Go to the "Metadata" section
   - Add a new field with:
     - **Key**: `role`
     - **Value**: `admin`

4. **Save Changes**: The user will now have admin access to the application.

## How It Works

- The `isUserAdmin()` server action checks the user's `privateMetadata.role` field
- If the role equals `"admin"`, the user is granted admin access
- The `useAdmin()` hook provides client-side admin status checking
- All admin pages and components use this dynamic system

## Security

- Private metadata is only accessible server-side
- Admin checks are performed on both client and server side
- The system gracefully handles missing or invalid metadata

## Code Examples

### Server Action (Server Component)
```typescript
import { isUserAdmin } from "@/actions/admin";

export default async function AdminPage() {
  if (!(await isUserAdmin())) {
    redirect("/");
  }
  // ... rest of component
}
```

### Client Hook (Client Component)
```typescript
import { useAdmin } from "@/hooks/use-admin";

export default function AdminComponent() {
  const { isAdmin, isLoading } = useAdmin();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access denied</div>;
  
  // ... rest of component
}
``` 