// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
require('dotenv').config();

describe('TEAMS config', function () {
  it('should have a valid client ID', function () {
    assert(
      process.env.AZURE_APP_ID &&
        process.env.AZURE_APP_ID.length > 0 &&
        '\nOAUTH_CLIENT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });

  it('should have a valid client secret', function () {
    assert(
      process.env.AZURE_APP_SECRET &&
        process.env.AZURE_APP_SECRET.length > 0 &&
        '\nOAUTH_CLIENT_SECRET is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });

  it('should have a valid tenant ID', function () {
    assert(
      process.env.AZURE_APP_ID_TENANT &&
        process.env.AZURE_APP_ID_TENANT.length > 0 &&
        'OAUTH_TENANT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });
  it('should have a valid element group ID', function () {
    assert(
      process.env.TEAMS_ID_GROUP_ELEMENT &&
        process.env.TEAMS_ID_GROUP_ELEMENT.length > 0 &&
        'OAUTH_TENANT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });
  it('should have a valid user ID delegated', function () {
    assert(
      process.env.TEAMS_ID_USER_DELEGATE &&
        process.env.TEAMS_ID_USER_DELEGATE.length > 0 &&
        'OAUTH_TENANT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });
  it('should have a valid user-admin ID', function () {
    assert(
      process.env.TEAMS_ID_USER_ADMIN &&
        process.env.TEAMS_ID_USER_ADMIN.length > 0 &&
        'OAUTH_TENANT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });
  it('should have a valid scope', function () {
    assert(
      process.env.TEAMS_SCOPE_USER &&
        process.env.TEAMS_SCOPE_USER.length > 0 &&
        'OAUTH_TENANT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });
  it('should have a valid link on a default avatar', function () {
    assert(
      process.env.TEAMS_DEFAULT_AVATAR_BOT &&
        process.env.TEAMS_DEFAULT_AVATAR_BOT.length > 0 &&
        'OAUTH_TENANT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });
  it('should have a valid link, to a redirect URI', function () {
    assert(
      process.env.TEAMS_REDIRECT_URI &&
        process.env.TEAMS_REDIRECT_URI.length > 0 &&
        'OAUTH_TENANT_ID is not set in .env.\n' +
          'See README.md for instructions on registering an application in the Azure portal',
    );
  });
});

describe('MATRIX config', function () {
  it('should have a valid https link', function () {
    assert(
      process.env.MATRIX_LINK_ADRESS &&
        process.env.MATRIX_LINK_ADRESS.length > 0 &&
        '\nOAUTH_CLIENT_ID is not set in .env.\n' +
          'See README.md for instructions.',
    );
  });
  it('should have a valid user token', function () {
    assert(
      process.env.MATRIX_USER_TOKEN &&
        process.env.MATRIX_USER_TOKEN.length > 0 &&
        '\nOAUTH_CLIENT_ID is not set in .env.\n' +
          'See README.md for instructions.',
    );
  });
  it('should have a valid user ID', function () {
    assert(
      process.env.MATRIX_USER_ID &&
        process.env.MATRIX_USER_ID.length > 0 &&
        '\nOAUTH_CLIENT_ID is not set in .env.\n' +
          'See README.md for instructions.',
    );
  });
  it('should have a valid room ID', function () {
    assert(
      process.env.MATRIX_WA_ID_ROOM &&
        process.env.MATRIX_WA_ID_ROOM.length > 0 &&
        '\nOAUTH_CLIENT_ID is not set in .env.\n' +
          'See README.md for instructions.',
    );
  });
});
