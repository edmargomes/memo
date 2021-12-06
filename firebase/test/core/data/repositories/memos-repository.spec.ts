import * as assert from "assert";
import * as sinon from "sinon";
import { FirestoreGateway } from "#data/gateways/firestore-gateway";
import { MemosRepository } from "#data/repositories/memos-repository";
import Ajv2020 from "ajv/dist/2020";
import { SchemaValidator } from "#data/schemas/schema-validator";
import { Memo } from "#domain/models/memo";
import SerializationError from "#faults/errors/serialization-error";
import createSinonStub from "#test/sinon-stub";

describe("MemosRepository", () => {
  const firestoreStub = createSinonStub(FirestoreGateway);
  const schemaValidator = new SchemaValidator(new Ajv2020());
  const memosRepo = new MemosRepository(firestoreStub, schemaValidator);
  let transactionSpy: sinon.SinonSpy;

  before(() => {
    // Mocks the transaction function to always run what's is inside the context
    const transactionContext = async (context: any) => {
      await context();
    };

    transactionSpy = sinon.spy(transactionContext);
    firestoreStub.runTransaction.callsFake(transactionSpy);
  });

  afterEach(() => {
    transactionSpy.resetHistory();
    firestoreStub.runTransaction.resetHistory();
  });

  describe("setMemos", async () => {
    const mockCollectionId = "collectionId1";
    const mockMemo = _newRawMemo({ id: "id1" });
    const memosPerCollection = _newMemosPerCollection(mockCollectionId, [mockMemo]);

    it("should update all memos inside a single transaction", async () => {
      await memosRepo.setMemos(memosPerCollection);

      assert.ok(firestoreStub.runTransaction.calledOnce);
      assert.ok(transactionSpy.calledOnce);
    });

    it("should throw when raw memos have an invalid format", () => {
      const malformedMemo: Memo = <any>{ id: "id2", foo: "bar" };
      const mockMemosPerCollection = _newMemosPerCollection(mockCollectionId, [mockMemo]);
      mockMemosPerCollection.set("collectionId2", [malformedMemo]);

      assert.rejects(() => memosRepo.setMemos(mockMemosPerCollection), SerializationError);
    });

    it("should update a memo using its raw representation", async () => {
      const expectedId = mockMemo.id;
      const expectedPath = `collections/${mockCollectionId}/memos`;
      const expectedData = <any>mockMemo;

      await memosRepo.setMemos(memosPerCollection);
      const { id, path, data } = firestoreStub.setDoc.lastCall.firstArg;

      assert.strictEqual(id, expectedId);
      assert.strictEqual(path, expectedPath);
      assert.strictEqual(data, expectedData);
    });
  });

  describe("removeMemosByIds", () => {
    const mockCollectionId = "collectionId1";
    const mockMemoId = "id1";
    const memosIdsPerCollection = _newMemosIdsPerCollection(mockCollectionId, [mockMemoId]);

    it("should remove all memos inside a single transaction", async () => {
      await memosRepo.removeMemosByIds(memosIdsPerCollection);

      assert.ok(firestoreStub.runTransaction.calledOnce);
      assert.ok(transactionSpy.calledOnce);
    });

    it("should remove a memo by its id", async () => {
      const expectedId = mockMemoId;
      const expectedPath = `collections/${mockCollectionId}/memos`;

      await memosRepo.removeMemosByIds(memosIdsPerCollection);
      const { id, path } = firestoreStub.setDoc.lastCall.firstArg;

      assert.strictEqual(id, expectedId);
      assert.strictEqual(path, expectedPath);
    });
  });

  describe("getAllMemos", async () => {
    it("should return a list of deserialized memos", async () => {
      const firstRawMemo = _newRawMemo({ id: "1", question: "Question 1", answer: "Answer 1" });
      const secondRawMemo = _newRawMemo({ id: "2", question: "Question 2", answer: "Answer 2" });

      firestoreStub.getCollection.resolves([firstRawMemo, secondRawMemo]);
      const memos = await memosRepo.getAllMemos("any");

      assert.strictEqual(memos.length, 2);
      assert.strictEqual(memos[0]!.id, firstRawMemo.id);
      assert.strictEqual(memos[1]!.id, secondRawMemo.id);
    });

    it("should throw when a memo is not in the expected schema format", () => {
      const firstRawMemo = _newRawMemo({ id: "1", question: "Question 1", answer: "Answer 1" });
      const secondRawMemo = { id: "2", foo: "bar" };

      firestoreStub.getCollection.resolves([firstRawMemo, secondRawMemo]);

      assert.rejects(() => memosRepo.getAllMemos("any"), SerializationError);
    });
  });
});

function _newMemosPerCollection(collectionId: string, memos: Memo[]): Map<string, Memo[]> {
  return new Map<string, Memo[]>([[collectionId, memos]]);
}

function _newMemosIdsPerCollection(collectionId: string, memosIds: string[]): Map<string, string[]> {
  return new Map<string, string[]>([[collectionId, memosIds]]);
}

function _newRawMemo(props?: { id?: string; question?: string; answer?: string }): Memo {
  return {
    id: props?.id ?? "any",
    question: [
      {
        insert: props?.question ?? "Question string",
      },
    ],
    answer: [
      {
        insert: props?.answer ?? "Answer string",
      },
    ],
  };
}