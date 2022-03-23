// @ts-ignore
import { BML } from "./interface/DOM";
import { Interpreter } from "./interpreter/interpreter";

interface BMLEvent {
    type: string;
    target: HTMLElement | null;
}

type BMLObjectElement = HTMLObjectElement;

interface BMLIntrinsicEvent extends BMLEvent {
    keyCode: number;
}

interface BMLBeventEvent extends BMLEvent {
    status: number;
    privateData: string;
    esRef: string;
    messageId: number;
    messageVersion: number;
    messageGroupId: number;
    moduleRef: string;
    languageTag: number;
    registerId: number;
    serviceId: number;
    eventId: number;
    peripheralRef: string;
    object: BMLObjectElement | null;
    segmentId: string | null;
}

// 同期割り込み事象キュー
export type SyncFocusEvent = {
    type: "focus";
    target: HTMLElement;
};

export type SyncBlurEvent = {
    type: "blur";
    target: HTMLElement;
};

export type SyncClickEvent = {
    type: "click";
    target: HTMLElement;
};

export type SyncEvent = SyncFocusEvent | SyncBlurEvent | SyncClickEvent;

export class EventDispatcher {
    private readonly eventQueue: EventQueue;
    private readonly bmlDocument: BML.BMLDocument;
    public constructor(eventQueue: EventQueue, bmlDocument: BML.BMLDocument) {
        this.eventQueue = eventQueue;
        this.bmlDocument = bmlDocument;
    }

    public setCurrentEvent(a: BMLEvent) {
        const { target: _, ...b } = a;
        const c = { target: BML.htmlElementToBMLHTMLElement(a.target, this.bmlDocument), ...b }
        this.bmlDocument._currentEvent = new BML.BMLEvent(c);
    }

    public setCurrentIntrinsicEvent(a: BMLIntrinsicEvent) {
        const { target: _, ...b } = a;
        const c = { target: BML.htmlElementToBMLHTMLElement(a.target, this.bmlDocument), ...b }
        this.bmlDocument._currentEvent = new BML.BMLIntrinsicEvent(c);
    }

    public setCurrentBeventEvent(a: BMLBeventEvent) {
        const { target: _1, object: _2, ...b } = a;
        const c = { target: BML.htmlElementToBMLHTMLElement(a.target, this.bmlDocument), object: BML.htmlElementToBMLHTMLElement(a.object, this.bmlDocument) as (BML.BMLObjectElement | null), ...b }
        this.bmlDocument._currentEvent = new BML.BMLBeventEvent(c);
    }

    public resetCurrentEvent() {
        this.bmlDocument._currentEvent = null;
    }

    public dispatchModuleLockedEvent(module: string, isEx: boolean, status: number) {
        console.log("ModuleLocked", module);
        const moduleLocked = (BML.bmlNodeToNode(this.bmlDocument.documentElement) as HTMLElement).querySelectorAll("beitem[type=\"ModuleLocked\"]");
        for (const beitem of Array.from(moduleLocked)) {
            if (beitem.getAttribute("subscribe") !== "subscribe") {
                continue;
            }
            const moduleRef = beitem.getAttribute("module_ref");
            if (moduleRef?.toLowerCase() === module.toLowerCase()) {
                const onoccur = beitem.getAttribute("onoccur");
                if (onoccur) {
                    this.eventQueue.queueAsyncEvent(async () => {
                        this.setCurrentBeventEvent({
                            type: "ModuleLocked",
                            target: beitem as HTMLElement,
                            status,
                            privateData: "",
                            esRef: "",
                            messageId: 0,
                            messageVersion: 0,
                            messageGroupId: 0,
                            moduleRef: module,
                            languageTag: 0,//?
                            registerId: 0,
                            serviceId: 0,
                            eventId: 0,
                            peripheralRef: "",
                            object: null,
                            segmentId: null,
                        } as BMLBeventEvent);
                        if (await this.eventQueue.executeEventHandler(onoccur)) {
                            return true;
                        }
                        this.resetCurrentEvent();
                        return false;
                    });
                    this.eventQueue.processEventQueue();
                }
            }
        }
    }

