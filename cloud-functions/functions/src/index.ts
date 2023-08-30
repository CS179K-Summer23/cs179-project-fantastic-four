/* eslint-disable */
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import * as admin from 'firebase-admin'
import { setGlobalOptions } from "firebase-functions/v2";

// Set the maximum instances to 10 for all functions
setGlobalOptions({ maxInstances: 10 });

const app = admin.initializeApp()
const db = admin.firestore(app)

const sgMail = require('@sendgrid/mail')

if (process.env.SENDGRID_API_KEY != null) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const {
  log,
  error,
} = require("firebase-functions/logger");

exports.onStreamCreate = onDocumentCreated("streams/{streamId}", async (event) => {
  log('onStreamCreate event: ', event)
  const { streamId } = event.params
  const data = event.data?.data()

  if (streamId != null && data != null) {
    const { streamer_id } = data

    // retrieve streamer's followers
    const followers = await db.collection('follows').where('following_id', '==', streamer_id).get()
    log('followers: ', followers)

    // send each follower an email notification
    followers.forEach(async (follower) => {
      const { follower_id } = follower.data()

      const user = await db.collection('users').doc(follower_id).get()
      const streamer = await db.collection('users').doc(streamer_id).get()

      const email = user?.data()?.email

      const msg = {
        to: email,
        from: 'mail@cs179-project-fantastic-four-qqc833gpi-fantasic-four-streaming.vercel.app',
        subject: `Streamer ${streamer?.data()?.name} is live!`,
        text: `A streamer named ${streamer?.data()?.name} that you follow is live!`,
      }

      if (process.env.SENDGRID_API_KEY != null) {
        try {
          sgMail.send(msg)
        } catch (err) {
          error('Sendgrid error: ', err)
        }
      }
      else {
        log('Notification Message:', msg)
      }
    })
  }
})
