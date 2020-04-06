const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');


// creat a nodemailer transport with data from variables.env
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});


// generating the html from a pug file
// then creating inline css styles with 'juice'
const generateHTML = (filename, options = {}) => {
  // __dirname is equal to the current file this code is run in
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`, 
    options
  );
  const inlined = juice(html);
  return inlined;
};


// sending the html email
exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  
  const mailOptions = {
    from: 'Matt Trussell <noreply@dang.com>',
    to: options.user.email,
    subject: options.subject,
    html: html,
    text: text
  };
  const sendMail = promisify(transport.sendMail, transport);
  sendMail(mailOptions);
};


// transport.sendMail({
//   from: 'Matt Trussell <matt@gmail.com>',
//   to: 'randy@tegridyfarms.com',
//   subject: 'Just smokin pot!',
//   html: 'Hey! I <strong>LOVE</strong> Tegridy!',
//   text: 'Hey! I LOVE Tegridy!'
// });