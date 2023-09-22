export interface CommandInterface {
    name: string;
    description: string;

    validate: (args: string[]) => boolean;

    run: (args: string[]) => void;
}