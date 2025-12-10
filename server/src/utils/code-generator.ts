import { randomInt } from 'crypto';

export const generate_six_digits_code = (): string => {
    return randomInt(100000, 1000000).toString();
};