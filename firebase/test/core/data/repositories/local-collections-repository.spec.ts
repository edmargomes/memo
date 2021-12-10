import * as assert from "assert";
import * as sinon from "sinon";
import { FileSystemGateway } from "#data/gateways/filesystem-gateway";
import { SchemaValidator } from "#data/schemas/schema-validator";
import { LocalCollectionsRepository } from "#data/repositories/local-collections-repository";
import FilesystemError from "#faults/errors/filesystem-error";
import SerializationError from "#faults/errors/serialization-error";
import { LocalPublicCollection } from "#domain/models/collection";
import createSinonStub from "#test/sinon-stub";

describe("LocalCollectionsRepository", () => {
  let sandbox: sinon.SinonSandbox;
  let fsGatewayStub: sinon.SinonStubbedInstance<FileSystemGateway>;
  let schemaValidatorStub: sinon.SinonStubbedInstance<SchemaValidator>;
  let localCollectionsRepo: LocalCollectionsRepository;

  before(() => {
    sandbox = sinon.createSandbox();

    const fsStub = createSinonStub(FileSystemGateway, sandbox);
    fsGatewayStub = fsStub;

    const schemaStub = createSinonStub(SchemaValidator, sandbox);
    schemaValidatorStub = schemaStub;

    localCollectionsRepo = new LocalCollectionsRepository(fsStub, schemaStub, "any");
  });

  beforeEach(() => {
    fsGatewayStub.readFileAsString.resolves(JSON.stringify(fakeLocalCollectionJson));
  });

  afterEach(() => sandbox.reset());

  describe("getAllCollectionsByIds", () => {
    it("should return local stored collections", async () => {
      const localCollections = await localCollectionsRepo.getAllCollectionsByIds(["any"]);

      assert.deepStrictEqual(localCollections[0], <LocalPublicCollection>fakeLocalCollectionJson);
    });

    it("should throw when reading files from system fails", async () => {
      const fakeError = new FilesystemError({ message: "Error Message" });

      fsGatewayStub.readFileAsString.rejects(fakeError);

      await assert.rejects(async () => await localCollectionsRepo.getAllCollectionsByIds(["any"]), fakeError);
    });

    it("should throw when collection de-serialization fails", async () => {
      const fakeError = new SerializationError({ message: "Error Message" });

      schemaValidatorStub.validateObject.throws(fakeError);

      await assert.rejects(async () => await localCollectionsRepo.getAllCollectionsByIds(["any"]), fakeError);
    });
  });
});

const fakeLocalCollectionJson = {
  id: "id",
  name: "name",
  description: "Description",
  category: "category",
  tags: ["tag", "tag2"],
  locale: "locale",
  contributors: [],
  resources: [],
  memos: [
    {
      id: "id",
      question: [
        {
          insert: "Question",
        },
      ],
      answer: [
        {
          insert: "Answer",
        },
      ],
    },
  ],
};
