import { EventEmitter } from "events";
import { tsTable } from "@chinachu/aribts";

// TsStreamと近似だがPSI/SIセクションを直接入力するパーサ
export class TsSectionParser extends EventEmitter {
    constructor() {
        super();
    }

    // 入力objは基本的にUint8ArrayのPSI/SIセクション。ただし戻り値がnullでない場合
    // これを次回呼び出し以降の同一入力の代わりに使うことができる。
    parse(pid: number, obj: any): any {
        let section: Buffer | null;
        let tableId: number;
        if ("table_id" in obj) {
            // 前回のデコード結果を再使用
            section = null;
            tableId = obj.table_id;
        } else {
            const data = obj as Uint8Array;
            section = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
            tableId = section[0];
            obj = null;
        }

        // ここからTsStream.parse()の対応部分とほぼ同じ
        if (tableId === 0x00) {
            // PAT
            if (this.listenerCount("pat")) {
                obj = obj ?? new tsTable.TsTablePat(section).decode();
                if (obj !== null) {
                    this.emit("pat", pid, obj);
                }
            }
        } else if (tableId === 0x01) {
            // CAT
            if (this.listenerCount("cat")) {
                obj = obj ?? new tsTable.TsTableCat(section).decode();
                if (obj !== null) {
                    this.emit("cat", pid, obj);
                }
            }
        } else if (tableId === 0x02) {
            // PMT
            if (this.listenerCount("pmt")) {
                obj = obj ?? new tsTable.TsTablePmt(section).decode();
                if (obj !== null) {
                    this.emit("pmt", pid, obj);
                }
            }
        } else if (tableId >= 0x3A && tableId <= 0x3F) {
            // DSM-CC
            if (this.listenerCount("dsmcc")) {
                obj = obj ?? new tsTable.TsTableDsmcc(section).decode();
                if (obj !== null) {
                    this.emit("dsmcc", pid, obj);
                }
            }
        } else if (tableId === 0x40 || tableId === 0x41) {
            // NIT
            if (this.listenerCount("nit")) {
                obj = obj ?? new tsTable.TsTableNit(section).decode();
                if (obj !== null) {
                    this.emit("nit", pid, obj);
                }
            }
        } else if (tableId === 0x42 || tableId === 0x46) {
            // SDT
            if (this.listenerCount("sdt")) {
                obj = obj ?? new tsTable.TsTableSdt(section).decode();
                if (obj !== null) {
                    this.emit("sdt", pid, obj);
                }
            }
        } else if (tableId === 0x4A) {
            // BAT
            if (this.listenerCount("bat")) {
                obj = obj ?? new tsTable.TsTableBat(section).decode();
                if (obj !== null) {
                    this.emit("bat", pid, obj);
                }
            }
        } else if (tableId >= 0x4E && tableId <= 0x6F) {
            // EIT
            if (this.listenerCount("eit")) {
                obj = obj ?? tsTable.TsTableEit.decode(section!);
                if (obj !== null) {
                    this.emit("eit", pid, obj);
                }
            }
        } else if (tableId === 0x70) {
            // TDT
            if (this.listenerCount("tdt")) {
                obj = obj ?? new tsTable.TsTableTdt(section).decode();
                if (obj !== null) {
                    this.emit("tdt", pid, obj);
                }
            }
        } else if (tableId === 0x73) {
            // TOT
            if (this.listenerCount("tot")) {
                obj = obj ?? new tsTable.TsTableTot(section).decode();
                if (obj !== null) {
                    this.emit("tot", pid, obj);
                }
            }
        } else if (tableId === 0x7E) {
            // DIT
            if (this.listenerCount("dit")) {
                obj = obj ?? new tsTable.TsTableDit(section).decode();
                if (obj !== null) {
                    this.emit("dit", pid, obj);
                }
            }
        } else if (tableId === 0x7F) {
            // SIT
            if (this.listenerCount("sit")) {
                obj = obj ?? new tsTable.TsTableSit(section).decode();
                if (obj !== null) {
                    this.emit("sit", pid, obj);
                }
            }
        } else if (tableId === 0xC3) {
            // SDTT
            if (this.listenerCount("sdtt")) {
                obj = obj ?? new tsTable.TsTableSdtt(section).decode();
                if (obj !== null) {
                    this.emit("sdtt", pid, obj);
                }
            }
        } else if (tableId === 0xC4) {
            // BIT
            if (this.listenerCount("bit")) {
                obj = obj ?? tsTable.TsTableBit.decode(section!);
                if (obj !== null) {
                    this.emit("bit", pid, obj);
                }
            }
        } else if (tableId === 0xC8) {
            // CDT
            if (this.listenerCount("cdt")) {
                obj = obj ?? new tsTable.TsTableCdt(section).decode();
                if (obj !== null) {
                    this.emit("cdt", pid, obj);
                }
            }
        }

        return obj;
    }
}
