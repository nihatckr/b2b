#!/usr/bin/env node

const fetch = require("node-fetch");

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

// GraphQL introspection queries
const queries = {
  // Test all types exist
  allTypes: `{
    __schema {
      types {
        name
        kind
      }
    }
  }`,

  // Test enum types
  roleEnum: `{
    __type(name: "Role") {
      enumValues {
        name
      }
    }
  }`,

  currencyEnum: `{
    __type(name: "Currency") {
      enumValues {
        name
      }
    }
  }`,

  orderStageEnum: `{
    __type(name: "OrderStage") {
      enumValues {
        name
      }
    }
  }`,

  approvalTypeEnum: `{
    __type(name: "ApprovalType") {
      enumValues {
        name
      }
    }
  }`,

  // Test object types
  userType: `{
    __type(name: "User") {
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }`,

  companyType: `{
    __type(name: "Company") {
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }`,

  // Test input types
  createOrderStageInput: `{
    __type(name: "CreateOrderStageInput") {
      inputFields {
        name
        type {
          name
          kind
        }
      }
    }
  }`,

  // Test query fields
  queryFields: `{
    __schema {
      queryType {
        fields {
          name
          type {
            name
          }
        }
      }
    }
  }`,

  // Test mutation fields
  mutationFields: `{
    __schema {
      mutationType {
        fields {
          name
          type {
            name
          }
        }
      }
    }
  }`,
};

async function runTest(testName, query) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    console.log("─".repeat(50));

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.log("❌ ERRORS:", JSON.stringify(result.errors, null, 2));
      return false;
    }

    if (result.data) {
      console.log("✅ SUCCESS");
      console.log(JSON.stringify(result.data, null, 2));
      return true;
    }

    console.log("⚠️  NO DATA RETURNED");
    return false;
  } catch (error) {
    console.log("💥 EXCEPTION:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 GRAPHQL TYPE TESTING STARTED");
  console.log("=".repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  for (const [testName, query] of Object.entries(queries)) {
    totalTests++;
    const passed = await runTest(testName, query);
    if (passed) passedTests++;

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 ALL TESTS PASSED! GraphQL schema is working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Please check the output above.");
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "{ __schema { queryType { name } } }" }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("🔍 Checking if GraphQL server is running...");

  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ GraphQL server is not running at", GRAPHQL_ENDPOINT);
    console.log("Please start the server first with: npm run dev");
    process.exit(1);
  }

  console.log("✅ Server is running, starting tests...\n");
  await runAllTests();
}

main().catch(console.error);
