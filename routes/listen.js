const router = require('express-promise-router')();
const certHelper = require('../helpers/certHelper');
const fs = require('fs');

const sendToElement = require('../element/msgToElement');

router.post('/', async function (req, res) {
  if (req.query && req.query.validationToken) {
    res.set('Content-Type', 'text/plain');
    res.send(req.query.validationToken);
    return;
  }
  if (req.body.value) {
    for (let i = 0; i < req.body.value.length; i++) {
      const notification = req.body.value[i];

      // Decrypt the symmetric key sent by Microsoft Graph
      const symmetricKey = certHelper.decryptSymmetricKey(
        notification.encryptedContent.dataKey,
        process.env.PRIVATE_KEY_PATH,
      );

      // Validate the signature on the encrypted content
      const isSignatureValid = certHelper.verifySignature(
        notification.encryptedContent.dataSignature,
        notification.encryptedContent.data,
        symmetricKey,
      );

      if (isSignatureValid) {
        // Decrypt the payload
        const decryptedPayload = JSON.parse(
          certHelper.decryptPayload(
            notification.encryptedContent.data,
            symmetricKey,
          ),
        );
        await sendToElement(decryptedPayload, res.locals.client);
      }
    }
  }
  res.status(202).end();
});

module.exports = router;
