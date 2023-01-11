import nodemailer from "nodemailer";

const SendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    PORT: process.env.SMPT_PORT,
    secure: true,
    service: process.env.SMPT_SERVICES,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });
  const data = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  await transporter.sendMail(data);
};
export default SendEmail;
