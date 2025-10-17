# Account Page - Feature Planning

## Page Structure: `/dashboard/account` or `/dashboard/settings/profile`

### Sections to Include:

#### 1. **Personal Information**
- Profile photo upload
- First Name / Last Name
- Email (readonly, can't change)
- Phone number
- Username
- Job Title / Department (if employee)

#### 2. **Company Information** (if belongs to company)
- Company Name (readonly)
- Role in company (Owner/Employee)
- Department
- Permissions/Access level

#### 3. **Account Security**
- Change Password
- Two-factor authentication (optional)
- Login history / Active sessions

#### 4. **Preferences**
- Language selection (TR/EN)
- Email notifications ON/OFF
- Push notifications ON/OFF
- Theme (Light/Dark)

#### 5. **Notifications Settings**
- Which types to receive:
  - Order updates
  - Sample updates
  - Production updates
  - Quality control alerts
  - Messages
  - System announcements

#### 6. **Account Actions**
- Delete Account (dangerous)
- Export Data
- Logout from all devices

---

## Implementation Plan

### Files to Create:
1. `client/src/app/(protected)/dashboard/account/page.tsx` - Main account page
2. `client/src/components/Account/ProfileSection.tsx` - Profile info section
3. `client/src/components/Account/SecuritySection.tsx` - Password change
4. `client/src/components/Account/PreferencesSection.tsx` - User preferences
5. `client/src/components/Account/NotificationSettings.tsx` - Notification preferences

### Backend Mutations Needed:
1. `updateUserProfile` - Update name, phone, photo, etc.
2. `changePassword` - Change user password
3. `updateUserPreferences` - Update preferences/settings
4. `deleteAccount` - Delete user account

---

## What to build first?

Let me create a basic account page with:
- ✅ Personal Information (editable)
- ✅ Company Information (readonly)
- ✅ Password Change
- ✅ Basic Preferences

Sound good?
