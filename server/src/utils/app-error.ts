export class AppError extends Error {
    public readonly status_code: number;
    public readonly status: string;
    public readonly is_operational: boolean;

    constructor(message: string, status_code: number) {
        super(message);
        this.status_code = status_code;
        this.status = `${status_code}`.startsWith('4') ? 'fail' : 'error';
        this.is_operational = true; // Error controlado

        Error.captureStackTrace(this, this.constructor);
    }
}