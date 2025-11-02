// scripts/generate-ops.js

import fetch from "cross-fetch";
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLList,
  GraphQLNonNull,
  isEnumType,
  isInterfaceType,
  isObjectType,
  isScalarType,
  isUnionType,
  Kind,
  print,
} from "graphql";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const ENDPOINT = process.env.GQL_ENDPOINT || "http://localhost:4001/graphql";
const OUT_DIR = process.env.OUT_DIR || "src/graphql";
const MAX_DEPTH = Number(process.env.MAX_DEPTH || 3); // gerekirse arttırın

async function introspectSchema() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Introspection failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(
      "Introspection errors: " + JSON.stringify(json.errors, null, 2)
    );
  }
  return buildClientSchema(json.data);
}

function unwrapType(t) {
  let type = t;
  let list = false;
  let nonNull = false;
  while (type instanceof GraphQLNonNull || type instanceof GraphQLList) {
    if (type instanceof GraphQLList) list = true;
    if (type instanceof GraphQLNonNull) nonNull = true;
    type = type.ofType;
  }
  return { type, list, nonNull };
}

const builtinScalars = new Set(["String", "ID", "Int", "Float", "Boolean"]);

function makeVarName(argName) {
  // basit ve güvenli bir değişken adı
  return argName.replace(/[^a-zA-Z0-9_]/g, "_");
}

function typeNodeFromGraphQLType(gqlType) {
  // GraphQL argüman tipi -> AST TypeNode (değişken deklarasyonu için)
  if (gqlType instanceof GraphQLNonNull) {
    const inner = typeNodeFromGraphQLType(gqlType.ofType);
    return { kind: Kind.NON_NULL_TYPE, type: inner };
  }
  if (gqlType instanceof GraphQLList) {
    const inner = typeNodeFromGraphQLType(gqlType.ofType);
    return { kind: Kind.LIST_TYPE, type: inner };
  }
  return {
    kind: Kind.NAMED_TYPE,
    name: { kind: Kind.NAME, value: gqlType.name },
  };
}

function buildSelectionSet(schema, gqlType, depth, seen = new Set()) {
  // object/interface/union tipleri için alan seçimleri üret
  const selections = [];

  if (depth > MAX_DEPTH) {
    // Max depth aşıldığında sadece id ve __typename
    selections.push({
      kind: Kind.FIELD,
      name: { kind: Kind.NAME, value: "id" },
    });
    selections.push({
      kind: Kind.FIELD,
      name: { kind: Kind.NAME, value: "__typename" },
    });
    return { kind: Kind.SELECTION_SET, selections };
  }

  if (isObjectType(gqlType) || isInterfaceType(gqlType)) {
    const fields = gqlType.getFields();
    for (const fieldName of Object.keys(fields)) {
      const field = fields[fieldName];
      const { type: unwrapped } = unwrapType(field.type);

      // Scalar ve Enum tiplerini direkt ekle
      if (
        isScalarType(unwrapped) ||
        isEnumType(unwrapped) ||
        builtinScalars.has(unwrapped.name)
      ) {
        selections.push({
          kind: Kind.FIELD,
          name: { kind: Kind.NAME, value: fieldName },
        });
        continue;
      }

      // Connection, Edge, PageInfo tiplerini atla (pagination için gerektiğinde manuel eklenecek)
      if (
        unwrapped.name.endsWith("Connection") ||
        unwrapped.name.endsWith("Edge") ||
        unwrapped.name === "PageInfo"
      ) {
        continue;
      }

      // döngüleri engelle
      const key = `${gqlType.name}.${fieldName}->${unwrapped.name}`;
      if (seen.has(key)) continue;

      const nextSeen = new Set(seen);
      nextSeen.add(key);

      // Nested object için sadece id ve __typename
      if (depth >= MAX_DEPTH) {
        selections.push({
          kind: Kind.FIELD,
          name: { kind: Kind.NAME, value: fieldName },
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "id" } },
              {
                kind: Kind.FIELD,
                name: { kind: Kind.NAME, value: "__typename" },
              },
            ],
          },
        });
      } else {
        const subSel = buildSelectionSet(
          schema,
          unwrapped,
          depth + 1,
          nextSeen
        );
        selections.push({
          kind: Kind.FIELD,
          name: { kind: Kind.NAME, value: fieldName },
          selectionSet: subSel,
        });
      }
    }
  } else if (isUnionType(gqlType)) {
    const types = gqlType.getTypes();
    for (const member of types) {
      const subSel = buildSelectionSet(schema, member, depth + 1, seen);
      selections.push({
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: {
          kind: Kind.NAMED_TYPE,
          name: { kind: Kind.NAME, value: member.name },
        },
        selectionSet: subSel,
      });
    }
  }

  // her selection set'e __typename eklemek genelde faydalı
  selections.push({
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: "__typename" },
  });

  return { kind: Kind.SELECTION_SET, selections };
}

