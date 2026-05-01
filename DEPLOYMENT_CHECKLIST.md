# Forgot Password Feature - Deployment Checklist

## Pre-Deployment Tasks

### 1. Database Migration
- [ ] Run Prisma migration: `cd backend && npx prisma migrate dev --name add_password_reset_fields`
- [ ] Verify new fields added to `candidate` table
- [ ] Backup database before migration
- [ ] Test rollback if needed: `npx prisma migrate resolve --rolled-back add_password_reset_fields`

### 2. Environment Variables
- [ ] Set `JWT_SECRET` (min 32 characters, unique)
- [ ] Configure `EMAIL_HOST` (e.g., smtp.gmail.com)
- [ ] Configure `EMAIL_PORT` (e.g., 587)
- [ ] Configure `EMAIL_USER` (sender email address)
- [ ] Configure `EMAIL_PASS` (app-specific password for Gmail)
- [ ] Verify `VITE_API_URL` in frontend `.env`
- [ ] Test email configuration: `npm run verify-email` (if script exists)

### 3. Backend Testing
- [ ] Test OTP generation: Check console logs for OTP format
- [ ] Test OTP email delivery: Send test email
- [ ] Test OTP verification: Verify with correct OTP
- [ ] Test rate limiting: Verify lockout after 5 failed attempts
- [ ] Test password reset: Complete full flow
- [ ] Test token expiration: Wait 15 minutes for reset token
- [ ] Test account lockout: Verify 30-minute lockout period
- [ ] Test error messages: Verify generic messages for security

### 4. Frontend Testing
- [ ] Click "Forgot Password?" link appears and works
- [ ] Email form validates and submits
- [ ] OTP screen shows 6 input fields
- [ ] OTP fields auto-focus correctly
- [ ] Resend timer counts down
- [ ] Password form validates confirmation
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Form resets after successful reset

### 5. Security Testing
- [ ] Test with non-existent email (should not reveal info)
- [ ] Test with Google OAuth account (should reject)
- [ ] Test with expired OTP (should fail)
- [ ] Test with wrong OTP (should increment attempts)
- [ ] Test account lockout (5 failures = 30-min lock)
- [ ] Test token expiration (15-min reset window)
- [ ] Verify passwords are hashed (check DB)
- [ ] Verify no plaintext passwords in emails
- [ ] Test CSRF protection (if enabled)
- [ ] Test XSS prevention in forms

### 6. Email Configuration
- [ ] Test email from correct sender address
- [ ] Verify email formatting is correct
- [ ] Check spam folder for emails
- [ ] Verify all links/text render correctly
- [ ] Test with multiple email providers (Gmail, Outlook, etc.)
- [ ] Verify OTP visibility in email
- [ ] Check security warnings are present
- [ ] Test HTML rendering in dark mode

### 7. Performance Testing
- [ ] Load test OTP generation under 100 simultaneous requests
- [ ] Test database query performance
- [ ] Verify email delivery time (<5 seconds)
- [ ] Check for memory leaks during OTP attempts
- [ ] Monitor API response times
- [ ] Verify no database connection pool exhaustion

### 8. Monitoring Setup
- [ ] Enable logging for password reset attempts
- [ ] Set up alerts for multiple failed attempts
- [ ] Monitor email delivery failures
- [ ] Track user success/failure rates
- [ ] Set up dashboard for reset statistics
- [ ] Configure error tracking (Sentry, etc.)

---

## Production Deployment

### Pre-Production Checklist
- [ ] Code reviewed by team
- [ ] All tests passing (unit, integration, e2e)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation reviewed and complete
- [ ] Rollback plan documented

### Deployment Steps
1. **Backup Database**
   ```bash
   # PostgreSQL backup
   pg_dump recruva > recruva_backup_$(date +%Y%m%d).sql
   ```

2. **Run Migration**
   ```bash
   cd backend
   npx prisma migrate deploy
   # Verify: psql -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'candidate'"
   ```

3. **Deploy Backend**
   ```bash
   npm install
   npm start
   # Verify endpoints accessible: curl http://localhost:5000/api/health
   ```

4. **Deploy Frontend**
   ```bash
   npm run build
   npm run preview
   # Verify UI loads and forgot password link visible
   ```

5. **Smoke Test**
   - [ ] Request OTP for test account
   - [ ] Receive OTP email
   - [ ] Verify OTP successfully
   - [ ] Reset password successfully
   - [ ] Login with new password
   - [ ] Verify confirmation email received