    public dispatchModuleUpdatedEvent(module: string, status: number) {
        console.log("ModuleUpdated", module, status);
        const moduleLocked = (BML.bmlNodeToNode(this.bmlDocument.documentElement) as HTMLElement).querySelectorAll("beitem[type=\"ModuleUpdated\"]");
        for (const beitem of Array.from(moduleLocked)) {
            if (beitem.getAttribute("subscribe") !== "subscribe") {
                continue;
            }
            const moduleRef = beitem.getAttribute("module_ref");
            if (moduleRef?.toLowerCase() === module.toLowerCase()) {
                const onoccur = beitem.getAttribute("onoccur");
                if (onoccur) {
                    this.eventQueue.queueAsyncEvent(async () => {
                        this.setCurrentBeventEvent({
                            type: "ModuleUpdated",
                            target: beitem as HTMLElement,
                            status,
                            privateData: "",
                            esRef: "",
                            messageId: 0,
                            messageVersion: 0,
                            messageGroupId: 0,
                            moduleRef: module,
                            languageTag: 0,//?
                            registerId: 0,
                            serviceId: 0,
                            eventId: 0,
                            peripheralRef: "",
                            object: null,
                            segmentId: null,
                        } as BMLBeventEvent);
                        if (await this.eventQueue.executeEventHandler(onoccur)) {
                            return true;
                        }
                        this.resetCurrentEvent();
                        return false;
                    });
                    this.eventQueue.processEventQueue();
                }
            }
        }
    }

    public dispatchDataButtonPressedEvent() {
        console.log("DataButtonPressed");
        const moduleLocked = (BML.bmlNodeToNode(this.bmlDocument.documentElement) as HTMLElement).querySelectorAll("beitem[type=\"DataButtonPressed\"]");
        for (const beitem of Array.from(moduleLocked)) {
            if (beitem.getAttribute("subscribe") !== "subscribe") {
                continue;
            }
            const onoccur = beitem.getAttribute("onoccur");
            if (onoccur) {
                this.eventQueue.queueAsyncEvent(async () => {
                    this.setCurrentBeventEvent({
                        type: "DataButtonPressed",
                        target: beitem as HTMLElement,
                        status: 0,
                        privateData: "",
                        esRef: "",
                        messageId: 0,
                        messageVersion: 0,
                        messageGroupId: 0,
                        moduleRef: "",
                        languageTag: 0,
                        registerId: 0,
                        serviceId: 0,
                        eventId: 0,
                        peripheralRef: "",
                        object: null,
                        segmentId: null,
                    } as BMLBeventEvent);
                    if (await this.eventQueue.executeEventHandler(onoccur)) {
                        return true;
                    }
                    this.resetCurrentEvent();
                    return false;
                });
                this.eventQueue.processEventQueue();
            }
        }
    }

    async dispatchFocus(event: SyncFocusEvent): Promise<boolean> {
        this.setCurrentEvent({
            type: "focus",
            target: event.target,
        } as BMLEvent);
        const handler = event.target.getAttribute("onfocus");
        if (handler) {
            if (await this.eventQueue.executeEventHandler(handler)) {
                return true;
            }
        }
        this.resetCurrentEvent();
        return false;
    }

    async dispatchBlur(event: SyncBlurEvent): Promise<boolean> {
        this.setCurrentEvent({
            type: "blur",
            target: event.target,
        } as BMLEvent);
        const handler = event.target.getAttribute("onblur");
        if (handler) {
            if (await this.eventQueue.executeEventHandler(handler)) {
                return true;
            }
        }
        this.resetCurrentEvent();
        return false;
    }

    async dispatchClick(event: SyncClickEvent): Promise<boolean> {
        this.setCurrentEvent({
            type: "click",
            target: event.target,
        } as BMLEvent);
        const handler = event.target.getAttribute("onclick");
        if (handler) {
            if (await this.eventQueue.executeEventHandler(handler)) {
                return true;
            }
        }
        this.resetCurrentEvent();
        return false;
    }

}

type Timer = {
    handle: number | null,
    handler: TimerHandler,
    timeout: number,
};

type BMLTimerID = number;

