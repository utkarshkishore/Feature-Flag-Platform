import { evaluateFlag } from '../src/sdk/flag-evaluator';
import { FeatureFlag, FlagType } from '@prisma/client';

describe('flag evaluator', () => {
  it('returns default when no rules', () => {
    const flag = {
      id: '1',
      key: 'test',
      type: FlagType.BOOLEAN,
      defaultValue: true,
      rules: [],
    } as FeatureFlag;

    const result = evaluateFlag(flag, undefined, { userId: 'u1' }, []);
    expect(result.value).toBe(true);
    expect(result.reason).toBe('default');
  });
});
