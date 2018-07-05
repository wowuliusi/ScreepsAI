export class Creeptask implements ICreeptask {
    model: BodyPartConstant[];
    role: string;
    status: string;
    target: string;

    constructor(model: BodyPartConstant[], role: string, status: string, target: string) {
        this.model = model;
        this.role = role;
        this.status = status;
        this.target = target;

    }
}
