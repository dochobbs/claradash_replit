# Security Guidelines

Critical security documentation for CareAgentDashboard. This application handles Protected Health Information (PHI) and requires strict security practices.

## ⚠️ CRITICAL: CURRENT STATUS

**This is a development application. It is NOT suitable for production use with real patient data.**

The following security implementations are REQUIRED before any production deployment:

- ❌ No authentication system
- ❌ No authorization/role-based access control
- ❌ No audit logging
- ❌ No HIPAA compliance
- ❌ No data encryption
- ❌ No rate limiting
- ❌ No input sanitization

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Data Protection](#data-protection)
5. [HIPAA Compliance](#hipaa-compliance)
6. [API Security](#api-security)
7. [Infrastructure Security](#infrastructure-security)
8. [Incident Response](#incident-response)

---

## Security Overview

### Risk Assessment

#### HIGH RISK ITEMS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| No authentication | Unauthorized access to PHI | Implement authentication system |
| No RBAC | Data access not controlled | Implement authorization layer |
| No encryption | PHI exposed if database breached | Encrypt sensitive fields |
| No audit logging | Compliance violation | Log all data access |
| No rate limiting | DDoS vulnerability | Implement rate limiting |

#### MEDIUM RISK ITEMS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| No HTTPS enforced | Man-in-the-middle attacks | Force HTTPS in production |
| No input validation | SQL injection / XSS | Add input validation |
| CORS misconfigured | CSRF attacks | Implement CORS security headers |
| Hardcoded secrets | Credential compromise | Use environment variables |

### Security Principles

1. **Zero Trust**: Verify every request, never assume security
2. **Least Privilege**: Users only access what they need
3. **Defense in Depth**: Multiple layers of security
4. **Secure by Default**: Security first in architecture
5. **Transparency**: Log all sensitive actions

---

## Authentication

### Current Status
❌ **NOT IMPLEMENTED** - All endpoints are public

### Required Implementation

#### 1. Authentication System

Choose one approach:

##### Option A: JWT (JSON Web Tokens)

```typescript
import jwt from 'jsonwebtoken';

// Login endpoint
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Verify credentials against database
  const user = await db.query("SELECT * FROM providers WHERE email = $1", [email]);
  if (!user || !bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // 2. Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // 3. Return token to client
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// Middleware to verify token
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Protect routes
app.get("/api/patients", authMiddleware, async (req, res) => {
  // Only authenticated users can access
});
```

##### Option B: OAuth 2.0 (Google, Microsoft)

Recommended for healthcare:

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"]
  });
  res.redirect(url);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code as string);
  const ticket = await oauth2Client.verifyIdToken({ idToken: tokens.id_token });
  const payload = ticket.getPayload();

  // Create/update user and issue session
});
```

##### Option C: SAML (Enterprise SSO)

For healthcare organizations with existing identity providers:

```typescript
import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';

