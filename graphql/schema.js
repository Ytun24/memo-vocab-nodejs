const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type User {
        _id: ID
        name: String
        email: String
        password: String
    }

    type AuthData {
        token: String!
        userId: String!
    }

    input UserInputData {
        email: String
        name: String
        password: String
    }

    type TestData {
        name: String,
        age: Int
    }

    type RootMutation {
        signup(userInput: UserInputData): User
    }
    
    type RootQuery {
        hello: TestData,
        login(email: String!, password: String!): AuthData!
    }

    schema {
        query: RootQuery,
        mutation: RootMutation
    }
`);
