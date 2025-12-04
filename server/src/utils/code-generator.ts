export const generate_six_digits_code = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};