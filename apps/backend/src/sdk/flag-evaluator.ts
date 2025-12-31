import { FeatureFlag, FlagEnvironmentValue, FlagType, Segment } from '@prisma/client';
import { createHash } from 'crypto';

export interface UserContext {
  userId?: string;
  email?: string;
  country?: string;
  appVersion?: string;
}

export interface RuleCondition {
  field: 'userId' | 'emailDomain' | 'country' | 'appVersion';
  op: 'equals' | 'contains' | 'in' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
  value: any;
}

export interface TargetingRule {
  name: string;
  conditions: RuleCondition[];
  rollout?: { percentage: number };
  value: any;
  segmentIds?: string[];
}

interface SegmentRules {
  include?: string[];
  exclude?: string[];
  conditions?: RuleCondition[];
}

export function evaluateFlag(
  flag: FeatureFlag,
  envValue: FlagEnvironmentValue | undefined,
  user: UserContext,
  segments: Segment[],
): { key: string; value: any; reason: string } {
  const rules = (flag.rules as unknown as TargetingRule[]) || [];
  for (const rule of rules) {
    if (rule.segmentIds && rule.segmentIds.length > 0) {
      const segmentMatch = segments
        .filter((segment) => rule.segmentIds?.includes(segment.id))
        .some((segment) => segmentMatches(segment.rules as SegmentRules, user));
      if (!segmentMatch) {
        continue;
      }
    }
    if (conditionsMatch(rule.conditions, user) && rolloutMatch(rule.rollout, flag.key, user)) {
      return { key: flag.key, value: castValue(flag.type, rule.value), reason: `rule:${rule.name}` };
    }
  }
  const fallback = envValue?.value ?? flag.defaultValue;
  return { key: flag.key, value: castValue(flag.type, fallback), reason: 'default' };
}

function conditionsMatch(conditions: RuleCondition[] = [], user: UserContext) {
  return conditions.every((condition) => matchCondition(condition, user));
}

function segmentMatches(rules: SegmentRules, user: UserContext) {
  const identity = user.userId || user.email || '';
  if (rules.exclude && rules.exclude.includes(identity)) {
    return false;
  }
  if (rules.include && rules.include.includes(identity)) {
    return true;
  }
  if (rules.conditions) {
    return conditionsMatch(rules.conditions, user);
  }
  return false;
}

function matchCondition(condition: RuleCondition, user: UserContext) {
  const fieldValue = resolveField(condition.field, user);
  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }
  switch (condition.op) {
    case 'equals':
      return String(fieldValue) === String(condition.value);
    case 'contains':
      return String(fieldValue).includes(String(condition.value));
    case 'startsWith':
      return String(fieldValue).startsWith(String(condition.value));
    case 'endsWith':
      return String(fieldValue).endsWith(String(condition.value));
    case 'in':
      return Array.isArray(condition.value) && condition.value.map(String).includes(String(fieldValue));
    case 'gt':
      return Number(fieldValue) > Number(condition.value);
    case 'lt':
      return Number(fieldValue) < Number(condition.value);
    default:
      return false;
  }
}

function resolveField(field: RuleCondition['field'], user: UserContext) {
  if (field === 'emailDomain') {
    if (!user.email) return undefined;
    return user.email.split('@')[1];
  }
  return user[field];
}

function rolloutMatch(rollout: { percentage: number } | undefined, flagKey: string, user: UserContext) {
  if (!rollout || rollout.percentage >= 100) return true;
  if (rollout.percentage <= 0) return false;
  const id = user.userId || user.email || 'anonymous';
  const hash = createHash('sha256').update(`${flagKey}:${id}`).digest('hex');
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  return bucket < rollout.percentage;
}

function castValue(type: FlagType, value: any) {
  switch (type) {
    case 'BOOLEAN':
      return Boolean(value);
    case 'NUMBER':
      return Number(value);
    case 'STRING':
      return String(value);
    case 'JSON':
    default:
      return value;
  }
}