export class EventQueue {
    private interpreter: Interpreter;
    public dispatchFocus = (_event: SyncFocusEvent): Promise<boolean> => Promise.resolve(false);
    public dispatchBlur = (_event: SyncBlurEvent): Promise<boolean> => Promise.resolve(false);
    public dispatchClick = (_event: SyncClickEvent): Promise<boolean> => Promise.resolve(false);

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;
    }

    public async executeEventHandler(handler: string): Promise<boolean> {
        if (/^\s*$/.exec(handler)) {
            return false;
        }
        const groups = /^\s*(?<funcName>[a-zA-Z_][0-9a-zA-Z_]*)\s*\(\s*\)\s*;?\s*$/.exec(handler)?.groups;
        if (!groups) {
            throw new Error("invalid event handler attribute " + handler);
        }
        console.debug("EXECUTE", handler);
        const result = await this.interpreter.runEventHandler(groups.funcName);
        console.debug("END", handler);
        return result;
    }

    private readonly timerHandles = new Map<BMLTimerID, Timer>();

    public setInterval(handler: TimerHandler, timeout: number, ...args: any[]): BMLTimerID {
        const handle = window.setInterval(handler, timeout, ...args);
        this.timerHandles.set(handle, {
            handle,
            handler,
            timeout,
        });
        return handle;
    }

    public pauseTimer(timerID: BMLTimerID): boolean {
        const timer = this.timerHandles.get(timerID);
        if (timer == null) {
            return false;
        }
        if (timer.handle != null) {
            window.clearInterval(timer.handle);
            timer.handle = null;
        }
        return true;
    }

    public resumeTimer(timerID: BMLTimerID): boolean {
        const timer = this.timerHandles.get(timerID);
        if (timer == null) {
            return false;
        }
        if (timer.handle == null) {
            timer.handle = window.setInterval(timer.handler, timer.timeout);
        }
        return true;
    }

    public clearInterval(timerID: BMLTimerID): boolean {
        const timer = this.timerHandles.get(timerID);
        if (timer == null) {
            return false;
        }
        if (timer.handle != null) {
            window.clearInterval(timer.handle);
        }
        this.timerHandles.delete(timerID);
        return true;
    }

    asyncEventQueue: (() => Promise<boolean>)[] = [];
    syncEventQueue: SyncEvent[] = [];
    syncEventQueueLockCount = 0;

    public async processEventQueue(): Promise<boolean> {
        while (this.syncEventQueue.length || this.asyncEventQueue.length) {
            if (this.syncEventQueueLockCount) {
                return false;
            }
            if (this.syncEventQueue.length) {
                let exit = false;
                try {
                    this.lockSyncEventQueue();
                    const event = this.syncEventQueue.shift();
                    if (event?.type === "focus") {
                        if (exit = await this.dispatchFocus(event)) {
                            return true;
                        }
                    } else if (event?.type === "blur") {
                        if (exit = await this.dispatchBlur(event)) {
                            return true;
                        }
                    } else if (event?.type === "click") {
                        if (exit = await this.dispatchClick(event)) {
                            return true;
                        }
                    }
                } finally {
                    if (!exit) {
                        this.unlockSyncEventQueue();
                    }
                }
                continue;
            }
            if (this.asyncEventQueue.length) {
                let exit = false;
                try {
                    this.lockSyncEventQueue();
                    const cb = this.asyncEventQueue.shift();
                    if (cb) {
                        exit = await cb();
                        if (exit) {
                            return true;
                        }
                    }
                } finally {
                    if (!exit) {
                        this.unlockSyncEventQueue();
                    }
                }
            }
        }
        return false;
    }

    public queueSyncEvent(event: SyncEvent) {
        this.syncEventQueue.push(event);
    }

    public queueAsyncEvent(callback: () => Promise<boolean>) {
        this.asyncEventQueue.push(callback);
    }

    public lockSyncEventQueue() {
        this.syncEventQueueLockCount++;
    }

    public unlockSyncEventQueue() {
        this.syncEventQueueLockCount--;
        if (this.syncEventQueueLockCount < 0) {
            throw new Error("syncEventQueueLockCount < 0");
        }
    }

    public resetEventQueue() {
        this.asyncEventQueue.splice(0, this.asyncEventQueue.length);
        this.syncEventQueue.splice(0, this.syncEventQueue.length);
        for (const i of this.timerHandles.keys()) {
            this.clearInterval(i);
        }
        this.syncEventQueueLockCount = 0;
    }
}