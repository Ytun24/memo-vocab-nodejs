const vocabController = require("../controllers/vocab");
const validator = require("express-validator");
const User = require("../models/user");
const Vocab = require("../models/vocab");

jest.mock("../models/user");
jest.mock("../models/vocab");
jest.mock("express-validator");

describe("Vocab Controller", () => {
  const mockPostVocabReq = () => {
    const req = {
      body: {
        title: "mock title",
        meaning: "mock meaning",
        file: {
          path: "test.png",
        },
      },
    };
    return req;
  };

  const mockGetVocabsReq = () => {
    const req = {
      query: {
        page: 1,
      },
    };
    return req;
  };

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("[getVocabs] should send success response with status 200", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockGetVocabsReq();
    const mockedRes = mockRes();

    const mockVocabFindRes = [
      {
        id: "1",
        title: "mock title 1",
      },
      {
        id: "2",
        title: "mock title 2",
      },
    ];

    jest.spyOn(Vocab, "countDocuments").mockReturnValue(2);
    jest.spyOn(Vocab, "find").mockImplementationOnce(() => ({
      skip: () => ({
        limit: () => mockVocabFindRes,
      }),
    }));

    await vocabController.getVocabs(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toHaveBeenCalledWith(200);
    expect(mockedRes.json).toHaveBeenCalledWith({
      message: "get vocab successfully!",
      totalItems: 2,
      vocabs: mockVocabFindRes,
    });
  });

  test("[getVocabs] should get vocabs number per page correctly when no page query param", async () => {
    const mockedNext = jest.fn();
    const mockedReq = {};
    const mockedRes = mockRes();

    const mockVocabFindRes = [
      {
        id: "1",
        title: "mock title 1",
      },
      {
        id: "2",
        title: "mock title 2",
      },
    ];

    const VocabMock = {
      find: jest.fn(() => VocabMock),
      limit: jest.fn(() => []),
      skip: jest.fn(() => VocabMock),
    };

    jest.spyOn(Vocab, "countDocuments").mockReturnValue(2);
    jest.spyOn(Vocab, "find").mockImplementationOnce(() => VocabMock);

    await vocabController.getVocabs(mockedReq, mockedRes, mockedNext);

    expect(VocabMock.skip).toHaveBeenCalledWith(0);
    expect(VocabMock.limit).toHaveBeenCalledWith(4);
  });

  test("[getVocabs] should send error to next middleware when vocab find error", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockGetVocabsReq();
    const mockedRes = mockRes();

    jest.spyOn(Vocab, "countDocuments").mockReturnValue(2);
    jest.spyOn(Vocab, "find").mockImplementationOnce(() => ({
      skip: () => ({
        limit: () => Promise.reject({ message: "vocab find error" }),
      }),
    }));

    await vocabController.getVocabs(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].message).toBe("vocab find error");
  });

  test("[postVocab] should send success response with status 201", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockPostVocabReq();
    const mockedRes = mockRes();

    const mockVocabSaveRes = { _id: 1, title: "mock title 1" };

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    jest
      .spyOn(User, "findById")
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: 1, email: "test@mail.com" })
      );
    jest
      .spyOn(Vocab.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(mockVocabSaveRes));

    await vocabController.postVocab(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toHaveBeenCalledWith(201);
    expect(mockedRes.json).toHaveBeenCalledWith({
      message: "post vocab successfully!",
      vocab: mockVocabSaveRes,
    });
  });

  test("[postVocab] should send error to next middleware when validation error is not empty", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockPostVocabReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => false, array: () => [] });

    await vocabController.postVocab(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(422);
    expect(mockedNext.mock.calls[0][0].message).toBe("Invalid input");
  });

  test("[postVocab] should send error to next middleware when vocab save error", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockPostVocabReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    jest
      .spyOn(User, "findById")
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: 1, email: "test@mail.com" })
      );
    jest
      .spyOn(Vocab.prototype, "save")
      .mockImplementationOnce(() =>
        Promise.reject({ message: "vocab save error" })
      );

    await vocabController.postVocab(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].message).toBe("vocab save error");
  });
});
