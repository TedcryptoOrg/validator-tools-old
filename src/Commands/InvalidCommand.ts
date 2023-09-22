export class InvalidCommand extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidCommand';
    }
}