6. **Monitor First 24 Hours**
   - [ ] Check error logs hourly
   - [ ] Monitor email delivery rate
   - [ ] Track user feedback/support tickets
   - [ ] Monitor API performance
   - [ ] Check database performance

---

## Post-Deployment

### Monitoring Metrics to Track
```
Password Reset Metrics:
- OTP requests per hour
- Successful resets per day
- Failed attempts (track lockouts)
- Email delivery success rate
- Average time to reset (UX metric)
- Account lockout frequency
- Support tickets related to forgot password
```

### On-Going Maintenance
- [ ] Review password reset attempts weekly
- [ ] Check for unusual patterns (brute force attempts)
- [ ] Monitor email deliverability
- [ ] Update security policies if needed
- [ ] Plan for 2FA enhancement
- [ ] Collect user feedback

### Troubleshooting Guide

#### Issue: OTPs not being received
**Solution**:
1. Check email configuration in `.env`
2. Verify email service is not blocking sender
3. Check spam folder
4. Review email service logs
5. Test with `npm run test-email` if available

#### Issue: "Account locked" appearing immediately
**Solution**:
1. Check database for old failed attempts
2. Clear `passwordResetAttempts` field: `UPDATE candidate SET passwordResetAttempts = 0`
3. Check system clock is correct
4. Review rate limiting logic

#### Issue: Reset token expiring too quickly
**Solution**:
1. Verify JWT_SECRET hasn't changed between requests
2. Check backend system time is correct
3. Increase token expiry if needed (in controller: `{ expiresIn: '20m' }`)
4. Check for clock skew between servers

#### Issue: Password not actually resetting
**Solution**:
1. Check bcryptjs is installed: `npm ls bcryptjs`
2. Verify password update actually runs
3. Check database transaction is committed
4. Clear any caching layers
5. Restart backend service

---

## Rollback Plan

If critical issues occur after deployment:

### Quick Rollback
```bash
# 1. Revert database migration
cd backend
npx prisma migrate resolve --rolled-back add_password_reset_fields

# 2. Restore from backup if data corruption
pg_restore recruva < recruva_backup_YYYYMMDD.sql

# 3. Redeploy previous backend version
git checkout <previous-commit-hash>
npm install
npm start
```

### Data Migration Considerations
- Forgot password fields are nullable
- Can safely roll back without data loss
- Old forgotten password OTPs become unusable
- Users can still login with existing passwords

---

## Security Sign-Off

Before going live, ensure:

- [ ] All OTP generation uses cryptographically secure randomness
- [ ] No OTPs logged in plain text
- [ ] No reset tokens exposed in URLs
- [ ] Password hashing uses bcryptjs with 10+ salt rounds
- [ ] Rate limiting prevents brute force
- [ ] Error messages don't reveal user information
- [ ] HTTPS enforced in production
- [ ] CSRF tokens enabled (if applicable)
- [ ] CSP headers configured
- [ ] Secure cookies set
- [ ] No sensitive data in request logs
- [ ] Audit logging enabled for compliance

---

## Performance Checklist

- [ ] OTP generation: <10ms
- [ ] Email sending: <5 seconds
- [ ] Token generation: <5ms
- [ ] Password hashing: <200ms
- [ ] Database queries: <50ms
- [ ] Total API response: <2 seconds
- [ ] No memory leaks during load test
- [ ] Database connection pool healthy
- [ ] Email queue not backed up

---

## Compliance & Compliance

- [ ] GDPR: User data stored securely, proper deletion after reset
- [ ] SOC 2: Audit logging enabled
- [ ] PCI DSS: Secure password handling (if applicable)
- [ ] HIPAA: If storing health data, verify compliance (likely not applicable)

---

## Launch Day

### Pre-Launch (1 hour before)
- [ ] All systems operational
- [ ] Database backups verified
- [ ] Monitoring systems active
- [ ] Support team briefed
- [ ] Rollback plan reviewed

### Launch Window
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Watch metrics dashboard
- [ ] Be ready to rollback

### Post-Launch (First 24 hours)
- [ ] Monitor every hour
- [ ] Response to issues immediately
- [ ] Collect user feedback
- [ ] Track metrics
- [ ] Document any issues

---

## Long-term Maintenance

- Monthly security audit of forgot password attempts
- Quarterly review of email delivery rates
- Annual penetration testing
- Update dependencies monthly
- Monitor for new security vulnerabilities
- Plan enhancements (2FA, recovery codes, etc.)

---

**Deployment Status**: Not Yet Deployed
**Last Checked**: [To be filled in]
**Next Review**: [To be scheduled]
**Responsible Team**: [To be assigned]
