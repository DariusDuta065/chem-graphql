const queries: {
  [key: string]: {
    operationName: string;
    query: string;
  };
} = {
  profile: {
    operationName: `ProfileQuery`,
    query: `
      query ProfileQuery {
        profile {
          id
          email
          firstName
          lastName
          role
        }
      }
    `,
  },
  adminRoute: {
    operationName: `AdminRouteQuery`,
    query: `
      query AdminRouteQuery {
        adminRoute
      }
    `,
  },
  userRoute: {
    operationName: `UserRouteQuery`,
    query: `
      query UserRouteQuery {
        userRoute
      }
    `,
  },
  publicRoute: {
    operationName: `PublicRouteQuery`,
    query: `
      query PublicRouteQuery {
        publicRoute
      }
    `,
  },
};

export default queries;
