const authController = require("../controllers/auth");

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("express-validator");

jest.mock("bcryptjs");
jest.mock("../models/user");
jest.mock("express-validator");

describe("AuthController", () => {
  const mockReq = () => {
    const req = {
      body: {
        email: "test@mail.com",
        confirmPassword: "password",
        password: "password",
        name: "test user",
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

  test("[signup] should send success response with status 201", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    bcrypt.hash.mockResolvedValue("testhasing");
    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: 1, email: "test@mail.com" })
      );

    await authController.signup(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toHaveBeenCalledWith(201);
    expect(mockedRes.json).toHaveBeenCalledWith({
      email: "test@mail.com",
      id: "1",
    });
  });

  test("[signup] should send error to next middleware when validation error is not empty", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => false, array: () => [] });

    await authController.signup(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(422);
    expect(mockedNext.mock.calls[0][0].message).toBe("Invalid input");
  });

  test("[signup] should send error to next middleware when hash error", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    bcrypt.hash.mockRejectedValue({ message: "hash error" });

    await authController.signup(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("hash error");
  });

  test("[signup] should send error to next middleware when user save error", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    bcrypt.hash.mockResolvedValue("testhasing");
    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() =>
        Promise.reject({ message: "user save error" })
      );

    await authController.signup(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("user save error");
  });
});
