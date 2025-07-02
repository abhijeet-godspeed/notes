## Workflow 1: Testing Setup

### State Management
```json
{
  "workflowType": "testing-setup",
  "setupPhases": {
    "scaffolding": "pending",        // Generate test directories
    "configuration": "pending",      // Jest/testing framework config
    "utilities": "pending",          // Test helpers and utilities
    "documentation": "pending"       // Testing guidelines and standards
  },
  "existingSetup": {
    "hasTestDir": false,
    "hasConfig": false,
    "hasScripts": false,
    "detectedFramework": null
  },
  "projectAnalysis": {
    "codebaseSize": "medium",
    "frameworkDetected": "express",
    "hasExistingTests": false,
    "recommendedTestFramework": "jest"
  }
}
```

### Adaptive Behavior
- **No Existing Setup**: Full scaffolding with framework selection
- **Partial Setup**: Enhance existing configuration
- **Different Framework**: Migration assistance (Jest to Vitest, etc.)
- **Monorepo Projects**: Workspace-aware setup[1][2]

### Resumable Checkpoints
1. **After Directory Creation**: Can resume at configuration
2. **After Framework Setup**: Can resume at utilities creation
3. **After Utilities**: Can resume at documentation
4. **Mid-Configuration**: Can resume specific config files

### Incremental Setup
- Core testing infrastructure first
- Framework-specific configurations second
- Advanced utilities and helpers third
- Documentation and guidelines last

## Workflow 2: Add Tests for New Features

### State Management
```json
{
  "workflowType": "add-feature",
  "targetFeature": "user-authentication",
  "existingTestAnalysis": {
    "currentCoverage": "65%",
    "existingTestFiles": ["auth.test.js", "user.test.js"],
    "relatedTests": ["user.test.js"]
  },
  "newTestRequirements": {
    "endpoints": ["/login", "/register", "/logout"],
    "functions": ["validateCredentials", "generateJWT"],
    "integrationPoints": ["database", "email-service"]
  }
}
```

### Adaptive Behavior
- **Authentication Systems**: Focus on security testing patterns[1][3][4]
- **High Coverage Project** (>80%): Maintain quality standards
- **Medium Coverage** (40-80%): Balance new features with gap filling
- **Low Coverage** (<40%): Suggest improving existing coverage first

### Modular Integration
- Read existing test strategy documents[5][6]
- Analyze existing test patterns and follow same structure
- Reuse existing test utilities and helpers
- Maintain consistent naming conventions

### Incremental Approach
- Add one endpoint test at a time
- Test individual functions before integration
- Allow partial completion and resumption
- Validate new tests don't break existing ones

## Workflow 3: Fix Broken/Failing Tests

### State Management
```json
{
  "workflowType": "fix-broken",
  "failureAnalysis": {
    "totalFailingTests": 8,
    "failureCategories": {
      "environment": 3,
      "code-changes": 4,
      "flaky": 1
    },
    "priorityOrder": ["critical-auth", "user-creation", "payment-flow"]
  },
  "fixProgress": {
    "analyzed": ["auth.test.js"],
    "fixed": [],
    "remaining": ["user.test.js", "payment.test.js"]
  }
}
```

### Adaptive Behavior
- **Few Failures** (1-5): Fix immediately
- **Many Failures** (5-20): Prioritize by business impact
- **Massive Failures** (20+): Suggest systematic review first
- **Authentication Issues**: Apply security-focused debugging[7][8]

### Diagnostic Approach
1. **Categorize Failures**: Environment vs Code vs Logic
2. **Priority Assessment**: Critical path vs Nice-to-have
3. **Root Cause Analysis**: One fix might solve multiple issues
4. **Validation**: Ensure fixes don't create new problems

### Resumable Process
- Save diagnostic results between sessions
- Track which fixes have been attempted
- Remember successful fix patterns for similar issues
- Allow pausing mid-fix for complex problems

## Workflow 4: Improve Test Coverage

### State Management
```json
{
  "workflowType": "improve-coverage",
  "coverageAnalysis": {
    "currentOverall": "45%",
    "byModule": {
      "auth": "85%",
      "user": "30%",
      "payment": "60%"
    },
    "uncoveredCriticalPaths": ["error-handling", "edge-cases"],
    "targetCoverage": "80%"
  },
  "improvementPlan": {
    "phase1": "user module to 70%",
    "phase2": "payment edge cases",
    "phase3": "error handling across modules"
  }
}
```

