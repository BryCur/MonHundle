import { compile } from 'json-schema-to-typescript';
import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

interface JsonSchemaNode {
    $ref?: string;
    type?: string | string[];
    enum?: unknown[];
    nullable?: boolean;
    items?: JsonSchemaNode;
    properties?: Record<string, JsonSchemaNode>;
    definitions?: Record<string, JsonSchemaNode>;
    [key: string]: unknown;
}

interface MediaTypeObject {
    schema?: JsonSchemaNode;
}

interface OperationObject {
    requestBody?: { content?: Record<string, MediaTypeObject> };
    parameters?: { schema?: JsonSchemaNode }[];
    responses?: Record<string, { content?: Record<string, MediaTypeObject> }>;
}

type PathItemObject = Record<string, OperationObject>;

interface OpenApiDocument {
    paths?: Record<string, PathItemObject>;
    components: { schemas: Record<string, JsonSchemaNode> };
}

type Folder = 'enum' | 'request-params' | 'response/objects' | 'response/errors' | 'models';

const contractPath =
    process.env.OPENAPI_CONTRACT_PATH ?? '../../monhundle/core-api/openapi/core-api_public.json';
const outRoot = 'src/domain/generated';
const GENERATED_BANNER =
    '/**\n * AUTO-GENERATED from the backend OpenAPI contract. Do not edit by hand.\n */';

const doc: OpenApiDocument = JSON.parse(await fs.readFile(contractPath, 'utf-8'));
const schemas = doc.components.schemas;
const REF_PREFIX = '#/components/schemas/';

// --- Normalize OpenAPI-specific schema dialect into plain JSON Schema, which is what
// json-schema-to-typescript actually understands:
//  - '#/components/schemas/X' refs become '#/definitions/X'
//  - `{ type: "string", nullable: true }` becomes `{ type: ["string", "null"] }` — OpenAPI's
//    `nullable` keyword isn't part of JSON Schema and is silently ignored otherwise, which
//    would silently drop `| null` from every nullable field in the generated types.
//  - an enum's `x-enum-varnames` (member names, added by the backend) becomes `tsEnumNames`, which
//    json-schema-to-typescript turns into a real named `enum` instead of a union of numbers. ---
function normalizeSchema(node: unknown): unknown {
    if (Array.isArray(node)) {
        return node.map(normalizeSchema);
    }
    if (node && typeof node === 'object') {
        const source = node as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(source)) {
            if (k === '$ref' && typeof v === 'string') {
                out[k] = v.replace(REF_PREFIX, '#/definitions/');
            } else if (k === 'x-enum-varnames') {
                out.tsEnumNames = v;
            } else if (k !== 'nullable') {
                out[k] = normalizeSchema(v);
            }
        }
        if (source.nullable === true && 'type' in out) {
            const type = out.type;
            out.type = Array.isArray(type) ? [...new Set([...type, 'null'])] : [type, 'null'];
        }
        return out;
    }
    return node;
}

const rewrittenSchemas = normalizeSchema(schemas) as Record<string, JsonSchemaNode>;

// --- Build a dependency graph: schema name -> set of schema names it directly references. ---
function collectRefNames(node: unknown, names: Set<string>): void {
    if (Array.isArray(node)) {
        node.forEach((n) => collectRefNames(n, names));
    } else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
            if (k === '$ref' && typeof v === 'string' && v.startsWith('#/definitions/')) {
                names.add(v.replace('#/definitions/', ''));
            } else {
                collectRefNames(v, names);
            }
        }
    }
}

const dependencyGraph = new Map<string, Set<string>>();
for (const [name, schema] of Object.entries(rewrittenSchemas)) {
    const deps = new Set<string>();
    collectRefNames(schema, deps);
    deps.delete(name);
    dependencyGraph.set(name, deps);
}

// --- Scan `paths` to find which schemas are directly used as request bodies/params,
// success responses, or error responses. ---
function refsInContent(content: Record<string, MediaTypeObject> | undefined): Set<string> {
    const names = new Set<string>();
    for (const mediaType of Object.values(content ?? {})) {
        const ref = mediaType?.schema?.$ref ?? mediaType?.schema?.items?.$ref;
        if (ref?.startsWith(REF_PREFIX)) names.add(ref.slice(REF_PREFIX.length));
    }
    return names;
}

const requestRoots = new Set<string>();
const successRoots = new Set<string>();
const errorRoots = new Set<string>();

for (const pathItem of Object.values(doc.paths ?? {})) {
    for (const operation of Object.values(pathItem)) {
        if (!operation || typeof operation !== 'object' || !operation.responses) continue;

        refsInContent(operation.requestBody?.content).forEach((n) => requestRoots.add(n));
        for (const param of operation.parameters ?? []) {
            const ref = param.schema?.$ref;
            if (ref?.startsWith(REF_PREFIX)) requestRoots.add(ref.slice(REF_PREFIX.length));
        }

        for (const [statusCode, response] of Object.entries(operation.responses)) {
            const target = statusCode.startsWith('2') ? successRoots : errorRoots;
            refsInContent(response.content).forEach((n) => target.add(n));
        }
    }
}

function isEnumSchema(schema: JsonSchemaNode): boolean {
    return (
        Array.isArray(schema.enum) &&
        ['integer', 'number', 'string'].includes(schema.type as string)
    );
}

