# Security Policy

## 🔒 Supported Versions

We actively support the following versions of Google Maps Scanner Pro:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes            |
| < 1.0   | ❌ No             |

## 🛡️ Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### ⚡ For Critical Security Issues

If you find a **critical security vulnerability** that could compromise user data or browser security:

1. **DO NOT** create a public issue
2. **DO NOT** discuss it in public forums
3. **Email us privately** at: [your-security-email@example.com]

### 📧 What to Include

When reporting a vulnerability, please include:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** assessment
- **Chrome version** and OS details
- **Extension version** where found
- **Proof of concept** (if safe to share)

### 🕐 Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Varies by severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next major release

### 🏆 Recognition

We appreciate security researchers and will:
- Credit you in our CHANGELOG (if desired)
- Notify you when the fix is released
- Consider feature requests from contributors

## 🔍 Security Best Practices

### For Users
- Only install from official sources
- Keep extension updated
- Review permissions requested
- Report suspicious behavior

### For Developers
- Follow secure coding practices
- Validate all inputs
- Use Content Security Policy
- Regular security audits
- Minimum required permissions

## 📋 Security Features

Our extension implements:
- **Content Security Policy** (CSP)
- **Minimal permissions** (only activeTab, storage, scripting)
- **No external API calls** (except Google Maps)
- **Local data processing** only
- **No user tracking**
- **No data collection beyond Maps data**

## 🔗 Security Resources

- [Chrome Extension Security Guide](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Security Model](https://chromium.org/developers/design-documents/extensions/extension-security-architecture/)

## ⚖️ Disclosure Policy

- We follow **responsible disclosure** principles
- Security fixes are prioritized over new features
- We maintain transparency while protecting users
- All security updates are clearly documented

Thank you for helping keep Google Maps Scanner Pro secure! 🙏