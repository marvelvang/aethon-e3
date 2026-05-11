/**
 * Generates src/api/generated.ts from the backend OpenAPI spec.
 *
 * Uses the programmatic openapi-typescript API so we can supply a transform
 * function. The .NET OpenAPI generator can emit integer fields in several ways
 * depending on the ASP.NET version and configured converters:
 *
 *   - { type: "integer" }                         → plain integer
 *   - { type: ["integer", "string"] }             → OAS 3.1 array-type (+ JsonStringEnumConverter)
 *   - { type: ["integer", "string", "null"] }     → same, nullable
 *   - { anyOf: [{type:"integer"},{type:"string"}] } → anyOf variant
 *   - { anyOf: [..., {type:"null"}] }             → same, nullable
 *   - { oneOf: [...] }                            → oneOf variant
 *
 * All of these are normalised to TypeScript `number` (preserving nullability).
 */

import openapiTS, { astToString } from 'openapi-typescript'
import ts from 'typescript'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const inputPath = resolve(__dirname, '../../backend/aethon-e3.api/aethon-e3.api.json')
const outputPath = resolve(__dirname, '../src/api/generated.ts')

const NUMBER = ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
const NULL_TYPE = ts.factory.createLiteralTypeNode(ts.factory.createNull())

function numberMaybeNull(nullable) {
  return nullable
    ? ts.factory.createUnionTypeNode([NUMBER, NULL_TYPE])
    : NUMBER
}

function transform(schemaObject) {
  const type = schemaObject.type

  // 1. Plain scalar integer: { type: "integer" }
  if (type === 'integer') return NUMBER

  // 2. OAS 3.1 array-type: { type: ["integer", "string", ...] }
  //    The library would otherwise split this and combine string + number.
  if (Array.isArray(type) && type.includes('integer') && type.includes('string')) {
    return numberMaybeNull(type.includes('null'))
  }

  // 3. anyOf / oneOf with integer + string variants (e.g. JsonStringEnumConverter)
  for (const key of ['anyOf', 'oneOf']) {
    const variants = schemaObject[key]
    if (!Array.isArray(variants)) continue
    const types = variants.flatMap(s => ('type' in s ? [s.type] : []))
    if (types.includes('integer') && types.includes('string')) {
      return numberMaybeNull(types.includes('null'))
    }
  }
}

const ast = await openapiTS(pathToFileURL(inputPath), { transform })
writeFileSync(outputPath, astToString(ast))
console.log(`openapi-typescript: ${inputPath} → ${outputPath}`)
