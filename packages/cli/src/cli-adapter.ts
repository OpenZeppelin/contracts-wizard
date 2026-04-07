import { z } from 'zod';

type PrimitiveType = 'string' | 'boolean' | 'number';

interface BaseTypeInfo {
  type: PrimitiveType | 'object';
  enumValues?: string[];
  hasLiteralFalse?: boolean;
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

function unwrapSchema(schema: z.ZodType): z.ZodType {
  let current: z.ZodType = schema;

  while (true) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
      current = current._def.innerType as z.ZodType;
      continue;
    }
    return current;
  }
}

function getBaseType(schema: z.ZodType): BaseTypeInfo {
  const unwrapped = unwrapSchema(schema);

  if (unwrapped instanceof z.ZodString) return { type: 'string' };
  if (unwrapped instanceof z.ZodBoolean) return { type: 'boolean' };
  if (unwrapped instanceof z.ZodNumber) return { type: 'number' };
  if (unwrapped instanceof z.ZodLiteral) {
    const val = unwrapped._def.values?.[0];
    if (val === false) return { type: 'boolean', hasLiteralFalse: true };
    if (typeof val === 'boolean') return { type: 'boolean' };
    if (typeof val === 'string') return { type: 'string', enumValues: [val] };
    return { type: 'string' };
  }
  if (unwrapped instanceof z.ZodEnum) return { type: 'string', enumValues: unwrapped.options as string[] };
  if (unwrapped instanceof z.ZodUnion) {
    const literals: string[] = [];
    let hasFalse = false;
    for (const option of unwrapped._def.options) {
      const base = getBaseType(option as z.ZodType);
      if (base.enumValues) literals.push(...base.enumValues);
      if (base.hasLiteralFalse) hasFalse = true;
    }
    if (literals.length > 0) return { type: 'string', enumValues: hasFalse ? ['false', ...literals] : literals };
    return { type: 'string' };
  }
  if (unwrapped instanceof z.ZodObject) return { type: 'object' };
  return { type: 'string' };
}

function getDescription(schema: z.ZodType): string | undefined {
  if (schema.description) return schema.description;
  if (schema instanceof z.ZodOptional) {
    return (schema.unwrap() as z.ZodType).description;
  }
  return undefined;
}

function isRequired(schema: z.ZodType): boolean {
  return !(schema instanceof z.ZodOptional) && !(schema instanceof z.ZodDefault);
}

function collectFlagSpecs(shape: z.ZodRawShape, pathPrefix: string[] = [], parentRequired = true): FlagSpec[] {
  const specs: FlagSpec[] = [];

  for (const key of Object.keys(shape)) {
    const schema = shape[key] as z.ZodType;
    const base = getBaseType(schema);
    const path = [...pathPrefix, key];
    const required = parentRequired && isRequired(schema);

    if (base.type === 'object') {
      const unwrapped = unwrapSchema(schema);
      if (unwrapped instanceof z.ZodObject) {
        specs.push(...collectFlagSpecs(unwrapped.shape, path, required));
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
  if (spec.type === 'number') return Number(value);
  if (spec.hasLiteralFalse && value === 'false') return false;
  return value;
}

function setPathValue(target: Record<string, unknown>, path: string[], value: string | number | boolean): void {
  let current = target;

  for (const segment of path.slice(0, -1)) {
    const existing = current[segment];
    if (existing === undefined) {
      current[segment] = {};
    } else if (typeof existing !== 'object' || existing === null || Array.isArray(existing)) {
      throw new Error(`Invalid option nesting: --${path.join('.')}`);
    }
    current = current[segment] as Record<string, unknown>;
  }

  current[path.at(-1)!] = value;
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

export function parseArgsFromSchema<T extends z.ZodRawShape>(shape: T, argv: string[]): z.infer<z.ZodObject<T>> {
  const flagSpecs = collectFlagSpecs(shape);
  const flagSpecsByName = new Map(flagSpecs.map(spec => [spec.name, spec]));

  const result: Record<string, unknown> = {};
  const seen = new Set<string>();

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

    if (seen.has(flagName)) {
      throw new Error(`Duplicate option: --${flagName}`);
    }
    seen.add(flagName);

    if (spec.type === 'boolean') {
      const nextArg = inlineValue ?? argv[i + 1];
      if (nextArg === 'true' || nextArg === 'false') {
        setPathValue(result, spec.path, nextArg === 'true');
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

  const parsed = z.object(shape).safeParse(result);
  if (!parsed.success) {
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const issue of parsed.error.issues) {
      const name = issue.path.join('.');
      const spec = flagSpecsByName.get(name);
      const isMissing = issue.code === 'invalid_type' && issue.message.endsWith('received undefined');

      const line = spec ? `  ${formatFlag(spec)}  ${spec.description ?? ''}` : `  --${name}: ${issue.message}`;

      if (isMissing) {
        missing.push(line);
      } else {
        invalid.push(line);
      }
    }

    const sections: string[] = [];
    if (invalid.length > 0) {
      sections.push(`Invalid values for options:\n${invalid.join('\n')}`);
    }
    if (missing.length > 0) {
      sections.push(`Missing required options:\n${missing.join('\n')}`);
    }
    throw new Error(sections.join('\n\n'));
  }
  return parsed.data;
}
