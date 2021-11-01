const mutations: {
  [key: string]: {
    operationName: string;
    query: string;
  };
} = {
  login: {
    operationName: `LoginMutation`,
    query: `
      mutation LoginMutation($password: String!, $username: String!) {
        login(password: $password, username: $username) {
          accesstoken
          refreshToken
          userData {
            id
            email
            firstName
            lastName
            role
          }
        }
      }
    `,
  },
  logout: {
    operationName: `LogoutMutation`,
    query: `
      mutation LogoutMutation($logoutRefreshToken: String!) {
        logout(refreshToken: $logoutRefreshToken)
      }
    `,
  },
  refreshToken: {
    operationName: `RefreshTokenMutation`,
    query: `
      mutation RefreshTokenMutation($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          accesstoken
          refreshToken
          userData {
            email
            firstName
            id
            lastName
            role
          }
        }
      }
    `,
  },
  register: {
    operationName: `RegisterMutation`,
    query: `
      mutation RegisterMutation($userRegisterInput: UserRegisterInput!) {
        register(userRegisterInput: $userRegisterInput) {
          userId
          email
          password
          firstName
          lastName
          role
        }
      }
    `,
  },
};

export default mutations;
