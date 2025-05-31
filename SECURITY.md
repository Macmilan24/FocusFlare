# 🔒 Security Policy

## 🛠 Supported Versions

The following versions of FocusFlare are currently maintained and receive security updates:

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | ✅ Yes              |
| 5.0.x   | ❌ No               |
| 4.0.x   | ✅ Yes              |
| < 4.0   | ❌ No               |

If you are using an unsupported version, please upgrade to the latest version for improved security and functionality.

---

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a vulnerability in FocusFlare, **please follow the steps below**:

1. **Do not** open a public GitHub issue.
2. Instead, send an email to: [focusflare.platform@gmail.com](mailto:focusflare.platform@gmail.com)
3. Include:
   - A clear description of the vulnerability.
   - Steps to reproduce the issue.
   - Your contact information (if you'd like updates).
   - The version of FocusFlare you're using.

We aim to respond within **48 hours**, and you can expect:

- An acknowledgment of the report.
- A timeline for resolution.
- Notification when the issue has been resolved.

We appreciate responsible disclosure and will credit you (if desired) once the vulnerability is patched.

---

## 🔐 Security Best Practices for Developers & Contributors

To keep FocusFlare secure:

- Always keep dependencies up to date.
- Use `.env` files securely and **never commit secrets**.
- Limit database access by IP on MongoDB Atlas.
- Use HTTPS in production.
- Review PRs for potential security issues before merging.

---

Thank you for helping make FocusFlare safer for everyone! 💙
