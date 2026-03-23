import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "phantrunghau270901@gmail.com",
    pass: "yqppwabezvvxibzy",
  },
});

// Send an email using async/await
export const sendMail = async ({
  to,
  subject,
  html,
  text
}) => {
  if (!to || !subject || (!html && !text)) {
    throw new Error("Chưa có mail data");
  }

  return transporter.sendMail({
    from: `"TH Chat App" <no-reply@phantrunghau.dev.vn>`,
    to,
    subject,
    html,
    text
  });
};
