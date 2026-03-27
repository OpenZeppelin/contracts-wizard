import { z } from 'zod';

type PrimitiveType = 'string' | 'boolean' | 'number';

interface BaseTypeInfo {
  type: PrimitiveType | 'object';
  enumValues?: string[];
}

interface FlagSpec {
  name: string;
  path: string[];
  type: PrimitiveType;
  enumValues?: string[];
  required: boolean;
  description?: string;
  hasLiteralFalse: boolean;
}

function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current = schema;

  while (true) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
      current = current._def.innerType;
      continue;
    }
    if (current instanceof z.ZodEffects) {
      current = current._def.schema;
      continue;
    }
    return current;
  }
}

function getObjectShape(schema: z.ZodTypeAny): z.ZodRawShape | undefined {
  const unwrapped = unwrapSchema(schema);
  return unwrapped instanceof z.ZodObject ? unwrapped.shape : undefined;
}

function getShapeField(shape: z.ZodRawShape, key: string): z.ZodTypeAny {
  const field = shape[key];
  if (!field) {
    throw new Error(`Unknown schema field: ${key}`);
  }
  return field;
}

function getBaseType(schema: z.ZodTypeAny): BaseTypeInfo {
  const unwrapped = unwrapSchema(schema);

  if (unwrapped instanceof z.ZodString) return { type: 'string' };
  if (unwrapped instanceof z.ZodBoolean) return { type: 'boolean' };
  if (unwrapped instanceof z.ZodNumber) return { type: 'number' };
  if (unwrapped instanceof z.ZodLiteral) {
    const val = unwrapped._def.value;
    if (typeof val === 'boolean') return { type: 'boolean' };
    if (typeof val === 'string') return { type: 'string', enumValues: [val] };
    return { type: 'string' };
  }
  if (unwrapped instanceof z.ZodEnum) return { type: 'string', enumValues: [...unwrapped.options] };
  if (unwrapped instanceof z.ZodUnion) {
    const literals: string[] = [];
    let hasFalse = false;
    for (const option of unwrapped._def.options) {
      const base = getBaseType(option);
      if (base.enumValues) literals.push(...base.enumValues);

      const unwrappedOption = unwrapSchema(option);
      if (unwrappedOption instanceof z.ZodLiteral && unwrappedOption._def.value === false) {
        hasFalse = true;
      }
    }
    if (literals.length > 0) return { type: 'string', enumValues: hasFalse ? ['false', ...literals] : literals };
    return { type: 'string' };
  }
  if (unwrapped instanceof z.ZodObject) return { type: 'object' };
  return { type: 'string' };
}

function getDescription(schema: z.ZodTypeAny): string | undefined {
  if (schema.description) return schema.description;
  if (schema instanceof z.ZodOptional) {
    return schema.unwrap().description;
  }
  return undefined;
}

function isRequired(schema: z.ZodTypeAny): boolean {
  return schema._def.typeName !== 'ZodOptional' && schema._def.typeName !== 'ZodDefault';
}

function collectFlagSpecs(shape: z.ZodRawShape, pathPrefix: string[] = [], parentRequired = true): FlagSpec[] {
  const specs: FlagSpec[] = [];

  for (const key of Object.keys(shape)) {
    const schema = getShapeField(shape, key);
    const base = getBaseType(schema);
    const path = [...pathPrefix, key];
    const required = parentRequired && isRequired(schema);

    if (base.type === 'object') {
      const innerShape = getObjectShape(schema);
      if (innerShape) {
        specs.push(...collectFlagSpecs(innerShape, path, required));
      }
      continue;
    }

    specs.push({
      name: path.join('.'),
      path,
      type: base.type,
      enumValues: base.enumValues,
      required,
      description: getDescription(schema),
      hasLiteralFalse: base.enumValues?.includes('false') ?? false,
    });
  }

  return specs;
}

function formatFlag(spec: FlagSpec): string {
  if (spec.type === 'boolean') {
    return `  --${spec.name}`;
  }

  const typeStr = spec.enumValues ? spec.enumValues.join('|') : spec.type;
  return `  --${spec.name} <${typeStr}>`;
}

function parseFlagValue(spec: FlagSpec, value: string): string | number | boolean {
  if (spec.type === 'number') {
    return Number(value);
  }
  if (spec.hasLiteralFalse && value === 'false') {
    return false;
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function setPathValue(target: Record<string, unknown>, path: string[], value: string | number | boolean): void {
  let current = target;

  for (const segment of path.slice(0, -1)) {
    const existing = current[segment];

    if (existing === undefined) {
      current[segment] = {};
    } else if (!isRecord(existing)) {
      throw new Error(`Invalid option nesting: --${path.join('.')}`);
    }

    const next = current[segment];
    if (!isRecord(next)) {
      throw new Error(`Invalid option nesting: --${path.join('.')}`);
    }
    current = next;
  }

  const leaf = path.at(-1);
  if (!leaf) {
    throw new Error('Invalid schema path');
  }
  current[leaf] = value;
}

export function generateHelp(commandName: string, shape: z.ZodRawShape, description?: string): string {
  const lines: string[] = [];
  lines.push(description ? `${commandName}: ${description}` : commandName);
  lines.push('');

  const required: string[] = [];
  const optional: string[] = [];

  for (const spec of collectFlagSpecs(shape)) {
    const flag = formatFlag(spec);
    const desc = spec.description ?? '';
    const padding = flag.length >= 40 ? '  ' : ' '.repeat(40 - flag.length);
    const indentedDesc = desc.replace(/\n/g, '\n    ');
    const line = desc ? `${flag}${padding}${indentedDesc}` : flag;

    if (spec.required) {
      required.push(line);
    } else {
      optional.push(line);
    }
  }

  if (required.length > 0) {
    lines.push('Required:');
    lines.push(...required);
    lines.push('');
  }
  if (optional.length > 0) {
    lines.push('Options:');
    lines.push(...optional);
  }

  return lines.join('\n');
}

/**
 * Manually parses argv against a Zod schema shape.
 * Handles: --flag (boolean true), --flag true|false, --flag value, --flag=value, --key.nested value
 */
export function parseArgsFromSchema<T extends z.ZodRawShape>(
  shape: T,
  argv: string[],
): z.infer<z.ZodObject<T>> {
  const flagSpecs = collectFlagSpecs(shape);
  const flagSpecsByName = new Map(flagSpecs.map(spec => [spec.name, spec]));

  const result: Record<string, unknown> = {};

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    let flagName: string;
    let inlineValue: string | undefined;

    const eqIndex = arg.indexOf('=');
    if (eqIndex !== -1) {
      flagName = arg.slice(2, eqIndex);
      inlineValue = arg.slice(eqIndex + 1);
    } else {
      flagName = arg.slice(2);
    }

    const spec = flagSpecsByName.get(flagName);
    if (!spec) {
      throw new Error(`Unknown option: --${flagName}`);
    }

    if (spec.type === 'boolean') {
      const nextArg = inlineValue ?? argv[i + 1];
      if (nextArg === 'true') {
        setPathValue(result, spec.path, true);
        i += inlineValue ? 1 : 2;
      } else if (nextArg === 'false') {
        setPathValue(result, spec.path, false);
        i += inlineValue ? 1 : 2;
      } else {
        setPathValue(result, spec.path, true);
        i++;
      }
    } else {
      const value = inlineValue ?? argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`Missing value for option: --${flagName}`);
      }
      setPathValue(result, spec.path, parseFlagValue(spec, value));
      i += inlineValue ? 1 : 2;
    }
  }

  return z.object(shape).parse(result);
}