// --- Classify each schema into exactly one folder. Enums always go to enum/. A schema
// DIRECTLY used as the root of exactly one context (a request body/param, a success
// response, or an error response) goes to the matching folder. Everything else — a schema
// used in more than one context, or one that's never a root itself and only ever shows up
// nested inside another schema (a "building block", like MonsterCriteriaDTO inside
// GuessResponse) — falls back to models/. Nested schemas deliberately do NOT inherit their
// parent's context: being reachable from a response doesn't make something "a response
// shape" in its own right. ---
function classify(name: string, schema: JsonSchemaNode): Folder {
    if (isEnumSchema(schema)) return 'enum';

    const contexts = [requestRoots.has(name), successRoots.has(name), errorRoots.has(name)];
    const contextCount = contexts.filter(Boolean).length;

    if (contextCount === 1) {
        if (contexts[0]) return 'request-params';
        if (contexts[1]) return 'response/objects';
        return 'response/errors';
    }
    return 'models';
}

const folderByName = new Map<string, Folder>(
    Object.entries(schemas).map(([name, schema]) => [name, classify(name, schema)]),
);

function relativeImportPath(fromFolder: Folder, toFolder: Folder, toName: string): string {
    const rel = path.posix.relative(fromFolder, toFolder);
    const prefix = rel === '' ? './' : rel.startsWith('.') ? `${rel}/` : `./${rel}/`;
    return `${prefix}${toName}`;
}

// Wipe the whole output tree first. Without this, a schema that gets renamed, removed, or
// reclassified into a different folder would leave its old file behind forever — writeFile
// only overwrites files at the path it expects to produce today, it never deletes what it
// doesn't (or no longer) expects.
await fs.rm(outRoot, { recursive: true, force: true });
await Promise.all(
    [...new Set(folderByName.values())].map((f) =>
        fs.mkdir(path.join(outRoot, f), { recursive: true }),
    ),
);

// The schemas a file can reference, with enums stripped of their member names: json-schema-to-typescript
// ignores `declareExternallyReferenced: false` for named enums and would re-declare every referenced
// enum inside each file using it. Without names, a referenced enum is only mentioned by its type
// name, which the imports below bring in from its own file — the only one declaring it.
const referencedDefinitions = Object.fromEntries(
    Object.entries(rewrittenSchemas).map(([name, schema]) => {
        const withoutMemberNames = { ...schema };
        delete withoutMemberNames.tsEnumNames;
        return [name, withoutMemberNames];
    }),
);

for (const [name, schema] of Object.entries(rewrittenSchemas)) {
    const folder = folderByName.get(name)!;
    const deps = dependencyGraph.get(name)!;

    // json-schema-to-typescript's own JSONSchema4 type doesn't structurally match our looser
    // JsonSchemaNode (e.g. it's stricter about `items`) — cast at the boundary rather than
    // contorting our own type to satisfy a third-party library's internal representation.
    const rootSchema = { ...schema, definitions: referencedDefinitions } as Parameters<
        typeof compile
    >[0];
    const body = await compile(rootSchema, name, {
        bannerComment: '',
        declareExternallyReferenced: false,
        additionalProperties: false,
        // Plain `enum`s rather than `const enum`s: a const enum is erased at compile time, so there
        // would be no runtime object to read member names from (`Weaknesses[0] === 'Fire'`).
        enableConstEnums: false,
        // formatted below, once the header and imports are prepended
        format: false,
    });

    const importLines = [...deps]
        .sort()
        .map(
            (dep) =>
                `import type { ${dep} } from '${relativeImportPath(folder, folderByName.get(dep)!, dep)}';`,
        );

    const header = [GENERATED_BANNER, ...(importLines.length ? ['', ...importLines] : []), ''].join(
        '\n',
    );

    await writeGeneratedFile(path.join(outRoot, folder, `${name}.ts`), header + body);
    console.log(
        'wrote',
        `${folder}/${name}.ts`,
        deps.size ? `(imports: ${[...deps].join(', ')})` : '',
    );
}

// --- Enum name registry: an enum doesn't know its own name at runtime, and a value alone
// (e.g. `0`) can't tell which enum it belongs to. Mapping each enum object to its name lets
// translation helpers build keys like `game.criteria.weaknesses.fire` from `(Weaknesses, 0)`. ---
const enumSchemaNames = Object.entries(rewrittenSchemas)
    .filter(([, schema]) => isEnumSchema(schema))
    .map(([name]) => name)
    .sort();

await writeGeneratedFile(
    path.join(outRoot, 'enum', 'enumNames.ts'),
    [
        GENERATED_BANNER,
        '',
        ...enumSchemaNames.map((name) => `import { ${name} } from './${name}';`),
        '',
        '/** Name of each generated enum, looked up from the enum object itself. */',
        'export const enumNames: ReadonlyMap<object, string> = new Map<object, string>([',
        ...enumSchemaNames.map((name) => `    [${name}, '${name}'],`),
        ']);',
    ].join('\n'),
);
console.log('wrote', 'enum/enumNames.ts', `(${enumSchemaNames.join(', ')})`);

// Formats with the project's Prettier config, so the generated files follow the same style as the
// rest of the codebase and `npm run format` leaves them untouched.
async function writeGeneratedFile(filePath: string, content: string): Promise<void> {
    const prettierConfig = await prettier.resolveConfig(filePath);
    const formatted = await prettier.format(content, { ...prettierConfig, filepath: filePath });
    await fs.writeFile(filePath, formatted);
}
