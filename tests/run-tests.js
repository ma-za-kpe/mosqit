#!/usr/bin/env node

/**
 * Test Runner for Mosqit
 * Runs all test suites with proper reporting
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}...`, colors.cyan);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, colors.green);
    return true;
  } catch {
    log(`❌ ${description} failed`, colors.red);
    return false;
  }
}

async function runTests() {
  log('🧪 Mosqit Test Suite Runner', colors.blue);
  log('=' .repeat(50), colors.blue);

  const results = {
    passed: [],
    failed: []
  };

  // 1. Check if dependencies are installed
  log('\n📦 Checking dependencies...', colors.cyan);
  const hasJest = fs.existsSync(path.join(__dirname, '..', 'node_modules', 'jest'));

  if (!hasJest) {
    log('Installing test dependencies...', colors.yellow);
    runCommand('npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom', 'Install dependencies');
  }

  // 2. Run unit tests
  if (runCommand('npx jest tests/mosqit-logger.test.js --no-coverage', 'Core Logger Tests')) {
    results.passed.push('Core Logger Tests');
  } else {
    results.failed.push('Core Logger Tests');
  }

  // 3. Run AI integration tests
  if (runCommand('npx jest tests/mosqit-ai.test.js --no-coverage', 'AI Integration Tests')) {
    results.passed.push('AI Integration Tests');
  } else {
    results.failed.push('AI Integration Tests');
  }

  // 4. Run pattern detection tests
  if (runCommand('npx jest tests/pattern-detection.test.js --no-coverage', 'Pattern Detection Tests')) {
    results.passed.push('Pattern Detection Tests');
  } else {
    results.failed.push('Pattern Detection Tests');
  }

  // 5. Run all tests with coverage
  log('\n📊 Running all tests with coverage...', colors.cyan);
  runCommand('npx jest --coverage', 'Full Test Suite with Coverage');

  // 6. Display results summary
  log('\n' + '=' .repeat(50), colors.blue);
  log('📋 Test Results Summary', colors.blue);
  log('=' .repeat(50), colors.blue);

  if (results.passed.length > 0) {
    log(`\n✅ Passed (${results.passed.length}):`, colors.green);
    results.passed.forEach(test => log(`   • ${test}`, colors.green));
  }

  if (results.failed.length > 0) {
    log(`\n❌ Failed (${results.failed.length}):`, colors.red);
    results.failed.forEach(test => log(`   • ${test}`, colors.red));
  }

  // 7. Check coverage report
  const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html');
  if (fs.existsSync(coveragePath)) {
    log('\n📊 Coverage report generated:', colors.cyan);
    log(`   Open: ${coveragePath}`, colors.cyan);
  }

  // Exit code based on results
  const exitCode = results.failed.length > 0 ? 1 : 0;

  if (exitCode === 0) {
    log('\n🎉 All tests passed!', colors.green);
  } else {
    log(`\n⚠️ ${results.failed.length} test suite(s) failed`, colors.yellow);
  }

  process.exit(exitCode);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, colors.red);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  log(`\n❌ Test runner error: ${error.message}`, colors.red);
  process.exit(1);
});