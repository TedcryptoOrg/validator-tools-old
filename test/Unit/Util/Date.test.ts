import {describe, expect, it} from "bun:test";
import {getDateFormatted} from "../../../src/Util/Date.ts";

describe('Date util', () => {
    it('should format the date', () => {
        const date = new Date('2021-01-01');
        expect(getDateFormatted(date)).toBe('01/01/2021');
    });
});
