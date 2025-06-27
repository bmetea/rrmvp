# Clerk UserButton Customization

## Overview

This document describes how to add custom menu items and pages to the Clerk UserButton component. The implementation adds a "My Entries" option that allows users to view their competition entries directly from the UserButton dropdown.

## Implementation

### CustomUserButton Component

Located at: `app/components/user/CustomUserButton.tsx`

```tsx
'use client'

import { UserButton } from '@clerk/nextjs'
import { Ticket } from 'lucide-react'
import MyEntriesPage from './MyEntriesPage'

const TicketIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
      <path d="M2 15v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" />
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </svg>
  )
}

export function CustomUserButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action label="My Entries" labelIcon={<TicketIcon />} open="my-entries" />
      </UserButton.MenuItems>

      <UserButton.UserProfilePage label="My Entries" labelIcon={<TicketIcon />} url="my-entries">
        <div className="p-6">
          <MyEntriesPage />
        </div>
      </UserButton.UserProfilePage>
    </UserButton>
  )
}
```

### Key Components

1. **UserButton.MenuItems**: Adds custom menu items to the UserButton dropdown
2. **UserButton.Action**: Defines a clickable action that opens a custom page
3. **UserButton.UserProfilePage**: Creates a custom page within the UserProfile interface

### Usage in Navbar

Replace the standard `UserButton` with `CustomUserButton` in the navigation:

```tsx
import { CustomUserButton } from "@/components/user/CustomUserButton";

// In the SignedIn section:
<SignedIn>
  <CustomUserButton />
</SignedIn>
```

## API Reference

### UserButton.MenuItems
- Container for custom menu items
- Must be a direct child of `UserButton`

### UserButton.Action
- **label**: Display text for the menu item
- **labelIcon**: React component for the icon
- **open**: URL identifier for the custom page to open

### UserButton.UserProfilePage
- **label**: Display text for the page (should match the Action label)
- **labelIcon**: React component for the icon (should match the Action icon)
- **url**: URL identifier (should match the Action open prop)
- **children**: React components to render in the custom page

## Customization Examples

### Adding Multiple Menu Items

```tsx
<UserButton.MenuItems>
  <UserButton.Action label="My Entries" labelIcon={<TicketIcon />} open="my-entries" />
  <UserButton.Action label="Help" labelIcon={<HelpIcon />} open="help" />
  <UserButton.Action label="Settings" labelIcon={<SettingsIcon />} open="settings" />
</UserButton.MenuItems>
```

### Adding Multiple Custom Pages

```tsx
<UserButton.UserProfilePage label="My Entries" labelIcon={<TicketIcon />} url="my-entries">
  <div className="p-6">
    <MyEntriesPage />
  </div>
</UserButton.UserProfilePage>

<UserButton.UserProfilePage label="Help" labelIcon={<HelpIcon />} url="help">
  <div className="p-6">
    <HelpPage />
  </div>
</UserButton.UserProfilePage>
```

## Best Practices

1. **Consistent Icons**: Use the same icon component for both Action and UserProfilePage
2. **Matching Labels**: Ensure Action label matches UserProfilePage label
3. **URL Consistency**: Action `open` prop should match UserProfilePage `url` prop
4. **Proper Styling**: Wrap custom page content in appropriate containers with padding
5. **Icon Design**: Use consistent icon sizing (typically 16x16 or 20x20 pixels)

## Troubleshooting

### Menu Item Not Appearing
- Ensure `UserButton.MenuItems` is a direct child of `UserButton`
- Check that all required props are provided to `UserButton.Action`

### Custom Page Not Loading
- Verify that `open` prop matches `url` prop exactly
- Ensure `UserButton.UserProfilePage` is a direct child of `UserButton`
- Check that the custom page component renders properly

### Icon Not Displaying
- Ensure the icon component returns valid JSX
- Check that the icon component doesn't have any console errors
- Verify proper sizing classes are applied

## Related Files

- `app/components/user/CustomUserButton.tsx` - Main implementation
- `app/components/user/MyEntriesPage.tsx` - Content displayed in custom page
- `app/components/navigation/Navbar.tsx` - Usage in navigation
- `docs/clerk-userbutton-customization.md` - This documentation

## References

- [Clerk UserButton Documentation](https://clerk.com/docs/components/user/user-button)
- [Clerk Customization Guide](https://clerk.com/docs/customization/user-button) 