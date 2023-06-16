import EventEmitter from "@tangerie/event-emitter"

type EventMap = {
    join: [id : string],
    leave: [id : string]
}

export const emitter = new EventEmitter<EventMap>();