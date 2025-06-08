
export class DocumentMock extends Document {
  public override readyState: DocumentReadyState = 'loading';
}

export class StorageMock implements Storage {
  public length = 0;
  public clear(): void { return; }
  public getItem(key: string): string|null { return null; }
  public key(index: number): string|null { return null; }
  public removeItem(key: string): void { return; }
  public setItem(key: string, value: string): void { return ; }
}

export class WindowMock extends Window {
  public override document = new DocumentMock();
  public override localStorage = new StorageMock();
  public override sessionStorage = new StorageMock();
}