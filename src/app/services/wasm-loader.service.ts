import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WasmLoaderService {
  private instance: WebAssembly.Instance | null = null;
  private memory: WebAssembly.Memory | null = null;
  private wasmLoaded: Promise<void> | null = null; // ✅ 透過 Promise 確保只載入一次

  private async loadWasm(): Promise<void> {
    if (this.wasmLoaded) return this.wasmLoaded; // ✅ 如果已載入，直接返回

    this.wasmLoaded = (async () => {
      console.log("🔄 開始載入 WASM...");
      const response = await fetch('/assets/release.wasm');
      if (!response.ok) {
        throw new Error(`❌ WASM 載入失敗: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const importObject = {
        env: {
          memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }), // ✅ 確保記憶體存在
          abort: () => console.log("❌ WASM 中斷！") // ✅ 避免 AssemblyScript 預設 `abort()`
        }
      };
      const wasmModule = await WebAssembly.instantiate(buffer, importObject);

      this.instance = wasmModule.instance;
      this.memory = (this.instance.exports['memory'] as WebAssembly.Memory) || null;
      console.log("✅ WASM 載入成功");
    })();

    return this.wasmLoaded;
  }

  async cleanCsv(csvString: string): Promise<string> {
    await this.loadWasm(); // ✅ 確保 WASM 已載入

    if (!this.instance || !this.memory) {
      throw new Error("WASM module not loaded");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const csvBuffer = encoder.encode(csvString);

    const ptr = (this.instance.exports['allocate'] as Function)(csvBuffer.length);
    const memoryArray = new Uint8Array(this.memory.buffer, ptr, csvBuffer.length);
    memoryArray.set(csvBuffer);

    const cleanedPtr = (this.instance.exports['cleanData'] as Function)(ptr, csvBuffer.length);

    // ✅ 修正：找出 Null 終止字元，確保只讀取有效長度
    let outputMemory = new Uint8Array(this.memory.buffer, cleanedPtr);
    let validLength = 0;
    while (validLength < outputMemory.length && outputMemory[validLength] !== 0) {
      validLength++;
    }

    return decoder.decode(outputMemory.slice(0, validLength)); // ✅ 只讀取有效長度
  }
}
