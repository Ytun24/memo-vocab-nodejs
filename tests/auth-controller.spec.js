const authController = require("../controllers/auth");

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("express-validator");
const jwt = require("jsonwebtoken");

jest.mock("bcryptjs");
jest.mock("../models/user");
jest.mock("express-validator");
jest.mock("jsonwebtoken");

describe("AuthController", () => {
  const mockSignUpReq = () => {
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

  const mockLoginReq = () => {
    const req = {
      body: {
        email: "test@mail.com",
        password: "password",
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
    const mockedReq = mockSignUpReq();
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
    const mockedReq = mockSignUpReq();
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
    const mockedReq = mockSignUpReq();
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
    const mockedReq = mockSignUpReq();
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

  test("[login] should send success response with status 200", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockLoginReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });

    User.findOne.mockResolvedValue({ _id: 1, email: "test@mail.com" });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mocktoken");

    await authController.login(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toHaveBeenCalledWith(200);
    expect(mockedRes.json).toHaveBeenCalledWith({
      token: "mocktoken",
      userId: "1",
    });
  });

  test("[login] should send error to next middleware when validation error is not empty", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockLoginReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => false, array: () => [] });

    await authController.login(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(422);
    expect(mockedNext.mock.calls[0][0].message).toBe("Invalid input");
  });

  test("[login] should send error to next middleware when email is not exist", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockLoginReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });

    User.findOne.mockResolvedValue(null);

    await authController.login(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(401);
    expect(mockedNext.mock.calls[0][0].message).toBe("Email or password is wrong!");
  });

  test("[login] should send error to next middleware when password is not match", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockLoginReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });

    User.findOne.mockResolvedValue({ _id: 1, email: "test@mail.com" });
    bcrypt.compare.mockResolvedValue(false);


    await authController.login(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(401);
    expect(mockedNext.mock.calls[0][0].message).toBe("Email or password is wrong!");
  });

  test("[login] should send error to next middleware when token sign error", async () => {
    const mockedNext = jest.fn();
    const mockedReq = mockLoginReq();
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });

    User.findOne.mockResolvedValue({ _id: 1, email: "test@mail.com" });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation(() => {throw new Error('jwt error')});

    await authController.login(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("jwt error");
  });
});
