import { NextApiRequest, NextApiResponse } from 'next'

const endpoint = async (req: NextApiRequest, res: NextApiResponse) => {
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  req.body.users.forEach(async (user: any) => {
    if (!user.email) return

    if (user.email === req.body.streamer.email) {
      return
    }

    const msg = {
      to: user.email,
      from: 'mail@fantasticfourstreaming.herokuapp.com',
      subject: 'Streamer ' + req.body.streamer.name + ' is live!',
      text: 'A streamer from our site is named ' + req.body.streamer.name + ' is live! Come check them out!',
    }

    console.log(msg)

    try {
      // await sgMail.send(msg);
      console.log('Message', msg)
    }
    catch (error) {
      console.log('ERROR', error);
    }
  })

  res.status(200).json({ message: 'Message sent successfully.' })

}

export default endpoint
