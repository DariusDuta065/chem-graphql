export default {
  login: `
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
};
