# Employee + Admin OTP Smoke Checklist

Use this list whenever you tweak either OTP client. All steps assume the API is running on `http://localhost:5009`.

1. **Admin allowlist enforcement** – try to send an OTP from `apps/salonmind-admin` with a phone number that is not in `ADMIN_ALLOWLIST_NUMBERS`. The API must reject the request.
2. **Admin happy path** – authenticate with an allowlisted number, verify the OTP, and make sure the dashboard loads plus `/v1/auth/admin/me` returns 200.
3. **Employee status guard** – log in with a phone that is not an active employee. The OTP verification should fail with `Employee inactive`.
4. **Employee happy path** – request + verify OTP for an active employee, confirm the Home screen shows the decoded token claims and logout clears secure storage.
5. **Refresh retry policy** – use either app, then manually expire the access token (tweak `ACCESS_TTL_*` to a few seconds). The auto-refresh should run once, replay the request, and log the user out if the refresh also fails.
6. **Logout + revoke** – log in from both apps, hit the logout button, and confirm subsequent calls fail with `Invalid refresh token` or `Session invalid`.
