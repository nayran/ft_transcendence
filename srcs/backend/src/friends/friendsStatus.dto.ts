export class FriendsStatusDTO {
	public status: number;
	public message: string;

	constructor(status: number = 0) {
		this.status = status;
        this.message = this.defineMessage(this.status);
	}

    private defineMessage(status: number): string {
        let friendshipStatusMessage: string[] = [
            "not friends",
            "frienship already requested",
            "friendship requested by the other party",
            "user is already your friend",
            "friendship successfully requested",
            "user not found",
            "can't be friends with yourself"
        ]
        if (status < 0 || status >= friendshipStatusMessage.length)
            return ('');
        return (friendshipStatusMessage[status]);
    }

    public setStatus(status: number) {
        this.status = status;
    }
    public getStatus(): number {
        return this.status;
    }

    public setMessage(message: string) {
        this.message = message;
    }

}
