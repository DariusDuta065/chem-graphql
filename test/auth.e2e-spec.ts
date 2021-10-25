import * as request from 'supertest';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../src/app.module';
import { TokenOutput } from '../src/auth/dto/token.output';

const loginMutation = `
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
`;

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('logins users', (done) => {
    const loginData = {
      username: 'darius_duta@yahoo.com',
      password: 'salut',
    };

    request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'LoginMutation',
        query: loginMutation,
        variables: loginData,
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        const body: TokenOutput = res.body.data.login;

        console.log('Body res');
        console.log(body.refreshToken);
        console.log(body.accesstoken);
        console.log(body.userData);

        return done();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
