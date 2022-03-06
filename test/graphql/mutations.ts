const mutations: {
  [key: string]: {
    [key: string]: {
      operationName: string;
      query: string;
    };
  };
} = {
  auth: {
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
            id
            email
            password
            firstName
            lastName
            role
          }
        }
    `,
    },
    resetPassword: {
      operationName: `ResetPasswordMutation`,
      query: `
        mutation ResetPasswordMutation($userID: Int!) {
          resetPassword(userID: $userID) {
            id
            email
            password
            firstName
            lastName
            role
          }
        }
    `,
    },
  },
  groups: {
    createGroup: {
      operationName: `CreateGroup`,
      query: `
        mutation CreateGroup($createGroupInput: CreateGroupInput!) {
          createGroup(createGroupInput: $createGroupInput) {
            id
            grade
            notes
            scheduleDay
            scheduleHour
            scheduleMinute
            users {
              id
            }
            contents {
              id
            }
          }
        }
    `,
    },
    updateGroup: {
      operationName: `UpdateGroup`,
      query: `
        mutation UpdateGroup($updateGroupInput: UpdateGroupInput!) {
          updateGroup(updateGroupInput: $updateGroupInput) {
            id
            grade
            notes
            scheduleDay
            scheduleHour
            scheduleMinute
            users {
              id
              email
            }
            contents {
              id
              blockID
              lastEditedAt
            }
          }
        }
    `,
    },
    deleteGroup: {
      operationName: `DeleteGroup`,
      query: `
        mutation DeleteGroup($groupId: Int!) {
          deleteGroup(groupId: $groupId)
        }
    `,
    },
  },
  users: {
    updateUser: {
      operationName: `UpdateUser`,
      query: `
        mutation UpdateUser($updateUserInput: UpdateUserInput!) {
          updateUser(updateUserInput: $updateUserInput) {
            id
            email
            firstName
            lastName
            role
          }
        }
      `,
    },
    deleteUser: {
      operationName: `DeleteUser`,
      query: `
        mutation DeleteUser($userId: Int!) {
          deleteUser(userId: $userId)
        }
      `,
    },
  },
};

export default mutations;
