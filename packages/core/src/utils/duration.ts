import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
dayjs.extend(dayjsDuration);

export { dayjs };

type DurationUnit = 'blocks' | keyof dayjsDuration.DurationUnitsObjectType;
export const durationPattern = /^(\d+(?:\.\d+)?) +(block|second|minute|hour|day|week|month|year)s?$/;

export function durationToBlocks(duration: string, blockTime: number): number {
  const match = duration.trim().match(durationPattern);

  if (!match) {
    throw new Error('Bad duration format');
  }

  const value = parseFloat(match[1]!);
  const unit = match[2]! + 's' as DurationUnit;

  if (unit === 'blocks') {
    return value;
  }

  const durationSeconds = dayjs.duration(value, unit).asSeconds();
  return Math.round(durationSeconds / blockTime);
}
