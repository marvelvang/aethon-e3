/**
 * Generates src/api/generated.ts from the backend OpenAPI spec.
 *
 * Uses the programmatic openapi-typescript API so we can supply a transform
 * function. The .NET OpenAPI generator can emit integer fields as
 * anyOf[integer, string] (e.g. when JsonStringEnumConverter is registered
 * globally). The transform below normalises all integer-typed schemas to the
 * plain TypeScript `number` type so the frontend always has a single,
 * unambiguous type for every numeric field.
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

function transform(schemaObject) {
  // Direct integer type → number
  if ('type' in schemaObject && schemaObject.type === 'integer') {
    return NUMBER
  }
  // anyOf patterns such as [integer, string] emitted by the .NET generator → number
  if ('anyOf' in schemaObject && Array.isArray(schemaObject.anyOf)) {
    const hasInteger = schemaObject.anyOf.some(s => 'type' in s && s.type === 'integer')
    const hasString  = schemaObject.anyOf.some(s => 'type' in s && s.type === 'string')
    if (hasInteger && hasString) {
      return NUMBER
    }
  }
}

const ast = await openapiTS(pathToFileURL(inputPath), { transform })
writeFileSync(outputPath, astToString(ast))
console.log(`openapi-typescript: ${inputPath} → ${outputPath}`)