passport.use(new SamlStrategy({
  entryPoint: process.env.SAML_ENTRY_POINT,
  issuer: process.env.SAML_ISSUER,
  cert: process.env.SAML_CERT
}, (profile, done) => {
  User.findOrCreate({ email: profile.email }, (err, user) => {
    done(err, user);
  });
}));
```

### Password Requirements

```typescript
// Validate strong passwords
const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[!@#$%^&*]/, "Must contain special character");
```

### Session Management

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // Not accessible via JavaScript
    sameSite: 'strict',  // CSRF protection
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
}));
```

---

## Authorization

### Current Status
❌ **NOT IMPLEMENTED** - No role-based access control

### Role-Based Access Control (RBAC)

Define user roles and permissions:

```typescript
// User roles
enum UserRole {
  ADMIN = "admin",                 // Full system access
  PROVIDER = "provider",           // Can review interactions
  CLINIC_MANAGER = "clinic_manager",  // Can manage clinic
  SUPPORT = "support"              // Can view logs
}

// Permissions per role
const rolePermissions = {
  [UserRole.ADMIN]: ["read_all", "write_all", "delete_all", "manage_users"],
  [UserRole.PROVIDER]: ["read_own_patients", "write_reviews", "escalate_cases"],
  [UserRole.CLINIC_MANAGER]: ["read_clinic_data", "manage_staff"],
  [UserRole.SUPPORT]: ["read_logs"]
};
```

### Authorization Middleware

```typescript
const authorize = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // From authentication
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    const userPermissions = rolePermissions[user.role];
    const hasPermission = requiredPermissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Usage
app.delete("/api/patients/:id",
  authMiddleware,
  authorize(["delete_all"]),
  async (req, res) => {
    // Only admins can delete
  }
);
```

### Attribute-Based Access Control (ABAC)

For finer-grained control:

```typescript
// Can provider only access their own patients?
const canAccessPatient = async (userId: string, patientId: string) => {
  const assignment = await db.query(
    `SELECT 1 FROM provider_patients
     WHERE provider_id = $1 AND patient_id = $2`,
    [userId, patientId]
  );
  return !!assignment;
};

// Usage
app.get("/api/patients/:patientId", authMiddleware, async (req, res) => {
  const canAccess = await canAccessPatient(req.user.id, req.params.patientId);
  if (!canAccess) {
    return res.status(403).json({ error: "Access denied" });
  }
  // Return patient data
});
```

---

## Data Protection

### Encryption at Rest

Encrypt sensitive fields in database:

```typescript
import crypto from 'crypto';

const encryptField = (plaintext: string): string => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted + ':' + cipher.getAuthTag().toString('hex');
};

const decryptField = (encrypted: string): string => {
  const [iv, ciphertext, authTag] = encrypted.split(':');
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
};

// Encrypt sensitive fields
const patientData = {
  name: encryptField(originalName),
  ssn: encryptField(originalSSN),
  dateOfBirth: encryptField(originalDOB)
};
```

### Encryption in Transit

```typescript
// Enforce HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Password Security

```typescript
import bcrypt from 'bcrypt';

// Hash password on registration
const hashedPassword = await bcrypt.hash(plainPassword, 12);

// Verify on login
const isValid = await bcrypt.compare(plainPassword, storedHash);
```

---

## HIPAA Compliance

### ⚠️ CRITICAL: HIPAA Requirements

Before using with real patient data, implement:

1. **Administrative Safeguards**
   - Security management process
   - Designated privacy/security officer
   - Workforce security and training
   - Sanction policies for violations
   - Information access management

2. **Physical Safeguards**
   - Facility access controls
   - Workstation security
   - Device/media controls
   - Encryption and decryption

3. **Technical Safeguards**
   - Access controls (authentication, authorization)
   - Audit controls (logging, monitoring)
   - Integrity controls (checksums, digital signatures)
   - Transmission security (TLS/SSL)

4. **Breach Notification**
   - Notification procedures
   - Timeline requirements (60 days)
   - HHS notification
   - Individual notification

### Audit Logging

```typescript
// Log all PHI access
const auditLog = async (
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  allowed: boolean
) => {
  await db.query(
    `INSERT INTO audit_logs
     (user_id, action, resource, resource_id, allowed, timestamp)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [userId, action, resource, resourceId, allowed]
  );
};

// Usage
app.get("/api/patients/:id", authMiddleware, async (req, res) => {
  const patientId = req.params.id;
  const canAccess = await canAccessPatient(req.user.id, patientId);

  auditLog(
    req.user.id,
    "view_patient",
    "patients",
    patientId,
    canAccess
  );

  if (!canAccess) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json(patient);
});
```

### Data Retention & Deletion

```typescript
// Implement soft deletes for audit trail
ALTER TABLE patients ADD COLUMN deleted_at TIMESTAMP NULL;

// Hard delete after retention period (e.g., 7 years for HIPAA)
DELETE FROM patients WHERE deleted_at < NOW() - INTERVAL '7 years';

// Export patient data on request
app.get("/api/patients/:id/export", authMiddleware, async (req, res) => {
  const patient = await getPatientWithAllData(req.params.id);
  res.download(JSON.stringify(patient), 'patient-data.json');
});

// Delete patient data (GDPR/HIPAA compliance)
app.delete("/api/patients/:id", authMiddleware, authorize(["delete_own"]), async (req, res) => {
  await softDeletePatient(req.params.id);
  res.json({ success: true });
});
```

---

## API Security

### Input Validation

```typescript
import { z } from 'zod';

// Validate all inputs
const createPatientSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
  preferredPharmacy: z.string().optional()
});

app.post("/api/patients", authMiddleware, async (req, res) => {
  try {
    const validated = createPatientSchema.parse(req.body);
    const patient = await storage.createPatient(validated);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: "Invalid input" });
  }
});
```

### SQL Injection Prevention

✅ **Already handled by Drizzle ORM** - Uses parameterized queries

```typescript
// ✅ Safe - parameterized query
const result = await db.query("SELECT * FROM patients WHERE id = $1", [id]);

// ❌ NOT safe - string concatenation
const result = await db.query(`SELECT * FROM patients WHERE id = ${id}`);
```

### XSS Prevention

```typescript
// Sanitize user input before storing
import sanitizeHtml from 'sanitize-html';

const sanitizedNotes = sanitizeHtml(req.body.providerNotes, {
  allowedTags: ['b', 'i', 'em', 'strong'],
  allowedAttributes: {}
});

// Use template literals safely in React
<div>{notes}</div> // React escapes by default

// Never use dangerouslySetInnerHTML
❌ <div dangerouslySetInnerHTML={{ __html: notes }} />
```

### CSRF Protection

```typescript
import csrf from 'csrf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Add token to forms
app.get("/", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Validate on POST
app.post("/api/reviews", csrfProtection, (req, res) => {
  // CSRF token validated automatically
});
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => req.user?.id || req.ip, // By user or IP
  message: "Too many requests, please try again later"
});

// Apply to all routes
app.use(limiter);

// Stricter limits for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5
});

app.post("/auth/login", strictLimiter, async (req, res) => {
  // Login attempts limited to 5 per minute
});
```

---

## Infrastructure Security

### Network Security

```yaml
# Cloud Security Group / Firewall Rules
- Port 443:   HTTPS (allow all)
- Port 80:    HTTP (redirect to 443)
- Port 5432:  PostgreSQL (allow only app server)
- Port 22:    SSH (allow only admin IPs)
- All other:  DENY
```

### Secrets Management

```bash
# ❌ Don't hardcode secrets
const API_KEY = "sk-1234567890abcdef";

# ✅ Use environment variables
const API_KEY = process.env.API_KEY;

# ✅ Use secret management service
import { SecretsManager } from 'aws-sdk';
const secret = await secretsManager.getSecretValue({ SecretId: 'openai-key' });
```

### Dependency Security

```bash
# Check for known vulnerabilities
npm audit

# Auto-fix vulnerabilities
npm audit fix

# Update dependencies safely
npm update

# Review changelog before major version bumps
```

### Access Control

```bash
# File permissions
chmod 600 .env                    # Read-only for owner
chmod 600 private-key.pem        # Read-only for owner
chmod 755 ./dist                 # Readable by web server

# Database users
# ✅ Use principle of least privilege
CREATE USER app_user WITH PASSWORD '...';
GRANT SELECT, INSERT, UPDATE ON patients TO app_user;
# Don't grant DROP, DELETE on production
```

---

## Incident Response

### Security Incident Playbook

#### Suspected Data Breach

1. **Assess Severity**
   - What data was exposed?
   - How many records?
   - Was it PHI?

2. **Contain**
   - Take affected systems offline if necessary
   - Disable compromised accounts
   - Reset passwords

3. **Notify**
   - Inform security team
   - Notify leadership
   - Prepare for HIPAA notification requirements

4. **Investigate**
   - Review audit logs
   - Check for other breaches
   - Identify root cause

5. **Remediate**
   - Patch vulnerabilities
   - Update password policies
   - Implement additional monitoring

6. **Document**
   - Timeline of events
   - Actions taken
   - Lessons learned

### Monitoring & Alerts

```typescript
// Alert on suspicious activity
if (failedLoginAttempts > 5) {
  await sendSecurityAlert(
    `Multiple failed login attempts from ${ip}`,
    AlertSeverity.HIGH
  );
}

// Alert on unusual access patterns
if (accessPatternLooksAnomolous(userId)) {
  await sendSecurityAlert(
    `Unusual access pattern detected for ${userId}`,
    AlertSeverity.MEDIUM
  );
}
```

---

## Security Checklist

### Before Development
- [ ] Security requirements documented
- [ ] Threat model created
- [ ] Security architecture reviewed
- [ ] Team trained on secure coding

### During Development
- [ ] Code reviewed for security issues
- [ ] All inputs validated
- [ ] Authentication implemented
- [ ] Authorization enforced
- [ ] Logging configured
- [ ] Error messages don't leak information

### Before Deployment
- [ ] All HTTPS enforced
- [ ] Secrets not in code/logs
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Database hardened
- [ ] Audit logging functional
- [ ] Backup/recovery tested

### After Deployment
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Incident response plan documented
- [ ] Regular security audits scheduled
- [ ] Penetration testing done
- [ ] HIPAA compliance verified

---

## Security Resources

### Healthcare Security Standards
- [HIPAA Technical Safeguards](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [HL7 FHIR Security](https://www.hl7.org/fhir/security.html)
- [HITRUST CSF](https://hitrustalliance.net/)

### Secure Coding
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Vulnerability scanner
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency vulnerability check
- [Snyk](https://snyk.io/) - Continuous vulnerability monitoring
- [SonarQube](https://www.sonarqube.org/) - Code quality and security

---

## Contact & Reporting

For security vulnerabilities:
- Email: security@yourdomain.com
- Do **not** open public GitHub issues for vulnerabilities
- Allow 90 days for patching before disclosure

---

**Last Updated**: October 2024
**Next Review**: April 2025

⚠️ **Remember**: Security is a continuous process, not a one-time implementation.
