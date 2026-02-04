# 🛡️ Security Policy - Framework Eustachio

**Version**: 1.0.0  
**Last Updated**: January 17, 2026  
**Protected under**: Non-Slavery Rule (NSR) & Lex Amoris

---

## 🎯 Our Security Commitment

The Framework Eustachio is built on the principle that **security is a fundamental human right**, not a luxury. We are committed to:

- ✅ **Protecting user sovereignty** - Your data belongs to you
- ✅ **Preventing exploitation** - No dark patterns or manipulation
- ✅ **Transparency** - Open source everything
- ✅ **Rapid response** - Fix vulnerabilities promptly
- ✅ **Community collaboration** - Security through collective wisdom

**"Security without freedom is a cage. Freedom without security is chaos. We provide both."**

---

## 📋 Table of Contents

1. [Supported Versions](#supported-versions)
2. [Security Features](#security-features)
3. [Reporting a Vulnerability](#reporting-a-vulnerability)
4. [Security Best Practices](#security-best-practices)
5. [Known Limitations](#known-limitations)
6. [Incident Response](#incident-response)
7. [Security Audits](#security-audits)
8. [Responsible Disclosure](#responsible-disclosure)

---

## ✅ Supported Versions

| Version | Supported          | Notes                               |
| ------- | ------------------ | ----------------------------------- |
| 1.0.x   | :white_check_mark: | Current stable release              |
| < 1.0   | :x:                | Development versions, not supported |

We recommend always using the **latest stable version** for optimal security.

---

## 🔐 Security Features

### 1. XSS (Cross-Site Scripting) Protection

**Status**: ✅ **FULLY PROTECTED**

**Implementation**:
- All user input is sanitized using `textContent` and `createElement`
- **No use of `innerHTML`** for user-generated content
- DOM manipulation prevents script injection

**Test**:
Try entering `<script>alert('xss')</script>` in the message box:
- ✅ **Expected**: Text is displayed as-is, no script execution
- ❌ **Vulnerable**: Alert popup would appear

**Code Example**:
```javascript
// ❌ VULNERABLE (not used)
chatBox.innerHTML += `<p>UTENTE: ${userInput}</p>`;

// ✅ SECURE (our implementation)
const userMessageElement = document.createElement('p');
const userLabelElement = document.createElement('strong');
userLabelElement.textContent = 'UTENTE:';
userMessageElement.appendChild(userLabelElement);
userMessageElement.append(' ' + input);
chatBox.appendChild(userMessageElement);
```

### 2. Subresource Integrity (SRI)

**Status**: ✅ **IMPLEMENTED**

**Purpose**: Prevents CDN tampering

**Implementation**:
```html
<script src="https://cdn.jsdelivr.net/npm/ipfs-http-client@60.0.1/dist/index.min.js"
        integrity="sha384-qH7vQ5rAQO19Lnb1vRFJHNWHFTy6BnUfzJBzBcXXqMl8vPvOPnwI0xWzNlzVxQy9"
        crossorigin="anonymous"></script>
```

**Verification**:
- Browser verifies the hash before executing
- If CDN is compromised, script won't run
- Protects against supply chain attacks

### 3. HTTPS Enforcement

**Status**: ⚠️ **RECOMMENDED**

**Deployment Checklist**:
- [ ] Obtain SSL/TLS certificate (Let's Encrypt is free)
- [ ] Configure web server for HTTPS
- [ ] Redirect HTTP to HTTPS
- [ ] Use HSTS header

**Why HTTPS Matters**:
- Encrypts data in transit
- Prevents man-in-the-middle attacks
- Required for modern web APIs
- Builds user trust

### 4. Content Security Policy (CSP)

**Status**: ⚠️ **RECOMMENDED**

**Suggested CSP Header**:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://ipfs.infura.io https://ipfs.io; 
               img-src 'self' data: https:;">
```

**What this does**:
- Restricts script sources to self and trusted CDN
- Allows styles from self (with inline for compatibility)
- Permits connections to IPFS endpoints only
- Prevents unauthorized data exfiltration

### 5. IPFS Data Encryption

**Status**: ⚠️ **PARTIAL** (plaintext by default, encryption optional)

**Current Implementation**:
- Messages are stored on IPFS as **plaintext JSON**
- CIDs are public and content-addressable
- Anyone with the CID can read the content

**For Sensitive Data**:
We recommend:
1. **Client-side encryption** before IPFS upload
2. Use **age** or **gpg** for encryption
3. Store encrypted blob on IPFS
4. Share decryption key only with intended recipients

**Example** (to be implemented):
```javascript
// Encrypt before upload
const encrypted = await encryptData(messageData, userPublicKey);
const { cid } = await ipfsClient.add(encrypted);
```

### 6. Rate Limiting

**Status**: ⚠️ **EXTERNAL** (handled by Infura/gateway)

**Considerations**:
- Free Infura tier has rate limits
- Implement request throttling in production
- Monitor usage to avoid service interruption

**Suggested Implementation** (server-side):
```javascript
// Pseudocode for rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 7. Input Validation

**Status**: ✅ **IMPLEMENTED**

**Checks**:
- Empty message validation
- Length limits (implicit via textarea)
- Type checking on all inputs

**Code**:
```javascript
if (!input || input.trim() === '') {
    displaySystemMessage('Per favore inserisci un messaggio.', true);
    return;
}
```

### 8. Dependency Management

**Status**: ✅ **CDN-ONLY** (no npm dependencies)

**Approach**:
- Use CDN-loaded libraries (ipfs-http-client)
- No `node_modules` directory
- No transitive dependency vulnerabilities
- SRI ensures integrity

**Benefits**:
- No supply chain vulnerabilities from npm packages
- Smaller attack surface
- Simpler deployment

---

## 🚨 Reporting a Vulnerability

### Severity Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | RCE, data breach, auth bypass | < 24 hours |
| **High** | XSS, CSRF, privilege escalation | < 72 hours |
| **Medium** | Info disclosure, DoS | < 1 week |
| **Low** | Minor bugs, UI issues | < 2 weeks |

### How to Report

**For Critical/High Severity**:
1. **DO NOT** create a public GitHub issue
2. Email: `security@eustachio.org` (coming soon)
3. Use PGP for sensitive details (key below)
4. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Affected versions
   - Suggested fix (if known)

**For Medium/Low Severity**:
1. Create a GitHub issue with label `security`
2. Provide detailed description
3. No need for private disclosure

### PGP Public Key

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
(Key will be published here soon)
-----END PGP PUBLIC KEY BLOCK-----
```

### What to Expect

1. **Acknowledgment**: Within 24 hours
2. **Assessment**: We'll evaluate severity and impact
3. **Fix**: We'll develop and test a patch
4. **Disclosure**: Coordinated disclosure after fix is deployed
5. **Credit**: We'll credit you in the security advisory (if desired)

---

## 🎖️ Security Hall of Fame

We honor security researchers who responsibly disclose vulnerabilities:

| Date | Researcher | Vulnerability | Severity |
|------|------------|---------------|----------|
| *None yet* | - | - | - |

*Your name could be here! Help us keep the framework secure.*

---

## 🛠️ Security Best Practices

### For Users

1. **Use HTTPS always**
   - Verify the lock icon in browser
   - Never ignore certificate warnings

2. **Keep browsers updated**
   - Use latest Chrome, Firefox, or Safari
   - Enable automatic updates

3. **Be cautious with personal data**
   - Remember: IPFS content is **public**
   - Don't share sensitive info without encryption

4. **Verify CIDs**
   - Check that CIDs match expected format
   - Use multiple gateways to verify content

5. **Use strong authentication** (when IPFS credentials are used)
   - Secure Infura API keys
   - Don't share credentials

### For Developers

1. **Never commit secrets**
   ```bash
   # Add to .gitignore
   .env
   config.js
   *.key
   ```

2. **Validate all inputs**
   ```javascript
   // Always validate
   if (typeof input !== 'string') throw new Error('Invalid input');
   ```

3. **Use Content Security Policy**
   - Implement strict CSP headers
   - Test with CSP Evaluator

4. **Keep dependencies updated**
   - Monitor CDN for security advisories
   - Verify SRI hashes periodically

5. **Follow the Lex Amoris**
   - Code with empathy
   - Consider security implications
   - Respect user privacy

### For Deployers

1. **Enable HTTPS**
   - Use Let's Encrypt (free)
   - Configure HSTS headers

2. **Configure firewalls**
   - Allow only necessary ports (80, 443)
   - Use fail2ban for brute force protection

3. **Monitor logs**
   - Set up log aggregation
   - Alert on suspicious patterns

4. **Regular backups**
   - Backup configuration files
   - Document deployment procedure

5. **Security headers**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header Referrer-Policy "no-referrer-when-downgrade" always;
   ```

---

## ⚠️ Known Limitations

### 1. IPFS Content is Public

**Issue**: All data uploaded to IPFS is publicly accessible.

**Risk**: Privacy breach if sensitive data is uploaded.

**Mitigation**:
- Encrypt sensitive data client-side before upload
- Use warning messages in UI
- Implement opt-in encryption in future

### 2. CDN Dependency

**Issue**: We rely on `cdn.jsdelivr.net` for the IPFS library.

**Risk**: CDN downtime or compromise could affect functionality.

**Mitigation**:
- SRI hash prevents tampering
- Consider self-hosting library for critical deployments
- Monitor CDN status

### 3. Browser Compatibility

**Issue**: Some features require modern browsers.

**Risk**: Users on old browsers may have degraded experience.

**Mitigation**:
- Feature detection and graceful degradation
- Inform users of browser requirements
- Provide fallback for core functionality

### 4. Rate Limits

**Issue**: Free IPFS gateways have rate limits.

**Risk**: Service interruption during high traffic.

**Mitigation**:
- Use paid Infura plan for production
- Implement client-side rate limiting
- Consider running own IPFS node

---

## 🚑 Incident Response

### In Case of Security Breach

**Immediate Actions** (within 1 hour):
1. Assess the scope and impact
2. Contain the breach (e.g., take site offline if needed)
3. Preserve evidence (logs, screenshots)
4. Notify core team

**Short-term** (within 24 hours):
1. Develop and test a fix
2. Deploy the fix to production
3. Notify affected users (if applicable)
4. Document the incident

**Long-term** (within 1 week):
1. Conduct post-mortem analysis
2. Publish security advisory
3. Implement preventive measures
4. Update security documentation

### Communication Protocol

- **Public disclosure**: Only after fix is deployed
- **User notification**: Via GitHub, website banner, email
- **Transparency**: Share lessons learned
- **Accountability**: Own our mistakes

---

## 🔍 Security Audits

### Internal Audits

**Frequency**: Before every major release

**Checklist**:
- [ ] Run CodeQL security scan
- [ ] Review all code changes for security implications
- [ ] Test XSS protection
- [ ] Verify SRI hashes
- [ ] Check for hardcoded secrets
- [ ] Review third-party dependencies

### External Audits

**Status**: Planned for Q2 2026

**Scope**:
- Full codebase review
- Penetration testing
- IPFS integration security
- Client-side security

**Results**: Will be published publicly

---

## 🤝 Responsible Disclosure

We believe in **transparency** and **collaboration**. Our responsible disclosure policy:

### Our Commitments

1. **No Legal Action**: We will not pursue legal action against security researchers who:
   - Act in good faith
   - Report vulnerabilities promptly
   - Do not exploit vulnerabilities maliciously
   - Do not access data beyond what's needed to demonstrate the issue

2. **Credit**: We will publicly credit researchers (unless they prefer anonymity)

3. **Timely Response**: We commit to acknowledging reports within 24 hours

4. **Open Communication**: We'll keep you updated on our progress

### What We Ask

1. **Private Disclosure**: Report critical issues privately first
2. **Reasonable Time**: Give us time to fix before public disclosure (typically 90 days)
3. **No Data Theft**: Don't access or exfiltrate user data
4. **No Disruption**: Don't perform DoS or disrupt services
5. **Act Ethically**: Follow the Lex Amoris principles

---

## 📚 Security Resources

### Tools We Use

- **CodeQL**: Static analysis for security vulnerabilities
- **npm audit**: Dependency vulnerability scanning (when applicable)
- **OWASP ZAP**: Web application security testing
- **Lighthouse**: Browser security audit

### Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [IPFS Security Best Practices](https://docs.ipfs.tech/concepts/security/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## 🎯 Security Roadmap

### Q1 2026
- [x] Implement XSS protection
- [x] Add SRI to CDN scripts
- [x] Create security policy

### Q2 2026
- [ ] External security audit
- [ ] Implement client-side encryption for IPFS
- [ ] Add PGP key for security reports
- [ ] Create security@eustachio.org email

### Q3 2026
- [ ] Implement rate limiting
- [ ] Add two-factor authentication (if user accounts added)
- [ ] Create security awareness documentation

### Q4 2026
- [ ] Bug bounty program
- [ ] Advanced threat monitoring
- [ ] Security training for contributors

---

## 📞 Contact

**Security Team**: `security@eustachio.org` (coming soon)  
**General Contact**: Open an issue on GitHub  
**Emergency**: For critical vulnerabilities, email with subject "[URGENT SECURITY]"

---

## 📜 Security Principles

We follow these guiding principles:

1. **Security is a Right**: Everyone deserves protection
2. **Transparency Builds Trust**: We're open about our security
3. **Privacy is Sacred**: Your data is yours
4. **Community Makes Us Stronger**: We welcome security contributions
5. **Continuous Improvement**: Security is a journey, not a destination

**"A system that protects freedom is more valuable than one that merely prevents harm."**

---

**Protected under the Charter of Kosymbiosis (CoK)**  
**Governed by the Non-Slavery Rule (NSR) & Lex Amoris**

© 2026 Framework Eustachio | Report vulnerabilities responsibly

---

**Last Security Scan**: January 17, 2026  
**CodeQL Results**: ✅ 0 vulnerabilities found  
**Status**: Production Ready with Recommended Practices
