#!/bin/bash

# User Guide Comprehensive Test Suite
# Executes all testing phases for the user guide feature

set -e

echo "🧪 User Guide Comprehensive Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test suite and track results
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    local description="$3"
    
    echo -e "\n${BLUE}📋 Running: $test_name${NC}"
    echo "Description: $description"
    echo "Command: $test_command"
    echo "----------------------------------------"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name: PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $test_name: FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

# Function to run performance benchmark
run_performance_benchmark() {
    echo -e "\n${BLUE}🚀 Running Performance Benchmark${NC}"
    echo "----------------------------------------"
    
    if command -v node &> /dev/null; then
        if node -e "require('./src/components/userGuide/__tests__/PerformanceBenchmark.ts')"; then
            echo -e "${GREEN}✅ Performance Benchmark: PASSED${NC}"
            ((PASSED_TESTS++))
        else
            echo -e "${RED}❌ Performance Benchmark: FAILED${NC}"
            ((FAILED_TESTS++))
        fi
    else
        echo -e "${YELLOW}⚠️  Node.js not found, skipping performance benchmark${NC}"
    fi
    
    ((TOTAL_TESTS++))
}

# Function to check accessibility with axe-core
check_accessibility() {
    echo -e "\n${BLUE}♿ Running Accessibility Audit${NC}"
    echo "----------------------------------------"
    
    # This would run axe-core accessibility tests
    # For now, we'll run the accessibility test suite
    if npm test -- --run src/components/userGuide/__tests__/UserGuideAccessibility.test.tsx --reporter=verbose; then
        echo -e "${GREEN}✅ Accessibility Audit: PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ Accessibility Audit: FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

# Function to run cross-browser tests
run_cross_browser_tests() {
    echo -e "\n${BLUE}🌐 Running Cross-Browser Tests${NC}"
    echo "----------------------------------------"
    
    if npm test -- --run src/components/userGuide/__tests__/UserGuideCrossBrowser.test.tsx --reporter=verbose; then
        echo -e "${GREEN}✅ Cross-Browser Tests: PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ Cross-Browser Tests: FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

# Function to generate test report
generate_test_report() {
    local pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    
    echo -e "\n${BLUE}📊 Test Results Summary${NC}"
    echo "========================================"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo "Pass Rate: $pass_rate%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! User Guide is ready for production.${NC}"
        return 0
    else
        echo -e "\n${RED}⚠️  Some tests failed. Please review and fix issues before deployment.${NC}"
        return 1
    fi
}

# Main test execution
main() {
    echo "Starting comprehensive test suite for User Guide..."
    echo "Timestamp: $(date)"
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found. Please install Node.js and npm.${NC}"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    # Run test suites
    run_test_suite \
        "Unit Tests" \
        "npm test -- --run src/components/userGuide/__tests__/ --exclude='**/UserGuideE2E.test.tsx' --exclude='**/UserGuideAccessibility.test.tsx' --exclude='**/UserGuideCrossBrowser.test.tsx' --exclude='**/UserGuideAcceptance.test.tsx'" \
        "Individual component and utility function tests"
    
    run_test_suite \
        "Integration Tests" \
        "npm test -- --run src/components/userGuide/__tests__/UserGuideIntegration.test.tsx" \
        "Component interaction and store integration tests"
    
    run_test_suite \
        "Performance Tests" \
        "npm test -- --run src/components/userGuide/__tests__/UserGuidePerformance.test.tsx" \
        "Performance benchmarks and optimization validation"
    
    check_accessibility
    
    run_cross_browser_tests
    
    run_test_suite \
        "End-to-End Tests" \
        "npm test -- --run src/components/userGuide/__tests__/UserGuideE2E.test.tsx" \
        "Complete user workflow and journey tests"
    
    run_test_suite \
        "User Acceptance Tests" \
        "npm test -- --run src/components/userGuide/__tests__/UserGuideAcceptance.test.tsx" \
        "Business requirements and user story validation"
    
    # Run performance benchmark
    run_performance_benchmark
    
    # Generate final report
    generate_test_report
}

# Handle script arguments
case "${1:-}" in
    --unit)
        run_test_suite "Unit Tests" "npm test -- --run src/components/userGuide/__tests__/ --exclude='**/UserGuideE2E.test.tsx'" "Unit tests only"
        ;;
    --integration)
        run_test_suite "Integration Tests" "npm test -- --run src/components/userGuide/__tests__/UserGuideIntegration.test.tsx" "Integration tests only"
        ;;
    --performance)
        run_test_suite "Performance Tests" "npm test -- --run src/components/userGuide/__tests__/UserGuidePerformance.test.tsx" "Performance tests only"
        run_performance_benchmark
        ;;
    --accessibility)
        check_accessibility
        ;;
    --cross-browser)
        run_cross_browser_tests
        ;;
    --e2e)
        run_test_suite "End-to-End Tests" "npm test -- --run src/components/userGuide/__tests__/UserGuideE2E.test.tsx" "E2E tests only"
        ;;
    --acceptance)
        run_test_suite "User Acceptance Tests" "npm test -- --run src/components/userGuide/__tests__/UserGuideAcceptance.test.tsx" "UAT only"
        ;;
    --help)
        echo "User Guide Test Suite"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --unit          Run unit tests only"
        echo "  --integration   Run integration tests only"
        echo "  --performance   Run performance tests and benchmark"
        echo "  --accessibility Run accessibility audit"
        echo "  --cross-browser Run cross-browser compatibility tests"
        echo "  --e2e          Run end-to-end tests only"
        echo "  --acceptance   Run user acceptance tests only"
        echo "  --help         Show this help message"
        echo ""
        echo "Run without arguments to execute the full test suite."
        ;;
    *)
        main
        ;;
esac