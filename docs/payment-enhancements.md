# Payment Enhancement - Additional Transaction Parameters

## Overview
To improve payment success rates and reduce fraud, we've implemented additional transaction parameters for NomuPay (OPPWA) payments as recommended in their 3D Secure documentation.

## Enhanced Parameters

### 1. Customer Email (`customer.email`)
- **Purpose**: Helps with verification, risk checks, and customer communication
- **Source**: Retrieved from Clerk authentication system
- **Benefits**: 
  - Improved authorization rates
  - Better fraud detection
  - Enhanced customer verification

### 2. Customer IP Address (`customer.ip`)
- **Purpose**: Helps spot and prevent fraud
- **Source**: Extracted from request headers (supports various proxy configurations)
- **Benefits**:
  - Fraud prevention
  - Geographic risk assessment
  - Enhanced security checks

## Implementation Details

### Server-Side Changes
- **File**: `src/app/(pages)/checkout/(server)/real-payment.actions.ts`
- **Functions Added**:
  - `getClientIpAddress()`: Extracts IP from various headers (x-forwarded-for, x-real-ip, cf-connecting-ip, etc.)
  - `getUserEmail()`: Retrieves user email from Clerk authentication
- **Integration**: Parameters are automatically added to checkout preparation requests

### Header Support
The IP detection supports various proxy configurations:
- `x-forwarded-for` (most common)
- `x-real-ip`
- `x-client-ip`
- `cf-connecting-ip` (Cloudflare)
- `x-forwarded`
- `forwarded-for`
- `forwarded`

### Logging
Enhanced logging tracks when additional parameters are sent:
- Logs presence/absence of customer email
- Logs presence/absence of customer IP
- Helps with debugging and monitoring

## Benefits

1. **Higher Success Rates**: Additional customer data strengthens payment requests
2. **Better Fraud Prevention**: IP-based fraud detection and risk assessment
3. **Improved Customer Experience**: Fewer false declines due to better verification
4. **Enhanced Security**: Multiple data points for risk evaluation

## Technical Notes

- Parameters are only added when data is available (graceful degradation)
- No client-side changes required - enhancement is transparent
- Backward compatible with existing payment flows
- Follows NomuPay's recommended best practices

## References

- [NomuPay 3D Secure Parameters Documentation](https://nomupay.docs.oppwa.com/tutorials/threeDSecure/Parameters)
- NomuPay advised: "Including additional parameters strengthens the payment request and can directly improve your approval rates"

## Testing

The implementation includes comprehensive error handling and fallbacks:
- If IP detection fails, payment continues without IP parameter
- If email retrieval fails, payment continues without email parameter
- All errors are logged for monitoring and debugging