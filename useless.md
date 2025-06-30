# Test Strategy Document:

## 1. Objective
To ensure the reliability and correctness of all event handlers.

## 2. Testing Framework
Mocha + Chai

## 3. In Scope

* Event Handlers: For each event, a corresponding test file will be created

## 4. Out of Scope

* Internal utility/helper functions
* End-to-end flows involving frontend or full stack
* Input schema validation (already enforced by Godspeed's event schema)

## 5. List of Test Files
### 1. test/eventHandlers/icemint/auth/login.test.ts

#### Test Case 1.1: Successful Login with Valid Email OTP

**Description**: This test case verifies the successful login flow when a user provides a valid OTP sent to their email.

**Key Verification Points**:
- The user is successfully authenticated.
- An access token and refresh token are generated and returned.
- The OTP is marked as verified in the database to prevent reuse.

**Detailed Implementation Guide**:
- **Setup**:
  - Mock the `OtpService.getInstance` to return a mocked `OtpService` instance.
  - Mock the `UserService.getInstance` to return a mocked `UserService` instance.
  - Mock `ctx.datasources.icemint.client` to simulate the Prisma client and its `$transaction` method.
- **Input Data**:
  - `ctx.inputs.data.body.otp`: "123456"
  - `ctx.inputs.data.guestUser`: `{ id: 'guest-user-id', deviceId: 'device-id' }`
  - Mocked `otpRecord`: `{ id: 'otp-id', email: 'test@example.com', mobileNo: null, verified: false, revoked: false }`
- **Execution Steps**:
  1. Call the `loginFunction` with the mocked context.
  2. The `OtpService.getOtpByGuestUserId` should be called with the guest user ID and the hashed OTP.
  3. The `prisma.$transaction` should be initiated.
  4. Inside the transaction, `OtpService.markOtpVerified` should be called with the OTP ID.
  5. `UserService.emailLogin` should be called with the email from the OTP record and the guest user object.
- **Mocking Requirements**:
  - `OtpService.getOtpByGuestUserId`: Should return the mocked `otpRecord`.
  - `OtpService.markOtpVerified`: Should resolve successfully.
  - `UserService.emailLogin`: Should return a success response with user data and tokens.
  - `prisma.$transaction`: Should execute the callback passed to it.
- **Expected Assertions**:
  - Verify that the final result is a success status.
  - Verify that the response contains the user data, access token, and refresh token.
  - Assert that `OtpService.markOtpVerified` was called exactly once.
  - Assert that `UserService.emailLogin` was called exactly once.
- **Cleanup**: No specific cleanup needed as all dependencies are mocked.

#### Test Case 1.2: Successful Login with Valid Mobile OTP

**Description**: This test case verifies the successful login flow when a user provides a valid OTP sent to their mobile number.

**Key Verification Points**:
- The user is successfully authenticated.
- An access token and refresh token are generated and returned.
- The OTP is marked as verified.

**Detailed Implementation Guide**:
- **Setup**: Similar to Test Case 1.1, with mocks for `OtpService`, `UserService`, and Prisma.
- **Input Data**:
  - `ctx.inputs.data.body.otp`: "654321"
  - `ctx.inputs.data.guestUser`: `{ id: 'guest-user-id-2', deviceId: 'device-id-2' }`
  - Mocked `otpRecord`: `{ id: 'otp-id-2', email: null, mobileNo: '1234567890', verified: false, revoked: false }`
- **Execution Steps**:
  1. Call the `loginFunction` with the mocked context.
  2. `OtpService.getOtpByGuestUserId` is called.
  3. `prisma.$transaction` is initiated.
  4. `OtpService.markOtpVerified` is called.
  5. `UserService.mobileLogin` is called with the mobile number from the OTP record and the guest user object.
- **Mocking Requirements**:
  - `OtpService.getOtpByGuestUserId`: Should return the mocked `otpRecord`.
  - `OtpService.markOtpVerified`: Should resolve successfully.
  - `UserService.mobileLogin`: Should return a success response with user data and tokens.
- **Expected Assertions**:
  - Verify the success status and the presence of user data and tokens in the response.
  - Assert that `UserService.mobileLogin` was called exactly once.
  - Assert that `UserService.emailLogin` was not called.
- **Cleanup**: None.

#### Test Case 1.3: Login Attempt with Invalid OTP

**Description**: This test case verifies that the system rejects a login attempt with an OTP that does not exist in the database.

**Key Verification Points**:
- The system returns a 401 Unauthorized status.
- The response message indicates that the OTP is invalid.

**Detailed Implementation Guide**:
- **Setup**: Mock `OtpService` and `UserService`.
- **Input Data**:
  - `ctx.inputs.data.body.otp`: "000000"
  - `ctx.inputs.data.guestUser`: `{ id: 'guest-user-id-3', deviceId: 'device-id-3' }`
- **Execution Steps**:
  1. Call the `loginFunction` with the mocked context.
  2. `OtpService.getOtpByGuestUserId` is called.
- **Mocking Requirements**:
  - `OtpService.getOtpByGuestUserId`: Should return `null` or `undefined`.
- **Expected Assertions**:
  - Verify that the function returns an `AutomintGSStatus.unauthorized()` status.
  - Verify that the response message is 'Invalid OTP'.
  - Assert that `prisma.$transaction` was not called.
- **Cleanup**: None.

#### Test Case 1.4: Login Attempt with Already Verified OTP

**Description**: This test case ensures that a previously used and verified OTP cannot be used for login again.

**Key Verification Points**:
- The system returns a 400 Bad Request status.
- The response message indicates that the OTP has already been used.

**Detailed Implementation Guide**:
- **Setup**: Mock `OtpService` and `UserService`.
- **Input Data**:
  - `ctx.inputs.data.body.otp`: "111111"
  - `ctx.inputs.data.guestUser`: `{ id: 'guest-user-id-4', deviceId: 'device-id-4' }`
  - Mocked `otpRecord`: `{ id: 'otp-id-4', email: 'test4@example.com', verified: true, revoked: false }`
- **Execution Steps**:
  1. Call the `loginFunction` with the mocked context.
  2. `OtpService.getOtpByGuestUserId` returns the `otpRecord`.
  3. The code enters the `prisma.$transaction` block.
  4. The `if (verified)` condition is met.
- **Mocking Requirements**:
  - `OtpService.getOtpByGuestUserId`: Should return the `otpRecord` with `verified: true`.
- **Expected Assertions**:
  - Verify that the function returns an `AutomintGSStatus.badRequest()` status.
  - Verify that the response message is 'OTP already used'.
  - Assert that `OtpService.markOtpVerified` was not called.
- **Cleanup**: None.

#### Test Case 1.5: Login Attempt with Revoked OTP

**Description**: This test case ensures that a revoked OTP cannot be used for login.

**Key Verification Points**:
- The system returns a 400 Bad Request status.
- The response message indicates that the OTP was revoked.

**Detailed Implementation Guide**:
- **Setup**: Mock `OtpService` and `UserService`.
- **Input Data**:
  - `ctx.inputs.data.body.otp`: "222222"
  - `ctx.inputs.data.guestUser`: `{ id: 'guest-user-id-5', deviceId: 'device-id-5' }`
  - Mocked `otpRecord`: `{ id: 'otp-id-5', email: 'test5@example.com', verified: false, revoked: true }`
- **Execution Steps**:
  1. Call the `loginFunction`.
  2. `OtpService.getOtpByGuestUserId` returns the `otpRecord`.
  3. The `if (revoked)` condition inside the transaction is met.
- **Mocking Requirements**:
  - `OtpService.getOtpByGuestUserId`: Should return the `otpRecord` with `revoked: true`.
- **Expected Assertions**:
  - Verify that the function returns an `AutomintGSStatus.badRequest()` status.
  - Verify that the response message is 'OTP was revoked'.
- **Cleanup**: None.

#### Test Case 1.6: Error Handling during Database Transaction

**Description**: This test case verifies the system's behavior when a database error occurs during the transaction.

**Key Verification Points**:
- The system returns a 500 Internal Server Error status.
- The error is logged appropriately.

**Detailed Implementation Guide**:
- **Setup**: Mock `OtpService`, `UserService`, and Prisma.
- **Input Data**:
  - `ctx.inputs.data.body.otp`: "333333"
  - `ctx.inputs.data.guestUser`: `{ id: 'guest-user-id-6', deviceId: 'device-id-6' }`
  - Mocked `otpRecord`: `{ id: 'otp-id-6', email: 'test6@example.com', verified: false, revoked: false }`
- **Execution Steps**:
  1. Call the `loginFunction`.
  2. `OtpService.getOtpByGuestUserId` returns the `otpRecord`.
  3. The `prisma.$transaction` is initiated.
- **Mocking Requirements**:
  - `OtpService.getOtpByGuestUserId`: Should return the `otpRecord`.
  - `prisma.$transaction`: Should be mocked to throw a generic error.
- **Expected Assertions**:
  - Verify that the function returns an `AutomintGSStatus.internalError()` status.
  - Verify that `ctx.logger.error` was called.
- **Cleanup**: None.
### 2. test/eventHandlers/icemint/carvariant/fuzzy-search.test.ts

#### Test Case 2.1: Search with a Single Term Matching Manufacturer

**Description**: This test verifies that a search with a single term that matches a car's manufacturer returns the correct results, ranked appropriately.

**Key Verification Points**:
- The search returns car variants where the manufacturer name includes the search term.
- The results are ranked, with manufacturer matches having a high rank.
- The response includes correct pagination and search query metadata.

**Detailed Implementation Guide**:
- **Setup**:
  - Mock `ctx.datasources.icemint.client.$queryRawUnsafe` to simulate the raw SQL query execution.
- **Input Data**:
  - `ctx.inputs.data.query`: `{ squery: 'Toyota', page: 1, limit: 10 }`
- **Execution Steps**:
  1. Call the `fuzzySearch` function with the mocked context.
  2. The function will construct a SQL query with `ILIKE '%Toyota%'` for manufacturer, model, and variant.
  3. The mocked `$queryRawUnsafe` will be called with the generated query and parameters.
- **Mocking Requirements**:
  - `prisma.$queryRawUnsafe`: Should be mocked to return a predefined array of car variant objects that would match the search term 'Toyota'. The returned objects should include a `rank` property.
    - Example return value: `[{ id: 'variant-1', manufacturer: 'Toyota', model: 'Camry', variant: 'LE', rank: 1.0 }, { id: 'variant-2', manufacturer: 'Toyota', model: 'Corolla', variant: 'XSE', rank: 1.0 }]`
- **Expected Assertions**:
  - Verify that the function returns an `AutomintGSStatus.ok()` status.
  - Verify that the `results` array in the response data contains the mocked car variants.
  - Verify that the `meta` object in the response contains the correct `page`, `limit`, and `squery` values.
  - Inspect the generated SQL query (if possible, by capturing the arguments to the mock) to ensure it's constructed correctly.
- **Cleanup**: None.

#### Test Case 2.2: Search with Multiple Terms

**Description**: This test verifies that a search with multiple terms (e.g., "Honda City") returns relevant results based on the combined ranking of the terms.

**Key Verification Points**:
- The search returns variants that match either "Honda" or "City" in their manufacturer, model, or variant fields.
- The ranking should reflect the combined score of matches.
- The response metadata is correct.

**Detailed Implementation Guide**:
- **Setup**: Mock `prisma.$queryRawUnsafe`.
- **Input Data**:
  - `ctx.inputs.data.query`: `{ squery: 'Honda City', page: 1, limit: 10 }`
- **Execution Steps**:
  1. Call the `fuzzySearch` function.
  2. The function will construct a SQL query with `ILIKE` clauses for both "Honda" and "City".
  3. The mocked `$queryRawUnsafe` will be called.
- **Mocking Requirements**:
  - `prisma.$queryRawUnsafe`: Should return a list of variants. Some should match "Honda", some "City", and some both, with different ranks.
    - Example: `[{ id: 'v1', manufacturer: 'Honda', model: 'City', variant: 'VX', rank: 1.8 }, { id: 'v2', manufacturer: 'Honda', model: 'Amaze', variant: 'S', rank: 1.0 }]`
- **Expected Assertions**:
  - Verify the status is `ok`.
  - Verify the returned `results` match the mocked data.
  - Verify the `meta` object is correct.
- **Cleanup**: None.

#### Test Case 2.3: Search with No Matching Results

**Description**: This test verifies the system's behavior when a search query yields no results.

**Key Verification Points**:
- The system returns a success status.
- The `results` array in the response is empty.
- The metadata in the response is still correct.

**Detailed Implementation Guide**:
- **Setup**: Mock `prisma.$queryRawUnsafe`.
- **Input Data**:
  - `ctx.inputs.data.query`: `{ squery: 'NonExistentCar', page: 1, limit: 10 }`
- **Execution Steps**:
  1. Call the `fuzzySearch` function.
- **Mocking Requirements**:
  - `prisma.$queryRawUnsafe`: Should be mocked to return an empty array `[]`.
- **Expected Assertions**:
  - Verify the status is `ok`.
  - Verify that the `results` array in the response is empty.
  - Verify that the `meta` object contains `squery: 'NonExistentCar'`.
- **Cleanup**: None.

#### Test Case 2.4: Search with Special Characters in Query

**Description**: This test verifies that the search function handles queries with special characters gracefully.

**Key Verification Points**:
- The function does not crash or produce a malformed SQL query.
- The search proceeds, likely returning no results if the special characters are not part of any car names.

**Detailed Implementation Guide**:
- **Setup**: Mock `prisma.$queryRawUnsafe`.
- **Input Data**:
  - `ctx.inputs.data.query`: `{ squery: 'Car!@#$%', page: 1, limit: 10 }`
- **Execution Steps**:
  1. Call the `fuzzySearch` function.
- **Mocking Requirements**:
  - `prisma.$queryRawUnsafe`: Mock to return an empty array `[]`.
- **Expected Assertions**:
  - Verify the status is `ok`.
  - Verify the `results` array is empty.
- **Cleanup**: None.

#### Test Case 2.5: Database Error during Search

**Description**: This test verifies that if the database query fails, the system handles the error gracefully.

**Key Verification Points**:
- The system returns a 500 Internal Server Error status.
- The error is logged.

**Detailed Implementation Guide**:
- **Setup**: Mock `prisma.$queryRawUnsafe`.
- **Input Data**:
  - `ctx.inputs.data.query`: `{ squery: 'SomeCar', page: 1, limit: 10 }`
- **Execution Steps**:
  1. Call the `fuzzySearch` function.
- **Mocking Requirements**:
  - `prisma.$queryRawUnsafe`: Should be mocked to throw an error (e.g., a simulated `Prisma.PrismaClientKnownRequestError`).
- **Expected Assertions**:
  - Verify that the function returns an `AutomintGSStatus.internalError()` status.
  - Verify that the response data contains a `prismaError` or `error` object.
  - Verify that `ctx.logger.info` was called, but the final status is an error.
- **Cleanup**: None.

---

# login.test.ts

```

import { expect } from 'chai';
import sinon from 'sinon';
import { GSStatus, GSContext } from '@godspeedsystems/core';
import { makeContext } from '../../../helpers/makeContext';
import { UserService } from '../../../../src/functions/modules/user/user.service';
import { OtpService } from '../../../../src/functions/modules/otp/otp.service';
import { AutomintGSStatus } from '../../../../src/functions/com/utils/gs-status';
import loginfunction from '../../../../src/functions/com/biz/icemint/auth/login';

describe('Login Workflow', () => {
  let ctx: GSContext;
  let userServiceMock: sinon.SinonStubbedInstance<UserService>;
  let otpServiceMock: sinon.SinonStubbedInstance<OtpService>;
  let prismaTransactionStub: sinon.SinonStub;
  let loggerErrorSpy: sinon.SinonSpy;

  beforeEach(async () => {
    ctx = {
      inputs: {
        data: {
          body: { otp: '123456' },
          guestUser: { id: 'guest-user-id', deviceId: 'device-id' }
        }
      },
      datasources: {
        icemint: {
          client: {
            $transaction: sinon.stub()
          }
        }
      },
      logger: {
        info: sinon.stub(),
        error: sinon.stub(),
        warn: sinon.stub(),
        debug: sinon.stub()
      }
    } as any;

    loggerErrorSpy = sinon.spy(ctx.logger, 'error');

    // Mock service instances
    userServiceMock = sinon.createStubInstance(UserService);
    otpServiceMock = sinon.createStubInstance(OtpService);

    // Stub the getInstance methods to return our mocks
    sinon.stub(UserService, 'getInstance').returns(userServiceMock);
    sinon.stub(OtpService, 'getInstance').returns(otpServiceMock);

    // Mock prisma transaction
    prismaTransactionStub = ctx.datasources.icemint.client.$transaction = sinon.stub();
    prismaTransactionStub.callsFake(async (fn) => fn(ctx.datasources.icemint.client));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Test Case 1.1: Successful Login with Valid Email OTP', async () => {
    const otpRecord = {
      id: 'otp-id',
      email: 'test@example.com',
      mobileNo: null,
      verified: false,
      revoked: false,
    };
    const loginResult = AutomintGSStatus.ok().withData({
      user: { id: 'user-1', email: 'test@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    otpServiceMock.getOtpByGuestUserId.resolves(otpRecord as any);
    userServiceMock.emailLogin.resolves(loginResult);
    otpServiceMock.markOtpVerified.resolves();

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.auth.login');
    const result: any = await loginfunction(ctx);

    expect(result.statusCode).to.equal(200);
    expect(result.body).to.deep.equal(loginResult.data);
    sinon.assert.calledOnce(otpServiceMock.markOtpVerified);
    sinon.assert.calledOnce(userServiceMock.emailLogin);
  });

  it('Test Case 1.2: Successful Login with Valid Mobile OTP', async () => {
    const otpRecord = {
      id: 'otp-id-2',
      email: null,
      mobileNo: '1234567890',
      verified: false,
      revoked: false,
    };
    const loginResult = AutomintGSStatus.ok().withData({
      user: { id: 'user-2', mobileNo: '1234567890' },
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
    });

    otpServiceMock.getOtpByGuestUserId.resolves(otpRecord as any);
    userServiceMock.mobileLogin.resolves(loginResult);
    otpServiceMock.markOtpVerified.resolves();

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.auth.login');
    const result: any = await loginfunction(ctx);

    expect(result.statusCode).to.equal(200);
    expect(result.body).to.deep.equal(loginResult.data);
    sinon.assert.calledOnce(userServiceMock.mobileLogin);
    sinon.assert.notCalled(userServiceMock.emailLogin);
  });

  it('Test Case 1.3: Login Attempt with Invalid OTP', async () => {
    otpServiceMock.getOtpByGuestUserId.resolves(null);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.auth.login');
    const result: any = await loginfunction(ctx);

    expect(result.statusCode).to.equal(401);
    expect(result.body.message).to.equal('Invalid OTP');
    sinon.assert.notCalled(prismaTransactionStub);
  });

  it('Test Case 1.4: Login Attempt with Already Verified OTP', async () => {
    const otpRecord = {
      id: 'otp-id-4',
      email: 'test4@example.com',
      verified: true,
      revoked: false,
    };
    otpServiceMock.getOtpByGuestUserId.resolves(otpRecord as any);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.auth.login');
    const result: any = await loginfunction(ctx);

    expect(result.statusCode).to.equal(400);
    expect(result.body.message).to.equal('OTP already used');
    sinon.assert.notCalled(otpServiceMock.markOtpVerified);
  });

  it('Test Case 1.5: Login Attempt with Revoked OTP', async () => {
    const otpRecord = {
      id: 'otp-id-5',
      email: 'test5@example.com',
      verified: false,
      revoked: true,
    };
    otpServiceMock.getOtpByGuestUserId.resolves(otpRecord as any);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.auth.login');
    const result: any = await loginfunction(ctx);

    expect(result.statusCode).to.equal(400);
    expect(result.body.message).to.equal('OTP was revoked');
  });

  it('Test Case 1.6: Error Handling during Database Transaction', async () => {
    const otpRecord = {
      id: 'otp-id-6',
      email: 'test6@example.com',
      verified: false,
      revoked: false,
    };
    const dbError = new Error('DB Connection Failed');
    otpServiceMock.getOtpByGuestUserId.resolves(otpRecord as any);
    prismaTransactionStub.throws(dbError);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.auth.login');
    const result: any = await loginfunction(ctx);

    expect(result.statusCode).to.equal(500);
    sinon.assert.calledWith(loggerErrorSpy, sinon.match.string);
  });
});
```
---

# fuzzy-search.test.ts

```
// fuzzy-search.test.ts

import { expect } from 'chai';
import sinon from 'sinon';
import { GSContext } from '@godspeedsystems/core';
import fuzzySearch from '../../../../src/functions/com/biz/icemint/carvariant/fuzzy-search';
import { AutomintGSStatus } from '../../../../src/functions/com/utils/gs-status';

describe('Fuzzy Search Workflow', () => {
  let ctx: GSContext;
  let queryRawUnsafeStub: sinon.SinonStub;

  beforeEach(async () => {
    ctx = {
      inputs: {
        data: {
          query: { 
            manufacturer: 'Toyota', 
            model: undefined,
            page: 1, 
            limit: 10 
          }
        }
      },
      datasources: {
        icemint: {
          client: {
            carVariant: {
              findMany: sinon.stub(),
              count: sinon.stub()
            }
          }
        }
      },
      logger: {
        info: sinon.stub(),
        error: sinon.stub(),
        warn: sinon.stub(),
        debug: sinon.stub()
      }
    } as any;
    queryRawUnsafeStub = ctx.datasources.icemint.client.$queryRawUnsafe = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Test Case 2.1: Search with a Single Term Matching Manufacturer', async () => {
    const mockCarVariants = [
      { id: 'variant-1', manufacturer: 'Toyota', model: 'Camry', variant: 'LE', rank: 1.0 },
      { id: 'variant-2', manufacturer: 'Toyota', model: 'Corolla', variant: 'XSE', rank: 1.0 },
    ];
    queryRawUnsafeStub.resolves(mockCarVariants);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.carvariant.fuzzy-search-experimental');
    const result: any = await fuzzySearch(ctx);

    expect(result.statusCode).to.equal(200);
    expect(result.body.results).to.deep.equal(mockCarVariants);
    expect(result.body.meta).to.deep.equal({ page: 1, limit: 10, squery: 'Toyota' });
  });

  it('Test Case 2.2: Search with Multiple Terms', async () => {
    ctx.inputs.data.query.squery = 'Honda City';
    const mockCarVariants = [
      { id: 'v1', manufacturer: 'Honda', model: 'City', variant: 'VX', rank: 1.8 },
      { id: 'v2', manufacturer: 'Honda', model: 'Amaze', variant: 'S', rank: 1.0 },
    ];
    queryRawUnsafeStub.resolves(mockCarVariants);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.carvariant.fuzzy-search-experimental');
    const result: any = await fuzzySearch(ctx);

    expect(result.statusCode).to.equal(200);
    expect(result.body.results).to.deep.equal(mockCarVariants);
  });

  it('Test Case 2.3: Search with No Matching Results', async () => {
    ctx.inputs.data.query.squery = 'NonExistentCar';
    queryRawUnsafeStub.resolves([]);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.carvariant.fuzzy-search-experimental');
    const result: any = await fuzzySearch(ctx);

    expect(result.statusCode).to.equal(200);
    expect(result.body.results).to.be.an('array').that.is.empty;
    expect(result.body.meta.squery).to.equal('NonExistentCar');
  });

  it('Test Case 2.4: Search with Special Characters in Query', async () => {
    ctx.inputs.data.query.squery = 'Car!@#$%';
    queryRawUnsafeStub.resolves([]);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.carvariant.fuzzy-search-experimental');
    const result: any = await fuzzySearch(ctx);

    expect(result.statusCode).to.equal(200);
    expect(result.body.results).to.be.an('array').that.is.empty;
  });

  it('Test Case 2.5: Database Error during Search', async () => {
    const dbError = new Error('DB Connection Failed');
    queryRawUnsafeStub.rejects(dbError);

    // const result: any = await executeWorkflow(ctx, 'com.biz.icemint.carvariant.fuzzy-search-experimental');
    const result: any = await fuzzySearch(ctx);

    expect(result.statusCode).to.equal(500);
    expect(result.body.prismaError).to.not.be.undefined;
  });
});
```
