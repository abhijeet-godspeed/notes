## Core Design Principles

**Stateful**: Remember previous work and current project state through persistent `.qa-state.json` files
**Modular**: Each workflow operates independently but shares common state and utilities
**Resumable**: Can pick up work from any interruption point using checkpoint systems
**Adaptive**: Adjusts approach based on project maturity, size, and existing infrastructure
**Incremental**: Supports small, focused changes rather than complete overhauls

## System Architecture

### State Management System
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
  }
}
```

### Agent Ecosystem
- **QA Lead Engineer**: Orchestrator and workflow manager
- **QA Document Writer**: Creates test strategies and documentation
- **QA Coder**: Implements actual test code

## Six Core Workflows

### Workflow 1: Testing Setup
**Purpose**: Establish testing infrastructure and configuration
**State Tracking**: Setup phases (scaffolding, configuration, utilities, documentation)
**Adaptive Behavior**: 
- No existing setup → Full scaffolding
- Partial setup → Enhancement mode
- Different frameworks → Migration assistance

### Workflow 2: Add Tests for New Features
**Purpose**: Write tests for newly developed functionality
**State Tracking**: Target features, existing test analysis, new requirements
**Incremental Approach**: One endpoint/function at a time with resumption capability

### Workflow 3: Fix Broken/Failing Tests
**Purpose**: Debug and repair failing test cases
**State Tracking**: Failure analysis, categorization, fix progress
**Diagnostic Process**: Categorize → Prioritize → Analyze → Fix → Validate

### Workflow 4: Improve Test Coverage
**Purpose**: Fill gaps and enhance existing test coverage
**State Tracking**: Coverage analysis by module, improvement phases
**Adaptive Strategy**: Different approaches based on current coverage levels

### Workflow 5: Update Existing Tests
**Purpose**: Modify tests due to code changes or requirement updates
**State Tracking**: Change impact analysis, affected tests, update progress
**Change Detection**: Identify direct, indirect, and uncertain impacts

### Workflow 6: Generate Test Reports
**Purpose**: Create comprehensive testing reports and analytics
**State Tracking**: Report type, scope, generation progress
**Adaptive Output**: Different report formats for developers, managers, stakeholders

## User Experience Flow

```
User initiates QA Lead Engineer
↓
System reads .qa-state.json (if exists)
↓
Present workflow options with context:
1. Testing Setup
2. Add Tests for New Features  
3. Fix Broken/Failing Tests
4. Improve Test Coverage
5. Update Existing Tests
6. Generate Test Reports
↓
User selects workflow
↓
System executes with checkpoints and state updates
↓
Provide completion summary and next steps
```
