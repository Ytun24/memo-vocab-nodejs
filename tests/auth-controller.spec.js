const authController = require("../controllers/auth");

const User = require("../models/user");
const Token = require("../models/token");
const bcrypt = require("bcryptjs");
const validator = require("express-validator");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

jest.mock("bcryptjs");
jest.mock("../models/user");
jest.mock("../models/token");
jest.mock("express-validator");
jest.mock("jsonwebtoken");
jest.mock("@sendgrid/mail");
jest.mock("crypto");

describe("AuthController", () => {
  const originalEnv = process.env;
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
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
    expect(mockedNext.mock.calls[0][0].message).toBe(
      "Email or password is wrong!"
    );
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
    expect(mockedNext.mock.calls[0][0].message).toBe(
      "Email or password is wrong!"
    );
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
    jwt.sign.mockImplementation(() => {
      throw new Error("jwt error");
    });

    await authController.login(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("jwt error");
  });

  test("[forgotPassword] should send email and send success response with status 200", async () => {
    // given
    const mockedNext = jest.fn();
    const mockedReq = {
      body: {
        email: "test@mail.com",
      },
    };
    const mockedRes = mockRes();

    process.env.SEND_EMAIL = true;

    User.findOne.mockResolvedValue({ _id: 1, email: "test@mail.com" });
    Token.findOne.mockResolvedValue(null);
    jest
      .spyOn(Token.prototype, "save")
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: 1, token: "mocktoken", userId: "1" })
      );
    crypto.randomBytes.mockImplementation(() => ({
      toString: () => "cyptohex",
    }));
    bcrypt.hash.mockResolvedValue("cyptohexhash");
    sgMail.setApiKey.mockImplementation(() => {});
    const mailSendSpy = jest.spyOn(sgMail, "send").mockResolvedValue({});

    // when
    await authController.forgotPassword(mockedReq, mockedRes, mockedNext);

    // then
    expect(mailSendSpy).toHaveBeenCalledTimes(1);
    expect(mockedRes.status).toHaveBeenCalledWith(200);
    expect(mockedRes.json).toHaveBeenCalledWith({
      message: "success",
    });
  });

  test("[forgotPassword] should delete token if token exist and continue send email and send success response with status 200", async () => {
    // given
    const mockedNext = jest.fn();
    const mockedReq = {
      body: {
        email: "test@mail.com",
      },
    };
    const mockedRes = mockRes();

    process.env.SEND_EMAIL = true;

    User.findOne.mockResolvedValue({ _id: 1, email: "test@mail.com" });
    const TokenMock = {
      findOne: jest.fn(() => TokenMock),
      deleteOne: jest.fn(() => {}),
    };
    jest.spyOn(Token, "findOne").mockImplementationOnce(() => TokenMock);
    jest
      .spyOn(Token.prototype, "save")
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: 1, token: "mocktoken", userId: "1" })
      );
    crypto.randomBytes.mockImplementation(() => ({
      toString: () => "cyptohex",
    }));
    bcrypt.hash.mockResolvedValue("cyptohexhash");
    sgMail.setApiKey.mockImplementation(() => {});
    const mailSendSpy = jest.spyOn(sgMail, "send").mockResolvedValue({});

    // when
    await authController.forgotPassword(mockedReq, mockedRes, mockedNext);

    // then
    expect(TokenMock.deleteOne).toHaveBeenCalledTimes(1);
    expect(mailSendSpy).toHaveBeenCalledTimes(1);
    expect(mockedRes.status).toHaveBeenCalledWith(200);
    expect(mockedRes.json).toHaveBeenCalledWith({
      message: "success",
    });
  });

  test("[forgotPassword] should not send email and send success response with status 200", async () => {
    // given
    const mockedNext = jest.fn();
    const mockedReq = {
      body: {
        email: "test@mail.com",
      },
    };
    const mockedRes = mockRes();

    process.env.SEND_EMAIL = false;
    process.env.FE_URL = "http://localhost:4200";

    User.findOne.mockResolvedValue({ _id: 1, email: "test@mail.com" });
    Token.findOne.mockResolvedValue(null);
    jest
      .spyOn(Token.prototype, "save")
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: 1, token: "mocktoken", userId: "1" })
      );
    crypto.randomBytes.mockImplementation(() => ({
      toString: () => "cyptohex",
    }));
    bcrypt.hash.mockResolvedValue("cyptohexhash");
    sgMail.setApiKey.mockImplementation(() => {});
    const mailSendSpy = jest.spyOn(sgMail, "send").mockResolvedValue({});

    // when
    await authController.forgotPassword(mockedReq, mockedRes, mockedNext);

    // then
    expect(mailSendSpy).not.toHaveBeenCalled();
    expect(mockedRes.status).toHaveBeenCalledWith(200);
    expect(mockedRes.json).toHaveBeenCalledWith({
      message: "success",
      url: "http://localhost:4200/reset-password?token=cyptohex&id=1",
    });
  });

  test("[forgotPassword] should send error to next middleware when user already exist", async () => {
    // given
    const mockedNext = jest.fn();
    const mockedReq = {
      body: {
        email: "test@mail.com",
      },
    };
    const mockedRes = mockRes();

    User.findOne.mockResolvedValue(null);

    // when
    await authController.forgotPassword(mockedReq, mockedRes, mockedNext);

    // then
    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("Email is not exist");
  });

  test("[forgotPassword] should send error to next middleware when send email error", async () => {
    // given
    const mockedNext = jest.fn();
    const mockedReq = {
      body: {
        email: "test@mail.com",
      },
    };
    const mockedRes = mockRes();

    process.env.SEND_EMAIL = true;

    User.findOne.mockResolvedValue({ _id: 1, email: "test@mail.com" });
    Token.findOne.mockResolvedValue(null);
    jest
      .spyOn(Token.prototype, "save")
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: 1, token: "mocktoken", userId: "1" })
      );
    crypto.randomBytes.mockImplementation(() => ({
      toString: () => "cyptohex",
    }));
    bcrypt.hash.mockResolvedValue("cyptohexhash");
    sgMail.setApiKey.mockImplementation(() => {});
    jest
      .spyOn(sgMail, "send")
      .mockImplementationOnce(() =>
        Promise.reject({ message: "email send error" })
      );

    // when
    await authController.forgotPassword(mockedReq, mockedRes, mockedNext);

    // then
    expect(mockedNext.mock.calls[0][0].message).toBe("email send error");
  });

  test("[resetPassword] should send success response with status 200", async () => {
    // given
    const mockedNext = jest.fn();
    const mockedReq = {
      body: {
        password: "password",
        resetToken: "resettoken",
        userId: "userid",
      },
    };
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    User.findById.mockImplementation(() => ({
      save: jest.fn(() => {}),
    }));
    Token.findOne.mockImplementation(() => ({
      deleteOne: jest.fn(() => {}),
    }));
    bcrypt.compare.mockReturnValue(true);
    bcrypt.hash.mockResolvedValue("testhasing");

    // when
    await authController.resetPassword(mockedReq, mockedRes, mockedNext);

    // then
    expect(mockedRes.status).toHaveBeenCalledWith(200);
    expect(mockedRes.json).toHaveBeenCalledWith({
      message: "success",
    });
  });

  test("[resetPassword] should send error to next middleware when validation error is not empty", async () => {
    const mockedNext = jest.fn();
    const mockedReq = {};
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => false, array: () => [] });

    await authController.resetPassword(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(422);
    expect(mockedNext.mock.calls[0][0].message).toBe("Invalid input");
  });

  test("[resetPassword] should send error to next middleware when token is not exist", async () => {
    const mockedNext = jest.fn();
    const mockedReq = {};
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    Token.findOne.mockResolvedValue(null);

    await authController.resetPassword(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("Invalid token!");
  });

  test("[resetPassword] should send error to next middleware when token is not valid", async () => {
    const mockedNext = jest.fn();
    const mockedReq = {};
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    Token.findOne.mockResolvedValue({
      _id: 1,
      token: "mocktoken",
      userId: "1",
    });
    bcrypt.compare.mockResolvedValue(false);

    await authController.resetPassword(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("Invalid token!");
  });

  test("[resetPassword] should send error to next middleware when user is not exist", async () => {
    const mockedNext = jest.fn();
    const mockedReq = {};
    const mockedRes = mockRes();

    jest
      .spyOn(validator, "validationResult")
      .mockReturnValue({ isEmpty: () => true, array: () => [] });
    Token.findOne.mockResolvedValue({
      _id: 1,
      token: "mocktoken",
      userId: "1",
    });
    bcrypt.compare.mockResolvedValue(true);
    User.findById.mockResolvedValue(null);

    await authController.resetPassword(mockedReq, mockedRes, mockedNext);

    expect(mockedNext.mock.calls[0][0].statusCode).toBe(500);
    expect(mockedNext.mock.calls[0][0].message).toBe("Invalid user");
  });
});