### Adaptive Strategy
- **Low Coverage** (<50%): Focus on happy path coverage first
- **Medium Coverage** (50-75%): Add edge cases and error scenarios
- **High Coverage** (75%+): Focus on complex integration scenarios
- **Microservices Architecture**: Service-specific coverage goals[9][10]

### Incremental Improvement
- Target specific modules rather than everything
- Set realistic coverage goals (not always 100%)
- Prioritize business-critical functionality
- Allow iterative improvement over time

## Workflow 5: Update Existing Tests

### State Management
```json
{
  "workflowType": "update-existing",
  "updateTrigger": "api-refactoring", // or "requirement-change", "bug-fix"
  "affectedTests": {
    "direct": ["auth.test.js", "user.test.js"],
    "indirect": ["integration.test.js"],
    "uncertain": ["payment.test.js"]
  },
  "updateProgress": {
    "analyzed": ["auth.test.js"],
    "updated": [],
    "validated": []
  }
}
```

### Change Impact Analysis
- Detect which tests are affected by code changes
- Identify dependencies between test files
- Assess risk level of each update
- Plan update sequence to minimize breakage

### Adaptive Updates
- **Minor Changes**: Update assertions and expected values
- **Major Refactoring**: Rewrite test logic while preserving intent
- **Breaking Changes**: Create migration plan for test updates
- **Framework Updates**: Handle TypeScript and dependency changes[11]

## Workflow 6: Generate Test Reports

### State Management
```json
{
  "workflowType": "generate-reports",
  "reportType": "comprehensive", // or "coverage", "performance", "trend"
  "reportScope": {
    "timeRange": "last-30-days",
    "modules": ["all"],
    "testTypes": ["unit", "integration"]
  },
  "reportProgress": {
    "dataCollected": true,
    "analysisComplete": false,
    "reportGenerated": false
  }
}
```

### Adaptive Reporting
- **Developer Reports**: Technical details, coverage gaps, performance
- **Manager Reports**: High-level metrics, trends, quality indicators
- **Stakeholder Reports**: Business impact, risk assessment, recommendations

### Incremental Generation
- Collect data progressively
- Generate sections independently
- Allow customization of report content
- Support multiple output formats

## Cross-Workflow State Sharing

### Shared State Structure
```json
{
  "project": {
    "name": "onlyexams-auth-service",
    "framework": "express",
    "testFramework": "jest",
    "architecture": "microservices",
    "lastActivity": "2025-07-02T16:13:00Z"
  },
  "currentWorkflow": "add-feature",
  "workflowHistory": ["testing-setup", "improve-coverage", "add-feature"],
  "globalProgress": {
    "setupComplete": true,
    "totalTestFiles": 12,
    "overallCoverage": "72%",
    "lastTestRun": "2025-07-02T15:30:00Z",
    "knownIssues": []
  },
  "userPreferences": {
    "testingFramework": "jest",
    "coverageThreshold": 80,
    "reportFormat": "markdown",
    "skipScaffolding": true
  }
}
```

## Workflow Integration Benefits

**Clear Separation**: Setup is infrastructure work, other workflows focus on test implementation
**Reusable Foundation**: Once setup is complete, all other workflows can assume proper infrastructure exists
**Flexible Entry**: Users can enhance existing setups or create new ones without touching test files
**Project-Aware**: Adapts to monorepo structures, microservices, and different tech stacks based on conversation history[1][2][9][10]

This design ensures each workflow is independent but leverages shared project knowledge, making the system truly adaptive and efficient for ongoing QA work across different project types and development stages.

[1] programming.authentication_systems
[2] programming.authentication_services
[3] https://www.perplexity.ai/search/63499142-6d1a-4a85-99d1-61ecbdf5e116
[4] https://www.perplexity.ai/search/05e35c94-742e-4a6e-9528-c3526ae6f897
[5] https://www.perplexity.ai/search/d2844f38-4d5f-4a87-a3e0-752f79f79137
[6] https://www.perplexity.ai/search/fa6cb9e5-f011-4330-ad4a-871b9fe47b6f
[7] https://www.perplexity.ai/search/c6eff447-833d-4472-8344-470a3b1897ed
[8] https://www.perplexity.ai/search/809c70ee-f1b2-4d7e-af00-e61f621a6331
[9] https://www.perplexity.ai/search/ee084700-cec3-4068-b199-68f7fd3e411a
[10] https://www.perplexity.ai/search/1674cec4-bc6b-4dea-a3a7-b75e915a2f4b
[11] https://www.perplexity.ai/search/733f1923-0c1c-4ab0-95d7-dbaa75e59184