function buildOperationDoc(opTypeName, fieldName, field, schema) {
  // operation adı
  const opName = `${opTypeName}_${fieldName}`;

  // Değişken tanımları (field argümanlarından)
  const variableDefinitions = (field.args || []).map((arg) => ({
    kind: Kind.VARIABLE_DEFINITION,
    variable: {
      kind: Kind.VARIABLE,
      name: { kind: Kind.NAME, value: makeVarName(arg.name) },
    },
    type: typeNodeFromGraphQLType(arg.type),
  }));

  // Field çağrısı argümanları
  const args = (field.args || []).map((arg) => ({
    kind: Kind.ARGUMENT,
    name: { kind: Kind.NAME, value: arg.name },
    value: {
      kind: Kind.VARIABLE,
      name: { kind: Kind.NAME, value: makeVarName(arg.name) },
    },
  }));

  // Alan seçimleri
  const { type: unwrapped } = unwrapType(field.type);
  const selectionSet =
    isScalarType(unwrapped) || builtinScalars.has(unwrapped.name)
      ? undefined
      : buildSelectionSet(schema, unwrapped, 1);

  return {
    kind: Kind.DOCUMENT,
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION,
        operation: opTypeName, // "query" | "mutation" | "subscription"
        name: { kind: Kind.NAME, value: opName },
        variableDefinitions,
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: [
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: fieldName },
              arguments: args,
              selectionSet,
            },
          ],
        },
      },
    ],
  };
}

function safeFileName(s) {
  return s.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Operation'ı hangi module'e ait olduğunu belirle
function getModuleForOperation(fieldName) {
  const name = fieldName.toLowerCase();

  // Admin operations
  if (name.includes("byadmin") || name.includes("admin")) return "admin";

  // User operations
  if (name.startsWith("user") || name === "me" || name === "updateprofile")
    return "user";

  // Company operations
  if (name.includes("company") || name.includes("companies")) return "company";

  // Sample operations
  if (name.includes("sample")) return "sample";

  // Collection operations
  if (name.includes("collection") || name.includes("rfq")) return "collection";

  // Order operations
  if (name.includes("order")) return "order";

  // Quote operations
  if (name.includes("quote")) return "quote";

  // Production operations
  if (name.includes("production") || name.includes("stage"))
    return "production";

  // Payment operations
  if (name.includes("payment")) return "payment";

  // Library operations
  if (name.includes("library") || name.includes("standard")) return "library";

  // Category operations
  if (name.includes("categor")) return "category";

  // Message operations
  if (name.includes("message") || name.includes("conversation"))
    return "message";

  // Notification operations
  if (name.includes("notification")) return "notification";

  // Question operations
  if (name.includes("question")) return "question";

  // File operations
  if (name.includes("file") || name.includes("upload")) return "file";

  // Subscription operations
  if (
    name.includes("subscription") ||
    name.includes("plan") ||
    name.includes("usage") ||
    name.includes("feature")
  )
    return "subscription";

  // Stats/Dashboard operations
  if (
    name.includes("stats") ||
    name.includes("dashboard") ||
    name.includes("count")
  )
    return "analytics";

  // Default: misc
  return "misc";
}

async function run() {
  const schema = await introspectSchema();

  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();

  // Create base directory
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  let totalFiles = 0;
  const moduleStats = {};

  // Process queries
  if (queryType) {
    const fields = queryType.getFields();
    for (const name of Object.keys(fields)) {
      const moduleName = getModuleForOperation(name);
      const moduleDir = `${OUT_DIR}/${moduleName}`;

      if (!existsSync(moduleDir)) mkdirSync(moduleDir, { recursive: true });

      const doc = buildOperationDoc("query", name, fields[name], schema);
      writeFileSync(
        `${moduleDir}/${safeFileName(name)}.graphql`,
        print(doc),
        "utf8"
      );

      moduleStats[moduleName] = (moduleStats[moduleName] || 0) + 1;
      totalFiles++;
    }
  }

  // Process mutations
  if (mutationType) {
    const fields = mutationType.getFields();
    for (const name of Object.keys(fields)) {
      const moduleName = getModuleForOperation(name);
      const moduleDir = `${OUT_DIR}/${moduleName}`;

      if (!existsSync(moduleDir)) mkdirSync(moduleDir, { recursive: true });

      const doc = buildOperationDoc("mutation", name, fields[name], schema);
      writeFileSync(
        `${moduleDir}/${safeFileName(name)}.graphql`,
        print(doc),
        "utf8"
      );

      moduleStats[moduleName] = (moduleStats[moduleName] || 0) + 1;
      totalFiles++;
    }
  }

  // Process subscriptions
  if (subscriptionType) {
    const fields = subscriptionType.getFields();
    for (const name of Object.keys(fields)) {
      const moduleName = getModuleForOperation(name);
      const moduleDir = `${OUT_DIR}/${moduleName}`;

      if (!existsSync(moduleDir)) mkdirSync(moduleDir, { recursive: true });

      const doc = buildOperationDoc("subscription", name, fields[name], schema);
      writeFileSync(
        `${moduleDir}/${safeFileName(name)}.graphql`,
        print(doc),
        "utf8"
      );

      moduleStats[moduleName] = (moduleStats[moduleName] || 0) + 1;
      totalFiles++;
    }
  }

  console.log(`\n✅ Bitti! ${totalFiles} operation oluşturuldu.\n`);
  console.log("📁 Modül dağılımı:");
  Object.keys(moduleStats)
    .sort()
    .forEach((module) => {
      console.log(`   ${module.padEnd(15)} ${moduleStats[module]} dosya`);
    });
  console.log(`\n📂 Klasör: ./${OUT_DIR}/`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
