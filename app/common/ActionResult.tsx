/**
 * Used for returning a result and message for validation.
 */
export class ActionResult {
    ok: boolean;
    message: string;

    /**
     * Allows you to return a result and message for validation.
     * 
     * @param ok The result of the action.
     * @param message The reason for the ok result.
     */
    constructor(ok: boolean, message: string = "") {
        this.ok = ok;
        this.message = message;
    }

    /**
     * @param message The reason for the result.
     * @returns ActionResult with the result as ok.
     */
    static ok(message: string = ""): ActionResult {
        return new ActionResult(true, message);
    }

    /**
     * @param message The reason for the result.
     * @returns ActionResult with the result as not ok.
     */
    static error(message: string = ""): ActionResult {
        return new ActionResult(false, message);
    }
}