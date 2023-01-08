import nodemailer from "nodemailer";

const SendEmail = async (options) => {
  // let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    //   host: "smtp.ethereal.email",
    //   port: 587,
    //   secure: false,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.text,
    //   html: "<b>Hello world?</b>",
  });

  // console.log("Message sent: %s", info.messageId);
  // res.json(info);
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
export default SendEmail;
